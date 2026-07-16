

// 所有装备部位数组
const POS_LIST = [
    EQUIP_POSITION.WEAPON,
    EQUIP_POSITION.HELMET,
    EQUIP_POSITION.ARMOR,
    EQUIP_POSITION.BOOT,
    EQUIP_POSITION.PANTS,
    EQUIP_POSITION.GLOVE,
    EQUIP_POSITION.RING,
    EQUIP_POSITION.NECKLACE
];

/**
 * 随机区间取值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number}
 */
function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

// 根据ilvl获取装备阶次（1~12）
function getTierIndex(ilvl) {
    return Math.min(12, Math.max(1, Math.ceil(ilvl / 10)));
}

// 计算物品等级增幅比例 (0 ~ maxBonus)
function getIlvlBonus(ilvl, minIlvl, maxIlvl) {
    const tierIndex = getTierIndex(ilvl);
    // 各阶最大增幅表（与上文表格一致）
    const MAX_BONUS_TABLE = [
        1.00,  // tier 1
        0.90,  // tier 2
        0.81,  // tier 3
        0.73,  // tier 4
        0.66,  // tier 5
        0.59,  // tier 6
        0.53,  // tier 7
        0.48,  // tier 8
        0.43,  // tier 9
        0.39,  // tier 10
        0.35,  // tier 11
        0.32   // tier 12
    ];
    const maxBonus = MAX_BONUS_TABLE[tierIndex - 1] || 0.32;
    const rangeLen = maxIlvl - minIlvl;
    if (rangeLen <= 0) return 0;
    const progress = (ilvl - minIlvl) / rangeLen;
    // 限制在 0~maxBonus 之间（防止浮点误差越界）
    return Math.min(maxBonus, Math.max(0, progress * maxBonus));
}

/**
 * 按权重随机选择下标
 * @param {number[]} weights 概率数组
 * @returns {number}
 */
function randomByWeight(weights) {
    let total = weights.reduce((sum, val) => sum + val, 0);
    let rand = Math.random() * total;
    let cur = 0;
    for (let i = 0; i < weights.length; i++) {
        cur += weights[i];
        if (rand <= cur) return i;
    }
    return weights.length - 1;
}

/**
 * 根据关卡获取稀有度
 * @param {number} level 当前关卡
 * @param {"normalMonster"|"eliteMonster"|"bossMonster"} monsterType 怪物类型
 * @returns {object} 稀有度配置
 */
window.getRandomRarity = function(level, monsterQualityIdx) {
    const diffIdx = getDiffIndex(level);
    const weightArr = window.DROP_RATE[monsterQualityIdx][diffIdx];
    const rarityIdx = randomByWeight(weightArr);
    return RARITY_CONFIG[rarityIdx];
};

window.monsterDropEquip = function(level, monsterQualityIdx) {
    // 根据怪物品质设定掉落概率：普通30%，精英60%，稀有80%，史诗（BOSS）100%
    const dropChanceMap = {
        0: 0.15,  // 普通怪物 30%
        1: 0.30,  // 优秀怪物 60%
        2: 0.50,  // 稀有怪物 80%
        3: 1.00   // 史诗（BOSS）100%
    };
    const dropChance = dropChanceMap[monsterQualityIdx] ?? 0.30;
    
    if (Math.random() > dropChance) return null;
    
    const rarity = getRandomRarity(level, monsterQualityIdx);
    const pos = randomEquipPosition();
    return generateEquip(level, pos, rarity);
};

/**
 * 随机装备部位
 * @returns {string} 部位key
 */
window.randomEquipPosition = function()  {
    return POS_LIST[Math.floor(Math.random() * POS_LIST.length)];
}

/**
 * 根据ilvl随机词条T阶
 * @param {number} ilvl 物品等级
 * @returns {number} T阶 1~12
 */
window.randomAffixTier = function(ilvl){
    const maxTier = getMaxTierByIlvl(ilvl);
    const probArr = TIER_PROB[maxTier - 1];
    const tierIdx = randomByWeight(probArr);
    return tierIdx + 1;
}

