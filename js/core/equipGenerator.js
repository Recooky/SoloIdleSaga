import {
    RARITY_CONFIG,
    ATTACK_AFFIX,
    DEF_AFFIX,
    EQUIP_LIB,
    DROP_RATE,
    TIER_PROB,
    EQUIP_POSITION
} from "../config/gameConfig.js";
import { getDiffIndex, getMaxTierByIlvl } from "../config/levelConfig.js";

// 所有装备部位数组
const POS_LIST = [
    EQUIP_POSITION.WEAPON,
    EQUIP_POSITION.HELMET,
    EQUIP_POSITION.ARMOR,
    EQUIP_POSITION.BOOT,
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
export function getRandomRarity(level, monsterType) {
    const diffIdx = getDiffIndex(level);
    const weightArr = DROP_RATE[monsterType][diffIdx];
    const rarityIdx = randomByWeight(weightArr);
    return RARITY_CONFIG[rarityIdx];
}

/**
 * 随机装备部位
 * @returns {string} 部位key
 */
export function randomEquipPosition() {
    return POS_LIST[Math.floor(Math.random() * POS_LIST.length)];
}

/**
 * 根据ilvl随机词条T阶
 * @param {number} ilvl 物品等级
 * @returns {number} T阶 1~12
 */
export function randomAffixTier(ilvl) {
    const maxTier = getMaxTierByIlvl(ilvl);
    const probArr = TIER_PROB[maxTier - 1];
    const tierIdx = randomByWeight(probArr);
    return tierIdx + 1;
}

/**
 * 根据部位获取可用词条库
 * @param {string} position 装备部位
 * @returns {Array} 词条数组
 */
function getAffixLibByPosition(position) {
    const attackPos = [EQUIP_POSITION.WEAPON, EQUIP_POSITION.RING, EQUIP_POSITION.NECKLACE];
    if (attackPos.includes(position)) {
        return ATTACK_AFFIX;
    } else {
        return DEF_AFFIX;
    }
}

/**
 * 随机生成单条词条
 * @param {string} position 装备部位
 * @param {number} tier T阶
 * @returns {object}
 */
function generateSingleAffix(position, tier) {
    const lib = getAffixLibByPosition(position);
    const affixDef = lib[Math.floor(Math.random() * lib.length)];
    const [minVal, maxVal] = affixDef.values[tier - 1];
    const value = randomRange(minVal, maxVal);
    return {
        name: affixDef.name,
        type: affixDef.type,
        value: parseFloat(value.toFixed(4))
    };
}

/**
 * 根据ilvl和部位获取装备基础模板
 * @param {number} ilvl
 * @param {string} position
 * @returns {object}
 */
function getEquipBaseTemplate(ilvl, position) {
    const equipList = EQUIP_LIB[position];
    return equipList.find(item => ilvl >= item.ilvl[0] && ilvl <= item.ilvl[1]);
}

/**
 * 生成一件完整装备
 * @param {number} ilvl 物品等级=当前关卡
 * @param {string} position 装备部位
 * @param {object} rarity 稀有度配置
 * @returns {object} 装备实例
 */
export function generateEquip(ilvl, position, rarity) {
    const template = getEquipBaseTemplate(ilvl, position);
    const baseAttr = {};
    // 基础属性 * 稀有度倍率
    Object.entries(template.base).forEach(([key, val]) => {
        baseAttr[key] = parseFloat((val * rarity.rate).toFixed(4));
    });

    // 生成对应数量词条
    const affixList = [];
    for (let i = 0; i < rarity.affixNum; i++) {
        const tier = randomAffixTier(ilvl);
        const affix = generateSingleAffix(position, tier);
        affix.tier = tier;
        affixList.push(affix);
    }

    return {
        id: Date.now() + Math.floor(Math.random() * 10000),
        ilvl: ilvl,
        position: position,
        name: template.name,
        rarityName: rarity.name,
        rarityColor: rarity.color,
        baseAttr: baseAttr,
        affixes: affixList,
        equipLv: Math.ceil(ilvl / 10)
    };
}

/**
 * 怪物掉落装备入口方法
 * @param {number} level 当前关卡
 * @param {"normalMonster"|"eliteMonster"|"bossMonster"} monsterType
 * @returns {object|null} 装备，没掉落返回null
 */
export function monsterDropEquip(level, monsterType) {
    // 掉落概率
    let dropChance = 0;
    switch (monsterType) {
        case "normalMonster":
            dropChance = 1;
            break;
        case "eliteMonster":
            dropChance = 1;
            break;
        case "bossMonster":
            dropChance = 1;
            break;
    }
    if (Math.random() > dropChance) return null;

    const rarity = getRandomRarity(level, monsterType);
    const pos = randomEquipPosition();
    const equip = generateEquip(level, pos, rarity);
    return equip;
}