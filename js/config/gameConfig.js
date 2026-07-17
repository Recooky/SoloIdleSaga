// ===================== 全局基础配置 =====================
window.BASE_ATTR = {
    hp: 200,
    mp: 100,
    atk: 15,
    def: 12,
    attackSpeed: 0.333,  // 每秒攻击频率
    critRate: 0.05,    // 暴击率
    critDmg: 1.5,   // 暴击伤害
    hpRegen: 2,  // 基础生命恢复速度，每秒2点
    mpRegen: 2,  // 基础魔力恢复速度
    fireRes: 0,  // 火焰抗性
    coldRes: 0,  // 冰霜抗性
    lightRes: 0, // 闪电抗性
    penetrateDef: 0, //护甲穿透
    dodge: 10,    // 基础闪避值
    hit: 10,       // 基础命中值
    fireDmg: 0,         // 火焰点伤基础值
    coldDmg: 0,         // 冰霜点伤基础值
    lightDmg: 0,        // 闪电点伤基础值
    firePercent: 1.0,   // 火焰伤害% (基数为1，表示100%)
    coldPercent: 1.0,   // 冰霜伤害%
    lightPercent: 1.0,  // 闪电伤害%
    elementPercent: 1.0,// 全元素伤害% (与各元素%叠加)
    firePen: 0,         // 火焰穿透% (0~1)
    coldPen: 0,         // 冰霜穿透% (0~1)
    lightPen: 0,        // 闪电穿透% (0~1)
    elementPen: 0,      // 全元素穿透% (0~1)
    str: 5, //力量
    agi: 5, //敏捷
    int: 5, //智力
    };

// 装备部位定义
window.EQUIP_POSITION = {
    WEAPON: "weapon",
    HELMET: "helmet",
    ARMOR: "armor",
    BOOT: "boot",
    PANTS: "pants",
    GLOVE: "glove",
    RING: "ring",
    NECKLACE: "necklace"
    
};

window.POSITION_NAME = {
    weapon: "武器",
    helmet: "头盔",
    armor: "护甲",
    boot: "靴子",
    pants: "裤子",
    glove: "手套",
    ring: "戒指",
    necklace: "项链"
};

// js/config/gameConfig.js
window.POSITION_ICON = {
    weapon:   './assets/images/icons/slot-weapon.png',
    helmet:   './assets/images/icons/slot-helmet.png',
    armor:    './assets/images/icons/slot-armor.png',
    boot:     './assets/images/icons/slot-boot.png',
    pants:    './assets/images/icons/slot-pants.png',
    glove:    './assets/images/icons/slot-glove.png',
    ring:     './assets/images/icons/slot-ring.png',
    necklace: './assets/images/icons/slot-necklace.png'
};

// 武器子类型（含显示名）
window.WEAPON_SUBTYPE = {
    sword: { id: "sword", name: "剑" },
    bow:   { id: "bow",   name: "弓" },
    staff: { id: "staff", name: "法杖" }
};


// 7档稀有度配置
window.RARITY_CONFIG = [
    { name: "普通", color: "#ffffff",   className: "rarity-normal",  label: "普通", affixNum: 0, rate: 1.0 },
    { name: "优秀", color: "#32cd32",   className: "rarity-fine",    label: "优秀", affixNum: 1, rate: 1.2 },
    { name: "稀有", color: "#0070dd",   className: "rarity-rare",    label: "稀有", affixNum: 2, rate: 1.5 },
    { name: "史诗", color: "#a335ee",   className: "rarity-epic",    label: "史诗", affixNum: 3, rate: 2.0 },
    { name: "传说", color: "#ff8c00",   className: "rarity-legend",  label: "传说", affixNum: 4, rate: 2.8 },
    { name: "神话", color: "#ff2222",   className: "rarity-myth",    label: "神话", affixNum: 5, rate: 4.0 },
    { name: "宇宙", color: "#00ccff)",  className: "rarity-cosmic", label: "宇宙", affixNum: 6, rate: 6.0 }
];

// 装备icon显示颜色（背景 + 边框），与 RARITY_CONFIG 顺序对应
window.RARITY_DISPLAY_COLORS = [
    { bg: "#f7f2ee", border: "#686462" },  // 普通 → 暖黄底，淡棕边框
    { bg: "#dddeb6", border: "#764632" },  // 优秀 → 浅绿底，绿边框
    { bg: "#cddbde", border: "#2b4965" },  // 稀有 → 浅蓝底，蓝边框
    { bg: "#e8ccd8", border: "#5c2c60" },  // 史诗 → 浅紫底，紫边框
    { bg: "#f2d7aa", border: "#7e4625" },  // 传说 → 浅橙底，橙边框
    { bg: "#f8c7c3", border: "#552427" },  // 神话 → 浅红底，红边框
    { bg: "#c1edf3", border: "#00bcd4" },  // 宇宙 → 浅青底，青边框
];



