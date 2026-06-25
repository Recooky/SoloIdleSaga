import { monsterDropEquip } from "./equipGenerator.js";

const SAVE_KEY = "solo_idle_saga_save";
const MAX_OFFLINE_HOUR = 8; // 离线最长8小时收益

// 初始化默认存档数据
function getDefaultSaveData() {
    return {
        // 角色基础属性
        baseAttr: {
            hp: 100,
            atk: 10,
            def: 0,
            attackSpeed: 1.0,
            critRate: 0.05,
            critDamage: 1.5
        },
        // 当前进度
        currentStage: 1, // 当前关卡1-120
        currentWave: 1, // 当前关卡波次1-5
        // 穿戴装备
        equipWear: {
            weapon: null,
            helmet: null,
            armor: null,
            boot: null,
            ring: null,
            necklace: null
        },
        // 背包装备数组
        bag: [],
        // 上次离线时间戳
        lastOfflineTime: Date.now(),
        // 战斗运行状态
        isBattleRunning: false
    }
}

// 初始化本地存档
export function initLocalSave() {
    let save = localStorage.getItem(SAVE_KEY);
    // 没有存档 或者 存档JSON损坏，都重置为默认存档
    if (!save) {
        const defaultData = getDefaultSaveData();
        localStorage.setItem(SAVE_KEY, JSON.stringify(defaultData));
    } else {
        try {
            JSON.parse(save);
        } catch (e) {
            // JSON解析失败，存档损坏，重置存档
            localStorage.removeItem(SAVE_KEY);
            const defaultData = getDefaultSaveData();
            localStorage.setItem(SAVE_KEY, JSON.stringify(defaultData));
        }
    }
}

// 获取存档
export function getSaveData() {
    const saveStr = localStorage.getItem(SAVE_KEY);
    return JSON.parse(saveStr);
}

// 保存存档
export function setSaveData(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// 更新离线时间（退出页面时触发）
export function updateOfflineTime() {
    const save = getSaveData();
    save.lastOfflineTime = Date.now();
    setSaveData(save);
}

// 计算离线收益：最长8小时
export function calcOfflineReward() {
    const save = getSaveData();
    const now = Date.now();
    const offlineMs = now - save.lastOfflineTime;
    const maxOfflineMs = MAX_OFFLINE_HOUR * 3600 * 1000;
    const validOfflineMs = Math.min(offlineMs, maxOfflineMs);
    // 每小时挂机掉落装备数量：当前关卡越高掉落越多
    const offlineHour = validOfflineMs / (3600 * 1000);
    return {
        offlineHour: offlineHour,
        currentIlvl: save.currentStage
    }
}

// 领取离线收益，生成装备存入背包
export function claimOfflineReward() {
    const save = getSaveData();
    const now = Date.now();
    const offlineMs = now - save.lastOfflineTime;
    const maxOfflineMs = MAX_OFFLINE_HOUR * 3600 * 1000;
    const validMs = Math.min(offlineMs, maxOfflineMs);
    const hour = parseFloat((validMs / 3600000).toFixed(2));

    // 每小时随机1~3件装备
    const equipCount = Math.floor(hour * (1 + Math.random() * 2));
    const rewardEquips = [];
    for (let i = 0; i < equipCount; i++) {
        const equip = monsterDropEquip(save.currentStage, "normalMonster");
        if (equip) rewardEquips.push(structuredClone(equip));
    }

    save.bag.push(...rewardEquips);
    save.lastOfflineTime = Date.now();
    setSaveData(save);

    return {
        hour,
        equipList: rewardEquips
    };
}

// 页面关闭前记录离线时间
window.addEventListener('beforeunload', () => {
    updateOfflineTime();
})