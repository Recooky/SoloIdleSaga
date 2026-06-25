// 本地模拟云端存储，实际项目替换为后端接口请求
const CLOUD_ACCOUNT_KEY = "game_cloud_account";
const CLOUD_SAVE_KEY = "game_cloud_backup";
const MAX_SLOT = 3;

// 账号数据结构
function getDefaultCloudData() {
    return {
        account: "",
        password: "",
        slots: [null, null, null] // 3个存档位
    }
}

// 获取本地缓存的云端账号信息
export function getLocalCloudAccount() {
    const str = localStorage.getItem(CLOUD_ACCOUNT_KEY);
    if (!str) return null;
    return JSON.parse(str);
}

// 注册/登录账号
export function loginAccount(account, password) {
    let cloudData = getLocalCloudAccount() || getDefaultCloudData();
    // 已有账号校验密码
    if (cloudData.account) {
        if (cloudData.account !== account || cloudData.password !== password) {
            return { success: false, msg: "账号或密码错误" };
        }
    } else {
        // 新账号注册
        cloudData.account = account;
        cloudData.password = password;
    }
    localStorage.setItem(CLOUD_ACCOUNT_KEY, JSON.stringify(cloudData));
    return { success: true, msg: "登录成功", data: cloudData };
}

// 获取云端3个存档位
export function getCloudSlots() {
    const cloud = getLocalCloudAccount();
    if (!cloud) return { success: false, msg: "请先登录账号" };
    return { success: true, slots: cloud.slots };
}

// 上传存档到指定存档位
export function uploadSaveToSlot(slotIndex, localSaveData) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOT) {
        return { success: false, msg: "存档位超出范围" };
    }
    const cloud = getLocalCloudAccount();
    if (!cloud) return { success: false, msg: "请先登录账号" };
    cloud.slots[slotIndex] = {
        save: localSaveData,
        time: Date.now()
    };
    localStorage.setItem(CLOUD_ACCOUNT_KEY, JSON.stringify(cloud));
    return { success: true, msg: `已保存至第${slotIndex + 1}存档位` };
}

// 从云端存档位下载存档并覆盖本地
export function downloadSaveFromSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOT) {
        return { success: false, msg: "存档位超出范围" };
    }
    const cloud = getLocalCloudAccount();
    if (!cloud) return { success: false, msg: "请先登录账号" };
    const slotData = cloud.slots[slotIndex];
    if (!slotData) return { success: false, msg: "该存档位暂无存档" };

    // 覆盖本地存档
    localStorage.setItem("solo_idle_saga_save", JSON.stringify(slotData.save));
    return { success: true, msg: "存档下载成功，刷新页面生效" };
}

// 退出登录
export function logoutAccount() {
    localStorage.removeItem(CLOUD_ACCOUNT_KEY);
    return { success: true, msg: "已退出登录" };
}