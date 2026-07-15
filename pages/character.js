// ===== 角色模块 - 属性、装备、背包 =====

// 当前背包过滤筛选器 ('all' 或 部位名)
let bagFilter = 'weapon';
// 自动出售配置缓存
let autoSellConfig = JSON.parse(localStorage.getItem("auto_sell_config")) || {
    qualityConfigs: {}
};
let otherItemListCache = [];    // 缓存当前其他物品的显示列表
// 当前背包排序模式：'time' 按获得时间 | 'part' 按部位 → 同部位按物品等级 | 'ilvl' 按物品等级
let bagSortMode = 'time';
const SORT_MODE_LABELS = {
    time: '获得时间',
    part: '部位排序',
    ilvl: '物品等级'
};
// 部位的固定显示顺序（用于按部位排序）
const POSITION_SORT_ORDER = ['weapon', 'helmet', 'armor', 'pants', 'glove', 'boot', 'ring', 'necklace'];

function smartFormat(value, maxDecimals = 1) {
    // 检查是否为整数（考虑浮点误差）
    if (Math.abs(value - Math.round(value)) < 1e-9) {
        return value.toFixed(0);
    }
    // 格式化到 maxDecimals 位，再去除末尾的0
    let formatted = value.toFixed(maxDecimals);
    // 如果末尾有 .0 则去掉（尽管上一步已经处理了整数，但防止 float 误差）
    formatted = formatted.replace(/\.?0+$/, '');
    return formatted;
}

// 新增：判断当前是否为其他物品Tab
function isOtherTab() {
    return bagFilter === 'other';
}

// ===== 唯一属性显示配置 =====
const ATTR_DISPLAY_CONFIG = {
    hp:          { label: '生命值',    format: val => smartFormat(val, 1), show: true,  group: '基础属性' },
    mp:          { label: '魔力',      format: val => smartFormat(val, 1), show: false,  group: '基础属性' },
    hpRegen:     { label: '生命恢复',  format: val => smartFormat(val, 1), show: false, group: '基础属性' },
    mpRegen:     { label: '魔力恢复',  format: val => smartFormat(val, 1), show: false, group: '基础属性' },
    str:         { label: '力量',    format: val => smartFormat(val, 1), show: false, group: '基础属性' },
    agi:         { label: '敏捷',    format: val => smartFormat(val, 1), show: false, group: '基础属性' },
    int:         { label: '智慧',    format: val => smartFormat(val, 1), show: false, group: '基础属性' },
    // 防御属性
    def:         { label: '护甲',      format: val => smartFormat(val, 1), show: true,  group: '防御属性' },
    dodge:       { label: '闪避',      format: val => smartFormat(val, 1), show: true,  group: '防御属性' },
    fireResist:  { label: '火焰抗性',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '防御属性' },
    coldResist:  { label: '冰霜抗性',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '防御属性' },
    lightResist: { label: '闪电抗性',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '防御属性' },
    // 攻击属性
    atk:         { label: '攻击力',    format: val => smartFormat(val, 1), show: true,  group: '攻击属性' },
    attackSpeed: { label: '攻击速度',  format: val => smartFormat(val, 3), show: false, group: '攻击属性' },
    hit:         { label: '命中',      format: val => smartFormat(val, 1), show: true, group: '攻击属性' },
    critRate:    { label: '暴击率',    format: val => (val * 100).toFixed(1) + '%', show: true,  group: '攻击属性' },
    critDmg:     { label: '暴击伤害',   format: val => (val * 100).toFixed(1) + '%', show: true,  group: '攻击属性' },
    penetrateDef:{ label: '防御穿透',  format: val => (val * 100).toFixed(1) + '%', show: false, group: '攻击属性' },
    // 元素伤害
    fireDmg:     { label: '火焰点伤',  format: val => smartFormat(val, 1), show: false,  group: '元素伤害' },
    fireDmgPercent:  { label: '火焰伤害%',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '元素伤害' },
    firePen:     { label: '火焰穿透',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '元素伤害' },
    coldDmg:     { label: '冰霜点伤',  format: val => smartFormat(val, 1), show: false,  group: '元素伤害' },
    coldDmgPercent:  { label: '冰霜伤害%',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '元素伤害' },
    coldPen:     { label: '冰霜穿透',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '元素伤害' },
    lightDmg:    { label: '闪电点伤',  format: val => smartFormat(val, 1), show: false,  group: '元素伤害' },
    lightDmgPercent: { label: '闪电伤害%',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '元素伤害' },
    lightPen:    { label: '闪电穿透',  format: val => {const pct = val * 100; return smartFormat(pct, 1) + '%'; }, show: false, group: '元素伤害' },
    
    eleDmg: {
    label: '元素点伤',
    format: val => smartFormat(val, 1),
    custom: true,   // 标记为自定义计算属性
    show: true,
    group: '元素伤害'
    },
};
const ALL_ATTR_GROUPS = ['基础属性', '防御属性', '攻击伤害', '元素伤害'];

function formatAttrVal(val,decimal = 1) {
    return Number(val.toFixed(1)).toString();
}

function getTierClass(tier) {
    const t = Math.min(12, Math.max(1, Math.floor(tier)));
    return `tier-${t}`;
}

// 1. 渲染角色属性面板
function renderAttrPanel() {
    const save = getSaveData();
    const total = calcTotalAttr(save.baseAttr, save.equipWear);
    const wrap = document.getElementById('attrWrap');
    if (!wrap) return;

    // 计算元素点伤 = 火焰点伤 + 冰霜点伤 + 闪电点伤
    total.eleDmg = (total.fireDmg || 0) + (total.coldDmg || 0) + (total.lightDmg || 0);

    // 获取需要显示的属性列表（固定顺序）
    const visibleAttrs = Object.entries(ATTR_DISPLAY_CONFIG)
        .filter(([key, cfg]) => total[key] !== undefined && cfg.show !== false);

    // 首次渲染：创建 DOM 结构
    if (!wrap.dataset.initialized) {
        wrap.innerHTML = visibleAttrs.map(([key, cfg]) => `
            <div class="attr-item" data-key="${key}">
                <span>${cfg.label}</span>
                <span class="attr-value">${cfg.format(total[key])}</span>
            </div>
        `).join('');
        wrap.dataset.initialized = 'true';
    } else {
        // 增量更新：只更新数值
        visibleAttrs.forEach(([key, cfg]) => {
            const item = wrap.querySelector(`.attr-item[data-key="${key}"]`);
            if (item) {
                const valueSpan = item.querySelector('.attr-value');
                if (valueSpan) {
                    valueSpan.textContent = cfg.format(total[key]);
                }
            }
        });
    }

    // ★ 绑定“查看全部属性”按钮事件（保持原有逻辑，只绑定一次）
    const showAllBtn = document.getElementById('showAllAttrBtn');
    if (showAllBtn && !showAllBtn.dataset.listenerAttached) {
        showAllBtn.addEventListener('click', showAllAttrModal);
        showAllBtn.dataset.listenerAttached = 'true';
    }
}

