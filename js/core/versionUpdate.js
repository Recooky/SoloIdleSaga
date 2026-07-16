const REMOTE_VERSION_URL = "./version.json";
const LOCAL_VERSION_KEY = "game_local_version";

function showUpdateModal(version, changelogText) {
    document.getElementById('updateVersionNum').textContent = version;
    const contentEl = document.getElementById('updateChangelogContent');
    // 如果 changelog 不存在或为空，显示默认文案
    contentEl.textContent = changelogText || '暂无更新说明，请查看官方网站。';

    const modal = document.getElementById('updateModal');
    if (modal) modal.style.display = 'flex';
}

window.checkVersionUpdate = async function () {
    try {
        const localVersion = localStorage.getItem(LOCAL_VERSION_KEY) || "0.0.0";
        const res = await fetch(REMOTE_VERSION_URL, { cache: "no-cache" });
        if (!res.ok) throw new Error("未获取远程版本");

        const remoteConfig = await res.json();
        const remoteVersion = remoteConfig.version;
        const changelogArr = remoteConfig.changelog || [];
        const changelogText = changelogArr.join('\n');

        if (remoteVersion !== localVersion) {
            showUpdateModal(remoteVersion, changelogText);

            // 防重复绑定按钮事件（使用一次性的 setTimeout 或替换节点）
            const confirmBtn = document.getElementById('updateConfirmBtn');
            const cancelBtn = document.getElementById('updateCancelBtn');
            
            // 移除已有监听（替换节点）
            const newConfirm = confirmBtn.cloneNode(true);
            const newCancel = cancelBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
            cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

            newConfirm.addEventListener('click', () => {
                localStorage.setItem(LOCAL_VERSION_KEY, remoteVersion);
                location.reload();
            });
            newCancel.addEventListener('click', () => {
                document.getElementById('updateModal').style.display = 'none';
            });
        }
    } catch (err) {
        localStorage.setItem(LOCAL_VERSION_KEY, window.GAME_VERSION);
        console.log("本地调试模式，跳过版本更新检测", err.message);
    }
};