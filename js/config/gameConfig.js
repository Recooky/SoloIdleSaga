// ===================== 全局基础配置 =====================
export const BASE_ATTR = {
    hp: 100,
    atk: 10,
    def: 0,
    attackSpeed: 1.0,
    critRate: 0.05,
    critDamage: 1.5
};

// 装备部位定义
export const EQUIP_POSITION = {
    WEAPON: "weapon",
    HELMET: "helmet",
    ARMOR: "armor",
    BOOT: "boot",
    RING: "ring",
    NECKLACE: "necklace"
};

export const POSITION_NAME = {
    weapon: "武器",
    helmet: "头盔",
    armor: "护甲",
    boot: "靴子",
    ring: "戒指",
    necklace: "项链"
};

// 7档稀有度配置
export const RARITY_CONFIG = [
    { name: "普通", color: "#ffffff", affixNum: 0, rate: 1.0 },
    { name: "优秀", color: "#32cd32", affixNum: 1, rate: 1.2 },
    { name: "稀有", color: "#4169e1", affixNum: 2, rate: 1.5 },
    { name: "史诗", color: "#9932cc", affixNum: 3, rate: 2.0 },
    { name: "传说", color: "#ff8c00", affixNum: 4, rate: 2.8 },
    { name: "神话", color: "#ff2222", affixNum: 5, rate: 4.0 },
    { name: "宇宙", color: "linear-gradient(90deg,red,orange,yellow,green,blue,purple)", affixNum: 6, rate: 6.0 }
];

// ===================== 攻击类词条（武器、戒指、项链可用） =====================
export const ATTACK_AFFIX = [
    {
        name: "增加攻击力",
        type: "fixedAtk",
        values: [
            [1,3],[3,5],[5,8],[8,12],[12,18],[18,25],[25,35],[35,50],[50,70],[70,95],[95,120],[120,150]
        ]
    },
    {
        name: "提升攻击力",
        type: "percentAtk",
        values: [
            [0.02,0.03],[0.03,0.04],[0.04,0.05],[0.05,0.07],[0.07,0.09],[0.09,0.11],
            [0.11,0.14],[0.14,0.17],[0.17,0.20],[0.20,0.23],[0.23,0.26],[0.26,0.30]
        ]
    },
    {
        name: "攻击速度提升",
        type: "percentAS",
        values: [
            [0.02,0.03],[0.03,0.04],[0.04,0.05],[0.05,0.06],[0.06,0.08],[0.08,0.10],
            [0.10,0.12],[0.12,0.14],[0.14,0.16],[0.16,0.18],[0.18,0.20],[0.20,0.25]
        ]
    },
    {
        name: "暴击率提升",
        type: "percentCritRate",
        values: [
            [0.01,0.02],[0.015,0.025],[0.02,0.03],[0.025,0.04],[0.03,0.05],[0.04,0.06],
            [0.05,0.07],[0.06,0.08],[0.07,0.09],[0.08,0.10],[0.09,0.11],[0.10,0.12]
        ]
    },
    {
        name: "暴击伤害提升",
        type: "percentCritDmg",
        values: [
            [0.05,0.08],[0.08,0.11],[0.11,0.14],[0.14,0.17],[0.17,0.20],[0.20,0.23],
            [0.23,0.26],[0.26,0.29],[0.29,0.32],[0.32,0.35],[0.35,0.38],[0.38,0.40]
        ]
    }
];

// ===================== 防御类词条（头盔、护甲、靴子可用） =====================
export const DEF_AFFIX = [
    {
        name: "增加最大生命值",
        type: "fixedHp",
        values: [
            [5,10],[10,15],[15,22],[22,30],[30,42],[42,58],
            [58,80],[80,110],[110,150],[150,200],[200,260],[260,330]
        ]
    },
    {
        name: "提升最大生命值",
        type: "percentHp",
        values: [
            [0.02,0.03],[0.03,0.04],[0.04,0.05],[0.05,0.07],[0.07,0.09],[0.09,0.11],
            [0.11,0.13],[0.13,0.15],[0.15,0.17],[0.17,0.19],[0.19,0.22],[0.22,0.25]
        ]
    },
    {
        name: "增加护甲值",
        type: "fixedDef",
        values: [
            [2,4],[4,6],[6,9],[9,13],[13,18],[18,25],
            [25,35],[35,48],[48,65],[65,80],[80,95],[95,110]
        ]
    },
    {
        name: "提升护甲值",
        type: "percentDef",
        values: [
            [0.03,0.05],[0.05,0.07],[0.07,0.09],[0.09,0.12],[0.12,0.15],[0.15,0.18],
            [0.18,0.22],[0.22,0.26],[0.26,0.30],[0.30,0.34],[0.34,0.38],[0.38,0.42]
        ]
    }
];

