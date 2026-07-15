let forgeInitialized = false;
let forgeCurrentEquip = null;    // 当前正在打造的装备
let forgeEquipSource = null;     // 'bag' 或 'wear'
let forgeBagIndex = -1;         // 背包索引
let forgeWearPos = null;        // 穿戴部位

// 在 forge.js 中实现的计算逻辑：
function getEnhanceGoldCost(equip, targetLevel) {
    // targetLevel: 从当前等级升到 targetLevel 的金币（1-10）
    // 基础公式：同一阶装备同品质强化所需金币相同
    const basePrice = calcEquipSellPrice(equip);  // 利用已有出售价格函数
    
    // 每一级的金币消耗系数（index 0 对应 +1，与 successRate 对齐）
    const levelCostMultipliers = [
        5.0,    // +1: 1倍出售价
        6.0,    // +2: 1.5倍
        7.0,    // +3: 2.2倍
        8.0,    // +4: 3倍
        9.0,    // +5: 4倍
        11.5,    // +6: 5.5倍
        13.0,    // +7: 7倍
        15.0,    // +8: 9倍
        17.0,   // +9: 12倍
        20.0    // +10: 16倍
    ];
    return Math.floor(basePrice * levelCostMultipliers[targetLevel - 1]);
}
// 1. 获取装备阶数（1-12）
function getEquipStage(equip) {
    return Math.ceil(equip.ilvl / 10);
}

// 2. 根据阶数获取所需的灵魂碎晶配置
function getSoulShardByStage(stage) {
    const shardMap = ENHANCE_CONFIG.soulShardByStage;
    for (const entry of shardMap) {
        if (stage >= entry.minStage && stage <= entry.maxStage) {
            return entry;
        }
    }
    return null; // 超出 12 阶的保护
}

// 3. 根据目标强化等级获取所需碎晶数量
function getMaterialCost(targetLevel) {
    return ENHANCE_CONFIG.materialCost[targetLevel] || 0;
}

// 4. 获取玩家背包中某个物品的数量
function getPlayerItemCount(cfgId) {
    const save = getSaveData();
    const otherItems = save.otherItems || {};
    return otherItems[cfgId] || 0;
}

// 统一格式化强化增益数值（小数类属性如暴击率显示百分比保留1位小数）
function formatForgeBonus(key, val) {
    const cfg = ATTR_DISPLAY_CONFIG[key];
    if (!cfg) return val.toFixed(1);
    
    // 直接使用已有 format 函数的反向推测：如果 format 结果是 "%" 结尾，说明是百分比属性
    const formatted = cfg.format(1);  // 临时用1测试
    if (formatted.endsWith('%')) {
        // 百分比属性：val是小数，乘以100后保留1位小数
        return (val * 100).toFixed(1) + '%';
    } else {
        // 普通数值属性：直接显示保留1位小数
        return val.toFixed(1);
    }
}
// 打开打造模块
function openForgeModule(equip, bagIndex, wearPos) {
    forgeCurrentEquip = equip;
    forgeBagIndex = bagIndex;
    forgeWearPos = wearPos;
    forgeEquipSource = wearPos !== null ? 'wear' : 'bag';
    
    // 切换到 forge 面板
    const forgePanel = document.getElementById('tab-forge');
    if (forgePanel) {
        // 隐藏其他面板，显示 forge 面板
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        forgePanel.classList.add('active');
        
        // 高亮对应的底部导航（如果有）
        document.querySelectorAll('.nav-module').forEach(b => b.classList.remove('active'));
        // 可以添加一个临时的 nav-module 或者复用角色按钮
        
        renderForgeModule();
    }
}

// 渲染打造模块
function renderForgeModule() {
    if (!forgeCurrentEquip) return;
    
    // 渲染当前装备属性
    renderForgeEquipStats();
    // 渲染强化信息
    renderForgeEnhanceInfo();
}