// ===================== 全部词缀统一库（取代攻击/防御分类） =====================
// 注意：每个词缀都添加了 category 字段，便于阅读和筛选
window.ALL_AFFIX = [
    // ========== 攻击类 ==========
    {
        name: "攻击力",type: "fixedAtk",category: "attack",decimal: 0,
        values: [
            [6,18],[18,45],[45,90],[90,160],[160,250],[250,360],
            [360,490],[490,640],[640,810],[810,1000],[1000,1220],[1220,1480]
        ]
    },
    {
        name: "攻击力%",type: "percentAtk",category: "attack",minTier: 4,decimal: 2,
        values: [
            [0.01,0.02],[0.02,0.03],[0.03,0.04],[0.04,0.09],[0.09,0.15],[0.15,0.22],
            [0.22,0.30],[0.30,0.39],[0.39,0.49],[0.49,0.60],[0.60,0.72],[0.72,0.85]
        ]
    },
    {
        name: "攻击速度",type: "percentAS",category: "attack",minTier: 4,decimal: 2,
        values: [
            [0.01,0.02],[0.02,0.03],[0.03,0.04],[0.04,0.08],[0.08,0.13],[0.13,0.19],
            [0.19,0.26],[0.26,0.34],[0.34,0.40],[0.40,0.45],[0.45,0.50],[0.50,0.55]
        ]
    },
    {
        name: "暴击率",type: "percentCritRate",category: "attack",minTier: 4,decimal: 2,
        values: [
            [0.01,0.03],[0.02,0.03],[0.02,0.03],[0.02,0.03],[0.03,0.04],[0.04,0.05],
            [0.05,0.06],[0.06,0.08],[0.08,0.10],[0.10,0.13],[0.13,0.15],[0.15,0.17]
        ]
    },
    {
        name: "暴击伤害",type: "percentCritDmg",category: "attack",minTier: 4,decimal: 2,
        values: [
            [0.01,0.02],[0.02,0.04],[0.04,0.07],[0.07,0.11],[0.11,0.16],[0.16,0.22],
            [0.22,0.29],[0.29,0.37],[0.37,0.46],[0.46,0.56],[0.56,0.67],[0.67,0.79]
        ]
    },
    {
        name: "护甲穿透",type: "penetrateDef",category: "attack",minTier: 4,decimal: 2,
        values: [
            [0.01,0.01],[0.01,0.01],[0.02,0.03],[0.01,0.02],[0.02,0.03],[0.03,0.04],
            [0.04,0.06],[0.06,0.09],[0.09,0.13],[0.13,0.18],[0.18,0.24],[0.24,0.30]
        ]
    },

    // ========== 元素攻击类 ==========
    // 1. 火焰点伤
    {
        name: "火焰点伤", type: "fixedFireDmg", category: "element", decimal: 0,
        values: [
            [5, 15], [15, 36], [36, 70], [70, 130], [130, 200], [200, 290], 
            [290, 400], [400, 510], [510, 650], [650, 800], [800, 980], [980, 1200]
        ]
    },

    // 2. 冰霜点伤
    {
        name: "冰霜点伤", type: "fixedColdDmg", category: "element", decimal: 0,
        values: [
            [5, 15], [15, 36], [36, 70], [70, 130], [130, 200], [200, 290], 
            [290, 400], [400, 510], [510, 650], [650, 800], [800, 980], [980, 1200]
        ]
    },

    // 3. 闪电点伤
    {
        name: "闪电点伤", type: "fixedLightDmg", category: "element", decimal: 0,
        values: [
            [5, 15], [15, 36], [36, 70], [70, 130], [130, 200], [200, 290], 
            [290, 400], [400, 510], [510, 650], [650, 800], [800, 980], [980, 1200]
        ]
    },

    // 4. 全元素点伤（三个元素同时加）
    {
        name: "元素点伤", type: "fixedElementDmg", category: "element", decimal: 0,
        values: [
            [2, 5], [5, 12], [12, 25], [25, 45], [45, 70], [70, 100], 
            [100, 135], [135, 175], [175, 220], [220, 270], [270, 330], [330, 420]]
    },

    // 5. 火焰伤害% (minTier=4)
    {
        name: "火焰伤害%", type: "percentFireDmg", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.02], [0.02, 0.03], [0.03, 0.07], [0.07, 0.13], [0.13, 0.20],
            [0.20, 0.28], [0.28, 0.37], [0.37, 0.47], [0.47, 0.58], [0.58, 0.70], [0.70, 0.82]
        ]
    },

    // 6. 冰霜伤害%
    {
        name: "冰霜伤害%", type: "percentColdDmg", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.02], [0.02, 0.03], [0.03, 0.07], [0.07, 0.13], [0.13, 0.20],
            [0.20, 0.28], [0.28, 0.37], [0.37, 0.47], [0.47, 0.58], [0.58, 0.70], [0.70, 0.82]
        ]
    },

    // 7. 闪电伤害%
    {
        name: "闪电伤害%", type: "percentLightDmg", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.02], [0.02, 0.03], [0.03, 0.07], [0.07, 0.13], [0.13, 0.20],
            [0.20, 0.28], [0.28, 0.37], [0.37, 0.47], [0.47, 0.58], [0.58, 0.70], [0.70, 0.82]
        ]
    },

    // 8. 元素伤害% (minTier=4，全元素百分比加成)
    {
        name: "元素伤害%", type: "percentElementDmg", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.01], [0.01, 0.01], [0.02, 0.04], [0.04, 0.07], [0.07, 0.10], 
            [0.10, 0.14], [0.14, 0.19], [0.19, 0.25], [0.25, 0.32], [0.32, 0.40], [0.40, 0.50]
        ]
    },

    // 9. 火焰穿透%
    {
        name: "火焰穿透%", type: "firePen", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.01], [0.01, 0.01], [0.01, 0.03], [0.03, 0.06], [0.06, 0.10], 
            [0.10, 0.14], [0.14, 0.18], [0.18, 0.22], [0.22, 0.25], [0.25, 0.28], [0.28, 0.30]
        ]
    },

    // 10. 冰霜穿透%
    {
        name: "冰霜穿透%", type: "coldPen", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.01], [0.01, 0.01], [0.01, 0.03], [0.03, 0.06], [0.06, 0.10], 
            [0.10, 0.14], [0.14, 0.18], [0.18, 0.22], [0.22, 0.25], [0.25, 0.28], [0.28, 0.30]
        ]
    },

    // 11. 闪电穿透%
    {
        name: "闪电穿透%", type: "lightPen", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.01], [0.01, 0.01], [0.01, 0.03], [0.03, 0.06], [0.06, 0.10], 
            [0.10, 0.14], [0.14, 0.18], [0.18, 0.22], [0.22, 0.25], [0.25, 0.28], [0.28, 0.30]
        ]
    },

    // 12. 全元素穿透% (同时对三种元素生效)
    {
        name: "全元素穿透%", type: "elementPen", category: "element", minTier: 4, decimal: 2,
        values: [
            [0.01, 0.01], [0.01, 0.01], [0.01, 0.01], [0.01, 0.02], [0.02, 0.03], [0.03, 0.04], 
            [0.04, 0.05], [0.05, 0.06], [0.06, 0.075], [0.075, 0.09], [0.09, 0.1], [0.1, 0.12]
        ]
    },
    // ========== 属性类 ==========
    {
        name: "力量", type: "fixedStr", category: "attribute", decimal: 0,
        values: [
            [2, 3], [3, 6], [6, 10], [10, 15], [15, 21], [21, 28],
            [28, 36], [36, 45], [45, 55], [55, 66], [66, 78], [78, 92]
        ]
    },
    {
        name: "敏捷", type: "fixedAgi", category: "attribute", decimal: 0,
        values: [
            [2, 3], [3, 6], [6, 10], [10, 15], [15, 21], [21, 28],
            [28, 36], [36, 45], [45, 55], [55, 66], [66, 78], [78, 92]
        ]
    },
    {
        name: "智慧", type: "fixedInt", category: "attribute", decimal: 0,
        values: [
            [2, 3], [3, 6], [6, 10], [10, 15], [15, 21], [21, 28],
            [28, 36], [36, 45], [45, 55], [55, 66], [66, 78], [78, 92]
        ]
    },


    // ========== 防御类 ==========
    {
        name: "生命",type: "fixedHp",category: "defense",decimal: 0,
        values: [
            [10,30],[30,80],[80,150],[150,280],[280,450],[450,680],
            [680,950],[950,1280],[1280,1650],[1650,2100],[2100,2650],[2650,3300]
        ]
    },
    {
        name: "生命%",type: "percentHp",category: "defense",minTier: 4,decimal: 2,
        values: [
            [0.01,0.01],[0.01,0.01],[0.01,0.01],[0.03,0.08],[0.08,0.14],[0.14,0.21],
            [0.21,0.29],[0.29,0.38],[0.38,0.48],[0.48,0.59],[0.59,0.71],[0.71,0.85]
        ]
    },
    {
        name: "生命恢复",type: "fixedHpRegen",category: "defense",decimal: 0,
        values: [
            [2,3],[3,7],[7,12],[12,20],[20,32],[32,48],
            [48,68],[68,92],[92,120],[120,155],[155,195],[195,240]
        ]
    },
    {
        name: "魔力",type: "fixedMp",category: "defense",decimal: 0,
        values: [
            [8,25],[25,65],[65,120],[120,220],[220,380],[380,550],
            [550,780],[780,1050],[1050,1360],[1360,1720],[1720,2200],[2200,2750]
        ]
    },
    {
        name: "魔力%",type: "percentMp",category: "defense",minTier: 4,decimal: 2,
        values: [
            [0.01,0.01],[0.01,0.01],[0.01,0.01],[0.03,0.08],[0.08,0.14],[0.14,0.21],
            [0.21,0.29],[0.29,0.38],[0.38,0.48],[0.48,0.59],[0.59,0.71],[0.71,0.85]
        ]
    },
    {
        name: "魔力恢复",type: "fixedMpRegen",category: "defense",decimal: 0,
        values: [
            [2,3],[3,4],[4,6],[6,10],[10,16],[16,24],
            [24,34],[34,46],[46,60],[60,78],[78,98],[98,120]
        ]
    },
    {
        name: "护甲",type: "fixedDef",category: "defense",decimal: 0,
        values: [
            [5,15],[15,40],[40,80],[80,140],[140,220],[220,320],
            [320,440],[440,580],[580,740],[740,920],[920,1120],[1120,1350]
        ]
    },
    {
        name: "护甲%",type: "percentDef",category: "defense",minTier: 4,decimal: 2,
        values: [
            [0.03,0.05],[0.05,0.07],[0.07,0.09],[0.09,0.12],[0.12,0.15],[0.15,0.18],
            [0.18,0.22],[0.22,0.26],[0.26,0.30],[0.30,0.34],[0.34,0.38],[0.38,0.42]
        ]
    },

 // ========== 闪避/命中类 ==========
    {
        name: "闪避",type: "fixedDodge",category: "defense",decimal: 0,
        values: [
            [5,15],[15,40],[40,80],[80,140],[140,220],[220,320],
            [320,440],[440,580],[580,740],[740,920],[920,1120],[1120,1350]
        ]
    },
    {
        name: "闪避%",type: "percentDodge",category: "defense",minTier: 4,decimal: 2,
        values: [
            [0.01,0.02],[0.02,0.03],[0.03,0.04],[0.04,0.08],[0.08,0.13],[0.13,0.19],
            [0.19,0.26],[0.26,0.34],[0.34,0.40],[0.40,0.45],[0.45,0.50],[0.50,0.55]
        ]
    },
    {
        name: "命中",type: "fixedHit",category: "attack",decimal: 0,
        values: [
            [5,15],[15,40],[40,75],[75,130],[130,200],[200,290],
            [290,400],[400,530],[530,680],[680,850],[850,1040],[1040,1260]
        ]
    },
    {
        name: "命中%",type: "fixedHit",category: "attack",minTier: 4,decimal: 2,
        values: [
            [0.01,0.01],[0.01,0.02],[0.02,0.03],[0.03,0.08],[0.08,0.14],[0.14,0.21],
            [0.21,0.29],[0.29,0.38],[0.38,0.48],[0.48,0.59],[0.59,0.71],[0.71,0.85]
        ]
    },
    // ========== 抗性类 ==========
    {
        name: "火焰抗性",type: "fireResist", category: "defense",decimal: 2,
        values: [
            [0.03,0.05],[0.05,0.08],[0.08,0.12],[0.12,0.16],[0.16,0.20],[0.20,0.25],
            [0.25,0.30],[0.30,0.35],[0.35,0.40],[0.40,0.46],[0.46,0.52],[0.52,0.60]
        ]
    },
    {
        name: "冰霜抗性",type: "coldResist", category: "defense",decimal: 2,
        values: [
            [0.03,0.05],[0.05,0.08],[0.08,0.12],[0.12,0.16],[0.16,0.20],[0.20,0.25],
            [0.25,0.30],[0.30,0.35],[0.35,0.40],[0.40,0.46],[0.46,0.52],[0.52,0.60]
        ]
    },
    {
        name: "闪电抗性",type: "lightResist", category: "defense",decimal: 2,
        values: [
            [0.03,0.05],[0.05,0.08],[0.08,0.12],[0.12,0.16],[0.16,0.20],[0.20,0.25],
            [0.25,0.30],[0.30,0.35],[0.35,0.40],[0.40,0.46],[0.46,0.52],[0.52,0.60]
        ]
    },
    {
        name: "全元素抗性",type: "allResist", category: "defense",decimal: 2,minTier: 4,
        values: [
            [0,0.01],[0.01,0.02],[0.03,0.04],[0.04,0.06],[0.06,0.07],[0.07,0.09],
            [0.09,0.11],[0.11,13],[0.12,14],[0.14,0.16],[0.16,0.18],[0.18,0.22]
        ]
    }
];

    