/**
 * 根据部位获取可用词条库和数值范围（基于 POSITION_AFFIX_RULES 配置）
 * @param {string} position 装备部位
 * @returns {{ lib: Array, getValueRange: Function }}
 *   lib: 该部位允许的词缀定义数组
 *   getValueRange: (affixType, tier) => [min, max]
 */
function getAffixLibByPosition(position) {
    const rule = POSITION_AFFIX_RULES[position];
    if (!rule) {
        console.warn(`未配置词缀规则的部位：${position}，返回空`);
        return { lib: [], getValueRange: () => [0, 0] };
    }

    // 从全局词缀定义库中筛选出该部位允许的词缀
    const allAffixes = window.ALL_AFFIX;  
    const lib = allAffixes.filter(affixDef =>
        rule.allowedAffixes.includes(affixDef.type)
    );

    /**
     * 根据词缀 type 和 Tier 返回该部位的数值范围
     * 优先使用 POSITION_AFFIX_RULES 中的 valueOverrides，否则使用词缀定义的默认 values
     * @param {string} affixType
     * @param {number} tier 1-12
     * @returns {[number, number]}
     */
    function getValueRange(affixType, tier) {
        const affixDef = allAffixes.find(a => a.type === affixType);
        if (!affixDef) return [0, 0];

        // 部位有覆盖值则用覆盖，否则用默认
        const overrideValues = rule.valueOverrides?.[affixType];
        const values = overrideValues || affixDef.values;
        return values[tier - 1] || [0, 0];
    }

    return { lib, getValueRange };
}

/**
 * 随机生成单条词条
 * @param {string} position 装备部位
 * @param {number} tier T阶
 * @returns {object}
 */
function generateSingleAffix(position, tier, excludeTypes = []) {
    const { lib, getValueRange } = getAffixLibByPosition(position);

    // 按最小T阶过滤，并排除已使用的词缀类型
    const availableAffixes = lib.filter(affixDef => {
        const minTier = affixDef.minTier || 1;
        return tier >= minTier && !excludeTypes.includes(affixDef.type);
    });

    if (availableAffixes.length === 0) return null;

    // 随机选一个词缀
    const affixDef = availableAffixes[Math.floor(Math.random() * availableAffixes.length)];
    if (!affixDef) return null;

    const [minVal, maxVal] = getValueRange(affixDef.type, tier);
    const value = randomRange(minVal, maxVal);
    const decimal = affixDef.decimal !== undefined ? affixDef.decimal : 0;

    return {
        name: affixDef.name,
        type: affixDef.type,
        value: parseFloat(value.toFixed(decimal))
    };
}


/**
 * 根据ilvl和部位获取装备基础模板
 * @param {number} ilvl
 * @param {string} position
 * @returns {object}
 */
function getEquipBaseTemplate(ilvl, position, subType) {
    let equipList;
    if (position === EQUIP_POSITION.WEAPON) {
        // subType 不存在时默认使用剑(sword)，兼容旧存档
        const sub = subType || 'sword';
        const libKey = `weapon_${sub}`;
        equipList = EQUIP_LIB[libKey];
    } else {
        equipList = EQUIP_LIB[position];
    }
    // 增加防御性判断，找不到时返回 null
    return equipList ? equipList.find(item => ilvl >= item.ilvl[0] && ilvl <= item.ilvl[1]) : null;
}

/**
 * 生成一件完整装备
 * @param {number} ilvl 物品等级=当前关卡
 * @param {string} position 装备部位
 * @param {object} rarity 稀有度配置
 * @returns {object} 装备实例
 */
