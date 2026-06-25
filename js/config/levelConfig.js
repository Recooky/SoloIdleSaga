// 怪物属性成长公式
export const MONSTER_GROW = {
    hpBase: 50,
    hpRate: 1.032,
    atkBase:5,
    atkRate:1.03,
    defBase:2,
    defRate:1.028
};

// 5波怪物倍率配置
export const WAVE_MULTI = [
    {hp:1.0,atk:1.0,def:1.0,asp:0.8},
    {hp:2.0,atk:1.4,def:1.8,asp:0.8},
    {hp:4.0,atk:1.8,def:2.5,asp:0.9},
    {hp:8.0,atk:2.1,def:3.0,asp:0.9},
    {hp:15.0,atk:2.5,def:4.0,asp:1.0}
];

// 12个怪物阶段配置
export const MONSTER_STAGE = [
    {
        zone:"幽暗森林",stage:1,range:[1,10],
        normal:"哥布林斥候",elite:"哥布林猎手",boss:"哥布林首领"
    },
    {
        zone:"幽暗森林",stage:2,range:[11,20],
        normal:"荒野野狼",elite:"巨型毒蛛",boss:"荒野狼王"
    },
    {
        zone:"幽暗森林",stage:3,range:[21,30],
        normal:"腐化树妖",elite:"腐化守卫",boss:"腐化德鲁伊"
    },
    {
        zone:"熔岩洞窟",stage:4,range:[31,40],
        normal:"熔岩蜥蜴",elite:"熔岩巨蜥",boss:"熔岩蜥蜴王"
    },
    {
        zone:"熔岩洞窟",stage:5,range:[41,50],
        normal:"兽人步兵",elite:"兽人百夫长",boss:"兽人督军"
    },
    {
        zone:"熔岩洞窟",stage:6,range:[51,60],
        normal:"火焰元素",elite:"炽焰元素",boss:"炎魔领主"
    },
    {
        zone:"虚空要塞",stage:7,range:[61,70],
        normal:"骷髅战士",elite:"骷髅将军",boss:"亡灵巫妖"
    },
    {
        zone:"虚空要塞",stage:8,range:[71,80],
        normal:"暗影刺客",elite:"暗影领主",boss:"虚空猎手"
    },
    {
        zone:"虚空要塞",stage:9,range:[81,90],
        normal:"虚空守卫",elite:"虚空执政官",boss:"要塞守护者"
    },
    {
        zone:"星界深渊",stage:10,range:[91,100],
        normal:"深渊恶魔",elite:"炎狱恶魔",boss:"深渊魔君"
    },
    {
        zone:"星界深渊",stage:11,range:[101,110],
        normal:"星界畸变体",elite:"畸变领主",boss:"星界吞噬者"
    },
    {
        zone:"星界深渊",stage:12,range:[111,120],
        normal:"创世卫士",elite:"创世执政官",boss:"星界主宰"
    }
];

// 根据当前关卡获取所属阶段
export function getStageByLevel(level) {
    return MONSTER_STAGE.find(s=>level >= s.range[0] && level <= s.range[1]);
}

// 根据关卡获取难度下标 0普通 1困难 2噩梦 3地狱
export function getDiffIndex(level) {
    if(level>=1&&level<=30) return 0;
    if(level>=31&&level<=60) return 1;
    if(level>=61&&level<=90) return 2;
    return 3;
}

// 根据ilvl获取最高T阶
export function getMaxTierByIlvl(ilvl) {
    return Math.ceil(ilvl / 10);
}

// ilvl转装备等级1~12
export function getEquipLvByIlvl(ilvl) {
    return Math.ceil(ilvl / 10);
}