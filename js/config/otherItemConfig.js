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
        name: '初级灵魂碎晶',
        icon: './assets/images/items/soul_shard_small.png',      // ← 新增
        description: '蕴含微弱灵魂力量的碎片，用于1-3阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 1,
        extraInfo: '适用: 1-3阶装备\n强化范围: +6到+10'
    },
    soul_shard_medium: {
        id: 'soul_shard_medium',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '中级灵魂碎晶',
        icon: './assets/images/items/soul_shard_medium.png',     // ← 新增
        description: '蕴含中等灵魂力量的碎片，用于4-6阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 1,
        extraInfo: '适用: 4-6阶装备\n强化范围: +6到+10'
    },
    soul_shard_large: {
        id: 'soul_shard_large',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '高级灵魂碎晶',
        icon: './assets/images/items/soul_shard_large.png',     // ← 新增
        description: '蕴含强大灵魂力量的碎片，用于7-9阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 1,
        extraInfo: '适用: 7-9阶装备\n强化范围: +6到+10'
    },
    soul_shard_complete: {
        id: 'soul_shard_complete',
        type: window.OTHER_ITEM_TYPE.ENHANCEMENT_MATERIAL,
        name: '完美灵魂碎晶',
        icon: './assets/images/items/soul_shard_complete.png',  // ← 新增
        description: '蕴含完整灵魂力量的结晶，用于10-12阶装备+6到+10强化。',
        maxStack: 99,
        category: '强化材料',
        rarity: 1,
        extraInfo: '适用: 10-12阶装备\n强化范围: +6到+10'
    },
    // ===== 改造材料 =====
    reform_stone_small: {
        id: 'reform_stone_small',
        type: window.OTHER_ITEM_TYPE.MODIFICATION_MATERIAL,
        name: '初级改造石',
        icon: './assets/images/items/reform_stone_small.png',
        description: '蕴含微弱改造力量的石头，用于1-3阶装备的词缀改造。',
        maxStack: 99,
        category: '改造材料',
        rarity: 2,
        extraInfo: '适用: 1-3阶装备'
    },
    reform_stone_medium: {
        id: 'reform_stone_medium',
        type: window.OTHER_ITEM_TYPE.MODIFICATION_MATERIAL,
        name: '中级改造石',
        icon: './assets/images/items/reform_stone_medium.png',
        description: '蕴含中等改造力量的石头，用于4-6阶装备的词缀改造。',
        maxStack: 99,
        category: '改造材料',
        rarity: 2,
        extraInfo: '适用: 4-6阶装备'
    },
    reform_stone_large: {
        id: 'reform_stone_large',
        type: window.OTHER_ITEM_TYPE.MODIFICATION_MATERIAL,
        name: '高级改造石',
        icon: './assets/images/items/reform_stone_large.png',
        description: '蕴含强大改造力量的石头，用于7-9阶装备的词缀改造。',
        maxStack: 99,
        category: '改造材料',
        rarity: 2,
        extraInfo: '适用: 7-9阶装备'
    },
    reform_stone_complete: {
        id: 'reform_stone_complete',
        type: window.OTHER_ITEM_TYPE.MODIFICATION_MATERIAL,
        name: '顶级改造石',
        icon: './assets/images/items/reform_stone_complete.png',
        description: '蕴含完整改造力量的结晶，用于10-12阶装备的词缀改造。',
        maxStack: 99,
        category: '改造材料',
        rarity: 2,
        extraInfo: '适用: 10-12阶装备'
    },

    // ===== 初级宝箱 =====
    // 优秀宝箱
    chest_excellent_low: {
        id: 'chest_excellent_low',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '低级优秀宝箱',
        icon: './assets/images/items/chest_excellent_low.png',  // ← 新增
        description: '低级怪物掉落的宝箱，内含少量财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 1,
        dropSources: [
            { regionStageRange: [1, 3], monsterQuality: 1, rate: 0.1 },
            { regionStageRange: [1, 3], monsterQuality: 2, rate: 0.3 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 100 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_small', amount: 1, rate: 0.3 },
            ]
        }
    },
    // 稀有宝箱
    chest_rare_low: {
        id: 'chest_rare_low',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '低级稀有宝箱',
        icon: './assets/images/items/chest_rare_low.png',       // ← 新增
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
                { type: 'item', cfgId: 'soul_shard_small', amount: 1, rate: 0.5 },
                { type: 'item', cfgId: 'reform_stone_small', amount: 1, rate: 0.2 }
            ]
        }
    },
    // 首领宝箱
    chest_boss_low: {
        id: 'chest_boss_low',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '低级首领宝箱',
        icon: './assets/images/items/chest_boss_low.png',       // ← 新增
        description: '低级首领怪物掉落的宝箱，内含传奇财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 3,
        dropSources: [
            { regionStageRange: [1, 3], monsterQuality: 3, rate: 0.5 }
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 500 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_small', amount: 2, rate: 0.8 },
                { type: 'item', cfgId: 'reform_stone_small', amount: 1, rate: 0.4 }
            ]
        }
    },
    // ========== 中级宝箱 (区域4-6) ==========
    // 优秀宝箱-中级
    chest_excellent_medium: {
        id: 'chest_excellent_medium',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '中级优秀宝箱',
        icon: './assets/images/items/chest_excellent_medium.png',
        description: '中级怪物掉落的宝箱，内含少量财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 1,
        dropSources: [
            { regionStageRange: [4, 6], monsterQuality: 1, rate: 0.1 },
            { regionStageRange: [4, 6], monsterQuality: 2, rate: 0.3 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 200 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_medium', amount: 1, rate: 0.3 },
            ]
        }
    },
    // 稀有宝箱-中级
    chest_rare_medium: {
        id: 'chest_rare_medium',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '中级稀有宝箱',
        icon: './assets/images/items/chest_rare_medium.png',
        description: '中级稀有怪物掉落的宝箱，内含稀有财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 2,
        dropSources: [
            { regionStageRange: [4, 6], monsterQuality: 2, rate: 0.1 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 400 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_medium', amount: 1, rate: 0.5 },
                { type: 'item', cfgId: 'reform_stone_medium', amount: 1, rate: 0.25 }
            ]
        }
    },
    // 首领宝箱-中级
    chest_boss_medium: {
        id: 'chest_boss_medium',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '中级首领宝箱',
        icon: './assets/images/items/chest_boss_medium.png',
        description: '中级首领怪物掉落的宝箱，内含传奇财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 3,
        dropSources: [
            { regionStageRange: [4, 6], monsterQuality: 3, rate: 0.5 }
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 1000 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_medium', amount: 2, rate: 0.8 },
                { type: 'item', cfgId: 'reform_stone_medium', amount: 1, rate: 0.4 }
            ]
        }
    },

    // ========== 高级宝箱 (区域7-9) ==========
    chest_excellent_high: {
        id: 'chest_excellent_high',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '高级优秀宝箱',
        icon: './assets/images/items/chest_excellent_high.png',
        description: '高级怪物掉落的宝箱，内含少量财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 1,
        dropSources: [
            { regionStageRange: [7, 9], monsterQuality: 1, rate: 0.1 },
            { regionStageRange: [7, 9], monsterQuality: 2, rate: 0.3 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 400 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_large', amount: 1, rate: 0.3 },
            ]
        }
    },
    chest_rare_high: {
        id: 'chest_rare_high',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '高级稀有宝箱',
        icon: './assets/images/items/chest_rare_high.png',
        description: '高级稀有怪物掉落的宝箱，内含稀有财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 2,
        dropSources: [
            { regionStageRange: [7, 9], monsterQuality: 2, rate: 0.1 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 700 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_large', amount: 1, rate: 0.5 },
                { type: 'item', cfgId: 'reform_stone_large', amount: 1, rate: 0.25 }
            ]
        }
    },
    chest_boss_high: {
        id: 'chest_boss_high',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '高级首领宝箱',
        icon: './assets/images/items/chest_boss_high.png',
        description: '高级首领怪物掉落的宝箱，内含传奇财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 3,
        dropSources: [
            { regionStageRange: [7, 9], monsterQuality: 3, rate: 0.5 }
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 2000 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_large', amount: 2, rate: 0.8 },
                { type: 'item', cfgId: 'reform_stone_large', amount: 1, rate: 0.4 }
            ]
        }
    },

    // ========== 顶级宝箱 (区域10-12) ==========
    chest_excellent_top: {
        id: 'chest_excellent_top',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '顶级优秀宝箱',
        icon: './assets/images/items/chest_excellent_top.png',
        description: '顶级怪物掉落的宝箱，内含少量财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 1,
        dropSources: [
            { regionStageRange: [10, 12], monsterQuality: 1, rate: 0.1 },
            { regionStageRange: [10, 12], monsterQuality: 2, rate: 0.3 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 600 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_complete', amount: 1, rate: 0.3 },
            ]
        }
    },
    chest_rare_top: {
        id: 'chest_rare_top',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '顶级稀有宝箱',
        icon: './assets/images/items/chest_rare_top.png',
        description: '顶级稀有怪物掉落的宝箱，内含稀有财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 2,
        dropSources: [
            { regionStageRange: [10, 12], monsterQuality: 2, rate: 0.1 },
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 1000 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_complete', amount: 1, rate: 0.5 },
                { type: 'item', cfgId: 'reform_stone_complete', amount: 1, rate: 0.25 }
            ]
        }
    },
    chest_boss_top: {
        id: 'chest_boss_top',
        type: window.OTHER_ITEM_TYPE.CHEST,
        name: '顶级首领宝箱',
        icon: './assets/images/items/chest_boss_top.png',
        description: '顶级首领怪物掉落的宝箱，内含传奇财宝。',
        maxStack: 99,
        category: '宝箱',
        rarity: 3,
        dropSources: [
            { regionStageRange: [10, 12], monsterQuality: 3, rate: 0.5 }
        ],
        openContents: {
            guaranteed: [
                { type: 'gold', amount: 3000 }
            ],
            random: [
                { type: 'item', cfgId: 'soul_shard_complete', amount: 2, rate: 0.8 },
                { type: 'item', cfgId: 'reform_stone_complete', amount: 1, rate: 0.4 }
            ]
        }
    },
};