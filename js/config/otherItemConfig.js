// ===================== 其他物品配置 =====================

// 1. 子类型枚举
window.OTHER_ITEM_TYPE = {
    ENHANCEMENT_MATERIAL: '强化材料',
    MODIFICATION_MATERIAL: '改造材料',
    CHEST: '宝箱',
    SPECIAL: '特殊物品'
};

// 2. 所有其他物品的配置映射 (cfgId -> config)
window.OTHER_ITEM_CONFIG = {
    // ===== 强化材料 =====
    soul_shard_small: {
        id: 'soul_shard_small',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '灵魂碎晶小',
        description: '蕴含微弱灵魂力量的碎片，用于1-3阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 2 ,
        extraInfo: '适用: 1-3阶装备\n强化范围: +6到+10'    // 可选，弹窗中额外显示
    },
    soul_shard_medium: {
        id: 'soul_shard_medium',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '灵魂碎晶中',
        description: '蕴含中等灵魂力量的碎片，用于4-6阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 2 ,
        extraInfo: '适用: 4-6阶装备\n强化范围: +6到+10'
    },
    soul_shard_large: {
        id: 'soul_shard_large',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '灵魂碎晶大',
        description: '蕴含强大灵魂力量的碎片，用于7-9阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 2 ,
        extraInfo: '适用: 7-9阶装备\n强化范围: +6到+10'
    },
    soul_shard_complete: {
        id: 'soul_shard_complete',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '灵魂碎晶完整',
        description: '蕴含完整灵魂力量的结晶，用于10-12阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 2 ,
        extraInfo: '适用: 10-12阶装备\n强化范围: +6到+10'
    },
    // ===== 宝箱 =====
    // 优秀宝箱
    chest_excellent_low: {
        id: 'chest_excellent_low',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '低级优秀宝箱',
        description: '低级怪物掉落的宝箱，内含少量财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 1,
        dropSources: [
            { regionStageRange: [1, 3], monsterQuality: 1, rate: 0.1 }, //1-3区域优秀怪10%掉率
            { regionStageRange: [1, 3], monsterQuality: 2, rate: 0.3 }, //1-3区域精英怪50%掉率
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 100 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_small', amount: 1, rate: 0.3 }
            ]
        }
    },
    // 稀有宝箱
    chest_rare_low: {
        id: 'chest_rare_low',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '低级稀有宝箱',
        description: '低级稀有怪物掉落的宝箱，内含稀有财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 2,
        dropSources: [
            { regionStageRange: [1, 3], monsterQuality: 2, rate: 0.1 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 200 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_small', amount: 2, rate: 0.5 }
            ]
        }
    },
    // 首领宝箱
    chest_boss_low: {
        id: 'chest_boss_low',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '低级首领宝箱',
        description: '低级首领怪物掉落的宝箱，内含传奇财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 3,
        dropSources: [
            { regionStageRange: [1, 3], monsterQuality: 3, rate: 0.5 }  // 首领100%掉落
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 500 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_medium', amount: 2, rate: 0.8 }
            ]
        }
    },
};