// ===================== 全部位装备基础库 =====================
export const EQUIP_LIB = {
    weapon: [
        {ilvl:[1,10],name:"生锈的短剑",base:{atk:5}},
        {ilvl:[11,20],name:"铁制短剑",base:{atk:7}},
        {ilvl:[21,30],name:"精钢长剑",base:{atk:9}},
        {ilvl:[31,40],name:"暗影匕首",base:{atk:13}},
        {ilvl:[41,50],name:"熔岩战斧",base:{atk:17}},
        {ilvl:[51,60],name:"符文长剑",base:{atk:23}},
        {ilvl:[61,70],name:"幽魂镰刀",base:{atk:31}},
        {ilvl:[71,80],name:"地狱巨剑",base:{atk:42}},
        {ilvl:[81,90],name:"虚空弯刀",base:{atk:57}},
        {ilvl:[91,100],name:"深渊战刃",base:{atk:77}},
        {ilvl:[101,110],name:"湮灭之剑",base:{atk:105}},
        {ilvl:[111,120],name:"星界主宰之刃",base:{atk:142}}
    ],
    helmet: [
        {ilvl:[1,10],name:"粗布兜帽",base:{hp:20}},
        {ilvl:[11,20],name:"皮革头盔",base:{hp:26}},
        {ilvl:[21,30],name:"铁制头盔",base:{hp:34}},
        {ilvl:[31,40],name:"暗影兜帽",base:{hp:44}},
        {ilvl:[41,50],name:"熔岩重盔",base:{hp:57}},
        {ilvl:[51,60],name:"符文头盔",base:{hp:74}},
        {ilvl:[61,70],name:"幽魂面甲",base:{hp:96}},
        {ilvl:[71,80],name:"地狱战盔",base:{hp:125}},
        {ilvl:[81,90],name:"虚空王冠",base:{hp:162}},
        {ilvl:[91,100],name:"深渊头盔",base:{hp:211}},
        {ilvl:[101,110],name:"湮灭之冠",base:{hp:274}},
        {ilvl:[111,120],name:"星界神冠",base:{hp:356}}
    ],
    armor: [
        {ilvl:[1,10],name:"粗布护甲",base:{def:6}},
        {ilvl:[11,20],name:"皮革护甲",base:{def:8}},
        {ilvl:[21,30],name:"铁制锁甲",base:{def:12}},
        {ilvl:[31,40],name:"暗影皮甲",base:{def:16}},
        {ilvl:[41,50],name:"熔岩重甲",base:{def:22}},
        {ilvl:[51,60],name:"符文板甲",base:{def:30}},
        {ilvl:[61,70],name:"幽魂战甲",base:{def:42}},
        {ilvl:[71,80],name:"地狱铠甲",base:{def:58}},
        {ilvl:[81,90],name:"虚空护甲",base:{def:78}},
        {ilvl:[91,100],name:"深渊战甲",base:{def:106}},
        {ilvl:[101,110],name:"湮灭铠甲",base:{def:144}},
        {ilvl:[111,120],name:"星界神铠",base:{def:200}}
    ],
    boot: [
        {ilvl:[1,10],name:"粗布短靴",base:{def:3,hp:10}},
        {ilvl:[11,20],name:"皮革长靴",base:{def:4,hp:13}},
        {ilvl:[21,30],name:"铁制战靴",base:{def:6,hp:17}},
        {ilvl:[31,40],name:"暗影之靴",base:{def:8,hp:22}},
        {ilvl:[41,50],name:"熔岩战靴",base:{def:11,hp:28}},
        {ilvl:[51,60],name:"符文之靴",base:{def:15,hp:36}},
        {ilvl:[61,70],name:"幽魂行靴",base:{def:21,hp:47}},
        {ilvl:[71,80],name:"地狱战靴",base:{def:29,hp:61}},
        {ilvl:[81,90],name:"虚空之靴",base:{def:39,hp:79}},
        {ilvl:[91,100],name:"深渊之靴",base:{def:53,hp:102}},
        {ilvl:[101,110],name:"湮灭之靴",base:{def:72,hp:133}},
        {ilvl:[111,120],name:"星界神靴",base:{def:98,hp:173}}
    ],
    ring: [
        {ilvl:[1,10],name:"黄铜戒指",base:{critRate:0.008,critDmg:0.03}},
        {ilvl:[11,20],name:"白银戒指",base:{critRate:0.01,critDmg:0.04}},
        {ilvl:[21,30],name:"黄金戒指",base:{critRate:0.013,critDmg:0.05}},
        {ilvl:[31,40],name:"暗影戒指",base:{critRate:0.017,critDmg:0.065}},
        {ilvl:[41,50],name:"熔岩戒指",base:{critRate:0.021,critDmg:0.08}},
        {ilvl:[51,60],name:"符文戒指",base:{critRate:0.026,critDmg:0.10}},
        {ilvl:[61,70],name:"幽魂戒指",base:{critRate:0.032,critDmg:0.13}},
        {ilvl:[71,80],name:"地狱戒指",base:{critRate:0.039,critDmg:0.16}},
        {ilvl:[81,90],name:"虚空戒指",base:{critRate:0.046,critDmg:0.20}},
        {ilvl:[91,100],name:"深渊戒指",base:{critRate:0.055,critDmg:0.25}},
        {ilvl:[101,110],name:"湮灭之戒",base:{critRate:0.065,critDmg:0.31}},
        {ilvl:[111,120],name:"星界神戒",base:{critRate:0.075,critDmg:0.38}}
    ],
    necklace: [
        {ilvl:[1,10],name:"草编项链",base:{critRate:0.01,atk:2}},
        {ilvl:[11,20],name:"骨制项链",base:{critRate:0.013,atk:3}},
        {ilvl:[21,30],name:"白银项链",base:{critRate:0.016,atk:4}},
        {ilvl:[31,40],name:"暗影项链",base:{critRate:0.02,atk:6}},
        {ilvl:[41,50],name:"熔岩项链",base:{critRate:0.025,atk:8}},
        {ilvl:[51,60],name:"符文项链",base:{critRate:0.03,atk:11}},
        {ilvl:[61,70],name:"幽魂项链",base:{critRate:0.036,atk:15}},
        {ilvl:[71,80],name:"地狱项链",base:{critRate:0.043,atk:20}},
        {ilvl:[81,90],name:"虚空项链",base:{critRate:0.05,atk:27}},
        {ilvl:[91,100],name:"深渊项链",base:{critRate:0.058,atk:37}},
        {ilvl:[101,110],name:"湮灭之链",base:{critRate:0.068,atk:50}},
        {ilvl:[111,120],name:"星界神链",base:{critRate:0.08,atk:68}}
    ]
};