// ===================== 新增：部位词缀规则（替代硬编码） =====================
window.POSITION_AFFIX_RULES = {
    //武器
    weapon: {
            // 允许出现的词缀 type 列表
            allowedAffixes: ["fixedAtk", "percentAtk", "percentAS", "percentCritRate", "percentCritDmg","penetrateDef","fixedHit","percentHit",
            "fixedFireDmg", "fixedColdDmg", "fixedLightDmg",
            "percentFireDmg", "percentColdDmg", "percentLightDmg",
            "fixedElementDmg", "percentElementDmg",
            "firePen", "coldPen", "lightPen", "elementPen"
            ],
        // 数值覆盖（可选）：key = 词缀 type, value = 该部位专属的 values 数组
        // 不写则使用词缀定义中的 values
        valueOverrides: {
            // 例如武器攻击力 T12 为 120-150，与默认一致，可以不写
            //"fixedAtk": [
            //    [1,2], [2,4], [3,5], [5,8], [8,12], [12,18],
            //    [18,25], [25,35], [35,50], [50,70], [70,95], [100,120]
            //]
        }
    },
    //项链
    necklace: {
        allowedAffixes: [
            "fixedAtk", "percentAtk", "percentAS", "percentCritRate", "percentCritDmg",
            "fixedHp", "percentHp", "fireResist","coldResist","lightResist","allResist","penetrateDef","fixedHit","percentHit",
            "fixedFireDmg", "fixedColdDmg", "fixedLightDmg",
            "percentFireDmg", "percentColdDmg", "percentLightDmg",
            "fixedElementDmg", "percentElementDmg",
            "firePen", "coldPen", "lightPen", "elementPen" 
        ],
        valueOverrides: {
            // 项链的攻击力数值范围更小
            
            // 例如项链攻击力 T12 为 120-150，与默认一致，可以不写
            // "fixedAtk": [ [1,3], [3,5], ... ]
            
        }
    },
        //戒指
    ring: {
        allowedAffixes: ["fixedAtk", "percentAtk", "percentAS", "percentCritRate", "percentCritDmg",
            "fireResist","coldResist","lightResist","allResist","penetrateDef","fixedHit","percentHit",
            "fixedFireDmg", "fixedColdDmg", "fixedLightDmg",
            "percentFireDmg", "percentColdDmg", "percentLightDmg",
            "fixedElementDmg", "percentElementDmg",
            "firePen", "coldPen", "lightPen", "elementPen"
        ],
        valueOverrides: {
            // ring 保持和 weapon 相同的数值，可不写
        }
    },
    //头盔
    helmet: {
        allowedAffixes: ["fixedHp", "percentHp", "fixedHpRegen", "fixedMp", "fixedMpRegen", 
            "fixedDef", "fixedDodge", "percentDodge", "fireResist","coldResist","lightResist","allResist",
        "fixedStr", "fixedAgi", "fixedInt" 
        ],
        // valueOverrides 可选
    },
    //护甲
    armor: {
        allowedAffixes: ["fixedHp", "percentHp", "fixedHpRegen", "fixedMp", "fixedMpRegen", 
            "fixedDef", "fixedDodge", "percentDodge", "fireResist","coldResist","lightResist","allResist",
        "fixedStr", "fixedAgi", "fixedInt" 
        ],
    },
        //靴子
    boot: {
        allowedAffixes: ["fixedHp", "percentHp", "fixedHpRegen", "fixedMp", "fixedMpRegen",
             "fixedDodge", "percentDodge", "fireResist","coldResist","lightResist","allResist",
            "fixedStr", "fixedAgi", "fixedInt" ,"fixedStr", "fixedAgi", "fixedInt"
        ],
    },
        //裤子
    pants: {
        allowedAffixes: [
            "fixedHp", "percentHp", "fixedHpRegen", "fixedMp", "fixedMpRegen",
            "fixedDef", "fixedDodge", "percentDodge",
            "fireResist", "coldResist", "lightResist", "allResist",
            "fixedStr", "fixedAgi", "fixedInt","fixedStr", "fixedAgi", "fixedInt"
        ]
    },
        //手套
    glove: {
        allowedAffixes: [
            "fixedHp", "percentHp", "fixedHpRegen", "fixedMp", "fixedMpRegen",
            "fixedDef", "fixedDodge", "percentDodge",
            "fireResist", "coldResist", "lightResist", "allResist",
            "fixedStr", "fixedAgi", "fixedInt", 
            "fixedHit","fixedHit","percentCritRate","percentCritDmg"
        ]
    }
};

