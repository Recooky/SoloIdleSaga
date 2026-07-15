// 怪物属性成长公式
window.MONSTER_GROW = {
    hpRegenBase: 2,         // ← 新增：怪物初始恢复 2/秒
    hpRegenRate: 1.015,     // ← 新增：每关增长1.5%
} 

window.MONSTER_RARITY = [
    { name: "普通", color: "#ffffff"},
    { name: "优秀", color: "#32cd32"},
    { name: "稀有", color: "#0070dd"},
    { name: "史诗", color: "#a335ee"},
    { name: "传说", color: "#ff8c00"},
    { name: "神话", color: "#ff2222"},
    { name: "宇宙", color: "#00ccff"}
];

// ===== 每关的波次怪物类型配置（键1~10，对应关卡1~10，后续关卡循环） =====
// 可选值: "normal" | "elite" | "boss"
// 波次怪物品质配置（分段式）
// range: [起始关卡, 结束关卡]（包含两端）
// waves: 长度为5的数组，每个元素为品质索引 0~6
// 若该品质索引在对应区域的 monstersByQuality 中不存在，则自动降级至可用的最高品质（或报错保护）
window.WAVE_TYPE_CONFIG = [
  { range: [1,  3],  waves: [0, 0, 0, 1, 1] }, // 关卡1~2：4只普通，1只优秀
  { range: [4,  6],  waves: [0, 0, 1, 1, 2] }, 
  { range: [7,  9],  waves: [0, 1, 1, 2, 2] }, 
  { range: [10,  10],  waves: [1, 1, 1, 2, 3] }, 
  { range: [11,  13],  waves: [0, 0, 0, 1, 1] }, //11~20
  { range: [14,  16],  waves: [0, 0, 1, 1, 2] }, 
  { range: [17,  19],  waves: [0, 1, 1, 2, 2] }, 
  { range: [20,  20],  waves: [1, 1, 1, 2, 3] }, 
  { range: [21,  23],  waves: [0, 0, 0, 0, 1] }, //21~30
  { range: [24,  26],  waves: [0, 0, 1, 1, 1] }, 
  { range: [27,  29],  waves: [0, 1, 1, 1, 2] }, 
  { range: [30,  30],  waves: [1, 1, 1, 2, 3] }, 
  { range: [31,  33],  waves: [0, 0, 0, 0, 1] }, //31~40
  { range: [34,  36],  waves: [0, 0, 1, 1, 1] }, 
  { range: [37,  39],  waves: [0, 1, 1, 1, 2] }, 
  { range: [40,  40],  waves: [1, 1, 1, 2, 3] }, 
  { range: [41,  43],  waves: [0, 0, 0, 0, 1] }, //41~50
  { range: [44,  46],  waves: [0, 0, 1, 1, 1] }, 
  { range: [47,  49],  waves: [0, 1, 1, 1, 2] }, 
  { range: [50,  50],  waves: [1, 1, 1, 2, 3] }, 
  { range: [51,  53],  waves: [0, 0, 0, 0, 1] }, //51~60
  { range: [54,  56],  waves: [0, 0, 1, 1, 1] }, 
  { range: [57,  59],  waves: [0, 1, 1, 1, 2] }, 
  { range: [60,  60],  waves: [1, 1, 1, 2, 3] }, 
  { range: [61,  63],  waves: [0, 0, 0, 0, 1] }, //61~70
  { range: [64,  66],  waves: [0, 0, 1, 1, 1] }, 
  { range: [67,  69],  waves: [0, 1, 1, 1, 2] }, 
  { range: [70,  70],  waves: [1, 1, 1, 2, 3] },   
  { range: [71,  73],  waves: [0, 0, 0, 0, 1] }, //71~80
  { range: [74,  76],  waves: [0, 0, 1, 1, 1] }, 
  { range: [77,  79],  waves: [0, 1, 1, 1, 2] }, 
  { range: [80,  80],  waves: [1, 1, 1, 2, 3] }, 
  { range: [81,  83],  waves: [0, 0, 0, 0, 1] }, //81~90
  { range: [84,  86],  waves: [0, 0, 1, 1, 1] }, 
  { range: [87,  89],  waves: [0, 1, 1, 1, 2] }, 
  { range: [90,  90],  waves: [1, 1, 1, 2, 3] }, 
  { range: [91,  93],  waves: [0, 0, 0, 0, 1] }, //91~100
  { range: [94,  96],  waves: [0, 0, 1, 1, 1] }, 
  { range: [97,  99],  waves: [0, 1, 1, 1, 2] }, 
  { range: [100,  100],  waves: [1, 1, 1, 2, 3] }, 
  { range: [101,  103],  waves: [0, 0, 0, 0, 1] }, //101~110
  { range: [104,  106],  waves: [0, 0, 1, 1, 1] }, 
  { range: [107,  109],  waves: [0, 1, 1, 1, 2] }, 
  { range: [110,  110],  waves: [1, 1, 1, 2, 3] }, 
  { range: [111,  113],  waves: [0, 0, 0, 0, 1] }, //111~120
  { range: [114,  116],  waves: [0, 0, 1, 1, 1] }, 
  { range: [117,  119],  waves: [0, 1, 1, 1, 2] }, 
  { range: [120,  120],  waves: [1, 1, 1, 2, 3] }, 
];

