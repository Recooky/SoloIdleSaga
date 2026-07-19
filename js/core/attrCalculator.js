

/**
 * 计算角色全身总属性
 * @param {Object} baseAttr 角色基础属性
 * @param {Object} wearEquips 已穿戴装备
 * @returns {Object} 最终总属性
 */
window.calcTotalAttr = function(baseAttr, wearEquips) {
    // 防御性初始值：任何 undefined/NaN 都兜底为 0
    function safe(v, fallback = 0) {
        const num = Number(v);
        return isNaN(num) ? fallback : num;
    }
    // 初始化属性值
    let totalHp = safe(baseAttr.hp);
    let totalAtk = safe(baseAttr.atk);
    let totalDef = safe(baseAttr.def);
    let totalAS = safe(baseAttr.attackSpeed, 1.0);    // 攻击速度默认 1.0
    let totalCritRate = safe(baseAttr.critRate);
    let totalCritDmg = safe(baseAttr.critDmg, 1.5); // 暴击伤害默认 1.5
    let totalPenetrateDef = 0;
    let totalDodge = safe(baseAttr.dodge);
    let totalHit = safe(baseAttr.hit);
    let totalHpRegen = safe(baseAttr.hpRegen);
    let totalMp = safe(baseAttr.mp);
    let totalMpRegen = safe(baseAttr.mpRegen);
    // ===== 新增：抗性初始值（从基础属性读取） =====
    let totalFireRes = safe(baseAttr.fireRes);    // 基础抗性
    let totalColdRes = safe(baseAttr.coldRes);
    let totalLightRes = safe(baseAttr.lightRes);
    // ===== 新增：元素伤害（从基础属性读取） =====
    let totalFireDmg = safe(baseAttr.fireDmg);
    let totalColdDmg = safe(baseAttr.coldDmg);
    let totalLightDmg = safe(baseAttr.lightDmg);
    let percentFireDmg = safe(baseAttr.firePercent, 1.0);
    let percentColdDmg = safe(baseAttr.coldPercent, 1.0);
    let percentLightDmg = safe(baseAttr.lightPercent, 1.0);
    let elementPercent = safe(baseAttr.elementPercent, 1.0);
    let totalStr = safe(baseAttr.str);
    let totalAgi = safe(baseAttr.agi);
    let totalInt = safe(baseAttr.int);

    let firePen = safe(baseAttr.firePen);
    let coldPen = safe(baseAttr.coldPen);
    let lightPen = safe(baseAttr.lightPen);
    let elementPen = safe(baseAttr.elementPen);

    // 百分比累加容器
    let percentHp = 1;
    let percentAtk = 1;
    let percentDef = 1;
    let percentAS = 1;
    let percentCritRate = 1;
    let percentCritDmg = 1;
    let percentMp = 1;
    let percentDodge = 1;
    let percentHit = 1;

    // 遍历所有穿戴装备
    Object.values(wearEquips).forEach(equip => {
        if (!equip) return;
        // 装备基础属性
        if (equip.baseAttr.hp) totalHp += equip.baseAttr.hp;
        if (equip.baseAttr.atk) totalAtk += equip.baseAttr.atk;
        if (equip.baseAttr.def) totalDef += equip.baseAttr.def;
        if (equip.baseAttr.critRate) totalCritRate += equip.baseAttr.critRate;
        if (equip.baseAttr.critDmg) totalCritDmg += equip.baseAttr.critDmg;
        if (equip.baseAttr.fireDmg) totalFireDmg += equip.baseAttr.fireDmg;
        if (equip.baseAttr.coldDmg) totalColdDmg += equip.baseAttr.coldDmg;
        if (equip.baseAttr.lightDmg) totalLightDmg += equip.baseAttr.lightDmg;
        // ===== 处理强化加成（enhanceBonus） =====
        if (equip.enhanceBonus) {
            Object.entries(equip.enhanceBonus).forEach(([key, val]) => {
                switch (key) {
                    case 'hp': totalHp += val; break;
                    case 'mp': totalMp += val; break;
                    case 'hpRegen': totalHpRegen += val; break;
                    case 'mpRegen': totalMpRegen += val; break;
                    case 'atk': totalAtk += val; break;
                    case 'def': totalDef += val; break;
                    case 'critRate': totalCritRate += val; break;
                    case 'critDmg': totalCritDmg += val; break;
                    case 'fireDmg': totalFireDmg += val; break;
                    case 'coldDmg': totalColdDmg += val; break;
                    case 'lightDmg': totalLightDmg += val; break;
                    case 'str': totalStr += val; break;
                    case 'agi': totalAgi += val; break;
                    case 'int': totalInt += val; break;
                    case 'dodge': totalDodge += val; break;
                    case 'hit': totalHit += val; break;
                    case 'penetrateDef': totalPenetrateDef += val; break;
                    // 如果还有其他可能的强化属性，请根据需要添加
                }
            });
        }
        // 遍历词条属性
        equip.affixes.forEach(affix => {
            switch (affix.type) {
                case "fixedHp":
                    totalHp += affix.value;
                    break;
                case "percentHp":
                    percentHp += affix.value;
                    break;
                case "fixedMp":
                    totalMp += affix.value;
                    break;
                case "percentMp":
                    percentMp += affix.value;
                    break;
                case "fixedMpRegen":
                    totalMpRegen += affix.value;
                    break;
                case "fixedHpRegen":
                    totalHpRegen += affix.value;
                    break;
                case "fixedAtk":
                    totalAtk += affix.value;
                    break;
                case "percentAtk":
                    percentAtk += affix.value;
                    break;
                case "fixedDef":
                    totalDef += affix.value;
                    break;
                case "percentDef":
                    percentDef += affix.value;
                    break;
                case "percentAS":
                    percentAS += affix.value;
                    break;
                case "percentCritRate":
                    percentCritRate += affix.value;
                    break;
                case "percentCritDmg":
                    percentCritDmg += affix.value;
                    break;
                case "penetrateDef":
                    totalPenetrateDef += affix.value;
                    break;
                case "fixedStr":
                    totalStr += affix.value;
                    break;
                case "fixedAgi":
                    totalAgi += affix.value;
                    break;
                case "fixedInt":
                    totalInt += affix.value;
                    break;
                // ===== 元素点伤（固定值）=====
                case "fixedFireDmg":
                    totalFireDmg += affix.value;
                    break;
                case "fixedColdDmg":
                    totalColdDmg += affix.value;
                    break;
                case "fixedLightDmg":
                    totalLightDmg += affix.value;
                    break;
                case "fixedElementDmg":
                    // 全元素点伤 → 同时加三种点伤
                    totalFireDmg += affix.value;
                    totalColdDmg += affix.value;
                    totalLightDmg += affix.value;
                    break;

                // ===== 元素百分比（%加成）=====
                case "percentFireDmg":
                    percentFireDmg += affix.value;    // 例：+0.15 → 1.0 + 0.15 = 1.15
                    break;
                case "percentColdDmg":
                    percentColdDmg += affix.value;
                    break;
                case "percentLightDmg":
                    percentLightDmg += affix.value;
                    break;
                case "percentElementDmg":
                    // 全元素伤害% → 累加到一个公共乘区
                    elementPercent += affix.value;
                    break;

                // ===== 元素穿透（%）=====
                case "firePen":
                    firePen += affix.value;
                    break;
                case "coldPen":
                    coldPen += affix.value;
                    break;
                case "lightPen":
                    lightPen += affix.value;
                    break;
                case "elementPen":
                    // 全元素穿透 → 累加到公共变量
                    elementPen += affix.value;
                    break;
                // ===== 新增：抗性词缀处理 =====
                case "fireResist":   totalFireRes += affix.value; break;
                case "coldResist":   totalColdRes += affix.value; break;
                case "lightResist":  totalLightRes += affix.value; break;
                // 全元素抗性：同时给三种抗性加相同的值
                case "allResist":
                    totalFireRes += affix.value;
                    totalColdRes += affix.value;
                    totalLightRes += affix.value;
                    break;
                // ===== 闪避/命中 =====
                case "fixedDodge":
                    totalDodge += affix.value;
                    break;
                case "percentDodge":
                    percentDodge += affix.value;   // 百分比→固定数值
                    break;
                case "fixedHit":
                    totalHit += affix.value;
                    break;
                case "percentHit":
                    percentHit += affix.value; // 百分比→固定数值
                    break;
            }
        });
    });


        // 最终元素点伤 = 基础点伤 × (元素百分比 × 全元素百分比)
        const finalFireDmg = parseFloat((totalFireDmg * percentFireDmg * elementPercent).toFixed(1));
        const finalColdDmg = parseFloat((totalColdDmg * percentColdDmg * elementPercent).toFixed(1));
        const finalLightDmg = parseFloat((totalLightDmg * percentLightDmg * elementPercent).toFixed(1));

        // 元素穿透 = 基础穿透 + 全元素穿透（叠加）
        const finalFirePen = Math.min(0.95, firePen + elementPen);
        const finalColdPen = Math.min(0.95, coldPen + elementPen);
        const finalLightPen = Math.min(0.95, lightPen + elementPen);

        // 确保至少为正数
        totalDodge = Math.max(0, totalDodge);
        totalHit = Math.max(0, totalHit);

        // ===== 力量/敏捷/智慧 换算 =====
        const STR_ATK_PERCENT = 0.005;   // 每点力量增加 0.5% 攻击力
        const STR_HP_REGEN    = 1;       // 每点力量增加 1 生命恢复
        const AGI_AS          = 0.005;    // 每点敏捷增加 0.005 攻击速度
        const AGI_HIT         = 5;       // 每点敏捷增加 5 命中
        const INT_ELEMENT_PCT = 0.002;   // 每点智慧增加 0.2% 全元素伤害
        const INT_MP_REGEN    = 1;       // 每点智慧增加 1 魔力恢复

        // 力量 → 攻击力% + 生命恢复
        percentAtk += totalStr * STR_ATK_PERCENT;
        totalHpRegen += totalStr * STR_HP_REGEN;

        // 敏捷 → 攻击速度 + 命中
        totalAS += totalAgi * AGI_AS;
        totalHit += totalAgi * AGI_HIT;

        // 智慧 → 全元素伤害% + 魔力恢复
        elementPercent += totalInt * INT_ELEMENT_PCT;
        totalMpRegen += totalInt * INT_MP_REGEN;

        // 百分比最终计算
        totalHp = Math.floor(totalHp * percentHp);
        totalMp = Math.floor(totalMp * percentMp);
        totalAtk = parseFloat((totalAtk * percentAtk).toFixed(2));
        totalDef = parseFloat((totalDef * percentDef).toFixed(2));
        const MAX_ATTACK_SPEED = 1.0;  // 300% 上限
        totalAS = Math.min(MAX_ATTACK_SPEED, parseFloat((totalAS * percentAS).toFixed(2)));
        totalCritRate = Math.min(1, parseFloat((totalCritRate * percentCritRate).toFixed(4)));
        totalCritDmg = parseFloat((totalCritDmg * percentCritDmg).toFixed(4));
        totalDodge = Math.max(0, parseFloat((totalDodge * percentDodge).toFixed(2)));
        totalHit= Math.max(0, parseFloat((totalHit * percentHit).toFixed(2)));
        // ===== 抗性不需要百分比计算（固定值累加），仅限制上下限 =====
        const RESIST_CAP = 0.70;
        totalFireRes  = Math.min(RESIST_CAP, Math.max(0, totalFireRes));
        totalColdRes  = Math.min(RESIST_CAP, Math.max(0, totalColdRes));
        totalLightRes = Math.min(RESIST_CAP, Math.max(0, totalLightRes));

    return {
        hp: totalHp,
        mp: totalMp,  
        hpRegen: totalHpRegen,
        mpRegen: totalMpRegen,
        atk: totalAtk,
        def: totalDef,
        attackSpeed: totalAS,
        critRate: totalCritRate,
        critDmg: totalCritDmg,
        penetrateDef: totalPenetrateDef,
        // ===== 新增：返回抗性 =====
        fireResist: totalFireRes,
        coldResist: totalColdRes,
        lightResist: totalLightRes,
        dodge: totalDodge,
        hit: totalHit,
        // ★ 新增返回值
        fireDmg: finalFireDmg,       // 最终火焰点伤
        coldDmg: finalColdDmg,       // 最终冰霜点伤
        lightDmg: finalLightDmg,     // 最终闪电点伤
        fireDmgPercent: percentFireDmg * elementPercent,  // 显示用
        coldDmgPercent: percentColdDmg * elementPercent,
        lightDmgPercent: percentLightDmg * elementPercent,
        firePen: finalFirePen,       // 火焰穿透
        coldPen: finalColdPen,       // 冰霜穿透
        lightPen: finalLightPen,     // 闪电穿透
        str: totalStr,
        agi: totalAgi,
        int: totalInt,
    };
}
/**
 * 根据关卡获取防御减伤公式的 K 值
 * 区域1（1~10关）K=700，之后每区增加350
 * @param {number} level 当前关卡
 * @returns {number} K 值
 */