// 渲染装备属性（左右卡片对比）
function renderForgeEquipStats() {
    const equip = forgeCurrentEquip;
    if (!equip) return;
    
    const currentStatsEl = document.getElementById('forgeCurrentStats');
    const nextStatsEl = document.getElementById('forgeNextStats');
    if (!currentStatsEl || !nextStatsEl) return;
    
    const rClass = getRarityClass(equip.rarityName);
    const enhanceBadge = equip.enhanceLevel ? `<span class="enhance-level">+${equip.enhanceLevel}</span>` : '';
    
    // ========== 左侧：当前装备卡片 ==========
    let currentHtml = buildForgeCardHtml(equip, '当前装备', false);
    currentStatsEl.innerHTML = `<div class="equip-tip-box" style="display:flex;flex-direction:column;">${currentHtml}</div>`;
    
    // ========== 右侧：强化后预览卡片 ==========
    const nextLevel = (equip.enhanceLevel || 0) + 1;
    if (nextLevel > ENHANCE_CONFIG.maxLevel) {
        nextStatsEl.innerHTML = `
            <div class="equip-tip-box" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;color:#94a3b8;">
                已达最大强化等级
            </div>`;
        return;
    }
    
    // 构建强化后的装备模拟对象
    const nextEquip = simulateEnhancedEquip(equip, nextLevel);
    let nextHtml = buildForgeCardHtml(nextEquip);
    nextStatsEl.innerHTML = `<div class="equip-tip-box" style="display:flex;flex-direction:column;">${nextHtml}</div>`;
}

// 构建单张卡片 HTML（复用装备详情弹窗样式）
function buildForgeCardHtml(equip, badgeText, isPreview) {
    const rClass = getRarityClass(equip.rarityName);
    const enhanceBadge = equip.enhanceLevel ? `<span class="enhance-level">+${equip.enhanceLevel}</span>` : '';
    const badgeHtml = badgeText ? `<span class="forge-preview-badge">${badgeText}</span>` : '';
    
    // 头部
    let html = `
        <div class="equip-header">
            <div class="equip-header-top">
                <div class="equip-header-left">
                    <span class="equip-name ${rClass}">${equip.name}${enhanceBadge}</span>
                </div>
            </div>
            <div class="equip-header-bottom">
                <div class="equip-level">装等：${equip.ilvl} ${badgeHtml}</div>
            </div>
        </div>
        <div class="equip-divider"></div>
    `;
    
    // 基础属性
    html += '<div class="base-attr-title">【基础属性】</div>';
    if (equip.baseAttr) {
        const template = getEquipBaseTemplate(equip.ilvl, equip.position, equip.subType);
        let baseKeys;
        if (template) {
            baseKeys = Object.keys(template.base);
            if (baseKeys.includes('eleDmg')) {
                const actualEleKey = Object.keys(equip.baseAttr).find(key =>
                    ['fireDmg', 'coldDmg', 'lightDmg'].includes(key)
                );
                if (actualEleKey) {
                    baseKeys = baseKeys.map(k => k === 'eleDmg' ? actualEleKey : k);
                } else {
                    baseKeys = baseKeys.filter(k => k !== 'eleDmg');
                }
            }
        } else {
            baseKeys = Object.keys(equip.baseAttr);
        }
        
        // 原始装备（用于预览时计算差值）
        const originalEquip = (!isPreview) ? null : forgeCurrentEquip;
        
        baseKeys.filter(key => equip.baseAttr[key] !== undefined).forEach(key => {
            const val = equip.baseAttr[key];
            const cfg = ATTR_DISPLAY_CONFIG[key];
            const label = cfg ? cfg.label : key;
            // 计算总和：基础值 + 强化加成
            const total = val + (equip.enhanceBonus?.[key] ?? 0);
            const valStr = cfg ? cfg.format(total) : total.toFixed(1);
            
            // 如果是预览模式，显示差值
            let diffHtml = '';
            if (isPreview && originalEquip) {
                const origTotal = (originalEquip.baseAttr?.[key] ?? 0) + (originalEquip.enhanceBonus?.[key] ?? 0);
                if (Math.abs(total - origTotal) > 0.001) {
                    const diff = total - origTotal;
                    const diffStr = cfg ? cfg.format(diff) : diff.toFixed(1);
                    diffHtml = `<span class="forge-attr-diff">(+${diffStr})</span>`;
                }
            }
            
            html += `<div class="forge-equip">
                <span class="forge-equip-name">${label}</span>
                <span class="forge-equip-value">+ ${valStr}</span>
            </div>`;
        });
    }
    
    // ========== 强化增益（仅左侧当前装备显示） ==========
    if (!isPreview && equip.enhanceBonus && Object.keys(equip.enhanceBonus).length > 0) {
        html += '<div class="equip-divider"></div>';
        html += '<div class="base-attr-title" style="color:#22c55e;">【强化增益】</div>';
        Object.entries(equip.enhanceBonus).forEach(([key, bonus]) => {
            const cfg = ATTR_DISPLAY_CONFIG[key];
            if (!cfg) return;
            const label = cfg.label;
            const valStr = formatForgeBonus(key, bonus);
            html += `<div class="forge-equip forge-bonus-item">
                <span class="forge-equip-name">${label}</span>
                <span class="forge-equip-value">+ ${valStr}</span>
            </div>`;
        });
    }
    
    // ========== 随机词条（左右都显示） ==========
    if (equip.affixes && equip.affixes.length > 0) {
        html += '<div class="equip-divider"></div>';
        html += '<div class="affix-title">【随机词条】</div>';
        
        const typeOrderMap = {};
        if (window.ALL_AFFIX) {
            window.ALL_AFFIX.forEach((def, idx) => typeOrderMap[def.type] = idx);
        }
        const sortedAffixes = [...equip.affixes].sort((a, b) => {
            const oa = typeOrderMap[a.type] ?? Infinity;
            const ob = typeOrderMap[b.type] ?? Infinity;
            return oa - ob;
        });
        
        sortedAffixes.forEach(aff => {
            const tier = aff.tier || 1;
            const tClass = getTierClass(tier);
            const valStr = aff.value > 1
                ? formatAttrVal(aff.value)
                : formatAttrVal(aff.value * 100) + '%';
            html += `<div class="forge-equip">
                <span class="forge-equip-name">
                    <span class="${tClass}">T${tier}</span>
                    <span class="forge-equip-label">${aff.name}</span>
                </span>
                <span class="forge-equip-value">+ ${valStr}</span>
            </div>`;
        });
    }
    
    return html;
}

