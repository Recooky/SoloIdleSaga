let forgeInitialized = false;
let forgeCurrentEquip = null;    // 当前正在打造的装备
let forgeEquipSource = null;     // 'bag' 或 'wear'
let forgeBagIndex = -1;         // 背包索引
let forgeWearPos = null;        // 穿戴部位

// ===== 改造相关变量 =====
let reformSelectedAffixIndex = -1;   // 当前选中的词缀下标（-1表示未选）
let lastForgeTab = 'enhance';  // 默认选中强化标签

/**
 * 格式化金币显示：>= 10000 显示为 X.XXW，否则显示原数字
 */
function formatGold(amount) {
    if (amount >= 10000) {
        return (amount / 10000).toFixed(1) + 'W';
    }
    return amount.toString();
}
// 在 forge.js 中实现的计算逻辑：
function getEnhanceGoldCost(equip, targetLevel) {
    // targetLevel: 从当前等级升到 targetLevel 的金币（1-10）
    // 基础公式：同一阶装备同品质强化所需金币相同
    const basePrice = calcEquipSellPrice(equip);  // 利用已有出售价格函数
    
    // 每一级的金币消耗系数（index 0 对应 +1，与 successRate 对齐）
    const levelCostMultipliers = [
        1.0,    // +1: 1倍出售价
        1.5,    // +2: 1.5倍
        2.2,    // +3: 2.2倍
        3.0,    // +4: 3倍
        4.0,    // +5: 4倍
        5.5,    // +6: 5.5倍
        7.0,    // +7: 7倍
        8.0,    // +8: 9倍
        12.0,   // +9: 12倍
        16.0    // +10: 16倍
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

// 打开打造模块（保留Tab位置，只刷新数据）
function openForgeModule(equip, bagIndex, wearPos) {
    forgeCurrentEquip = equip;
    forgeBagIndex = bagIndex;
    forgeWearPos = wearPos;
    forgeEquipSource = wearPos !== null ? 'wear' : 'bag';
    
    // 切换到 forge 面板（不改变Tab内部状态）
    const forgePanel = document.getElementById('tab-forge');
    if (forgePanel) {
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        forgePanel.classList.add('active');
        
        // 高亮底部导航（可选，保持统一）
        document.querySelectorAll('.nav-module').forEach(b => b.classList.remove('active'));
        const charBtn = document.querySelector('[data-module="character"]');
        if (charBtn) charBtn.classList.add('active');
    }
    
    // ★ 根据上次选中的 tab 刷新对应面板
    const target = lastForgeTab || 'enhance';
    
    // 激活对应的 tab 按钮和面板
    const tabsContainer = document.getElementById('forgeTabs');
    if (tabsContainer) {
        tabsContainer.querySelectorAll('.forge-tab').forEach(t => t.classList.remove('active'));
        const targetTab = tabsContainer.querySelector(`[data-forge-tab="${target}"]`);
        if (targetTab) targetTab.classList.add('active');
    }
    document.querySelectorAll('.forge-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById('forgePanel' + 
        target.charAt(0).toUpperCase() + target.slice(1));
    if (targetPanel) targetPanel.classList.add('active');
    
    // 渲染对应面板
    if (target === 'reform') {
        renderReformPanel();
    } else {
        renderForgeModule();
    }
}

// 渲染打造模块（强化页）
function renderForgeModule() {
    // 从存档重新获取当前装备（确保数据最新）
    let equip;
    const save = getSaveData();
    if (forgeEquipSource === 'bag' && forgeBagIndex >= 0) {
        equip = save.bag[forgeBagIndex];
    } else if (forgeEquipSource === 'wear' && forgeWearPos) {
        equip = save.equipWear[forgeWearPos];
    }
    if (!equip) {
        forgeCurrentEquip = null;
        return;
    }
    forgeCurrentEquip = equip;
    
    // 渲染当前装备属性
    renderForgeEquipStats();
    // 渲染强化信息
    renderForgeEnhanceInfo();
}

// 渲染装备属性（单卡片）
function renderForgeEquipStats() {
    const equip = forgeCurrentEquip;
    if (!equip) return;

    const displayEl = document.getElementById('forgeEquipDisplay');
    if (!displayEl) return;

    // ★ 获取装备相关信息
    const iconUrl = getEquipIcon(equip);
    const dc = getRarityDisplayColor(equip.rarityName);
    const rarityColor = dc.border;
    const enhanceBadge = equip.enhanceLevel;

    // ★ 外部头部：图标 + 名称 + 强化等级
    const headerHtml = `
        <div class="forge-equip-icon-area">
            <div class="forge-equip-icon-wrap" style="
                background-color: ${dc.bg};
                border: 2px solid ${dc.border};
            ">
                <img src="${iconUrl}" alt="${equip.name}">
            </div>
            <div class="forge-equip-name-line" style="color: ${rarityColor};">
                ${equip.name} +${enhanceBadge}
            </div>
        </div>
    `;

    // ★ 内部盒子（属性部分）
    const cardHtml = buildForgeCardHtml(equip);

    displayEl.innerHTML = headerHtml + `<div class="equip-forge-box" style="display:flex;flex-direction:column;">${cardHtml}</div>`;
}

// 构建单张卡片 HTML（打造界面强化模块使用）
function buildForgeCardHtml(equip) {
    // 计算下一级强化预览
    const currentLevel = equip.enhanceLevel || 0;
    const nextLevel = currentLevel + 1;
    let nextBoost = null;
    if (nextLevel <= ENHANCE_CONFIG.maxLevel) {
        nextBoost = calculateEnhanceBoostForLevel(equip, nextLevel, currentLevel);
    }

    let html = '<div class="base-attr-title">【基础属性】</div>';

    // ========== 基础属性 ==========
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

        baseKeys.filter(key => equip.baseAttr[key] !== undefined).forEach(key => {
            const val = equip.baseAttr[key];
            const cfg = ATTR_DISPLAY_CONFIG[key];
            const label = cfg ? cfg.label : key;
            const valStr = cfg ? cfg.format(val) : val.toFixed(1);
            html += `<div class="forge-equip">
                <span class="forge-equip-name">${label}</span>
                <span class="forge-equip-value">+ ${valStr}</span>
            </div>`;
        });
    }

    // ========== 强化增益（绿色） ==========
    html += '<div class="equip-divider"></div>';
    html += '<div class="base-attr-title">【当前增益+强化预览】</div>';

    // 决定要显示的属性列表：
    // 如果有 enhanceBonus，使用其键；否则使用 baseAttr 的键（代表所有可强化属性）
    let bonusKeys;
    if (equip.enhanceBonus && Object.keys(equip.enhanceBonus).length > 0) {
        bonusKeys = Object.keys(equip.enhanceBonus);
    } else {
        // 强化等级为0时，从基础属性获取可强化的属性键
        bonusKeys = equip.baseAttr ? Object.keys(equip.baseAttr).filter(key => {
            // 过滤掉可能不需要显示为增益的属性（如果有需要排除的），目前保留全部
            return true;
        }) : [];
    }

    bonusKeys.forEach(key => {
        const cfg = ATTR_DISPLAY_CONFIG[key];
        if (!cfg) return;
        const label = cfg.label;
        
        // 当前增益值：如果有 enhanceBonus 则取用，否则为 0
        const bonus = equip.enhanceBonus?.[key] || 0;
        const valStr = formatForgeBonus(key, bonus);

        // ★ 下一级预览
        let previewHtml = '';
        if (nextBoost && nextBoost[key] !== undefined) {
            const nextAdd = nextBoost[key];
            const nextValStr = formatForgeBonus(key, nextAdd);
            previewHtml = `<span class="forge-bonus-preview"> (+${nextValStr})</span>`;
        }

        html += `<div class="forge-equip forge-bonus-item">
            <span class="forge-equip-name">${label}</span>
            <span class="forge-equip-value">+ ${valStr}</span>
            ${previewHtml}
        </div>`;
    });
    return html;
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
    
    goldCostEl.textContent = formatGold(goldCost);
    playerGoldEl.textContent = formatGold(playerGold);
    
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

            // ★ 从 OTHER_ITEM_CONFIG 获取显示名称
            const shardName = (window.OTHER_ITEM_CONFIG?.[shardCfg.cfgId]?.name) || shardCfg.cfgId;

            materialArea.innerHTML = `
                <div class="forge-action-row material-row">
                    <span class="row-label">
                        <span class="row-label-text">${shardName}</span>
                        <span class="row-label-colon">：</span>
                    </span>
                    <span class="row-value">
                        <span class="material-num" style="color:${numColor};font-weight:600;">${cost}</span>
                        <span class="material-slash"> / </span>
                        <span class="material-denom">${owned}</span>
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
            // ★ 将 shardName 提前定义，使其在整个 shardCfg 块内可用
            const shardName = (window.OTHER_ITEM_CONFIG?.[shardCfg.cfgId]?.name) || shardCfg.cfgId;
            if (owned < cost) {
                showToast(`材料不足：需要 ${shardName} x${cost}`);
                return;
            }
            // 扣除材料
            if (!save.otherItems) save.otherItems = {};
            save.otherItems[shardCfg.cfgId] = (save.otherItems[shardCfg.cfgId] || 0) - cost;
            console.log(`扣除材料: ${shardName} x${cost}, 剩余: ${save.otherItems[shardCfg.cfgId]}`);
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

// ===================== 改造系统 =====================

// 从存档重新获取当前装备对象（确保数据最新）
function getReformEquipFromSave() {
    const save = getSaveData();
    if (forgeEquipSource === 'bag' && forgeBagIndex >= 0) {
        return save.bag[forgeBagIndex];
    } else if (forgeEquipSource === 'wear' && forgeWearPos) {
        return save.equipWear[forgeWearPos];
    }
    return null;
}

// 根据阶数获取对应的改造石配置
function getReformStoneByStage(stage) {
    const stoneMap = REFORM_CONFIG.stoneByStage;
    for (const entry of stoneMap) {
        if (stage >= entry.minStage && stage <= entry.maxStage) {
            return entry;
        }
    }
    return null;
}

// 渲染改造面板（每次从存档重新获取装备）
function renderReformPanel() {
    const equip = getReformEquipFromSave();
    if (!equip) {
        document.getElementById('reformEquipDisplay').innerHTML = '<div style="color:#4a2c11;padding:20px;">装备数据异常</div>';
        document.getElementById('reformActionArea').innerHTML = '';
        document.getElementById('reformAffixReference').innerHTML = '';
        return;
    }
    forgeCurrentEquip = equip;
    renderReformLeft();
    renderReformAffixReference();
    renderReformBottom();
}

// 渲染左侧：装备头部 + 随机词缀选择
function renderReformLeft() {
    const equip = forgeCurrentEquip;
    const el = document.getElementById('reformEquipDisplay');
    if (!el || !equip) return;

    const iconUrl = getEquipIcon(equip);
    const dc = getRarityDisplayColor(equip.rarityName);
    const rarityColor = dc.border;
    const enhanceBadge = equip.enhanceLevel || 0;
    const isReformed = equip.reformReformed === true;

    // 头部：图标 + 名称 + 装等
    let html = `
        <div class="reform-equip-header">
            <div class="reform-equip-icon" style="background-color:${dc.bg};border:2px solid ${dc.border};">
                <img src="${iconUrl}" alt="${equip.name}">
            </div>
            <div class="reform-equip-meta">
                <div class="reform-equip-name" style="color:${rarityColor};">${equip.name} +${enhanceBadge}</div>
                <div class="reform-equip-level">装备等级 ${equip.ilvl}</div>
            </div>
        </div>
        <div class="reform-affix-section-title">请选择需要改造的词条</div>
    `;

    // 词缀列表（只显示随机词缀，不显示基础属性）
    if (equip.affixes && equip.affixes.length > 0) {
        const affixesToRender = equip.affixes;

        affixesToRender.forEach((affix, displayIdx) => {
            const originalIdx = equip.affixes.indexOf(affix);
            const cfg = ATTR_DISPLAY_CONFIG[affix.type];
            let valStr = '';
            if (cfg) {
                valStr = cfg.format(affix.value);
            } else {
                valStr = affix.value !== undefined ? affix.value.toFixed(1) : '';
            }
            const tierColorClass = 'tier-' + affix.tier;
            const isSelected = (equip.reformLockedAffixIndex === originalIdx);

            let canClick = false;
            if (isReformed) {
                canClick = (originalIdx === equip.reformLockedAffixIndex);
            } else {
                canClick = true;
            }
            const isDisabled = !canClick;
            const disabledStyle = isDisabled ? 'style="pointer-events:none;overflow:visible;white-space:normal;"' : '';
            const isClickable = canClick;

            html += `<div class="reform-affix-row ${isSelected ? 'reform-affix-selected' : ''} ${isDisabled ? 'reform-affix-disabled' : ''} ${isClickable ? 'reform-affix-clickable' : ''}" 
                        ${disabledStyle}
                        data-affix-index="${originalIdx}" onclick="${isDisabled ? '' : 'onSelectReformAffix(' + originalIdx + ')'}">
                        <div class="reform-affix-info">
                            <span class="affix-tier ${tierColorClass}">T${affix.tier}</span>
                            <span class="affix-name">${affix.name}</span>
                        </div>
                        <span class="affix-value">+ ${valStr}</span>
                    </div>`;
        });
    } else {
        html += '<div class="reform-empty">该装备没有随机词缀</div>';
    }

    el.innerHTML = html;
}

// 选中某条词缀为改造位
function onSelectReformAffix(affixIndex) {
    const equip = forgeCurrentEquip;
    if (!equip || !equip.affixes || affixIndex < 0 || affixIndex >= equip.affixes.length) {
        showToast('无效的词缀索引');
        return;
    }
    // ★ 已改造装备：只允许选择被锁定的那条词缀（允许反复改造）
    if (equip.reformReformed === true && affixIndex !== equip.reformLockedAffixIndex) {
            showToast('只能改造已锁定的词条');
            return;
        }
    // 保存到装备对象和存档
    equip.reformLockedAffixIndex = affixIndex;
    const save = getSaveData();
    let targetEquip;
    if (forgeEquipSource === 'bag' && forgeBagIndex >= 0) {
        targetEquip = save.bag[forgeBagIndex];
    } else if (forgeEquipSource === 'wear' && forgeWearPos) {
        targetEquip = save.equipWear[forgeWearPos];
    }
    if (targetEquip) {
        targetEquip.reformLockedAffixIndex = affixIndex;
        setSaveData(save);
        forgeCurrentEquip = targetEquip;
    }
    // 重新渲染
    renderReformPanel();
}


// 渲染底部操作区（改造石消耗 + 随机改造按钮）
function renderReformActionArea() {
    const equip = forgeCurrentEquip;
    const area = document.getElementById('reformActionArea');
    if (!area) return;

    if (!equip || !equip.affixes || equip.affixes.length === 0) {
        area.innerHTML = '<div class="forge-action-area" style="text-align:center;color:#4a2c11;">该装备没有可改造的词缀</div>';
        return;
    }

    // ★ 已改造装备：如果有锁定词缀，仍然允许改造（可反复改造）
    if (equip.reformReformed === true) {
        const lockedIdx = equip.reformLockedAffixIndex;
        if (lockedIdx === undefined || lockedIdx < 0) {
            area.innerHTML = '<div class="forge-action-area" style="text-align:center;color:#4a2c11;">该装备已改造，无法再次改造</div>';
            return;
        }
        // 有锁定词缀，继续执行下面的逻辑，显示改造按钮
    }

    const lockedIdx = equip.reformLockedAffixIndex;
    if (lockedIdx === undefined || lockedIdx < 0) {
        area.innerHTML = '<div class="forge-action-area" style="text-align:center;color:#4a2c11;">请先选择改造位</div>';
        return;
    }

    // 改造石信息
    const stage = getEquipStage(equip);
    const stoneCfg = getReformStoneByStage(stage);
    const stoneInfo = stoneCfg ? (window.OTHER_ITEM_CONFIG?.[stoneCfg.cfgId]) : null;
    const stoneName = stoneInfo?.name || '改造石';
    const cost = REFORM_CONFIG.costPerReform;
    const owned = stoneCfg ? getPlayerItemCount(stoneCfg.cfgId) : 0;
    const hasEnough = owned >= cost;
    const stoneColor = hasEnough ? '#22c55e' : '#ef4444';

    let html = '<div class="forge-action-area">';
    html += `<div class="forge-action-row material-row">
                <span class="row-label">
                    <span class="row-label-text">${stoneName}</span>
                    <span class="row-label-colon">：</span>
                </span>
                <span class="row-value">
                    <span class="material-num" style="color:${stoneColor};font-weight:600;">${cost}</span>
                    <span class="material-slash"> / </span>
                    <span class="material-denom">${owned}</span>
                </span>
            </div>`;

    const disabled = !hasEnough ? 'disabled' : '';
    const btnText = !hasEnough ? `${stoneName}不足` : '随机改造';
    html += `<button class="forge-enhance-btn" id="reformDoBtn" ${disabled}>
                ${btnText}
            </button>`;

    html += '</div>';
    area.innerHTML = html;

    // 绑定改造按钮事件
    const reformBtn = document.getElementById('reformDoBtn');
    if (reformBtn && hasEnough) {
        reformBtn.addEventListener('click', doReform);
    }
}

// 执行改造（随机选择目标词缀类型）
function doReform() {
    const save = getSaveData();
    let equip;

    if (forgeEquipSource === 'bag' && forgeBagIndex >= 0) {
        equip = save.bag[forgeBagIndex];
    } else if (forgeEquipSource === 'wear' && forgeWearPos) {
        equip = save.equipWear[forgeWearPos];
    } else {
        showToast('无法获取装备数据');
        return;
    }
    if (!equip) {
        showToast('装备不存在');
        return;
    }

    forgeCurrentEquip = equip;

    const lockedIdx = equip.reformLockedAffixIndex;
    if (lockedIdx === undefined || lockedIdx < 0 || !equip.affixes || !equip.affixes[lockedIdx]) {
        showToast('请先选择需要改造的词条');
        return;
    }

    // 检查改造石
    const stage = getEquipStage(equip);
    const stoneCfg = getReformStoneByStage(stage);
    if (!stoneCfg) {
        showToast('无法确定改造石类型');
        return;
    }

    const cost = REFORM_CONFIG.costPerReform;
    const owned = getPlayerItemCount(stoneCfg.cfgId);
    if (owned < cost) {
        const stoneName = (window.OTHER_ITEM_CONFIG?.[stoneCfg.cfgId]?.name) || stoneCfg.cfgId;
        showToast(`${stoneName}不足，需要 ${cost} 个`);
        return;
    }

    // 随机选择目标词缀类型
    const position = equip.position;
    const { lib } = getAffixLibByPosition(position);

    // 排除其他词缀类型（当前改造位类型保留在池中）
    const existingTypes = equip.affixes
        .filter((_, idx) => idx !== lockedIdx)
        .map(a => a.type);

    const maxTier = Math.min(12, Math.ceil(equip.ilvl / 10));

    const availableTargets = lib.filter(affixDef => {
        const minTier = affixDef.minTier || 1;
        return !existingTypes.includes(affixDef.type) && maxTier >= minTier;
    });

    if (availableTargets.length === 0) {
        showToast('没有可用的目标词缀');
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableTargets.length);
    const targetDef = availableTargets[randomIndex];
    const reformTargetAffixType = targetDef.type;
    const reformTargetAffixName = targetDef.name;

    // 扣除改造石
    if (!save.otherItems) save.otherItems = {};
    save.otherItems[stoneCfg.cfgId] = (save.otherItems[stoneCfg.cfgId] || 0) - cost;

    // 生成新词缀
    const ilvl = equip.ilvl;
    const tier = Math.min(12, Math.ceil(ilvl / 10)); // 或使用 window.randomAffixTier(ilvl)
    const { getValueRange } = getAffixLibByPosition(position);
    const [minVal, maxVal] = getValueRange(reformTargetAffixType, tier);
    const randomVal = minVal + Math.random() * (maxVal - minVal);
    const decimal = targetDef.decimal !== undefined ? targetDef.decimal : 0;
    const newValue = parseFloat(randomVal.toFixed(decimal));

    // 替换词缀
    equip.affixes[lockedIdx] = {
        name: reformTargetAffixName,
        type: reformTargetAffixType,
        value: newValue,
        tier: tier
    };

    // 重置目标选择（不再使用全局变量，只清空本地状态）
    // 装备标记为已改造
    equip.reformReformed = true;

    setSaveData(save);
    renderReformPanel();
    refreshCharacterPanel();
    showToast(`改造成功！将 ${equip.affixes[lockedIdx].name} 替换为 ${reformTargetAffixName} T${tier}`);
}


// 渲染右侧可用词缀池（只读展示）
function renderReformAffixReference() {
    const refEl = document.getElementById('reformAffixReference');
    if (!refEl) return;
    const equip = forgeCurrentEquip;
    if (!equip || !equip.affixes || equip.affixes.length === 0) {
        refEl.innerHTML = '<div style="padding:12px;color:#4a2c11;">请先选择装备</div>';
        return;
    }

    const lockedIdx = equip.reformLockedAffixIndex;
    // 已改造但没有锁定索引 → 提示（异常情况）
    if (equip.reformReformed === true && (lockedIdx === undefined || lockedIdx < 0)) {
        refEl.innerHTML = '<div style="padding:12px;color:#4a2c11;">该装备已改造，无法再次改造</div>';
        return;
    }
    if (lockedIdx === undefined || lockedIdx < 0) {
        refEl.innerHTML = '<div style="padding:12px;color:#4a2c11;">请点击左侧词缀选择改造位</div>';
        return;
    }

    const position = equip.position;
    const { lib } = getAffixLibByPosition(position);

    // 排除其他词缀类型（当前改造位类型允许出现在列表中）
    const existingTypes = equip.affixes
        .filter((_, idx) => idx !== lockedIdx)
        .map(a => a.type);

    const maxTier = Math.min(12, Math.ceil(equip.ilvl / 10));

    const availableAffixes = lib.filter(affixDef => {
        const minTier = affixDef.minTier || 1;
        return !existingTypes.includes(affixDef.type) && maxTier >= minTier;
    });

    const sorted = [...availableAffixes].sort((a, b) => (a.minTier || 1) - (b.minTier || 1));

    let html = '<div class="reform-right-title">可改造为目标词缀：</div>';
    html += '<div class="reform-target-list readonly">';

    sorted.forEach(affixDef => {
        const minTier = affixDef.minTier || 1;
        const tierRange = minTier === maxTier ? `T${minTier}` : `T${minTier}~T${maxTier}`;

        html += `<div class="reform-target-item">
                    <span class="reform-target-name">${affixDef.name}</span>
                    <span class="reform-target-tier">${tierRange}</span>
                </div>`;
    });

    html += '</div>';
    refEl.innerHTML = html;
}
function renderReformBottom() {
    renderReformActionArea();
}
// ===================== 结束改造系统 =====================

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
            lastForgeTab = target; 
            document.querySelectorAll('.forge-panel').forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById('forgePanel' + 
                target.charAt(0).toUpperCase() + target.slice(1));
            if (targetPanel) targetPanel.classList.add('active');
            
            // 改造Tab：渲染改造面板
            if (target === 'reform' && forgeCurrentEquip) {
                renderReformPanel();
            } else if (target === 'enhance' && forgeCurrentEquip) {
                renderForgeModule();
            }
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