window.getDefKByStage = function(level) {
    const region = window.getRegionByLevel(level);
    const baseK = 200;
    if (!region) return baseK;
    const stage = region.stage || 1;
    return baseK + (stage - 1) * 2500;
};
/**
 * 护甲减伤计算
 * @param {number} def 防御值
 * @returns {number} 减伤比例
 */
window.getDefDamageReduce = function(def, level) {
    const K = window.getDefKByStage(level || 1);
    return Math.min(0.75, def / (def + K));
};

/**
 * 计算单次攻击最终伤害
 * @param {number} atk 攻击者攻击力
 * @param {number} def 目标防御
 * @param {number} critRate 暴击率
 * @param {number} penetrateDef 防御穿透比例（0~1）
 * @returns {Object} {damage: 最终伤害, isCrit: 是否暴击, effectiveDef: 实际生效防御}
 * @param {number} elementDmg 该元素点伤值
 * @param {number} targetResist 目标该元素抗性
 * @param {number} elementPen 该元素穿透比例 (0~1)
 * @returns {number} 最终元素伤害
 */
window.calcDamage = function(atk, def, critRate, critDmg, penetrateDef = 0, level = 1) {
    const penRate = Math.min(1, Math.max(0, penetrateDef || 0));
    const effectiveDef = Math.max(0, def * (1 - penRate));
    const reduce = getDefDamageReduce(effectiveDef, level);
    let isCrit = Math.random() <= critRate;
    let baseDmg = atk * (1 - reduce);
    if (isCrit) {
        baseDmg *= critDmg;
    }
    return {
        damage: Math.max(1, Math.floor(baseDmg)),
        isCrit,
        effectiveDef
    };
};