// 模拟强化后的装备对象（用于预览）
function simulateEnhancedEquip(equip, targetLevel) {
    const newBonus = calculateEnhanceBoostForLevel(equip, targetLevel, targetLevel - 1);
    const mergedBonus = {};
    Object.entries(equip.enhanceBonus || {}).forEach(([k, v]) => mergedBonus[k] = v);
    Object.entries(newBonus).forEach(([k, v]) => {
        mergedBonus[k] = (mergedBonus[k] || 0) + v;
    });
    
    return {
        ...equip,
        enhanceLevel: targetLevel,
        enhanceBonus: mergedBonus
    };
}

// 计算强化属性增益
function calculateEnhanceBonus(equip, attrKey, level, prevLevel) {
    if (level <= 0) return 0;
    const baseVal = equip.baseAttr?.[attrKey];
    if (!baseVal || baseVal === 0) return 0;
    
    const config = ENHANCE_CONFIG.boostConfig[level];
    if (!config) return 0;
    
    // 上一级的总增幅倍率（0级为0）
    const prevMultiplier = (prevLevel > 0 && ENHANCE_CONFIG.boostConfig[prevLevel])
        ? ENHANCE_CONFIG.boostConfig[prevLevel].baseMultiplier
        : 0;
    
    // 增量 = 当前总增幅 - 上一级总增幅
    return baseVal * (config.baseMultiplier - prevMultiplier);
}

// 计算某一级的全部增益
function calculateEnhanceBoostForLevel(equip, targetLevel, prevLevel) {
    const bonuses = {};
    if (!equip.baseAttr) return bonuses;
    Object.keys(equip.baseAttr).forEach(key => {
        const bonus = calculateEnhanceBonus(equip, key, targetLevel, prevLevel);
        if (bonus !== 0) bonuses[key] = bonus;
    });
    return bonuses;
}

