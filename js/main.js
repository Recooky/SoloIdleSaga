// 全局版本号（用于自动更新校验）
window.GAME_VERSION = "0.0.6";



// 页面加载初始化：版本校验 + 本地存档初始化
document.addEventListener('DOMContentLoaded', async () => {
    await checkVersionUpdate();  // ✅ 串行等待
    initLocalSave();
    checkLogin();
});