// 12个怪物阶段配置
// 怪物区域配置（取代旧的 MONSTER_STAGE）
// 品质索引：0普通 1优秀 2稀有 3史诗 4传说 5神话 6宇宙
window.MONSTER_REGION_CONFIG = [
    //第1区
    {
    zone: "幽暗森林",
    name: "低语沼泽",
    stage: 1,
    range: [1, 10],
    resistPenalty: 0,
    background: "../assets/images/backgrounds/zone-bg/dark-forest.jpg",
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "goblin_scout", name: "哥布林斥候", hp: 80, atk: 12, def: 5, dodge: 5, hit: 8, fireRes: 0, coldRes: 0, lightRes: 0,
              skills: [],
              image: "images/monster/1goblin/goblin_scout.png" },
            { id: "goblin_worker", name: "哥布林劳工", hp: 120, atk: 8, def: 8, dodge: 2, hit: 6, fireRes: 0, coldRes: 0, lightRes: 0,
              skills: [],
              image: "images/monster/1goblin/goblin_worker.png" },
            { id: "goblin_runner", name: "哥布林刺客", hp: 60, atk: 15, def: 3, dodge: 12, hit: 10, fireRes: 0, coldRes: 0, lightRes: 0,
              skills: [],
              image: "images/monster/1goblin/goblin_runner.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "goblin_hunter", name: "哥布林猎手", hp: 150, atk: 22, def: 10, dodge: 10, hit: 15, fireRes: 0.05, coldRes: 0.05, lightRes: 0,
              skills: [],
              image: "images/monster/1goblin/goblin_hunter.png" },
            { id: "goblin_shield", name: "哥布林盾卫", hp: 250, atk: 14, def: 18, dodge: 3, hit: 10, fireRes: 0.10, coldRes: 0.05, lightRes: 0,
              skills: [],
              image: "images/monster/1goblin/goblin_shield.png" },
            { id: "goblin_trapper", name: "哥布林战士", hp: 120, atk: 28, def: 6, dodge: 15, hit: 12, fireRes: 0, coldRes: 0.10, lightRes: 0.05,
              skills: [],
              image: "images/monster/1goblin/goblin_trapper.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "goblin_shaman", name: "哥布林萨满", hp: 400, atk: 35, elementType: "fireDmg", elementDmg: 30, def: 15, dodge: 8, hit: 20, fireRes: 0.15, coldRes: 0.10, lightRes: 0.10,
              skills: ["fireball"],
              image: "images/monster/1goblin/goblin_shaman.png" },
            { id: "goblin_berserker", name: "哥布林法师", hp: 350, atk: 50, elementType: "fireDmg", elementDmg: 30, def: 12, dodge: 5, hit: 25, fireRes: 0.05, coldRes: 0.05, lightRes: 0.05,
              skills: ["rage"],
              image: "images/monster/1goblin/goblin_berserker.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "goblin_chieftain", name: "哥布林酋长", hp: 800, atk: 65, elementType: "lightDmg", elementDmg: 40, def: 25, dodge: 10, hit: 30, fireRes: 0.20, coldRes: 0.20, lightRes:0.20,
              skills: ["warCry", "frenzy"],
              image: "images/monster/1goblin/goblin_chieftain.png" }
        ]
    }
    },
    //第2区
    {
    zone: "幽暗森林",
    name: "血根密林",
    stage: 2,
    range: [11, 20],
    resistPenalty: 0.10,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "wild_wolf", name: "荒野野狼", hp: 150, atk: 18, def: 6, dodge: 10, hit: 12, fireRes: 0, coldRes: 0.05, lightRes: 0,
              skills: [],
              image: "images/monster/wild_wolf.png" },
            { id: "giant_rat", name: "巨鼠", hp: 100, atk: 14, def: 4, dodge: 15, hit: 8, fireRes: 0, coldRes: 0, lightRes: 0,
              skills: [],
              image: "images/monster/giant_rat.png" },
            { id: "venom_snake", name: "毒蛇", hp: 80, atk: 0, elementType: "fireDmg", elementDmg: 20, def: 3, dodge: 18, hit: 10, fireRes: 0, coldRes: 0, lightRes: 0,
              skills: ["poison"],
              image: "images/monster/venom_snake.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "giant_spider", name: "巨型毒蛛", hp: 280, atk: 0, elementType: "fireDmg", elementDmg: 30, def: 12, dodge: 12, hit: 18, fireRes: 0.05, coldRes: 0.05, lightRes: 0,
              skills: ["poison", "web"],
              image: "images/monster/giant_spider.png" },
            { id: "alpha_wolf", name: "荒野狼王", hp: 400, atk: 40, def: 18, dodge: 14, hit: 22, fireRes: 0.10, coldRes: 0.10, lightRes: 0.05,
              skills: ["howl"],
              image: "images/monster/alpha_wolf.png" },
            { id: "dark_stalker", name: "暗影潜行者", hp: 200, atk: 0, elementType: "coldDmg", elementDmg: 45, def: 8, dodge: 22, hit: 15, fireRes: 0, coldRes: 0.10, lightRes: 0.10,
              skills: ["stealth"],
              image: "images/monster/dark_stalker.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "elite_wolf", name: "精英狼王", hp: 600, atk: 55, elementType: "coldDmg", elementDmg: 60, def: 22, dodge: 16, hit: 26, fireRes: 0.15, coldRes: 0.15, lightRes: 0.10,
              skills: ["howl", "frenzy"],
              image: "images/monster/elite_wolf.png" },
            { id: "venom_lord", name: "毒液领主", hp: 500, atk: 60, elementType: "fireDmg", elementDmg: 70, def: 15, dodge: 20, hit: 20, fireRes: 0.05, coldRes: 0.10, lightRes: 0.15,
              skills: ["poisonBolt", "toxic"],
              image: "images/monster/venom_lord.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "forest_titan", name: "密林巨人", hp: 1200, atk: 80, elementType: "lightDmg", elementDmg: 100, def: 35, dodge: 5, hit: 35, fireRes: 0.25, coldRes: 0.25, lightRes: 0.20,
              skills: ["stomp", "root"],
              image: "images/monster/forest_titan.png" }
        ]
    }
    },
    //第3区
    {
    zone: "幽暗森林",
    name: "永夜祭坛",
    stage: 3,
    range: [21, 30],
    resistPenalty: 0.20,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "corrupted_vine", name: "腐化藤蔓", hp: 120, atk: 0, elementType: "fireDmg", elementDmg: 16, def: 7, dodge: 4, hit: 9, fireRes: 0, coldRes: 0.05, lightRes: 0,
              skills: [],
              image: "images/monster/corrupted_vine.png" },
            { id: "tainted_sprite", name: "怨灵", hp: 90, atk: 0, elementType: "lightDmg", elementDmg: 22, def: 4, dodge: 14, hit: 11, fireRes: 0.05, coldRes: 0, lightRes: 0.10,
              skills: [],
              image: "images/monster/tainted_sprite.png" },
            { id: "rotten_slime", name: "腐液史莱姆", hp: 160, atk: 12, def: 10, dodge: 2, hit: 7, fireRes: 0.10, coldRes: 0, lightRes: 0,
              skills: [],
              image: "images/monster/rotten_slime.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "corrupted_guard", name: "腐化守卫", hp: 280, atk: 30, def: 16, dodge: 8, hit: 16, fireRes: 0.10, coldRes: 0.10, lightRes: 0.05,
              skills: [],
              image: "images/monster/corrupted_guard.png" },
            { id: "shade_walker", name: "暗影行者", hp: 200, atk: 0, elementType: "coldDmg", elementDmg: 40, def: 10, dodge: 20, hit: 14, fireRes: 0, coldRes: 0.15, lightRes: 0.10,
              skills: ["shadowBlast"],
              image: "images/monster/shade_walker.png" },
            { id: "plague_cultist", name: "瘟疫祭司", hp: 320, atk: 0, elementType: "fireDmg", elementDmg: 26, def: 14, dodge: 6, hit: 18, fireRes: 0.15, coldRes: 0.05, lightRes: 0.10,
              skills: ["plague"],
              image: "images/monster/plague_cultist.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "corrupted_knight", name: "腐化骑士", hp: 550, atk: 50, elementType: "fireDmg", elementDmg: 60, def: 22, dodge: 12, hit: 24, fireRes: 0.20, coldRes: 0.15, lightRes: 0.15,
              skills: ["darkStrike", "shield"],
              image: "images/monster/corrupted_knight.png" },
            { id: "shadow_mage", name: "暗影法师", hp: 400, atk: 60, elementType: "coldDmg", elementDmg: 70, def: 15, dodge: 16, hit: 22, fireRes: 0.10, coldRes: 0.20, lightRes: 0.20,
              skills: ["shadowBolt", "darkness"],
              image: "images/monster/shadow_mage.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "druid_corrupted", name: "腐化德鲁伊", hp: 1100, atk: 75, elementType: "lightDmg", elementDmg: 90, def: 30, dodge: 10, hit: 32, fireRes: 0.25, coldRes: 0.25, lightRes: 0.20,
              skills: ["corruptionWave", "summonVines", "lifeDrain"],
              image: "images/monster/druid_corrupted.png" }
        ]
    }
    },
    //第4区
    {
    zone: "熔岩洞窟",
    name: "焦骨走廊",
    stage: 4,
    range: [31, 40],
    resistPenalty: 0.35,
    background: "../assets/images/backgrounds/zone-bg/lava-cave.jpg",
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "lava_lizard", name: "熔岩蜥蜴", hp: 180, atk: 0, elementType: "fireDmg", elementDmg: 22, def: 10, dodge: 6, hit: 12, fireRes: 0.20, coldRes: 0, lightRes: 0.05,
              skills: [],
              image: "images/monster/lava_lizard.png" },
            { id: "ember_imp", name: "余烬小鬼", hp: 130, atk: 0, elementType: "fireDmg", elementDmg: 28, def: 6, dodge: 16, hit: 14, fireRes: 0.15, coldRes: 0, lightRes: 0.5,
              skills: ["flameBolt"],
              image: "images/monster/ember_imp.png" },
            { id: "magma_slug", name: "岩浆蛞蝓", hp: 220, atk: 0, elementType: "fireDmg", elementDmg: 18, def: 14, dodge: 2, hit: 10, fireRes: 0.25, coldRes: 0, lightRes: 0.5,
              skills: [],
              image: "images/monster/magma_slug.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "lava_giant_lizard", name: "熔岩巨蜥", hp: 400, atk: 38, def: 20, dodge: 10, hit: 20, fireRes: 0.30, coldRes: 0.05, lightRes: 0.10,
              skills: ["tailSweep"],
              image: "images/monster/lava_giant_lizard.png" },
            { id: "fire_cultist", name: "火焰祭司", hp: 300, atk: 0, elementType: "fireDmg", elementDmg: 45, def: 14, dodge: 14, hit: 18, fireRes: 0.30, coldRes: 0.05, lightRes: 0.10,
              skills: ["fireWave", "heatShield"],
              image: "images/monster/fire_cultist.png" },
            { id: "molten_guard", name: "熔岩守卫", hp: 480, atk: 0, elementType: "fireDmg", elementDmg: 32, def: 26, dodge: 6, hit: 22, fireRes: 0.35, coldRes: 0, lightRes: 0.10,
              skills: ["lavaShield"],
              image: "images/monster/molten_guard.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "magma_berserker", name: "岩浆狂战士", hp: 700, atk: 58, elementType: "fireDmg", elementDmg: 70, def: 24, dodge: 12, hit: 28, fireRes: 0.40, coldRes: 0.05, lightRes: 0.15,
              skills: ["fury", "flameCharge"],
              image: "images/monster/magma_berserker.png" },
            { id: "fire_elemental", name: "火焰元素", hp: 600, atk: 65, elementType: "fireDmg", elementDmg: 80, def: 18, dodge: 18, hit: 26, fireRes: 0.50, coldRes: 0, lightRes: 0.15,
              skills: ["fireStorm", "immolate"],
              image: "images/monster/fire_elemental.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "lava_lizard_king", name: "熔岩蜥蜴王", hp: 1500, atk: 90, elementType: "fireDmg", elementDmg: 110, def: 38, dodge: 8, hit: 36, fireRes: 0.55, coldRes: 0.10, lightRes: 0.20,
              skills: ["lavaEruption", "kingRoar", "tailSweep"],
              image: "images/monster/lava_lizard_king.png" }
        ]
    }
    },
    //第5区
    {
    zone: "熔岩洞窟",
    name: "沸银之湖",
    stage: 5,
    range: [41, 50],
    resistPenalty: 0.50,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "orc_grunt", name: "兽人步兵", hp: 250, atk: 28, def: 14, dodge: 8, hit: 16, fireRes: 0.25, coldRes: 0.10, lightRes: 0.10,
              skills: [],
              image: "images/monster/orc_grunt.png" },
            { id: "goblin_raider", name: "兽人劫掠者", hp: 180, atk: 35, def: 8, dodge: 20, hit: 18, fireRes: 0.15, coldRes: 0.10, lightRes: 0.10,
              skills: ["quickStrike"],
              image: "images/monster/goblin_raider.png" },
            { id: "silver_vapor", name: "银雾灵", hp: 200, atk: 0, elementType: "coldDmg", elementDmg: 32, def: 10, dodge: 18, hit: 15, fireRes: 0.20, coldRes: 0.30, lightRes: 0.20,
              skills: [],
              image: "images/monster/silver_vapor.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "orc_centurion", name: "兽人百夫长", hp: 500, atk: 48, def: 24, dodge: 12, hit: 24, fireRes: 0.35, coldRes: 0.15, lightRes: 0.15,
              skills: ["warCry", "shieldBash"],
              image: "images/monster/orc_centurion.png" },
            { id: "silver_elemental", name: "银光元素", hp: 380, atk: 0, elementType: "lightDmg", elementDmg: 55, def: 18, dodge: 16, hit: 22, fireRes: 0.25, coldRes: 0.40, lightRes: 0.30,
              skills: ["silverBeam", "freeze"],
              image: "images/monster/silver_elemental.png" },
            { id: "orc_shaman", name: "兽人萨满", hp: 550, atk: 0, elementType: "fireDmg", elementDmg: 40, def: 20, dodge: 10, hit: 26, fireRes: 0.40, coldRes: 0.20, lightRes: 0.20,
              skills: ["bloodlust", "heal"],
              image: "images/monster/orc_shaman.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "orc_warlord", name: "兽人督军", hp: 900, atk: 70, elementType: "fireDmg", elementDmg: 85, def: 30, dodge: 14, hit: 32, fireRes: 0.50, coldRes: 0.20, lightRes: 0.25,
              skills: ["frenzy", "intimidate", "cleave"],
              image: "images/monster/orc_warlord.png" },
            { id: "silver_dragon", name: "银鳞幼龙", hp: 800, atk: 80, elementType: "coldDmg", elementDmg: 90, def: 25, dodge: 20, hit: 30, fireRes: 0.40, coldRes: 0.60, lightRes: 0.40,
              skills: ["silverBreath", "tailWhip"],
              image: "images/monster/silver_dragon.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "silver_lord", name: "银湖领主", hp: 2000, atk: 100, elementType: "coldDmg", elementDmg: 120, def: 45, dodge: 12, hit: 40, fireRes: 0.55, coldRes: 0.60, lightRes: 0.50,
              skills: ["silverWave", "lordCommand", "elementBarrier"],
              image: "images/monster/silver_lord.png" }
        ]
    }
    },
    //第6区
    {
    zone: "熔岩洞窟",
    name: "原初裂痕",
    stage: 6,
    range: [51, 60],
    resistPenalty: 0.65,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "ember_wisp", name: "余烬之灵", hp: 280, atk: 0, elementType: "fireDmg", elementDmg: 32, def: 16, dodge: 10, hit: 18, fireRes: 0.35, coldRes: 0, lightRes: 0.10,
              skills: ["fireSpark"],
              image: "images/monster/ember_wisp.png" },
            { id: "cinder_rat", name: "烬鼠", hp: 220, atk: 40, def: 10, dodge: 24, hit: 20, fireRes: 0.30, coldRes: 0, lightRes: 0.10,
              skills: [],
              image: "images/monster/cinder_rat.png" },
            { id: "magma_sprout", name: "岩浆芽孢", hp: 350, atk: 28, def: 20, dodge: 4, hit: 14, fireRes: 0.40, coldRes: 0, lightRes: 0.15,
              skills: ["burst"],
              image: "images/monster/magma_sprout.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "flame_warrior", name: "烈焰战士", hp: 550, atk: 0, elementType: "fireDmg", elementDmg: 50, def: 24, dodge: 12, hit: 26, fireRes: 0.50, coldRes: 0.5, lightRes: 0.15,
              skills: ["flameSlash"],
              image: "images/monster/flame_warrior.png" },
            { id: "magma_elemental", name: "岩浆元素", hp: 650, atk: 0, elementType: "fireDmg", elementDmg: 45, def: 30, dodge: 8, hit: 28, fireRes: 0.55, coldRes: 0, lightRes: 0.20,
              skills: ["lavaSpit", "moltenArmor"],
              image: "images/monster/magma_elemental.png" },
            { id: "cinder_phoenix", name: "烬火凤凰", hp: 480, atk: 0, elementType: "fireDmg", elementDmg: 60, def: 18, dodge: 20, hit: 24, fireRes: 0.60, coldRes: 0.10, lightRes: 0.25,
              skills: ["fireBall", "rebirth"],
              image: "images/monster/cinder_phoenix.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "inferno_knight", name: "地狱骑士", hp: 1000, atk: 72, elementType: "fireDmg", elementDmg: 80, def: 32, dodge: 16, hit: 34, fireRes: 0.65, coldRes: 0.10, lightRes: 0.25,
              skills: ["infernoCharge", "darkFlame", "shield"],
              image: "images/monster/inferno_knight.png" },
            { id: "lava_titan", name: "熔岩泰坦", hp: 1200, atk: 68, elementType: "fireDmg", elementDmg: 75, def: 40, dodge: 6, hit: 36, fireRes: 0.70, coldRes: 0, lightRes: 0.30,
              skills: ["groundSlam", "lavaEruption"],
              image: "images/monster/lava_titan.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "fire_lord", name: "炎魔领主", hp: 2800, atk: 110, elementType: "fireDmg", elementDmg: 130, def: 50, dodge: 14, hit: 44, fireRes: 0.75, coldRes: 0.15, lightRes: 0.35,
              skills: ["hellFire", "meteor", "flameStorm", "summonEmber"],
              image: "images/monster/fire_lord.png" }
        ]
    }
    },
    //第7区
    {
    zone: "虚空要塞",
    name: "白骨回廊",
    stage: 7,
    range: [61, 70],
    resistPenalty: 0.85,
    background: "../assets/images/backgrounds/zone-bg/void-fortress.jpg",
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "skeleton_soldier", name: "骷髅战士", hp: 350, atk: 36, def: 20, dodge: 8, hit: 20, fireRes: 0.10, coldRes: 0.20, lightRes: 0.05,
              skills: [],
              image: "images/monster/skeleton_soldier.png" },
            { id: "ghost_wisp", name: "幽魂之灵", hp: 280, atk: 0, elementType: "coldDmg", elementDmg: 44, def: 12, dodge: 28, hit: 22, fireRes: 0.05, coldRes: 0.30, lightRes: 0,
              skills: ["soulDrain"],
              image: "images/monster/ghost_wisp.png" },
            { id: "bone_crawler", name: "骨爬行者", hp: 400, atk: 32, def: 24, dodge: 14, hit: 18, fireRes: 0.15, coldRes: 0.25, lightRes: 0.05,
              skills: [],
              image: "images/monster/bone_crawler.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "skeleton_knight", name: "骷髅骑士", hp: 650, atk: 55, def: 28, dodge: 14, hit: 28, fireRes: 0.20, coldRes: 0.35, lightRes: 0.10,
              skills: ["charge"],
              image: "images/monster/skeleton_knight.png" },
            { id: "wraith_assassin", name: "怨灵刺客", hp: 500, atk: 0, elementType: "coldDmg", elementDmg: 65, def: 16, dodge: 24, hit: 26, fireRes: 0.05, coldRes: 0.40, lightRes: 0.05,
              skills: ["shadowSlash", "invisible"],
              image: "images/monster/wraith_assassin.png" },
            { id: "bone_priest", name: "白骨祭司", hp: 700, atk: 0, elementType: "fireDmg", elementDmg: 48, def: 24, dodge: 10, hit: 30, fireRes: 0.25, coldRes: 0.40, lightRes: 0.15,
              skills: ["boneArmor", "darkHeal"],
              image: "images/monster/bone_priest.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "skeleton_general", name: "骷髅将军", hp: 1200, atk: 78, elementType: "coldDmg", elementDmg: 90, def: 38, dodge: 18, hit: 36, fireRes: 0.30, coldRes: 0.50, lightRes: 0.15,
              skills: ["warCry", "whirlwind", "command"],
              image: "images/monster/skeleton_general.png" },
            { id: "lich_apprentice", name: "巫妖学徒", hp: 1000, atk: 85, elementType: "coldDmg", elementDmg: 95, def: 22, dodge: 22, hit: 34, fireRes: 0.15, coldRes: 0.55, lightRes: 0.10,
              skills: ["deathBolt", "frostNova"],
              image: "images/monster/lich_apprentice.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "lich_lord", name: "亡灵巫妖", hp: 3500, atk: 120, elementType: "coldDmg", elementDmg: 150, def: 55, dodge: 16, hit: 46, fireRes: 0.35, coldRes: 0.65, lightRes: 0.20,
              skills: ["deathWave", "summonSkeletons", "lifeLeech", "frostStorm"],
              image: "images/monster/lich_lord.png" }
        ]
    }
    },
    //第8区
    {
    zone: "虚空要塞",
    name: "混沌穹顶",
    stage: 8,
    range: [71, 80],
    resistPenalty: 1.05,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "void_slime", name: "虚空软泥", hp: 420, atk: 40, def: 24, dodge: 6, hit: 22, fireRes: 0.15, coldRes: 0.15, lightRes: 0.15,
              skills: [],
              image: "images/monster/void_slime.png" },
            { id: "shadow_bat", name: "暗影蝙蝠", hp: 320, atk: 0, elementType: "lightDmg", elementDmg: 48, def: 14, dodge: 30, hit: 24, fireRes: 0.10, coldRes: 0.10, lightRes: 0.05,
              skills: ["sonicBite"],
              image: "images/monster/shadow_bat.png" },
            { id: "chaos_imp", name: "混沌小鬼", hp: 380, atk: 0, elementType: "fireDmg", elementDmg: 44, def: 18, dodge: 18, hit: 20, fireRes: 0.20, coldRes: 0.20, lightRes: 0.10,
              skills: ["chaosBolt"],
              image: "images/monster/chaos_imp.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "void_hound", name: "虚空猎犬", hp: 750, atk: 60, def: 28, dodge: 18, hit: 30, fireRes: 0.20, coldRes: 0.20, lightRes: 0.20,
              skills: ["voidBite"],
              image: "images/monster/void_hound.png" },
            { id: "shadow_mage", name: "暗影法师", hp: 600, atk: 0, elementType: "coldDmg", elementDmg: 72, def: 20, dodge: 22, hit: 28, fireRes: 0.15, coldRes: 0.25, lightRes: 0.10,
              skills: ["darkBeam", "voidBlink"],
              image: "images/monster/shadow_mage.png" },
            { id: "chaos_warrior", name: "混沌战士", hp: 800, atk: 56, def: 32, dodge: 12, hit: 32, fireRes: 0.30, coldRes: 0.30, lightRes: 0.20,
              skills: ["chaosSlash"],
              image: "images/monster/chaos_warrior.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "void_lord", name: "虚空领主", hp: 1400, atk: 85, elementType: "lightDmg", elementDmg: 100, def: 40, dodge: 16, hit: 38, fireRes: 0.35, coldRes: 0.35, lightRes: 0.30,
              skills: ["voidPulse", "gravityWell", "darkShield"],
              image: "images/monster/void_lord.png" },
            { id: "chaos_beast", name: "混沌巨兽", hp: 1600, atk: 80, elementType: "fireDmg", elementDmg: 95, def: 45, dodge: 8, hit: 40, fireRes: 0.40, coldRes: 0.40, lightRes: 0.30,
              skills: ["chaosRoar", "rampage"],
              image: "images/monster/chaos_beast.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "void_hunter", name: "虚空猎手", hp: 4200, atk: 130, elementType: "coldDmg", elementDmg: 150, def: 60, dodge: 20, hit: 50, fireRes: 0.45, coldRes: 0.45, lightRes: 0.40,
              skills: ["voidStrike", "astralBarrage", "teleportStrike", "nullField"],
              image: "images/monster/void_hunter.png" }
        ]
    }
    },
    //第9区
    {
    zone: "虚空要塞",
    name: "归零之庭",
    stage: 9,
    range: [81, 90],
    resistPenalty: 1.25,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "void_sentry", name: "虚空哨兵", hp: 500, atk: 46, def: 28, dodge: 10, hit: 26, fireRes: 0.25, coldRes: 0.25, lightRes: 0.25,
              skills: [],
              image: "images/monster/void_sentry.png" },
            { id: "null_orb", name: "归零之球", hp: 380, atk: 0, elementType: "lightDmg", elementDmg: 52, def: 18, dodge: 22, hit: 28, fireRes: 0.30, coldRes: 0.20, lightRes: 0.20,
              skills: ["nullity"],
              image: "images/monster/null_orb.png" },
            { id: "void_scarab", name: "虚空圣甲虫", hp: 600, atk: 40, def: 32, dodge: 14, hit: 24, fireRes: 0.30, coldRes: 0.30, lightRes: 0.30,
              skills: [],
              image: "images/monster/void_scarab.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "void_knight", name: "虚空骑士", hp: 900, atk: 68, def: 34, dodge: 16, hit: 34, fireRes: 0.35, coldRes: 0.35, lightRes: 0.35,
              skills: ["voidLance"],
              image: "images/monster/void_knight.png" },
            { id: "null_weaver", name: "归零织者", hp: 700, atk: 0, elementType: "coldDmg", elementDmg: 80, def: 22, dodge: 26, hit: 32, fireRes: 0.40, coldRes: 0.30, lightRes: 0.30,
              skills: ["erase", "reconstruction"],
              image: "images/monster/null_weaver.png" },
            { id: "void_priest", name: "虚空祭司", hp: 850, atk: 0, elementType: "fireDmg", elementDmg: 62, def: 28, dodge: 14, hit: 36, fireRes: 0.40, coldRes: 0.40, lightRes: 0.35,
              skills: ["voidBlessing", "nullShield"],
              image: "images/monster/void_priest.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "void_archon", name: "虚空执政官", hp: 1800, atk: 95, elementType: "lightDmg", elementDmg: 100, def: 45, dodge: 20, hit: 42, fireRes: 0.50, coldRes: 0.50, lightRes: 0.45,
              skills: ["voidBlast", "singularity", "chronoShift"],
              image: "images/monster/void_archon.png" },
            { id: "null_titan", name: "归零泰坦", hp: 2000, atk: 90, elementType: "coldDmg", elementDmg: 100, def: 50, dodge: 8, hit: 44, fireRes: 0.55, coldRes: 0.45, lightRes: 0.50,
              skills: ["zeroImpact", "gravityCrush"],
              image: "images/monster/null_titan.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "fortress_guardian", name: "要塞守护者", hp: 5000, atk: 145, elementType: "coldDmg", elementDmg: 160, def: 68, dodge: 22, hit: 55, fireRes: 0.60, coldRes: 0.60, lightRes: 0.55,
              skills: ["absoluteZero", "voidStorm", "guardianShield", "realityRift"],
              image: "images/monster/fortress_guardian.png" }
        ]
    }
    },
    //第10区
    {
    zone: "星界深渊",
    name: "破碎星环",
    stage: 10,
    range: [91, 100],
    resistPenalty: 1.55,
    background: "../assets/images/backgrounds/zone-bg/star-abyss.jpg", 
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "star_slime", name: "星界软泥", hp: 600, atk: 52, def: 32, dodge: 10, hit: 30, fireRes: 0.30, coldRes: 0.30, lightRes: 0.40,
              skills: [],
              image: "images/monster/star_slime.png" },
            { id: "fallen_star", name: "坠星之灵", hp: 480, atk: 0, elementType: "lightDmg", elementDmg: 60, def: 20, dodge: 26, hit: 32, fireRes: 0.40, coldRes: 0.30, lightRes: 0.50,
              skills: ["starBolt"],
              image: "images/monster/fallen_star.png" },
            { id: "cosmic_crab", name: "星界巨蟹", hp: 720, atk: 48, def: 38, dodge: 8, hit: 28, fireRes: 0.35, coldRes: 0.35, lightRes: 0.35,
              skills: [],
              image: "images/monster/cosmic_crab.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "star_hunter", name: "星界猎手", hp: 1000, atk: 76, def: 36, dodge: 20, hit: 38, fireRes: 0.40, coldRes: 0.40, lightRes: 0.50,
              skills: ["starSlash"],
              image: "images/monster/star_hunter.png" },
            { id: "void_siren", name: "虚空海妖", hp: 800, atk: 0, elementType: "lightDmg", elementDmg: 88, def: 24, dodge: 28, hit: 36, fireRes: 0.35, coldRes: 0.45, lightRes: 0.45,
              skills: ["sirenSong", "voidPulse"],
              image: "images/monster/void_siren.png" },
            { id: "celestial_knight", name: "天界骑士", hp: 1100, atk: 70, def: 40, dodge: 14, hit: 40, fireRes: 0.45, coldRes: 0.45, lightRes: 0.55,
              skills: ["celestialStrike"],
              image: "images/monster/celestial_knight.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "star_devourer", name: "星辰吞噬者", hp: 2200, atk: 105, elementType: "lightDmg", elementDmg: 120, def: 48, dodge: 18, hit: 46, fireRes: 0.50, coldRes: 0.50, lightRes: 0.60,
              skills: ["devourStar", "cosmicFrenzy", "lightAbsorb"],
              image: "images/monster/star_devourer.png" },
            { id: "void_abomination", name: "虚空孽物", hp: 2500, atk: 100, elementType: "fireDmg", elementDmg: 130, def: 55, dodge: 10, hit: 48, fireRes: 0.55, coldRes: 0.45, lightRes: 0.55,
              skills: ["voidEruption", "chaosTendrils"],
              image: "images/monster/void_abomination.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "abyss_overlord", name: "深渊魔君", hp: 6000, atk: 160, elementType: "coldDmg", elementDmg: 180, def: 72, dodge: 24, hit: 58, fireRes: 0.60, coldRes: 0.60, lightRes: 0.65,
              skills: ["abyssGate", "starfall", "overlordWrath", "darknessAura"],
              image: "images/monster/abyss_overlord.png" }
        ]
    }
    },
    //11区
    {
    zone: "星界深渊",
    name: "虚空鲸落",
    stage: 11,
    range: [101, 110],
    resistPenalty: 1.85,
    monstersByQuality: {
        0: [ // 普通品质（3只），仅一种攻击属性
            { id: "void_jellyfish", name: "虚空水母", hp: 750, atk: 0, elementType: "lightDmg", elementDmg: 80, def: 36, dodge: 14, hit: 34, fireRes: 0.40, coldRes: 0.40, lightRes: 0.50,
              skills: [],
              image: "images/monster/void_jellyfish.png" },
            { id: "cosmic_remnant", name: "宇宙残渣", hp: 600, atk: 0, elementType: "fireDmg", elementDmg: 90, def: 24, dodge: 30, hit: 36, fireRes: 0.50, coldRes: 0.35, lightRes: 0.40,
              skills: ["flare"],
              image: "images/monster/cosmic_remnant.png" },
            { id: "stellar_mite", name: "星界螨虫", hp: 900, atk: 0, elementType: "coldDmg", elementDmg: 70, def: 42, dodge: 8, hit: 34, fireRes: 0.45, coldRes: 0.45, lightRes: 0.45,
              skills: [],
              image: "images/monster/stellar_mite.png" }
        ],
        1: [ // 优秀品质（3只），仅一种攻击属性
            { id: "void_ray", name: "虚空鳐", hp: 1200, atk: 0, elementType: "lightDmg", elementDmg: 120, def: 40, dodge: 22, hit: 42, fireRes: 0.50, coldRes: 0.45, lightRes: 0.55,
              skills: ["voidBeam"],
              image: "images/monster/void_ray.png" },
            { id: "cosmic_moth", name: "宇宙飞蛾", hp: 950, atk: 0, elementType: "coldDmg", elementDmg: 135, def: 28, dodge: 32, hit: 40, fireRes: 0.45, coldRes: 0.50, lightRes: 0.50,
              skills: ["dustScatter"],
              image: "images/monster/cosmic_moth.png" },
            { id: "star_siren", name: "星界塞壬", hp: 1100, atk: 0, elementType: "fireDmg", elementDmg: 130, def: 34, dodge: 18, hit: 44, fireRes: 0.55, coldRes: 0.40, lightRes: 0.50,
              skills: ["sirenSong", "flameWave"],
              image: "images/monster/star_siren.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "void_whale", name: "虚空巨鲸", hp: 3000, atk: 120, elementType: "coldDmg", elementDmg: 150, def: 55, dodge: 12, hit: 50, fireRes: 0.60, coldRes: 0.55, lightRes: 0.60,
              skills: ["whaleSong", "iceBreath", "tailSlam"],
              image: "images/monster/void_whale.png" },
            { id: "cosmic_devourer", name: "宇宙吞噬者", hp: 2800, atk: 130, elementType: "fireDmg", elementDmg: 160, def: 50, dodge: 20, hit: 48, fireRes: 0.55, coldRes: 0.60, lightRes: 0.65,
              skills: ["devour", "solarFlare", "gravityPull"],
              image: "images/monster/cosmic_devourer.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "space_eater", name: "星界吞噬者", hp: 7500, atk: 180, elementType: "lightDmg", elementDmg: 220, def: 80, dodge: 26, hit: 62, fireRes: 0.65, coldRes: 0.65, lightRes: 0.70,
              skills: ["cosmicDevourer", "galaxyCrush", "starShower", "voidTear"],
              image: "images/monster/space_eater.png" }
        ]
    }
    },
    //12区
    {
    zone: "星界深渊",
    name: "创世余烬",
    stage: 12,
    range: [111, 120],
    resistPenalty: 2.15,
    monstersByQuality: {
        0: [ // 普通品质（3只），每个只有一种攻击属性
            { id: "primordial_spark", name: "原初火花", hp: 800, atk: 0, elementType: "fireDmg", elementDmg: 75, def: 34, dodge: 14, hit: 36, fireRes: 0.50, coldRes: 0.50, lightRes: 0.60,
              skills: [],
              image: "images/monster/primordial_spark.png" },
            { id: "creation_fragment", name: "创世碎片", hp: 650, atk: 62, def: 22, dodge: 32, hit: 38, fireRes: 0.60, coldRes: 0.50, lightRes: 0.50,
              skills: [],
              image: "images/monster/creation_fragment.png" },
            { id: "void_crystal", name: "虚空水晶", hp: 950, atk: 0, elementType: "coldDmg", elementDmg: 70, def: 42, dodge: 8, hit: 34, fireRes: 0.55, coldRes: 0.65, lightRes: 0.55,
              skills: [],
              image: "images/monster/void_crystal.png" }
        ],
        1: [ // 优秀品质（3只），每个只有一种攻击属性
            { id: "ember_sentinel", name: "余烬哨兵", hp: 1400, atk: 110, def: 38, dodge: 20, hit: 44, fireRes: 0.65, coldRes: 0.55, lightRes: 0.60,
              skills: ["flameWall"],
              image: "images/monster/ember_sentinel.png" },
            { id: "stellar_warden", name: "星界守护者", hp: 1200, atk: 0, elementType: "lightDmg", elementDmg: 115, def: 26, dodge: 30, hit: 42, fireRes: 0.60, coldRes: 0.60, lightRes: 0.70,
              skills: ["lightningField"],
              image: "images/monster/stellar_warden.png" },
            { id: "frost_remnant", name: "霜冻残响", hp: 1600, atk: 0, elementType: "coldDmg", elementDmg: 100, def: 40, dodge: 16, hit: 46, fireRes: 0.55, coldRes: 0.70, lightRes: 0.55,
              skills: ["blizzard"],
              image: "images/monster/frost_remnant.png" }
        ],
        2: [ // 稀有品质（2只），同时拥有 atk + 元素伤害
            { id: "prime_archon", name: "原初执政官", hp: 3500, atk: 95, elementType: "lightDmg", elementDmg: 145, def: 55, dodge: 22, hit: 52, fireRes: 0.70, coldRes: 0.70, lightRes: 0.75,
              skills: ["divineJudgment", "holyShield"],
              image: "images/monster/prime_archon.png" },
            { id: "eternal_titan", name: "永恒泰坦", hp: 4000, atk: 90, elementType: "fireDmg", elementDmg: 150, def: 62, dodge: 12, hit: 54, fireRes: 0.75, coldRes: 0.75, lightRes: 0.70,
              skills: ["eternalFlame", "meteorStrike"],
              image: "images/monster/eternal_titan.png" }
        ],
        3: [ // 史诗品质（1只，终极BOSS），同时拥有 atk + 元素伤害
            { id: "astral_overlord", name: "星界主宰", hp: 10000, atk: 150, elementType: "coldDmg", elementDmg: 200, def: 85, dodge: 30, hit: 65, fireRes: 0.80, coldRes: 0.80, lightRes: 0.85,
              skills: ["bigBang", "cosmicFreeze", "absoluteZero", "creationRay"],
              image: "images/monster/astral_overlord.png" }
        ]
    }
    }
  // ...后续区域仿照此结构，根据关卡难度适当提升基础属性值
];