window.calcElementDamage = function(elementDmg, targetResist, elementPen) {
    if (elementDmg <= 0) return 0;
    const effectiveResist = Math.max(0, targetResist * (1 - Math.min(0.95, elementPen)));
    // 修复前：const resistReduce = Math.min(0.80, effectiveResist / 100);
    // 修复后：直接使用抗性小数
    const RESIST_CAP = 0.70;   // 抗性上限70%
    const resistReduce = Math.min(RESIST_CAP, effectiveResist);
    return Math.max(0, Math.floor(elementDmg * (1 - resistReduce)));
};;

/**
 * 根据关卡+波次计算怪物属性
 * @param {number} level 当前关卡1~120
 * @param {number} wave 当前波次1~5
 * @returns {Object} 怪物属性
 */
// 根据关卡和波次获取怪物完整属性
// 根据关卡和波次获取怪物完整属性
window.getMonsterAttrByLevel = function(level, wave) {
    // 1. 获取区域
    const region = getRegionByLevel(level);
    if (!region) {
        console.error(`getMonsterAttrByLevel: 关卡 ${level} 找不到对应的区域配置`);
        return null;
    }

    // 2. 获取波次配置的品质索引
    const qualityIdx = getMonsterTypeByWave(level, wave);

    // 3. 从区域对应品质组中随机选一个怪物，若该品质不存在则降级
    for (let q = qualityIdx; q >= 0; q--) {
        const pool = region.monstersByQuality[q];
        if (pool && pool.length > 0) {
            return getMonsterAttrByLevelWithQuality(level, wave, region, q);
        }
    }

    // 所有品质都不可用 → 返回 null
    console.error(`getMonsterAttrByLevel: 区域 ${region.name} 没有任何可用的怪物配置`);
    return null;
};

