// 全局版本号（用于自动更新校验）
window.GAME_VERSION = "1.0.0";



// 页面加载初始化：版本校验 + 本地存档初始化
document.addEventListener('DOMContentLoaded', () => {
    // 直接调用全局函数，不再动态import
    checkVersionUpdate();
    initLocalSave();
    checkLogin();
});