// 难度区间
export const DIFFICULT_ZONE = [
    {name:"普通",min:1,max:30},
    {name:"困难",min:31,max:60},
    {name:"噩梦",min:61,max:90},
    {name:"地狱",min:91,max:120}
];

// 普通怪、精英、BOSS掉落概率配置
export const DROP_RATE = {
    normalMonster: [
        [0.6,0.36,0.04,0,0,0,0],
        [0.3,0.35,0.33,0.02,0,0,0],
        [0.15,0.3,0.38,0.15,0.02,0,0],
        [0.05,0.2,0.4,0.3,0.05,0,0]
    ],
    eliteMonster: [
        [0.5,0.35,0.14,0.01,0,0,0],
        [0.3,0.35,0.3,0.04,0.01,0,0],
        [0.15,0.25,0.3,0.25,0.04,0.01,0],
        [0.05,0.15,0.3,0.3,0.18,0.02,0]
    ],
    bossMonster: [
        [0.5,0.35,0.12,0.025,0.005,0,0],
        [0.3,0.35,0.25,0.08,0.02,0,0],
        [0.15,0.25,0.3,0.2,0.08,0.02,0],
        [0.05,0.15,0.25,0.25,0.19,0.1,0.01]
    ]
};

// T阶词条概率表
export const TIER_PROB = [
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