// ===================== 全部位装备基础库 =====================
window.EQUIP_LIB = {
    weapon_sword: [
        {ilvl:[1,10],  name:"生锈短剑", icon:"./assets/images/equip/T1/j.png",  base:{atk:10}},
        {ilvl:[11,20], name:"铁制长剑", icon:"./assets/images/equip/T2/j.png",  base:{atk:30}},
        {ilvl:[21,30], name:"精钢大剑", icon:"./assets/images/equip/T3/j.png",  base:{atk:60}},
        {ilvl:[31,40], name:"岩纹巨剑", icon:"./assets/images/equip/T4/j.png",  base:{atk:120}},
        {ilvl:[41,50], name:"熔岩炎剑", icon:"./assets/images/equip/T5/j.png",  base:{atk:200}},
        {ilvl:[51,60], name:"符文阔剑", icon:"./assets/images/equip/T6/j.png",  base:{atk:320}},
        {ilvl:[61,70], name:"幽魂斩刃", icon:"./assets/images/equip/T7/j.png",  base:{atk:440}},
        {ilvl:[71,80], name:"地狱重剑", icon:"./assets/images/equip/T8/j.png",  base:{atk:580}},
        {ilvl:[81,90], name:"虚空龙剑", icon:"./assets/images/equip/T9/j.png",  base:{atk:740}},
        {ilvl:[91,100],name:"深渊圣剑", icon:"./assets/images/equip/T10/j.png", base:{atk:900}},
        {ilvl:[101,110],name:"湮灭神剑", icon:"./assets/images/equip/T11/j.png",base:{atk:1100}},
        {ilvl:[111,120],name:"星界天剑", icon:"./assets/images/equip/T12/j.png",base:{atk:1360}}
    ],
    weapon_bow: [
        {ilvl:[1,10],   name:"短弓",     icon:"./assets/images/equip/T1/g.png",  base:{atk:6,   eleDmg:7}},
        {ilvl:[11,20],  name:"长弓",     icon:"./assets/images/equip/T2/g.png",  base:{atk:20,  eleDmg:20}},
        {ilvl:[21,30],  name:"精钢战弓", icon:"./assets/images/equip/T3/g.png",  base:{atk:40,  eleDmg:40}},
        {ilvl:[31,40],  name:"岩纹猎弓", icon:"./assets/images/equip/T4/g.png",  base:{atk:80,  eleDmg:80}},
        {ilvl:[41,50],  name:"熔岩炎弓", icon:"./assets/images/equip/T5/g.png",  base:{atk:140, eleDmg:140}},
        {ilvl:[51,60],  name:"符文长弓", icon:"./assets/images/equip/T6/g.png",  base:{atk:220, eleDmg:220}},
        {ilvl:[61,70],  name:"幽魂灵弓", icon:"./assets/images/equip/T7/g.png",  base:{atk:290, eleDmg:310}},
        {ilvl:[71,80],  name:"地狱魔弓", icon:"./assets/images/equip/T8/g.png",  base:{atk:380, eleDmg:420}},
        {ilvl:[81,90],  name:"虚空龙弓", icon:"./assets/images/equip/T9/g.png",  base:{atk:490, eleDmg:530}},
        {ilvl:[91,100], name:"深渊圣弓", icon:"./assets/images/equip/T10/g.png", base:{atk:620, eleDmg:650}},
        {ilvl:[101,110],name:"湮灭神弓", icon:"./assets/images/equip/T11/g.png",base:{atk:830, eleDmg:790}},
        {ilvl:[111,120],name:"星界天弓", icon:"./assets/images/equip/T12/g.png",base:{atk:880, eleDmg:980}}
    ],
    weapon_staff: [
        {ilvl:[1,10],   name:"木制法杖", icon:"./assets/images/equip/T1/f.png",  base:{eleDmg:12}},
        {ilvl:[11,20],  name:"水晶法杖", icon:"./assets/images/equip/T2/f.png",  base:{eleDmg:36}},
        {ilvl:[21,30],  name:"铁芯魔杖", icon:"./assets/images/equip/T3/f.png",  base:{eleDmg:72}},
        {ilvl:[31,40],  name:"岩纹秘杖", icon:"./assets/images/equip/T4/f.png",  base:{eleDmg:144}},
        {ilvl:[41,50],  name:"熔岩焰杖", icon:"./assets/images/equip/T5/f.png",  base:{eleDmg:240}},
        {ilvl:[51,60],  name:"符文法杖", icon:"./assets/images/equip/T6/f.png",  base:{eleDmg:384}},
        {ilvl:[61,70],  name:"幽魂灵杖", icon:"./assets/images/equip/T7/f.png",  base:{eleDmg:528}},
        {ilvl:[71,80],  name:"地狱魔杖", icon:"./assets/images/equip/T8/f.png",  base:{eleDmg:696}},
        {ilvl:[81,90],  name:"虚空龙杖", icon:"./assets/images/equip/T9/f.png",  base:{eleDmg:888}},
        {ilvl:[91,100], name:"深渊圣杖", icon:"./assets/images/equip/T10/f.png", base:{eleDmg:1080}},
        {ilvl:[101,110],name:"湮灭神杖", icon:"./assets/images/equip/T11/f.png",base:{eleDmg:1320}},
        {ilvl:[111,120],name:"星界天杖", icon:"./assets/images/equip/T12/f.png",base:{eleDmg:1632}}
    ],
    helmet: [
        {ilvl:[1,10],  name:"粗布兜帽", icon:"./assets/images/equip/T1/tk.png",  base:{hp:60,  dodge:10}},
        {ilvl:[11,20], name:"皮革头盔", icon:"./assets/images/equip/T2/tk.png",  base:{hp:110, dodge:18}},
        {ilvl:[21,30], name:"精钢战盔", icon:"./assets/images/equip/T3/tk.png",  base:{hp:190, dodge:30}},
        {ilvl:[31,40], name:"岩纹战盔", icon:"./assets/images/equip/T4/tk.png",  base:{hp:300, dodge:48}},
        {ilvl:[41,50], name:"熔岩战盔", icon:"./assets/images/equip/T5/tk.png",  base:{hp:425, dodge:68}},
        {ilvl:[51,60], name:"符文战盔", icon:"./assets/images/equip/T6/tk.png",  base:{hp:575, dodge:92}},
        {ilvl:[61,70], name:"幽魂战盔", icon:"./assets/images/equip/T7/tk.png",  base:{hp:800, dodge:125}},
        {ilvl:[71,80], name:"地狱战盔", icon:"./assets/images/equip/T8/tk.png",  base:{hp:1050,dodge:160}},
        {ilvl:[81,90], name:"虚空战盔", icon:"./assets/images/equip/T9/tk.png",  base:{hp:1375,dodge:200}},
        {ilvl:[91,100],name:"深渊战盔", icon:"./assets/images/equip/T10/tk.png", base:{hp:1750,dodge:245}},
        {ilvl:[101,110],name:"湮灭战盔", icon:"./assets/images/equip/T11/tk.png",base:{hp:2150,dodge:290}},
        {ilvl:[111,120],name:"星界战盔", icon:"./assets/images/equip/T12/tk.png",base:{hp:2600,dodge:345}}
    ],
    armor: [
        {ilvl:[1,10],  name:"粗布护甲", icon:"./assets/images/equip/T1/yf.png",  base:{hp:120, def:18}},
        {ilvl:[11,20], name:"皮革甲胄", icon:"./assets/images/equip/T2/yf.png",  base:{hp:220, def:32}},
        {ilvl:[21,30], name:"精钢战甲", icon:"./assets/images/equip/T3/yf.png",  base:{hp:380, def:55}},
        {ilvl:[31,40], name:"岩纹战甲", icon:"./assets/images/equip/T4/yf.png",  base:{hp:600, def:85}},
        {ilvl:[41,50], name:"熔岩战甲", icon:"./assets/images/equip/T5/yf.png",  base:{hp:850, def:120}},
        {ilvl:[51,60], name:"符文战甲", icon:"./assets/images/equip/T6/yf.png",  base:{hp:1150,def:165}},
        {ilvl:[61,70], name:"幽魂战甲", icon:"./assets/images/equip/T7/yf.png",  base:{hp:1600,def:220}},
        {ilvl:[71,80], name:"地狱战甲", icon:"./assets/images/equip/T8/yf.png",  base:{hp:2100,def:285}},
        {ilvl:[81,90], name:"虚空战甲", icon:"./assets/images/equip/T9/yf.png",  base:{hp:2750,def:360}},
        {ilvl:[91,100],name:"深渊战甲", icon:"./assets/images/equip/T10/yf.png", base:{hp:3500,def:440}},
        {ilvl:[101,110],name:"湮灭战甲", icon:"./assets/images/equip/T11/yf.png",base:{hp:4300,def:520}},
        {ilvl:[111,120],name:"星界战甲", icon:"./assets/images/equip/T12/yf.png",base:{hp:5200,def:620}}
    ],
    pants: [
        {ilvl:[1,10],   name:"粗布短裤", icon:"./assets/images/equip/T1/kz.png",  base:{def:30}},
        {ilvl:[11,20],  name:"皮革长腿", icon:"./assets/images/equip/T2/kz.png",  base:{def:58}},
        {ilvl:[21,30],  name:"精钢护腿", icon:"./assets/images/equip/T3/kz.png",  base:{def:100}},
        {ilvl:[31,40],  name:"岩纹腿铠", icon:"./assets/images/equip/T4/kz.png",  base:{def:150}},
        {ilvl:[41,50],  name:"熔岩腿铠", icon:"./assets/images/equip/T5/kz.png",  base:{def:220}},
        {ilvl:[51,60],  name:"符文腿铠", icon:"./assets/images/equip/T6/kz.png",  base:{def:310}},
        {ilvl:[61,70],  name:"幽魂腿铠", icon:"./assets/images/equip/T7/kz.png",  base:{def:420}},
        {ilvl:[71,80],  name:"地狱腿铠", icon:"./assets/images/equip/T8/kz.png",  base:{def:550}},
        {ilvl:[81,90],  name:"虚空腿铠", icon:"./assets/images/equip/T9/kz.png",  base:{def:700}},
        {ilvl:[91,100], name:"深渊腿铠", icon:"./assets/images/equip/T10/kz.png", base:{def:860}},
        {ilvl:[101,110],name:"湮灭腿铠", icon:"./assets/images/equip/T11/kz.png",base:{def:1020}},
        {ilvl:[111,120],name:"星界腿铠", icon:"./assets/images/equip/T12/kz.png",base:{def:1200}}
    ],
    glove: [
        {ilvl:[1,10],   name:"粗布手套", icon:"./assets/images/equip/T1/st.png",  base:{hp:40,  dodge:8}},
        {ilvl:[11,20],  name:"皮革手套", icon:"./assets/images/equip/T2/st.png",  base:{hp:80,  dodge:14}},
        {ilvl:[21,30],  name:"精钢护手", icon:"./assets/images/equip/T3/st.png",  base:{hp:140, dodge:24}},
        {ilvl:[31,40],  name:"岩纹护手", icon:"./assets/images/equip/T4/st.png",  base:{hp:220, dodge:38}},
        {ilvl:[41,50],  name:"熔岩护手", icon:"./assets/images/equip/T5/st.png",  base:{hp:320, dodge:54}},
        {ilvl:[51,60],  name:"符文护手", icon:"./assets/images/equip/T6/st.png",  base:{hp:440, dodge:74}},
        {ilvl:[61,70],  name:"幽魂护手", icon:"./assets/images/equip/T7/st.png",  base:{hp:600, dodge:100}},
        {ilvl:[71,80],  name:"地狱护手", icon:"./assets/images/equip/T8/st.png",  base:{hp:800, dodge:130}},
        {ilvl:[81,90],  name:"虚空护手", icon:"./assets/images/equip/T9/st.png",  base:{hp:1050,dodge:165}},
        {ilvl:[91,100], name:"深渊护手", icon:"./assets/images/equip/T10/st.png", base:{hp:1350,dodge:205}},
        {ilvl:[101,110],name:"湮灭护手", icon:"./assets/images/equip/T11/st.png",base:{hp:1700,dodge:245}},
        {ilvl:[111,120],name:"星界护手", icon:"./assets/images/equip/T12/st.png",base:{hp:2100,dodge:295}}
    ],
    boot: [
        {ilvl:[1,10],  name:"粗布短靴", icon:"./assets/images/equip/T1/xz.png",  base:{def:8,  dodge:8}},
        {ilvl:[11,20], name:"皮革长靴", icon:"./assets/images/equip/T2/xz.png",  base:{def:14, dodge:14}},
        {ilvl:[21,30], name:"精钢战靴", icon:"./assets/images/equip/T3/xz.png",  base:{def:24, dodge:24}},
        {ilvl:[31,40], name:"岩纹战靴", icon:"./assets/images/equip/T4/xz.png",  base:{def:38, dodge:38}},
        {ilvl:[41,50], name:"熔岩战靴", icon:"./assets/images/equip/T5/xz.png",  base:{def:54, dodge:54}},
        {ilvl:[51,60], name:"符文战靴", icon:"./assets/images/equip/T6/xz.png",  base:{def:74, dodge:74}},
        {ilvl:[61,70], name:"幽魂战靴", icon:"./assets/images/equip/T7/xz.png",  base:{def:100,dodge:100}},
        {ilvl:[71,80], name:"地狱战靴", icon:"./assets/images/equip/T8/xz.png",  base:{def:130,dodge:130}},
        {ilvl:[81,90], name:"虚空战靴", icon:"./assets/images/equip/T9/xz.png",  base:{def:165,dodge:165}},
        {ilvl:[91,100],name:"深渊战靴", icon:"./assets/images/equip/T10/xz.png", base:{def:205,dodge:205}},
        {ilvl:[101,110],name:"湮灭战靴", icon:"./assets/images/equip/T11/xz.png",base:{def:245,dodge:245}},
        {ilvl:[111,120],name:"星界战靴", icon:"./assets/images/equip/T12/xz.png",base:{def:295,dodge:295}}
    ],
    ring: [
        {ilvl:[1,10],  name:"黄铜指环", icon:"./assets/images/equip/T1/jz.png",   base:{hit:10,   critDmg:0.02}},
        {ilvl:[11,20], name:"白银戒环", icon:"./assets/images/equip/T2/jz.png",   base:{hit:30,   critDmg:0.05}},
        {ilvl:[21,30], name:"黄金魔戒", icon:"./assets/images/equip/T3/jz.png",   base:{hit:60,   critDmg:0.08}},
        {ilvl:[31,40], name:"岩纹秘戒", icon:"./assets/images/equip/T4/jz.png",   base:{hit:100,  critDmg:0.115}},
        {ilvl:[41,50], name:"熔岩焰戒", icon:"./assets/images/equip/T5/jz.png",   base:{hit:150,  critDmg:0.15}},
        {ilvl:[51,60], name:"符文法戒", icon:"./assets/images/equip/T6/jz.png",   base:{hit:210,  critDmg:0.185}},
        {ilvl:[61,70], name:"幽魂灵戒", icon:"./assets/images/equip/T7/jz.png",   base:{hit:280,  critDmg:0.22}},
        {ilvl:[71,80], name:"地狱魔戒", icon:"./assets/images/equip/T8/jz.png",   base:{hit:360,  critDmg:0.255}},
        {ilvl:[81,90], name:"虚空龙戒", icon:"./assets/images/equip/T9/jz.png",   base:{hit:450,  critDmg:0.29}},
        {ilvl:[91,100],name:"深渊圣指", icon:"./assets/images/equip/T10/jz.png",  base:{hit:550,  critDmg:0.325}},
        {ilvl:[101,110],name:"湮灭神戒", icon:"./assets/images/equip/T11/jz.png", base:{hit:660,  critDmg:0.36}},
        {ilvl:[111,120],name:"星界天戒", icon:"./assets/images/equip/T12/jz.png", base:{hit:780,  critDmg:0.38}}
    ],
    necklace: [
        {ilvl:[1,10],  name:"骨质项链", icon:"./assets/images/equip/T1/xl.png",   base:{critRate:0.01, critDmg:0.02}},
        {ilvl:[11,20], name:"白银链坠", icon:"./assets/images/equip/T2/xl.png",   base:{critRate:0.02, critDmg:0.05}},
        {ilvl:[21,30], name:"黄金魔链", icon:"./assets/images/equip/T3/xl.png",   base:{critRate:0.03, critDmg:0.08}},
        {ilvl:[31,40], name:"岩纹秘链", icon:"./assets/images/equip/T4/xl.png",   base:{critRate:0.04, critDmg:0.115}},
        {ilvl:[41,50], name:"熔岩焰链", icon:"./assets/images/equip/T5/xl.png",   base:{critRate:0.05, critDmg:0.15}},
        {ilvl:[51,60], name:"符文法链", icon:"./assets/images/equip/T6/xl.png",   base:{critRate:0.06, critDmg:0.185}},
        {ilvl:[61,70], name:"幽魂灵链", icon:"./assets/images/equip/T7/xl.png",   base:{critRate:0.07, critDmg:0.22}},
        {ilvl:[71,80], name:"地狱魔链", icon:"./assets/images/equip/T8/xl.png",   base:{critRate:0.08, critDmg:0.255}},
        {ilvl:[81,90], name:"虚空龙链", icon:"./assets/images/equip/T9/xl.png",   base:{critRate:0.09, critDmg:0.29}},
        {ilvl:[91,100],name:"深渊圣链", icon:"./assets/images/equip/T10/xl.png",  base:{critRate:0.10, critDmg:0.325}},
        {ilvl:[101,110],name:"湮灭神链", icon:"./assets/images/equip/T11/xl.png", base:{critRate:0.11, critDmg:0.36}},
        {ilvl:[111,120],name:"星界天链", icon:"./assets/images/equip/T12/xl.png", base:{critRate:0.12, critDmg:0.38}}
    ]
};