// ★ 新增：显示全部属性弹窗
function showAllAttrModal() {
    const oldModal = document.querySelector('.all-attr-modal');
    if (oldModal) oldModal.remove();

    const save = getSaveData();
    const total = calcTotalAttr(save.baseAttr, save.equipWear);
    total.eleDmg = (total.fireDmg || 0) + (total.coldDmg || 0) + (total.lightDmg || 0);

    // 按键值分组收集
    const groupMap = {};
    Object.entries(ATTR_DISPLAY_CONFIG).forEach(([key, cfg]) => {
        if (total[key] === undefined) return;
        const group = cfg.group || '其他';
        if (!groupMap[group]) groupMap[group] = [];
        groupMap[group].push({ key, cfg });
    });

    // 按分组顺序渲染
    const groupHtml = ALL_ATTR_GROUPS
        .filter(g => groupMap[g]) // 跳过空组
        .map(g => {
            const itemsHtml = groupMap[g].map(({ key, cfg }) => `
                <div class="all-attr-item">
                    <span class="all-attr-name">${cfg.label}</span>
                    <span class="all-attr-value">${cfg.format(total[key])}</span>
                </div>
            `).join('');
            return `
                <div class="all-attr-group">
                    <div class="all-attr-group-title">${g}</div>
                    ${itemsHtml}
                </div>
                <div class="all-attr-divider"></div>
            `;
        }).join('');

    // 处理未分组的属性（归入"其他"）
    const otherGroup = groupMap['其他'];
    if (otherGroup) {
        groupHtml += `
            <div class="all-attr-group">
                <div class="all-attr-group-title">其他</div>
                ${otherGroup.map(({ key, cfg }) => `
                    <div class="all-attr-item">
                        <span class="all-attr-name">${cfg.label}</span>
                        <span class="all-attr-value">${cfg.format(total[key])}</span>
                    </div>
                `).join('')}
            </div>
            <div class="all-attr-divider"></div>
        `;
    }

    const modal = document.createElement('div');
    modal.className = 'all-attr-modal';
    modal.innerHTML = `
        <div class="all-attr-box">
            <div class="all-attr-header">
                <span>全部人物属性</span>
                <button class="all-attr-close-btn" id="closeAllAttrModal">&times;</button>
            </div>
            <div class="all-attr-content">
                ${groupHtml}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeAllAttrModal').onclick = () => modal.remove();
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
}

// 2. 渲染6个装备穿戴槽（带指纹缓存，锁定图标单独一行）
function renderEquipSlots() {
    const save = getSaveData();
    const slots = document.querySelectorAll('.equip-slot');
    slots.forEach(slot => {
        const pos = slot.dataset.pos;
        const equip = save.equipWear[pos];

        // 生成指纹（id + 锁定 + 强化等级 + 稀有度）
        const currentFingerprint = equip 
            ? `${equip.id}_${equip.locked ? '1' : '0'}_${equip.enhanceLevel || 0}_${equip.rarityName}`
            : 'empty';
        if (slot.dataset.lastFingerprint === currentFingerprint) return;
        slot.dataset.lastFingerprint = currentFingerprint;

        if (equip) {
            const enhanceStr = equip.enhanceLevel ? `+${equip.enhanceLevel}` : '';
            const lockHtml = equip.locked ? '<span class="equip-lock-icon">🔒</span>' : '';
            // 名称 + 强化等级（空格分隔），锁通过浮动定位到右上角
            slot.innerHTML = `${equip.name} ${enhanceStr}${lockHtml}`;
            slot.className = `equip-slot has-equip ${getRarityClass(equip.rarityName)}`;
            slot.onclick = () => showEquipTip(equip, pos);
        } else {
            slot.className = 'equip-slot';
            // 使用自定义图标图片，若有图标则插入 img，否则显示文字
            const iconSrc = window.POSITION_ICON && window.POSITION_ICON[pos];
            if (iconSrc) {
                slot.innerHTML = `<img src="${iconSrc}" alt="${POSITION_NAME[pos]}" class="slot-icon">`;
            } else {
                slot.innerHTML = POSITION_NAME[pos];
            }
            slot.onclick = null;
        }
    });
}

// 3. 渲染背包列表（支持部位过滤）
function renderBagList() {
    const save = getSaveData();
    const bagWrap = document.getElementById('bagGrid');
    if (!bagWrap) return;

    // ===== 如果是"其他" Tab =====
    if (bagFilter === 'other') {
        renderOtherItemsList(save, bagWrap);
        return;
    }

    function isEquipMatchFilter(equip, filter) {
    if (filter === 'weapon') return equip.position === 'weapon';
    if (filter === 'armor') return ['helmet', 'armor', 'boot', 'pants', 'glove'].includes(equip.position);
    if (filter === 'jewelry') return ['ring', 'necklace'].includes(equip.position);
    return false; // other 不在这里处理
}

    const filteredWithIndex = save.bag
        .map((equip, idx) => ({ equip, idx }))
        .filter(({ equip }) => isEquipMatchFilter(equip, bagFilter));

    // 排序：按物品等级(ilvl)降序，同等级按id(掉落时间)降序
    if (bagSortMode === 'time') {
        // 按获得时间（id升序，老的在前）
        filteredWithIndex.sort((a, b) => (a.equip.id || 0) - (b.equip.id || 0));
    } else if (bagSortMode === 'part') {
        // 按部位排序（使用固定顺序），同部位按 ilvl 降序
        filteredWithIndex.sort((a, b) => {
            const orderA = POSITION_SORT_ORDER.indexOf(a.equip.position);
            const orderB = POSITION_SORT_ORDER.indexOf(b.equip.position);
            if (orderA !== orderB) return orderA - orderB;
            return (b.equip.ilvl || 0) - (a.equip.ilvl || 0);
        });
    } else if (bagSortMode === 'ilvl') {
        // 按物品等级降序，同级按id降序（新获取的在前）
        filteredWithIndex.sort((a, b) => {
            if (a.equip.ilvl !== b.equip.ilvl) {
                return (b.equip.ilvl || 0) - (a.equip.ilvl || 0);
            }
            return (b.equip.id || 0) - (a.equip.id || 0);
        });
    }

    // ★ 新增：生成装备格 HTML
    bagWrap.innerHTML = filteredWithIndex.map(({ equip, idx }) => {
        const rClass = getRarityClass(equip.rarityName);
        const enhanceStr = equip.enhanceLevel
            ? `<span class="enhance-badge">+${equip.enhanceLevel}</span>`
            : '';
        const lockIcon = equip.locked
            ? '<span class="bag-lock-icon">🔒</span>'
            : '';
        return `<div class="bag-item ${rClass}" data-index="${idx}" style="position:relative;">
            ${equip.name}${enhanceStr}
            ${lockIcon}
        </div>`;
    }).join('');

    // 给每个背包装备绑定点击弹窗事件（使用原始索引）
    bagWrap.querySelectorAll('.bag-item').forEach(item => {
        item.onclick = () => {
            const idx = Number(item.dataset.index);
            showEquipTip(save.bag[idx], null, idx);
        };
    });
}
/**
 * 渲染其他物品列表（支持堆叠拆分）
 * @param {Object} save - 存档数据
 * @param {HTMLElement} wrap - 背包网格容器
 */
// js\pages\character.js

function renderOtherItemsList(save, wrap) {
    const otherMap = save.otherItems || {};
    const displayList = [];

    Object.keys(otherMap).forEach(cfgId => {
        const config = window.OTHER_ITEM_CONFIG[cfgId];
        if (!config) return;

        const totalCount = otherMap[cfgId];
        const maxStack = config.maxStack || 50;

        let remaining = totalCount;
        while (remaining > 0) {
            const stackCount = Math.min(remaining, maxStack);
            displayList.push({
                cfgId: cfgId,
                stackCount: stackCount,
                totalCount: totalCount
            });
            remaining -= stackCount;
        }
    });

    const configOrder = Object.keys(window.OTHER_ITEM_CONFIG);
    displayList.sort((a, b) => configOrder.indexOf(a.cfgId) - configOrder.indexOf(b.cfgId));

    // ★ 辅助函数：根据 rarity 索引获取颜色
    function getRarityColor(rarityIdx) {
        if (rarityIdx === undefined || rarityIdx === null) return '#ffffff'; // 默认白色
        const rarityConfig = window.MONSTER_RARITY && window.MONSTER_RARITY[rarityIdx];
        return rarityConfig ? rarityConfig.color : '#ffffff';
    }

    wrap.innerHTML = displayList.map((item, idx) => {
        const config = window.OTHER_ITEM_CONFIG[item.cfgId];
        const color = getRarityColor(config.rarity);
        const displayName = item.stackCount > 1 
            ? `${config.name} x ${item.stackCount}`
            : config.name;

        return `<div class="bag-item other-item" data-cfgid="${item.cfgId}" data-stackcount="${item.stackCount}" data-total="${item.totalCount}">
            <span style="color: ${color};">${displayName}</span>
        </div>`;
    }).join('');

    wrap.querySelectorAll('.bag-item.other-item').forEach(el => {
        el.onclick = function() {
            const cfgId = this.dataset.cfgid;
            const config = window.OTHER_ITEM_CONFIG[cfgId];
            if (config) {
                showOtherItemTip(config);
            }
        };
    });
}

// 4. 初始化背包过滤标签页
function renderBagFilters() {
    const tabsContainer = document.getElementById('bagFilterTabs');
    if (!tabsContainer) return;

    // 点击事件委托
    tabsContainer.addEventListener('click', function(e) {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        const filter = tab.dataset.filter;
        if (filter === bagFilter) return;

        // 更新样式
        tabsContainer.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 更新过滤状态并重新渲染背包
        bagFilter = filter;
        renderBagList();
    });
}

// 排序切换
function initSortToggle() {
    const sortBtn = document.getElementById('sortToggleBtn');
    if (!sortBtn) return;
    sortBtn.addEventListener('click', function() {
        // 循环切换：time → part → ilvl → time
        const order = ['time', 'part', 'ilvl'];
        const currentIdx = order.indexOf(bagSortMode);
        bagSortMode = order[(currentIdx + 1) % order.length];
        // 刷新背包列表
        renderBagList();
        // Toast 提示
        const label = SORT_MODE_LABELS[bagSortMode];
        showToast(`背包内物品已按${label}排序`);
    });
}

// 在 initCharacterModule 末尾加上：
initSortToggle();
/**
 * 反向查找：某个物品可以从哪些宝箱中开出
 * @param {string} cfgId - 物品配置ID
 * @returns {Array<{sourceName: string, rate: number, isGuaranteed: boolean, amount: number}>}
 */
function findItemSources(cfgId) {
    const sources = [];
    const allConfigs = window.OTHER_ITEM_CONFIG || {};
    Object.values(allConfigs).forEach(chestConfig => {
        if (chestConfig.type !== window.OTHER_ITEM_TYPE.CHEST) return;
        const contents = chestConfig.openContents;
        if (!contents) return;

        // 检查固定掉落
        if (contents.guaranteed) {
            contents.guaranteed.forEach(entry => {
                if (entry.type === 'item' && entry.cfgId === cfgId) {
                    sources.push({
                        sourceName: chestConfig.name,
                        rate: 1.0,
                        isGuaranteed: true,
                        amount: entry.amount
                    });
                }
            });
        }
        // 检查随机掉落
        if (contents.random) {
            contents.random.forEach(entry => {
                if (entry.type === 'item' && entry.cfgId === cfgId) {
                    sources.push({
                        sourceName: chestConfig.name,
                        rate: entry.rate,
                        isGuaranteed: false,
                        amount: entry.amount
                    });
                }
            });
        }
    });
    return sources;
}
/**
 * 显示其他物品的说明弹窗
 * @param {Object} config - OTHER_ITEM_CONFIG 中的配置项
 */
function showOtherItemTip(config) {
    const oldModal = document.querySelector('.equip-tip-modal');
    if (oldModal) oldModal.remove();

    let rarityColor = '#ffffff';
    if (config.rarity !== undefined && window.MONSTER_RARITY && window.MONSTER_RARITY[config.rarity]) {
        rarityColor = window.MONSTER_RARITY[config.rarity].color;
    }

    const isChest = config.type === window.OTHER_ITEM_TYPE.CHEST;
    let extraHtml = '';

    // ---- 对所有物品显示【物品来源】（反向从宝箱配置中查找） ----
    const sources = findItemSources(config.id);
    if (sources.length > 0) {
        let lines = '';
        sources.forEach(src => {
            const rateText = src.isGuaranteed
                ? '固定'
                : (src.rate * 100).toFixed(1) + '%';
            lines += `  • ${src.sourceName}：${rateText}概率获得 x ${src.amount}\n`;
        });
        extraHtml += `
            <div class="equip-divider"></div>
            <div class="base-attr-title">【物品来源】</div>
            <div class="base-attr-item">
                <span class="attr-value" style="width:100%;white-space:pre-wrap;">${lines}</span>
            </div>
        `;
    }
    // ---------- 宝箱专用内容 ----------
    if (isChest) {
        // 掉落来源
        if (config.dropSources && config.dropSources.length > 0) {
            const sourceLines = config.dropSources.map(src => {
                const stages = `第${src.regionStageRange[0]}-${src.regionStageRange[1]}区`;
                const qualityName = window.MONSTER_RARITY[src.monsterQuality]?.name || '未知';
                const ratePct = (src.rate * 100).toFixed(1) + '%';
                return `${qualityName}怪物 (${stages})  ${ratePct}概率掉落`;
            }).join('\n');
            extraHtml += `
                <div class="equip-divider"></div>
                <div class="base-attr-title">【掉落来源】</div>
                <div class="base-attr-item">
                    <span class="attr-value" style="width:100%;white-space:pre-wrap;">${sourceLines}</span>
                </div>
            `;
        }

        // 开启内容
        if (config.openContents) {
            let contentsHtml = '';
            if (config.openContents.guaranteed) {
                config.openContents.guaranteed.forEach(entry => {
                    const name = entry.type === 'gold' ? '金币' : (window.OTHER_ITEM_CONFIG[entry.cfgId]?.name || entry.cfgId);
                    contentsHtml += `  • 固定：${name} x ${entry.amount}\n`;
                });
            }
            if (config.openContents.random) {
                config.openContents.random.forEach(entry => {
                    const name = entry.type === 'gold' ? '金币' : (window.OTHER_ITEM_CONFIG[entry.cfgId]?.name || entry.cfgId);
                    const ratePct = (entry.rate * 100).toFixed(1) + '%';
                    contentsHtml += `  • ${ratePct}概率：${name} x ${entry.amount}\n`;
                });
            }
            extraHtml += `
                <div class="equip-divider"></div>
                <div class="base-attr-title">【开启内容】</div>
                <div class="base-attr-item">
                    <span class="attr-value" style="width:100%;white-space:pre-wrap;">${contentsHtml}</span>
                </div>
            `;
        }
    }

    const modal = document.createElement('div');
    modal.className = 'equip-tip-modal';
    modal.innerHTML = `
        <div class="equip-tip-box">
            <div class="equip-header">
                <div class="equip-header-top">
                    <div class="equip-header-left">
                        <span class="equip-name" style="color: ${rarityColor};">${config.name}</span>
                    </div>
                </div>
                <div class="equip-header-bottom">
                    <div class="equip-level">类型: ${config.category || config.type}</div>
                </div>
            </div>
            <div class="equip-divider"></div>
            <div class="base-attr-title">【物品说明】</div>
            <div class="base-attr-item">
                <span class="attr-value" style="width:100%;white-space:pre-wrap;">${config.description}</span>
            </div>
            ${extraHtml}
            <div class="tip-btn-group" style="margin-top:16px;">
                ${isChest ? `
                    <button class="tip-btn btn-wear" id="openOneChest">开启一个</button>
                    <button class="tip-btn btn-wear" id="openAllChest">全部开启</button>
                ` : ''}
                <button class="tip-btn btn-close" id="closeOtherTip">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeOtherTip').onclick = () => modal.remove();
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });

    // 宝箱按钮事件
    if (isChest) {
        document.getElementById('openOneChest').onclick = function() {
            const save = getSaveData();
            const count = save.otherItems[config.id] || 0;
            if (count <= 0) {
                showToast('没有足够的宝箱');
                return;
            }
            const result = openSingleChest(config.id);
            if (result) {
                showChestOpenToast(config.name, result);
                modal.remove();
                refreshCharacterPanel();
            }
        };

        document.getElementById('openAllChest').onclick = function() {
            const save = getSaveData();
            const totalCount = save.otherItems[config.id] || 0;
            if (totalCount <= 0) {
                showToast('没有足够的宝箱');
                return;
            }
            let totalGold = 0;
            const itemAgg = {}; // { name: amount }
            for (let i = 0; i < totalCount; i++) {
                const result = openSingleChest(config.id);
                if (result) {
                    totalGold += result.gold;
                    result.itemGains.forEach(g => {
                        itemAgg[g.name] = (itemAgg[g.name] || 0) + g.amount;
                    });
                }
            }
            // 构建结果展示
            const lines = [`开启了 ${totalCount} 个 [${config.name}]`];
            if (totalGold > 0) lines.push(`💰 共获得 ${totalGold} 金币`);
            Object.entries(itemAgg).forEach(([name, amt]) => lines.push(`  + ${name} x ${amt}`));
            showChestOpenToastExtra(lines.join('\n'));
            modal.remove();
            refreshCharacterPanel();
        };
    }
}