// 渲染强化信息（成功率、金币等）
function renderForgeEnhanceInfo() {
    const equip = forgeCurrentEquip;
    const currentLevel = equip.enhanceLevel || 0;
    const nextLevel = currentLevel + 1;
    
    const successRateEl = document.getElementById('forgeSuccessRate');
    const goldCostEl = document.getElementById('forgeGoldCost');
    const playerGoldEl = document.getElementById('forgePlayerGold');
    const enhanceBtn = document.getElementById('forgeEnhanceBtn');
    const materialArea = document.getElementById('forgeMaterialArea');
    
    if (!successRateEl || !goldCostEl || !playerGoldEl) return;
    
    if (nextLevel > ENHANCE_CONFIG.maxLevel) {
        successRateEl.textContent = '-';
        goldCostEl.textContent = '-';
        playerGoldEl.textContent = '-';
        if (enhanceBtn) enhanceBtn.disabled = true;
        return;
    }
    
    // 成功率
    const rate = ENHANCE_CONFIG.successRate[nextLevel - 1];
    successRateEl.textContent = (rate * 100).toFixed(0) + '%';
    
    // 金币消耗
    const goldCost = getEnhanceGoldCost(equip, nextLevel);
    const save = getSaveData();
    const playerGold = save.gold || 0;
    
    goldCostEl.textContent = goldCost;
    playerGoldEl.textContent = playerGold;
    
    // 颜色提示是否足够
    goldCostEl.style.color = playerGold >= goldCost ? '#22c55e' : '#ef4444';
    
    // +6以上显示材料区域
    if (nextLevel >= ENHANCE_CONFIG.needMaterialFromLevel) {
        materialArea.style.display = 'block';
        const equipStage = getEquipStage(equip);
        const shardCfg = getSoulShardByStage(equipStage);
        
        if (shardCfg) {
            const cost = getMaterialCost(nextLevel);
            const owned = getPlayerItemCount(shardCfg.cfgId);
            const hasEnough = owned >= cost;
            const numColor = hasEnough ? '#22c55e' : '#ef4444';

            materialArea.innerHTML = `
                <div class="forge-action-row material-row">
                    <span class="row-label">
                        <span class="row-label-text">${shardCfg.name}</span>
                        <span class="row-label-colon">：</span>
                    </span>
                    <span class="row-value">
                        <span class="material-num" style="color:${numColor};font-weight:600;">${owned}</span>
                        <span class="material-slash"> / </span>
                        <span class="material-denom">${cost}</span>
                    </span>
                </div>
            `;
        } else {
            materialArea.innerHTML = '';
            materialArea.style.display = 'none';
        }
    } else {
        materialArea.style.display = 'none';
        materialArea.innerHTML = '';
    }
    // 检查材料是否足够
    let materialEnough = true;
    if (nextLevel >= ENHANCE_CONFIG.needMaterialFromLevel) {
        const equipStage = getEquipStage(equip);
        const shardCfg = getSoulShardByStage(equipStage);
        if (shardCfg) {
            const cost = getMaterialCost(nextLevel);
            const owned = getPlayerItemCount(shardCfg.cfgId);
            materialEnough = owned >= cost;
        }
    }

    if (enhanceBtn) {
        enhanceBtn.disabled = playerGold < goldCost 
            || nextLevel > ENHANCE_CONFIG.maxLevel 
            || !materialEnough;
    }
}

// 获取强化金币消耗
function getEnhanceGoldCost(equip, targetLevel) {
    const basePrice = calcEquipSellPrice(equip);
    const multipliers = [
        1.0, 1.5, 2.2, 3.0, 4.0,
        5.5, 7.0, 9.0, 12.0, 16.0
    ];
    return Math.floor(basePrice * multipliers[targetLevel - 1]);
}