// 普通怪、精英、BOSS掉落概率配置
window.DROP_RATE = {
    0: [
        [0.50, 0.35, 0.12, 0.03, 0, 0, 0],
        [0.20, 0.40, 0.30, 0.08, 0.02, 0, 0],
        [0.10, 0.25, 0.35, 0.20, 0.10, 0, 0],
        [0.05, 0.15, 0.30, 0.30, 0.20, 0, 0]
    ],
    1: [
        [0.25, 0.50, 0.20, 0.05, 0, 0, 0],
        [0, 0.30, 0.45, 0.20, 0.05, 0, 0],
        [0, 0.20, 0.30, 0.34, 0.15, 0.01, 0],
        [0, 0.10, 0.25, 0.32, 0.22, 0.08, 0]
    ],
    2: [
        [0.10, 0.30, 0.40, 0.15, 0.05, 0, 0],
        [0, 0.20, 0.30, 0.45, 0.15, 0, 0],
        [0, 0.10, 0.20, 0.45, 0.20, 0.05, 0],
        [0, 0, 0.15, 0.30, 0.38, 0.15, 0.02]
    ],
    3: [
        [0, 0, 0.40, 0.45, 0.15, 0, 0],
        [0, 0, 0.25, 0.35, 0.35, 0.05, 0],
        [0, 0, 0.10, 0.35, 0.45, 0.10, 0],
        [0, 0, 0, 0.20, 0.45, 0.30, 0.05]
    ]
};

