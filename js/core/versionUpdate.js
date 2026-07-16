
// 线上版本配置地址，部署后在项目根目录创建version.json
const REMOTE_VERSION_URL = "./version.json";
// 本地存储已加载版本
const LOCAL_VERSION_KEY = "game_local_version";

// 把导出函数挂载到全局window，删除export关键字
window.checkVersionUpdate = async function () {
    try {
        // 读取本地记录的版本
        const localRecordVersion = localStorage.getItem(LOCAL_VERSION_KEY) || "0.0.0";
        const res = await fetch(REMOTE_VERSION_URL, { cache: "no-cache" });
        if (!res.ok) throw new Error("未获取远程版本");

        const remoteConfig = await res.json();
        const remoteVersion = remoteConfig.version;

        // 版本不一致，强制刷新页面更新
        if (remoteVersion !== localRecordVersion) {
            if (confirm(`检测到游戏新版本 V${remoteVersion}，点击确定自动刷新更新游戏`)) {
                localStorage.setItem(LOCAL_VERSION_KEY, remoteVersion);
                location.reload();
            }
        }
    } catch (err) {
        // 本地打开无服务器环境，跳过远程版本检测
        localStorage.setItem(LOCAL_VERSION_KEY, window.GAME_VERSION);
        console.log("本地调试模式，跳过版本更新检测", err.message);
    }
};