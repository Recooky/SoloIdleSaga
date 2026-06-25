import { BASE_ATTR } from "../config/gameConfig.js";
import { MONSTER_GROW, WAVE_MULTI } from "../config/levelConfig.js";

/**
 * 计算角色全身总属性
 * @param {Object} baseAttr 角色基础属性
 * @param {Object} wearEquips 已穿戴装备
 * @returns {Object} 最终总属性
 */
export function calcTotalAttr(baseAttr, wearEquips) {
    // 初始化属性值
    let totalHp = baseAttr.hp;
    let totalAtk = baseAttr.atk;
    let totalDef = baseAttr.def;
    let totalAS = baseAttr.attackSpeed;
    let totalCritRate = baseAttr.critRate;
    let totalCritDmg = baseAttr.critDamage;

    // 百分比累加容器
    let percentHp = 1;
    let percentAtk = 1;
    let percentDef = 1;
    let percentAS = 1;
    let percentCritRate = 1;
    let percentCritDmg = 1;

    // 遍历所有穿戴装备
    Object.values(wearEquips).forEach(equip => {
        if (!equip) return;

        // 装备基础属性
        if (equip.baseAttr.hp) totalHp += equip.baseAttr.hp;
        if (equip.baseAttr.atk) totalAtk += equip.baseAttr.atk;
        if (equip.baseAttr.def) totalDef += equip.baseAttr.def;
        if (equip.baseAttr.critRate) totalCritRate += equip.baseAttr.critRate;
        if (equip.baseAttr.critDmg) totalCritDmg += equip.baseAttr.critDmg;

        // 遍历词条属性
        equip.affixes.forEach(affix => {
            switch (affix.type) {
                case "fixedHp":
                    totalHp += affix.value;
                    break;
                case "percentHp":
                    percentHp += affix.value;
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
            }
        });
    });

    // 百分比最终计算
    totalHp = Math.floor(totalHp * percentHp);
    totalAtk = parseFloat((totalAtk * percentAtk).toFixed(2));
    totalDef = parseFloat((totalDef * percentDef).toFixed(2));
    totalAS = parseFloat((totalAS * percentAS).toFixed(2));
    totalCritRate = Math.min(1, parseFloat((totalCritRate * percentCritRate).toFixed(4)));
    totalCritDmg = parseFloat((totalCritDmg * percentCritDmg).toFixed(4));

    return {
        hp: totalHp,
        atk: totalAtk,
        def: totalDef,
        attackSpeed: totalAS,
        critRate: totalCritRate,
        critDamage: totalCritDmg
    };
}

/**
 * 护甲减伤计算
 * @param {number} def 防御值
 * @returns {number} 减伤比例
 */
export function getDefDamageReduce(def) {
    return def / (def + 100);
}

/**
 * 计算单次攻击最终伤害
 * @param {number} atk 攻击者攻击力
 * @param {number} def 目标防御
 * @param {number} critRate 暴击率
 * @param {number} critDmg 暴击伤害倍率
 * @returns {Object} {damage: 最终伤害, isCrit: 是否暴击}
 */
export function calcDamage(atk, def, critRate, critDmg) {
    const reduce = getDefDamageReduce(def);
    let isCrit = Math.random() <= critRate;
    let baseDmg = atk * (1 - reduce);
    if (isCrit) {
        baseDmg *= critDmg;
    }
    return {
        damage: Math.max(1, Math.floor(baseDmg)),
        isCrit
    };
}

/**
 * 根据关卡+波次计算怪物属性
 * @param {number} level 当前关卡1~120
 * @param {number} wave 当前波次1~5
 * @returns {Object} 怪物属性
 */
export function getMonsterAttrByLevel(level, wave) {
    const waveMulti = WAVE_MULTI[wave - 1];
    const baseHp = MONSTER_GROW.hpBase * Math.pow(MONSTER_GROW.hpRate, level - 1);
    const baseAtk = MONSTER_GROW.atkBase * Math.pow(MONSTER_GROW.atkRate, level - 1);
    const baseDef = MONSTER_GROW.defBase * Math.pow(MONSTER_GROW.defRate, level - 1);

    return {
        hp: Math.floor(baseHp * waveMulti.hp),
        maxHp: Math.floor(baseHp * waveMulti.hp),
        atk: parseFloat((baseAtk * waveMulti.atk).toFixed(2)),
        def: parseFloat((baseDef * waveMulti.def).toFixed(2)),
        attackSpeed: waveMulti.asp
    };
}

/**
 * 根据波次获取怪物类型标识
 * @param {number} wave
 * @returns {string}
 */
export function getMonsterTypeByWave(wave) {
    if (wave === 3 || wave === 4) return "eliteMonster";
    if (wave === 5) return "bossMonster";
    return "normalMonster";
}