// T阶词条概率表
window.TIER_PROB = [
    [1],
    [0.412,0.588],
    [0.224,0.320,0.457],
    [0.135,0.193,0.276,0.395],
    [0.178,0.255,0.364,0.145,0.058],
    [0.111,0.158,0.226,0.323,0.129,0.052],
    [0.072,0.103,0.147,0.210,0.300,0.120,0.048],
    [0.048,0.069,0.098,0.140,0.200,0.286,0.114,0.046],
    [0.033,0.046,0.066,0.095,0.135,0.193,0.276,0.111,0.044],
    [0.022,0.032,0.045,0.065,0.093,0.132,0.189,0.270,0.108,0.043],
    [0.015,0.022,0.031,0.045,0.064,0.091,0.130,0.186,0.266,0.106,0.043],
    [0.011,0.015,0.022,0.031,0.044,0.063,0.090,0.129,0.184,0.263,0.105,0.042]
];

// ===================== 装备出售价格倍率 =====================
window.EQUIP_SELL_POSITION_MULTIPLIER = {
    weapon: 1.0,
    helmet: 0.8,
    armor: 0.8,
    boot: 0.8,
    pants: 0.8,
    glove: 0.8,
    ring: 1.2,
    necklace: 1.2
};

window.EQUIP_SELL_RARITY_MULTIPLIER = {
    "普通": 1,
    "优秀": 1.2,
    "稀有": 1.5,
    "史诗": 2,
    "传说": 3,
    "神话": 4,
    "宇宙": 8
};

