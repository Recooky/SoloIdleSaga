// 全局版本号（用于自动更新校验）
window.GAME_VERSION = "1.0.0";

// 页面加载初始化：版本校验 + 本地存档初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 引入版本更新模块
    const { checkVersionUpdate } = await import('./core/versionUpdate.js');
    // 检测版本更新
    checkVersionUpdate();

    // 初始化本地存档
    const { initLocalSave } = await import('./core/saveManager.js');
    initLocalSave();
});

// 全局工具：稀有度转颜色class
window.getRarityClass = function(rarity) {
    const map = {
        "普通": "rarity-normal",
        "优秀": "rarity-fine",
        "稀有": "rarity-rare",
        "史诗": "rarity-epic",
        "传说": "rarity-legend",
        "神话": "rarity-myth",
        "宇宙": "rarity-cosmic"
    }
    return map[rarity] || "rarity-normal";
}