// 内部函数：使用指定品质索引生成怪物属性
function getMonsterAttrByLevelWithQuality(level, wave, region, qualityIdx) {
    const pool = region.monstersByQuality[qualityIdx];
    if (!pool || pool.length === 0) {
        console.error(`getMonsterAttrByLevelWithQuality: 区域 ${region.name} 的品质 ${qualityIdx} 无怪物`);
        return null;
    }

    const monsterConfig = pool[Math.floor(Math.random() * pool.length)];

    // ===== 攻击/HP 成长倍率（原公式） =====
    const STAGE_GROWTH_MULTIPLIER = [1.0, 2.5, 6.0, 15, 35, 80, 180, 400, 900, 2000, 4500, 10000];
    const INNER_GROWTH_RATE = 0.20;
    const regionIndex = Math.min(11, Math.max(0, Math.ceil(level / 10) - 1));
    const levelInRegion = ((level - 1) % 10) + 1;
    const growMulti = STAGE_GROWTH_MULTIPLIER[regionIndex] * Math.pow(1 + INNER_GROWTH_RATE, levelInRegion - 1);

    // ===== 防御成长倍率（攻击成长的 8%） =====
    const STAGE_DEF_MULTIPLIER = [
        0.15,     // 1区
        0.40,     // 2区
        0.90,     // 3区
        2.0,      // 4区
        3.5,      // 5区
        5.5,      // 6区
        7.0,     // 7区
        9.0,       // 8区
        11.0,       // 9区
        13.0,      // 10区
        15.0,      // 11区
        17.0       // 12区
    ];
    const defGrowMulti = STAGE_DEF_MULTIPLIER[regionIndex] * Math.pow(1 + INNER_GROWTH_RATE, levelInRegion - 1);

    // 计算最终属性
    const hp  = Math.floor(monsterConfig.hp * growMulti);
    const atk = parseFloat((monsterConfig.atk * growMulti).toFixed(2));
    const def = parseFloat((monsterConfig.def * defGrowMulti).toFixed(2));   // ★ 使用 defGrowMulti
    const dodge = Math.floor(monsterConfig.dodge * growMulti);
    const hit   = Math.floor(monsterConfig.hit * growMulti);

    // 元素伤害：根据 elementType 生成对应点伤
    let fireDmg = 0, coldDmg = 0, lightDmg = 0;
    if (monsterConfig.elementType) {
        const elementVal = parseFloat((monsterConfig.elementDmg * growMulti).toFixed(2));
        if (monsterConfig.elementType === 'fireDmg') {
            fireDmg = elementVal;
        } else if (monsterConfig.elementType === 'coldDmg') {
            coldDmg = elementVal;
        } else if (monsterConfig.elementType === 'lightDmg') {
            lightDmg = elementVal;
        }
    }

    // 攻击速度：使用固定值（3秒/次），或从怪物配置中读取（若需要差异化可后续扩展）
    const attackSpeed = monsterConfig.attackSpeed || 0.333;

    // 生命恢复：使用 MONSTER_GROW 计算（原逻辑，未依赖波次倍率）
    const hpRegen = parseFloat((
        window.MONSTER_GROW.hpRegenBase *
        Math.pow(window.MONSTER_GROW.hpRegenRate, level - 1)
    ).toFixed(2));

    return {
        monsterId: monsterConfig.id,
        monsterName: monsterConfig.name,
        monsterImage: monsterConfig.image || null,
        qualityIdx: qualityIdx,
        hp: hp,
        maxHp: hp,
        atk: atk,
        def: def,
        attackSpeed: attackSpeed,
        hpRegen: hpRegen,
        dodge: dodge,
        hit: hit,
        // 抗性直接使用区域配置中的值（可考虑未来也乘成长，但暂时保留原样）
        fireResist: monsterConfig.fireRes || 0,
        coldResist: monsterConfig.coldRes || 0,
        lightResist: monsterConfig.lightRes || 0,
        fireDmg: fireDmg,
        coldDmg: coldDmg,
        lightDmg: lightDmg,
        skills: monsterConfig.skills || []
    };
}

// 根据关卡获取区域
window.getRegionByLevel = function(level) {
    return window.MONSTER_REGION_CONFIG.find(r => level >= r.range[0] && level <= r.range[1]);
};