/**
 * 计算一件装备的出售价格
 * @param {Object} equip
 * @returns {number}
 */
window.calcEquipSellPrice = function(equip) {
    if (!equip || !equip.position || !equip.rarityName) return 0;

    const posMulti = window.EQUIP_SELL_POSITION_MULTIPLIER[equip.position] || 0.5;
    const rarityMulti = window.EQUIP_SELL_RARITY_MULTIPLIER[equip.rarityName] || 1;
    const ilvl = equip.ilvl || 1;
    // 基础价格 = ilvl * 2 + 10（ilvl=1时约12，ilvl=120时约250
    const basePrice = Math.floor((ilvl-1) * 2 + 10);
    // 最终价格 = 基础价格 × 部位倍率 × 品质倍率，平滑因子使后期价格合理
    const price = Math.floor(basePrice * posMulti * rarityMulti);
    return Math.max(1, price);
};

// ===== 装备改造系统配置 =====
window.REFORM_CONFIG = {
    // 改造石阶次映射
    stoneByStage: [
        { minStage: 1,  maxStage: 3,  cfgId: 'reform_stone_small'},
        { minStage: 4,  maxStage: 6,  cfgId: 'reform_stone_medium'},
        { minStage: 7,  maxStage: 9,  cfgId: 'reform_stone_large'},
        { minStage: 10, maxStage: 12, cfgId: 'reform_stone_complete'}
    ],
    // 每次改造消耗数量
    costPerReform: 1
};

