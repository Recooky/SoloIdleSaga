

const SAVE_KEY = "solo_idle_saga_save";
const MAX_OFFLINE_HOUR = 8; // 离线最长8小时收益

// 初始化默认存档数据
function getDefaultSaveData() {
    return {
        // 直接引用全局基础属性常量，消除重复 + 补全遗漏字段
        baseAttr: { ...window.BASE_ATTR },
        // 当前进度
        currentStage: 1, // 当前关卡1-120
        currentWave: 1, // 当前关卡波次1-5
        // 穿戴装备
        equipWear: {
            weapon: null,
            helmet: null,
            armor: null,
            boot: null,
            pants: null,
            glove: null,
            ring: null,
            necklace: null
        },
                // 背包装备数组
        gold: 0,
        bag: [],
        // 昵称（默认取邮箱@前面部分）
        nickname: "",
        // 关卡解锁数据：记录已解锁的最高难度、区域、关卡
                unlockData: {
            maxDifficulty: 0,
            maxZone: 0,
            maxStage: 0
        },
        // 上次离线时间戳
        lastOfflineTime: Date.now(),
                // 战斗运行状态
        isBattleRunning: false,
        // 循环刷怪模式（开启后通关不跳关，在当前关卡重复挑战）
        isLoopFarming: false,
        gameSpeed: 1,
        otherItems: {}
    };
}
       

// 初始化本地存档
window.initLocalSave = function(){
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
 window.getSaveData = function(){
    const saveStr = localStorage.getItem(SAVE_KEY);
    return JSON.parse(saveStr);
}

// 保存存档
window.setSaveData = function(data) {
    setLocalSaveData(data);
    // 异步触发云端同步（如果用户已登录且 syncAll 函数存在）
    if (typeof window.requestCloudSync === 'function') {
        setTimeout(() => window.requestCloudSync(), 0);
    }
};
// 新增：纯本地 get/set（不触发云同步）
window.getLocalSaveData = function() {
    const saveStr = localStorage.getItem(SAVE_KEY);
    if (!saveStr) return getDefaultSaveData();
    try {
        return JSON.parse(saveStr);
    } catch (e) {
        return getDefaultSaveData();
    }
};

window.setLocalSaveData = function(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
};
// 更新离线时间（退出页面时触发）
window.updateOfflineTime = function(){
    const save = getSaveData();
    save.lastOfflineTime = Date.now();
    setSaveData(save);
}


// 领取离线收益，生成装备存入背包
window.claimOfflineReward = function(){
    const save = getSaveData();
    const now = Date.now();
    const offlineMs = now - save.lastOfflineTime;
    const maxOfflineMs = MAX_OFFLINE_HOUR * 3600 * 1000;
    const validMs = Math.min(offlineMs, maxOfflineMs);
    const hour = parseFloat((validMs / 3600000).toFixed(2));

    // 每小时随机1~3件装备
    const equipCount = Math.floor(hour * (10 + Math.random() * 2));
    const rewardEquips = [];
    for (let i = 0; i < equipCount; i++) {
        const equip = monsterDropEquip(save.currentStage, "normalMonster");
        if (equip) rewardEquips.push(structuredClone(equip));
    }

    rewardEquips.forEach(equip => {
        const sellPrice = window.processAutoSell(equip, save);
        if (sellPrice === null) {
            save.bag.push(equip);
        }
        // 自动出售的已经通过 processAutoSell 加了金币，不入背包
    });
    save.lastOfflineTime = Date.now();
    setSaveData(save);

    return {
        hour,
        equipList: rewardEquips
    };
}

// 页面关闭前记录离线时间
window.addEventListener('beforeunload', () => {
    // 如果战斗正在运行，先停止战斗定时器
    const save = getSaveData();
    if (save.isBattleRunning) {
        stopBattleLoop();
    }
    save.currentWave = 1;
    updateOfflineTime();
})