// 执行强化
// 执行强化
function doEnhance() {
    const save = getSaveData();
    let equip;

    // ★ 先用日志确认变量值
    console.log('doEnhance inputs:', { 
        forgeEquipSource, forgeBagIndex, forgeWearPos, 
        forgeCurrentEquip: forgeCurrentEquip?.name 
    });

    if (forgeEquipSource === 'bag' && forgeBagIndex >= 0) {
        equip = save.bag[forgeBagIndex];
        console.log('从背包获取装备:', equip?.name, equip?.enhanceLevel);
    } else if (forgeEquipSource === 'wear' && forgeWearPos) {
        equip = save.equipWear[forgeWearPos];
        console.log('从穿戴获取装备:', equip?.name, equip?.enhanceLevel, '位置:', forgeWearPos);
    } else {
        showToast('无法获取装备数据');
        return;
    }
    if (!equip) {
        showToast('装备不存在');
        return;
    }

    // 同步更新 forgeCurrentEquip 以便渲染面板使用
    forgeCurrentEquip = equip;

    const currentLevel = equip.enhanceLevel || 0;
    const targetLevel = currentLevel + 1;

    if (targetLevel > ENHANCE_CONFIG.maxLevel) {
        showToast('装备已达最大强化等级');
        return;
    }

    const goldCost = getEnhanceGoldCost(equip, targetLevel);
    if ((save.gold || 0) < goldCost) {
        showToast('金币不足');
        return;
    }

    // ===== 新增：+6 及以上检查并扣除材料 =====
    if (targetLevel >= ENHANCE_CONFIG.needMaterialFromLevel) {
        const equipStage = getEquipStage(equip);
        const shardCfg = getSoulShardByStage(equipStage);
        if (shardCfg) {
            const cost = getMaterialCost(targetLevel);
            const owned = getPlayerItemCount(shardCfg.cfgId);
            if (owned < cost) {
                showToast(`材料不足：需要 ${shardCfg.name} x${cost}`);
                return;
            }
            // 扣除材料
            if (!save.otherItems) save.otherItems = {};
            save.otherItems[shardCfg.cfgId] = (save.otherItems[shardCfg.cfgId] || 0) - cost;
            console.log(`扣除材料: ${shardCfg.name} x${cost}, 剩余: ${save.otherItems[shardCfg.cfgId]}`);
        }
    }

    // 扣金币
    save.gold -= goldCost;
    console.log('扣金币:', goldCost, '剩余:', save.gold);

    // 判断成功率
    const rate = ENHANCE_CONFIG.successRate[targetLevel - 1];
    const isSuccess = Math.random() < rate;

    if (isSuccess) {
        // 强化成功
        equip.enhanceLevel = targetLevel;

        // 计算本次增加的属性
        const newBonus = calculateEnhanceBoostForLevel(equip, targetLevel, currentLevel);
        if (!equip.enhanceBonus) equip.enhanceBonus = {};

        Object.entries(newBonus).forEach(([key, val]) => {
            equip.enhanceBonus[key] = (equip.enhanceBonus[key] || 0) + val;
        });

        console.log('强化成功！当前等级:', equip.enhanceLevel, '提升属性:', newBonus);
        showToast(`强化成功！装备已提升至+${targetLevel}`);
    } else {
        // 强化失败
        if (targetLevel >= ENHANCE_CONFIG.failDropLevelFrom) {
            equip.enhanceLevel = Math.max(0, currentLevel - 1);
            showToast('强化失败，强化等级-1');
        } else {
            showToast('强化失败，消耗了金币');
        }
    }

    console.log('保存前的装备数据:', equip);
    setSaveData(save);
    renderForgeEnhanceInfo();
    renderForgeEquipStats();
    refreshCharacterPanel();
}

// 初始化打造模块
function initForgeModule() {
    if (forgeInitialized) return;  // 只绑定一次
    forgeInitialized = true;
    // Tab切换
    const tabsContainer = document.getElementById('forgeTabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', function(e) {
            const tab = e.target.closest('.forge-tab');
            if (!tab) return;
            
            tabsContainer.querySelectorAll('.forge-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.dataset.forgeTab;
            document.querySelectorAll('.forge-panel').forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById('forgePanel' + 
                target.charAt(0).toUpperCase() + target.slice(1));
            if (targetPanel) targetPanel.classList.add('active');
        });
    }
    
    // 返回按钮
    const backBtn = document.getElementById('forgeBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            // 返回角色面板
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('tab-character').classList.add('active');
            document.querySelectorAll('.nav-module').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-module="character"]').classList.add('active');
            
            forgeCurrentEquip = null;
            refreshCharacterPanel();
        });
    }
    
    // 强化按钮
    const enhanceBtn = document.getElementById('forgeEnhanceBtn');
    if (enhanceBtn) {
        enhanceBtn.addEventListener('click', doEnhance);
    }
}