// ===== 装备强化系统配置 =====
window.ENHANCE_CONFIG = {
    maxLevel: 10,  // 强化上限
    
    // 每一级的强化成功率（index 0 对应 +1，index 9 对应 +10）
    successRate: [
        1.00,   // +1: 100%
        0.90,   // +2: 90%
        0.85,   // +3: 85%
        0.80,   // +4: 80%
        0.70,   // +5: 70%
        0.65,   // +6: 65%
        0.55,   // +7: 55%
        0.45,   // +8: 40%
        0.35,   // +9: 25%
        0.30    // +10: 15%
    ],
    
    // 是否需要"附加材料"（+6及以上需要，暂时留空后续开发）
    needMaterialFromLevel: 6,  // 从+6开始需要材料
    
    soulShardByStage: [
        { minStage: 1,  maxStage: 3,  cfgId: 'soul_shard_small'},
        { minStage: 4,  maxStage: 6,  cfgId: 'soul_shard_medium'},
        { minStage: 7,  maxStage: 9,  cfgId: 'soul_shard_large'},
        { minStage: 10, maxStage: 12, cfgId: 'soul_shard_complete'}
    ],

    materialCost: {
        6: 1,     // +5→+6  需要 5 个对应碎晶
        7: 2,    // +6→+7  需要 10 个
        8: 3,    // +7→+8  需要 20 个
        9: 4,    // +8→+9  需要 40 个
        10: 5     // +9→+10 需要 80 个
    },
    // 强化失败惩罚：+6及以上掉1级
    failDropLevelFrom: 90,
    
    // ===== 每一级的基础属性增幅系数（相对于装备出售价格的乘数） =====
    // 强化后增加的属性值 = 装备出售价格 * boostCoefficient[level]
    // 这样同一阶同品质的装备强化消耗/收益相同
    boostConfig: {
        // 格式：level => { 属性增幅倍率（相对于装备原始基础属性） }
        1: { baseMultiplier: 0.10 },   // +1: 增加5%
        2: { baseMultiplier: 0.20 },
        3: { baseMultiplier: 0.30 },
        4: { baseMultiplier: 0.40 },
        5: { baseMultiplier: 0.50 },
        6: { baseMultiplier: 0.65 },
        7: { baseMultiplier: 0.80 },
        8: { baseMultiplier: 0.95 },
        9: { baseMultiplier: 1.10 },
        10: { baseMultiplier: 1.30 }
    }
};