window.generateEquip = function(ilvl, position, rarity){
        // 如果是武器，随机一个子类型
    let subType = null;
    if (position === EQUIP_POSITION.WEAPON) {
        const subTypes = Object.keys(WEAPON_SUBTYPE); // ["sword","bow","staff"]
        subType = subTypes[Math.floor(Math.random() * subTypes.length)];
    }
    const template = getEquipBaseTemplate(ilvl, position, subType);
    const baseAttr = {};
    // 计算物品等级增幅比例（基于模板的 ilvl 范围）
    const ilvlBonus = getIlvlBonus(ilvl, template.ilvl[0], template.ilvl[1]);
    const elementTypes = ['fireDmg', 'coldDmg', 'lightDmg'];
    let chosenEle = null;


    // 基础属性 * 稀有度倍率
    Object.entries(template.base).forEach(([key, val]) => {
    // ★ 先应用物品等级增幅，再乘以稀有度倍率
        const baseWithBonus = val * (1 + ilvlBonus);
        if (key === 'eleDmg') {
            chosenEle = elementTypes[Math.floor(Math.random() * elementTypes.length)];
            baseAttr[chosenEle] = Math.floor(baseWithBonus * rarity.rate);
        } else if (key === 'critRate' || key === 'critDmg') {
            baseAttr[key] = parseFloat((baseWithBonus * rarity.rate).toFixed(4));
        } else {
            baseAttr[key] = Math.floor(baseWithBonus * rarity.rate);
        }
    });

    // 生成对应数量词条
    const affixList = [];
    const usedTypes = []; // 记录已经选过的词缀类型
    for (let i = 0; i < rarity.affixNum; i++) {
        const tier = randomAffixTier(ilvl);
        const affix = generateSingleAffix(position, tier, usedTypes);
        if (affix) {
            usedTypes.push(affix.type);
            affix.tier = tier;
            affixList.push(affix);
        }
        // 如果 affix 为 null（所有可用的词缀都用完了），可以忽略或跳出循环
    }

    return {
        id: Date.now() + Math.floor(Math.random() * 10000),
        ilvl: ilvl,
        position: position,
        subType: subType,
        name: template.name,
        rarityName: rarity.name,
        rarityColor: rarity.color,
        baseAttr: baseAttr,
        affixes: affixList,
        equipLv: Math.ceil(ilvl / 10),
        locked: false ,
        enhanceLevel: 0,   
        enhanceBonus: {} 
    };
}

// ===== 宝箱掉落生成 =====
/**
 * 根据怪物信息决定是否掉落宝箱
 * @param {number} level 当前关卡
 * @param {number} monsterQualityIdx 怪物品质索引
 * @returns {string|null} 掉落的宝箱 cfgId，未掉落返回 null
 */
window.generateChestDrop = function(level, monsterQualityIdx) {
    // 加强防御：必须是对象且有内容
    if (!window.OTHER_ITEM_CONFIG || typeof window.OTHER_ITEM_CONFIG !== 'object' || Object.keys(window.OTHER_ITEM_CONFIG).length === 0) {
        console.warn('generateChestDrop: OTHER_ITEM_CONFIG 不可用或为空，跳过宝箱掉落');
        return null;
    }
    // 获取当前区域 stage
    const region = getRegionByLevel(level);
    if (!region) {
        console.warn('generateChestDrop: 无法获取区域配置（level=' + level + '），跳过宝箱掉落');
        return null;
    }

    // 遍历所有宝箱配置
    for (const cfgId in window.OTHER_ITEM_CONFIG) {
        if (!Object.prototype.hasOwnProperty.call(window.OTHER_ITEM_CONFIG, cfgId)) continue; // 可选安全遍历
        const config = window.OTHER_ITEM_CONFIG[cfgId];
        if (config.type !== window.OTHER_ITEM_TYPE.CHEST) continue;
        if (!config.dropSources || config.dropSources.length === 0) continue;

        // 检查该宝箱的掉落来源是否匹配
        for (const source of config.dropSources) {
            const [stageMin, stageMax] = source.regionStageRange;
            if (region.stage >= stageMin && region.stage <= stageMax
                && source.monsterQuality === monsterQualityIdx) {
                // 按概率判定
                if (Math.random() < source.rate) {
                    return cfgId;
                }
            }
        }
    }
    return null;
};

/**
 * 根据关卡获取所在区域配置
 * @param {number} level
 * @returns {object|null} MONSTER_REGION_CONFIG 中的区域对象
 */
window.getRegionByLevel = function(level) {
    for (const region of window.MONSTER_REGION_CONFIG) {
        if (level >= region.range[0] && level <= region.range[1]) {
            return region;
        }
    }
    return null;
};