// ===== 核心弹窗渲染 =====
function showEquipTip(equip, wearPos, bagIndex) {
    const old = document.querySelector('.equip-tip-modal');
    if (old) old.remove();
    const oldContainer = document.querySelector('.equip-compare-container');
    if (oldContainer) oldContainer.remove();

    const isWorn = (wearPos !== null);
    const isBag = (wearPos === null);

    // 获取已穿戴装备
    let wearEquip = null;
    if (isBag) {
        const save = getSaveData();
        wearEquip = save.equipWear[equip.position] || null;
    }

    // ---------- 辅助：生成单装备 HTML（不含按钮） ----------
    function buildEquipCardHtml(eq, showWearBadge) {
        const rClass = getRarityClass(eq.rarityName);
        const enhanceBadgeHtml = eq.enhanceLevel
        ? `<span class="enhance-level">+${eq.enhanceLevel}</span>`
        : '';
        let baseHtml = '';
        if (eq.baseAttr) {
            const template = getEquipBaseTemplate(eq.ilvl, eq.position, eq.subType);
            let baseKeys;
            if (template) {
                baseKeys = Object.keys(template.base);
                if (baseKeys.includes('eleDmg')) {
                    const actualEleKey = Object.keys(eq.baseAttr).find(key =>
                        ['fireDmg', 'coldDmg', 'lightDmg'].includes(key)
                    );
                    if (actualEleKey) {
                        baseKeys = baseKeys.map(k => k === 'eleDmg' ? actualEleKey : k);
                    } else {
                        baseKeys = baseKeys.filter(k => k !== 'eleDmg');
                    }
                }
            } else {
                baseKeys = Object.keys(eq.baseAttr);
            }
            baseHtml = baseKeys
                .filter(key => eq.baseAttr[key] !== undefined)
                .map(key => {
                    const val = eq.baseAttr[key];
                    const cfg = ATTR_DISPLAY_CONFIG[key];
                    const label = cfg ? cfg.label : key;
                    // 计算总和：基础值 + 强化加成
                    const total = val + (eq.enhanceBonus?.[key] ?? 0);
                    const valStr = cfg ? cfg.format(total) : total.toFixed(1);
                    return `<div class="base-attr-item">
                        <span class="attr-name">${label}</span>
                        <span class="attr-value">+ ${valStr}</span>
                    </div>`;
                }).join('');
        }
        let affixHtml = '';
        if (eq.affixes && eq.affixes.length > 0) {
            const typeOrderMap = {};
            if (window.ALL_AFFIX) {
                window.ALL_AFFIX.forEach((def, idx) => typeOrderMap[def.type] = idx);
            }
            const sortedAffixes = [...eq.affixes].sort((a, b) => {
                const oa = typeOrderMap[a.type] ?? Infinity;
                const ob = typeOrderMap[b.type] ?? Infinity;
                return oa - ob;
            });
            affixHtml = sortedAffixes.map(aff => {
                const tier = aff.tier || 1;
                const tClass = getTierClass(tier);
                const valStr = aff.value > 1
                    ? formatAttrVal(aff.value)
                    : formatAttrVal(aff.value * 100) + '%';
                return `<div class="affix-item">
                    <span class="affix-name">
                        <span class="affix-tier ${tClass}">T${tier}</span>
                        ${aff.name}
                    </span>
                    <span class="affix-value">+ ${valStr}</span>
                </div>`;
            }).join('');
        }
        return `
            <div class="equip-header">
                <div class="equip-header-top">
                    <div class="equip-header-left">
                        <span class="equip-name ${rClass}">${eq.name}${enhanceBadgeHtml}</span>
                    </div>
                    <div class="equip-header-right">
                        <span class="lock-toggle-btn ${eq.locked ? 'locked' : 'unlocked'}" 
                            title="${eq.locked ? '点击解锁' : '点击锁定'}">
                            ${eq.locked ? '🔒' : '🔓'}
                        </span>
                    </div>
                </div>
                <div class="equip-header-bottom">
                    <div class="equip-level">装等：${eq.ilvl}</div>
                </div>
            </div>

            <div class="equip-divider"></div>
            <div class="base-attr-title">【基础属性】</div>
            ${baseHtml}
            ${eq.affixes ? `
                <div class="equip-divider"></div>
                <div class="affix-title">【随机词条】</div>
                ${eq.affixes.length ? affixHtml : '<div class="base-attr-item">无</div>'}
            ` : ''}
        `;
    }

    // ========== 分支1：已穿戴装备弹窗 ==========
    if (isWorn) {
        const modal = document.createElement('div');
        modal.className = 'equip-tip-modal';
        modal.innerHTML = `
            <div class="equip-tip-box" style="display:flex;flex-direction:column;">
                ${buildEquipCardHtml(equip, true)}
                <div class="tip-btn-group">
                    <button class="tip-btn btn-unload" id="unloadEquip">卸下装备</button>
                    <button class="tip-btn btn-forge" id="forgeEquip">打造</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('unloadEquip').onclick = () => {
            equipUnloadItem(wearPos);
            modal.remove();
        };
        document.getElementById('forgeEquip').onclick = () => {
            modal.remove();
            openForgeModule(equip, null, wearPos);
        };
        // ★ 锁定图标点击事件
        modal.querySelector('.lock-toggle-btn').onclick = function() {
            const save = getSaveData();
            const e = save.equipWear[wearPos];
            if (e) {
                e.locked = !e.locked;
                setSaveData(save);
                refreshCharacterPanel();
                // 立即更新弹窗内的锁图标
                this.textContent = e.locked ? '🔒' : '🔓';
                this.title = e.locked ? '点击解锁' : '点击锁定';
                this.className = 'lock-toggle-btn ' + (e.locked ? 'locked' : 'unlocked');
            }
        };
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });
        return;
    }

    // ========== 分支2：背包装备 + 有已穿戴装备（双弹窗对比） ==========
    if (isBag && wearEquip) {
        const container = document.createElement('div');
        container.className = 'equip-compare-container';
        container.innerHTML = `
            <div class="equip-tip-box wear-equip-card" style="display:flex;flex-direction:column;">
                ${buildEquipCardHtml(wearEquip, true)}
                <div class="tip-btn-group">
                    <button class="tip-btn btn-unload" id="unloadCompareWear">卸下装备</button>
                </div>
            </div>
            <div class="equip-tip-box" style="display:flex;flex-direction:column;">
                ${buildEquipCardHtml(equip, false)}
                <div class="tip-btn-group">
                    <button class="tip-btn btn-wear" id="wearEquip">穿戴</button>
                    <button class="tip-btn btn-forge" id="forgeEquip">打造</button>
                    <button class="tip-btn btn-destroy" id="sellBagEquip" ${equip.locked ? 'disabled' : ''}>出售</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        container.addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });

        // 左侧已穿戴按钮
        document.getElementById('unloadCompareWear').onclick = () => {
            const pos = equip.position;
            equipUnloadItem(pos);
            container.remove();
        };
        // ★ 左侧锁定图标点击（已穿戴装备）
        container.querySelector('.wear-equip-card .lock-toggle-btn').onclick = function() {
            const save = getSaveData();
            const pos = equip.position;
            const e = save.equipWear[pos];
            if (e) {
                e.locked = !e.locked;
                setSaveData(save);
                refreshCharacterPanel();
                // 立即更新锁图标
                this.textContent = e.locked ? '🔒' : '🔓';
                this.title = e.locked ? '点击解锁' : '点击锁定';
                this.className = 'lock-toggle-btn ' + (e.locked ? 'locked' : 'unlocked');
            }
        };

        // 右侧背包按钮
        document.getElementById('wearEquip').onclick = () => {
            equipWearItem(bagIndex, equip.position);
            container.remove();
        };
        // ★ 右侧锁定图标点击（背包装备）
        container.querySelector('.equip-tip-box:not(.wear-equip-card) .lock-toggle-btn').onclick = function() {
            const save = getSaveData();
            const e = save.bag[bagIndex];
            if (e) {
                e.locked = !e.locked;
                setSaveData(save);
                refreshCharacterPanel();
                // 立即更新锁图标
                this.textContent = e.locked ? '🔒' : '🔓';
                this.title = e.locked ? '点击解锁' : '点击锁定';
                this.className = 'lock-toggle-btn ' + (e.locked ? 'locked' : 'unlocked');
            }
        };
        
        document.getElementById('sellBagEquip').onclick = function() {
            if (equip.locked) {
                alert('该装备已锁定，请先解锁');
                return;
            }
            const save = getSaveData();
            const price = calcEquipSellPrice(equip);
            save.gold = (save.gold || 0) + price;
            save.bag.splice(bagIndex, 1);
            setSaveData(save);
            refreshCharacterPanel();
            container.remove();
            showToast(`出售装备获得 ${price} 金币`);
        };
        document.getElementById('forgeEquip').onclick = () => {
            container.remove();
            openForgeModule(equip, bagIndex, null);
        };
        return;
    }

    // ========== 分支3：背包装备 + 无已穿戴装备（单弹窗） ==========
    if (isBag && !wearEquip) {
        const modal = document.createElement('div');
        modal.className = 'equip-tip-modal';
        modal.innerHTML = `
            <div class="equip-tip-box" style="display:flex;flex-direction:column;">
                ${buildEquipCardHtml(equip, false)}
                <div class="tip-btn-group">
                    <button class="tip-btn btn-wear" id="wearEquip">穿戴</button>
                    <button class="tip-btn btn-forge" id="forgeEquip">打造</button>
                    <button class="tip-btn btn-destroy" id="sellBagEquip" ${equip.locked ? 'disabled' : ''}>出售</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('wearEquip').onclick = () => {
            equipWearItem(bagIndex, equip.position);
            modal.remove();
        };
        // ★ 锁定图标点击事件
        modal.querySelector('.lock-toggle-btn').onclick = function() {
            const save = getSaveData();
            const e = save.bag[bagIndex];
            if (e) {
                e.locked = !e.locked;
                setSaveData(save);
                refreshCharacterPanel();
                // 立即更新锁图标
                this.textContent = e.locked ? '🔒' : '🔓';
                this.title = e.locked ? '点击解锁' : '点击锁定';
                this.className = 'lock-toggle-btn ' + (e.locked ? 'locked' : 'unlocked');
            }
        };
        document.getElementById('sellBagEquip').onclick = () => {
            if (equip.locked) {
                alert('该装备已锁定，请先解锁');
                return;
            }
            const save = getSaveData();
            const price = calcEquipSellPrice(equip);
            save.gold = (save.gold || 0) + price;
            save.bag.splice(bagIndex, 1);
            setSaveData(save);
            refreshCharacterPanel();
            modal.remove();
            showToast(`出售装备获得 ${price} 金币`);
        };
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });
        document.getElementById('forgeEquip').onclick = () => {
            modal.remove();
            openForgeModule(equip, bagIndex, null);
        };
    }
}

// 穿戴装备
function equipWearItem(bagIndex, pos) {
    const save = getSaveData();
    const equip = save.bag[bagIndex];
    // 卸下当前部位旧装备
    if (save.equipWear[pos]) {
        save.bag.push(save.equipWear[pos]);
    }
    save.equipWear[pos] = equip;
    save.bag.splice(bagIndex, 1);
    setSaveData(save);
    refreshCharacterPanel();
}

// 卸下装备
function equipUnloadItem(pos) {
    const save = getSaveData();
    const equip = save.equipWear[pos];
    save.bag.push(equip);
    save.equipWear[pos] = null;
    setSaveData(save);
    refreshCharacterPanel();
}

/**
 * 构建品质配置区域的HTML（包含品质checkbox和可展开的配置面板）
 * @param {Object} configCache - 含有 qualityConfigs 属性的缓存对象
 * @returns {string} HTML 字符串
 */
function buildQualityConfigHtml(configCache) {
    if (!configCache.qualityConfigs) {
        configCache.qualityConfigs = {};
        RARITY_CONFIG.forEach(item => {
            configCache.qualityConfigs[item.name] = {
                checked: false,
                ilvlMin: 1,
                ilvlMax: 10,
                affixCount: 0,
                affixTierMin: 1
            };
        });
    }

    let html = "";
    RARITY_CONFIG.forEach(item => {
        const config = configCache.qualityConfigs[item.name] || {
            checked: false,
            ilvlMin: 1,
            ilvlMax: 10,
            affixCount: 0,
            affixTierMin: 1
        };

        const checkedAttr = config.checked ? "checked" : "";
        const panelDisplay = config.checked ? "block" : "none";
        const ilvlMinVal = config.ilvlMin;
        const ilvlMaxVal = config.ilvlMax;

        const affixCountOptions = ['', '1个', '2个', '3个', '4个', '5个', '6个'];
        const currentCountLabel = config.affixCount === 0 ? '' : config.affixCount + '个';

        const affixTierOptions = [];
        for (let i = 1; i <= 12; i++) affixTierOptions.push('T' + i);
        const currentTierLabel = 'T' + config.affixTierMin;

        html += `
        <div class="quality-group" data-quality="${item.name}">
            <div class="quality-check-item">
                <input type="checkbox" value="${item.name}" ${checkedAttr}>
                <span class="${item.className}">${item.label}</span>
            </div>
            <div class="quality-config-panel" style="display: ${panelDisplay}">
                <div class="config-row">
                    <label>物品等级</label>
                    <div class="level-range">
                        <input type="number" class="config-ilvl-min" data-quality="${item.name}" 
                            value="${ilvlMinVal}" min="1" max="999">
                        ~
                        <input type="number" class="config-ilvl-max" data-quality="${item.name}" 
                            value="${ilvlMaxVal}" min="1" max="999">
                    </div>
                </div>
                ${item.affixNum > 0 ? `
                <div class="config-row">
                    <label class="affix-filter-label">
                        <span>保留</span>
                        <select class="config-affix-count" data-quality="${item.name}">
                            ${affixCountOptions.map(opt => 
                                `<option value="${opt}" ${opt === currentCountLabel ? 'selected' : ''}>${opt === '' ? ' ' : opt}</option>`
                            ).join('')}
                        </select>
                        <select class="config-affix-tier" data-quality="${item.name}">
                            ${affixTierOptions.map(opt => 
                                `<option value="${opt}" ${opt === currentTierLabel ? 'selected' : ''}>${opt}</option>`
                            ).join('')}
                        </select>
                        <span>及以上词缀装备</span>
                    </label>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    });
    return html;
}

/**
 * 为弹窗内的品质配置区域绑定事件
 * @param {HTMLElement} modal - 弹窗容器
 * @param {Object} configCache - 配置缓存对象（会从DOM读取并更新到该对象）
 * @returns {boolean} 校验是否通过（如果通过返回true）
 */
function attachQualityConfigEvents(modal, configCache) {
    // 1. checkbox 切换时展开/折叠配置面板
    modal.querySelectorAll('.quality-check-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const qualityGroup = this.closest('.quality-group');
            const panel = qualityGroup.querySelector('.quality-config-panel');
            if (panel) {
                panel.style.display = this.checked ? 'block' : 'none';
            }
        });
    });

    // 返回一个函数用于从DOM读取配置并校验
    return {
        readConfigs: function() {
            const qualityGroups = modal.querySelectorAll('.quality-group');
            qualityGroups.forEach(group => {
                const qualityName = group.dataset.quality;
                const checkbox = group.querySelector('input[type="checkbox"]');
                const panel = group.querySelector('.quality-config-panel');

                const config = {
                    checked: checkbox.checked,
                    ilvlMin: 1,
                    ilvlMax: 100,
                    affixCount: 0,
                    affixTierMin: 1
                };

                if (panel) {
                    const ilvlMinInput = panel.querySelector('.config-ilvl-min');
                    const ilvlMaxInput = panel.querySelector('.config-ilvl-max');
                    const countSelect = panel.querySelector('.config-affix-count');
                    const tierSelect = panel.querySelector('.config-affix-tier');

                    if (ilvlMinInput) config.ilvlMin = parseInt(ilvlMinInput.value) || 1;
                    if (ilvlMaxInput) config.ilvlMax = parseInt(ilvlMaxInput.value) || 100;
                    if (countSelect) {
                        const countText = countSelect.value;
                        config.affixCount = countText === '' ? 0 : parseInt(countText);
                    }
                    if (tierSelect) {
                        const tierText = tierSelect.value;
                        config.affixTierMin = parseInt(tierText.replace('T', '')) || 1;
                    }
                }

                configCache.qualityConfigs[qualityName] = config;
            });
        },
        validate: function() {
            // ★ 不再检查“至少选择一种品质”
            for (const [name, config] of Object.entries(configCache.qualityConfigs)) {
                if (config.checked) {
                    if (config.ilvlMin > config.ilvlMax) {
                        const label = RARITY_CONFIG.find(r => r.name === name)?.label || name;
                        showToast(`"${label}" 的最小等级不能大于最大等级`);
                        return false;
                    }
                    if (config.ilvlMin < 1 || config.ilvlMax < 1) {
                        const label = RARITY_CONFIG.find(r => r.name === name)?.label || name;
                        showToast(`"${label}" 的装备等级不能小于1`);
                        return false;
                    }
                }
            }
            return true;
        },
    };
}

// ===== 批量出售弹窗（重构） =====
function openBatchSellModal() {
    const oldModal = document.querySelector(".batch-modal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.className = "batch-modal";
    modal.innerHTML = `
    <div class="batch-box">
        <h3 class="batch-title">批量出售装备</h3>
        <div class="batch-scroll-area">
            <div class="form-item">
                <label>选择装备品质（可多选）</label>
                <div class="quality-check-group">
                    ${buildQualityConfigHtml(batchFilterCache)}
                </div>
            </div>
        </div>
        <div class="batch-btn-wrap">
            <button class="tip-btn btn-destroy" id="confirmBatchSell">确定出售</button>
            <button class="tip-btn btn-close" id="closeBatchModal">取消</button>
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    // 绑定通用事件
    const events = attachQualityConfigEvents(modal, batchFilterCache);

    document.getElementById("closeBatchModal").onclick = () => modal.remove();

    document.getElementById("confirmBatchSell").onclick = () => {
        events.readConfigs();

            // ★ 自定义检查：至少选择一种品质，用 toast 提示
        const selectedQualities = Object.entries(batchFilterCache.qualityConfigs)
            .filter(([_, config]) => config.checked)
            .map(([name, _]) => name);
        if (selectedQualities.length === 0) {
            showToast("请至少选择一种要操作的装备品质");
            return;
        }
        if (!events.validate()) return;

        // 保存缓存
        localStorage.setItem("batch_destroy_filter", JSON.stringify(batchFilterCache));

        // 执行出售逻辑
        const save = getSaveData();
        let totalGold = 0;
        let soldCount = 0;
        save.bag = save.bag.filter(equip => {
            if (equip.locked) return true;
            const config = batchFilterCache.qualityConfigs[equip.rarityName];
            if (!config || !config.checked) return true;
            if (equip.ilvl < config.ilvlMin || equip.ilvl > config.ilvlMax) return true;
            if (config.affixCount > 0 && equip.affixes) {
                const highTierCount = equip.affixes.filter(aff => aff.tier >= config.affixTierMin).length;
                if (highTierCount >= config.affixCount) return true;
            }
            totalGold += calcEquipSellPrice(equip);
            soldCount++;
            return false;
        });
        save.gold = (save.gold || 0) + totalGold;
        setSaveData(save);
        modal.remove();
        refreshCharacterPanel();
        if (soldCount > 0) {
            showToast(`成功出售 ${soldCount} 件装备，获得 ${totalGold} 金币`);
        } else {
            showToast('没有符合出售条件的装备');
        }
    };
}

// ===== 自动出售弹窗（重构） =====
function openAutoSellModal() {
    const oldModal = document.querySelector(".batch-modal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.className = "batch-modal";
    modal.innerHTML = `
    <div class="batch-box">
        <h3 class="batch-title">自动出售设置</h3>
        <div class="batch-scroll-area">
            <div class="form-item">
                <label>选择自动出售的装备品质条件（可多选）</label>
                <div class="quality-check-group">
                    ${buildQualityConfigHtml(autoSellConfig)}
                </div>
            </div>
        </div>
        <div class="batch-btn-wrap">
            <button class="tip-btn btn-wear" id="confirmAutoSell">确定</button>
            <button class="tip-btn btn-close" id="closeAutoSellModal">取消</button>
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    // 绑定通用事件
    const events = attachQualityConfigEvents(modal, autoSellConfig);

    document.getElementById("closeAutoSellModal").onclick = () => modal.remove();

    document.getElementById("confirmAutoSell").onclick = () => {
        events.readConfigs();
        // ★ 不再验证品质选中，但保留其他校验（ilvl 范围等）
        if (!events.validate()) return;   // 此 validate 已去掉品质选中检查
        // 保存配置
        localStorage.setItem("auto_sell_config", JSON.stringify(autoSellConfig));
        modal.remove();
        showToast("自动出售设置已保存");
    };
}

/**
 * 检查装备是否符合自动出售条件
 * @param {Object} equip 装备对象
 * @returns {boolean} true=应自动出售，false=保留
 */
window.checkAutoSell = function(equip) {
    if (equip.locked) return false;
    
    const config = autoSellConfig.qualityConfigs[equip.rarityName];
    if (!config || !config.checked) return false;
    
    // 检查物品等级范围
    if (equip.ilvl < config.ilvlMin || equip.ilvl > config.ilvlMax) return false;
    
    // 检查词缀条件
    if (config.affixCount > 0 && equip.affixes) {
        const highTierCount = equip.affixes.filter(aff => aff.tier >= config.affixTierMin).length;
        // 如果高Tier词缀数量小于配置要求，表示条件不满足，不自动出售
        if (highTierCount < config.affixCount) return false;
    }
    
    return true;
}

/**
 * 处理自动出售并记录日志
 * @param {Object} equip 装备对象
 * @param {Object} save 存档数据
 * @returns {number|null} 出售获得的金币数，未出售返回null
 */
window.processAutoSell = function(equip, save) {
    if (!checkAutoSell(equip)) return null;
    
    const price = calcEquipSellPrice(equip);
    save.gold = (save.gold || 0) + price;
    return price;
}

// 初始化角色模块（在 DOMContentLoaded 中调用）
function initCharacterModule() {
    // 首次渲染
    renderAttrPanel();
    renderEquipSlots();
    renderBagList();
    renderBagFilters();
    initSortToggle();

    // 批量出售按钮绑定
    const batchSellBtn = document.getElementById('batchSellBtn');
    if (batchSellBtn) {
        batchSellBtn.addEventListener('click', openBatchSellModal);
    }
    // 自动出售按钮绑定
    const autoSellBtn = document.getElementById('autoSellBtn');
    if (autoSellBtn) {
        autoSellBtn.addEventListener('click', openAutoSellModal);
    }
}

// ===== 宝箱开启逻辑 =====

/**
 * 开启单个宝箱，直接修改存档并返回结果
 * @param {string} cfgId 宝箱配置ID
 * @returns {object|null} { gold: number, itemGains: [{name, amount}] }
 */
function openSingleChest(cfgId) {
    const config = window.OTHER_ITEM_CONFIG[cfgId];
    if (!config || config.type !== window.OTHER_ITEM_TYPE.CHEST) return null;

    const save = getSaveData();
    let totalGold = 0;
    const itemGains = [];

    // 固定掉落
    if (config.openContents.guaranteed) {
        config.openContents.guaranteed.forEach(entry => {
            if (entry.type === 'gold') {
                totalGold += entry.amount;
            } else if (entry.type === 'item') {
                const itemConfig = window.OTHER_ITEM_CONFIG[entry.cfgId];
                if (itemConfig) {
                    save.otherItems[entry.cfgId] = (save.otherItems[entry.cfgId] || 0) + entry.amount;
                    itemGains.push({ name: itemConfig.name, amount: entry.amount });
                }
            }
        });
    }

    // 随机掉落
    if (config.openContents.random) {
        config.openContents.random.forEach(entry => {
            if (Math.random() < entry.rate) {
                if (entry.type === 'gold') {
                    totalGold += entry.amount;
                } else if (entry.type === 'item') {
                    const itemConfig = window.OTHER_ITEM_CONFIG[entry.cfgId];
                    if (itemConfig) {
                        save.otherItems[entry.cfgId] = (save.otherItems[entry.cfgId] || 0) + entry.amount;
                        itemGains.push({ name: itemConfig.name, amount: entry.amount });
                    }
                }
            }
        });
    }

    // 消耗一个宝箱
    const currentCount = save.otherItems[cfgId] || 0;
    if (currentCount > 0) {
        save.otherItems[cfgId] = currentCount - 1;
    }

    // 加金币
    if (totalGold > 0) {
        save.gold = (save.gold || 0) + totalGold;
    }

    setSaveData(save);
    return { gold: totalGold, itemGains };
}

/**
 * 显示单个宝箱开启结果 Toast（多行，3秒渐隐）
 * @param {string} chestName 宝箱名称
 * @param {object} result { gold, itemGains[] }
 */
function showChestOpenToast(chestName, result) {
    const lines = [`开启了 [${chestName}]`];
    if (result.gold > 0) lines.push(`💰 获得 ${result.gold} 金币`);
    result.itemGains.forEach(gain => lines.push(`  + ${gain.name} x ${gain.amount}`));
    showChestOpenToastExtra(lines.join('\n'));
}

/**
 * 通用宝箱开启结果 Toast
 * @param {string} text 多行文本
 */
function showChestOpenToastExtra(text) {
    const toastDiv = document.createElement('div');
    toastDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 16px 24px;
        
        z-index: 99999;
        white-space: pre-line;
        text-align: center;
        line-height: 1.8;
        font-size: 14px;
        animation: chestToastFadeInOut 3s forwards;

        border-radius: 12px;
            1. inset 0 3px 0 rgba(255, 255, 255, 0.8):
            2. 0 8px 16px rgba(123, 92, 77, 0.15): 
        box-shadow:
            inset 0 3px 0 rgba(255, 255, 255, 0.8),
            0 8px 16px rgba(123, 92, 77, 0.15);
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        border: 1px solid #334155;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        background-color: #fdf4e9; 
        border: 3px solid #7B5C4D;     
        animation: toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        color: #5D4037; 
        letter-spacing: 1px;

        @keyframes toastSlideDown {
        0% {
            top: 0px;
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
        }
        100% {
            top: 40px;
            opacity: 1;
            transform: translateX(-50%) scale(1);
    `;
    toastDiv.textContent = text;
    document.body.appendChild(toastDiv);

    setTimeout(() => toastDiv.remove(), 3000);

    // 添加动画 keyframes（只添加一次）
    if (!document.querySelector('#chestToastKeyframes')) {
        const style = document.createElement('style');
        style.id = 'chestToastKeyframes';
        style.textContent = `
            @keyframes chestToastFadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                75% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
}