// 根据关卡获取难度下标 0简单 1困难 2噩梦 3地狱
window.getDiffIndex = function(level){
    if(level>=1&&level<=30) return 0;
    if(level>=31&&level<=60) return 1;
    if(level>=61&&level<=90) return 2;
    return 3;
}

// 根据难度索引获取 zone 名称
window.getZoneNameByDiff = function(diffIdx) {
    const stageIndex = diffIdx * 3;
    if (window.MONSTER_REGION_CONFIG[stageIndex]) {
        return window.MONSTER_REGION_CONFIG[stageIndex].zone;
    }
    return "未知区域";
}

// 根据ilvl获取最高T阶
window.getMaxTierByIlvl = function(ilvl) {
    return Math.ceil(ilvl / 10);
}

// ===== 关卡选择数据计算函数（battleEngine.js 和 battle.js 共用） =====
// 根据 currentStage 计算解锁数据（难度索引 0-3，区域索引 0-2，区域内关卡 1-10）
window.calcUnlockData = function(stage) {
    const diffIdx = getDiffIndex(stage);
    const diffStart = diffIdx * 30 + 1;
    const relativePos = stage - diffStart;
    const zoneIdx = Math.floor(relativePos / 10);
    const stageInZone = (relativePos % 10) + 1;
    return { diffIdx, zoneIdx, stageInZone };
};

// 获取某关卡对应波次的品质索引
window.getMonsterTypeByWave = function(stage, wave) {
    const config = window.WAVE_TYPE_CONFIG.find(c => stage >= c.range[0] && stage <= c.range[1]);
    if (config && config.waves.length >= wave) {
        return config.waves[wave - 1];
    }
    // fallback：普通品质
    return 0;
};