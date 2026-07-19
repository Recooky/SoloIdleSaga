
// ===== 模板加载系统：从 pages/ 加载面板 HTML =====
const PANEL_NAMES = ['town', 'character', 'battle', 'skill', 'challenge', 'forge'];

async function loadPanelTemplate(name) {
    const container = document.querySelector(`[data-template="${name}"]`);
    if (!container) return;
    try {
        const response = await fetch(`pages/${name}.html`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        console.warn(`面板 "${name}" 加载失败，使用默认占位:`, err.message);
        container.innerHTML = `<h2 style="color:#4a2c11;font-size:22px;">${name}</h2><p style="color:#94a3b8;text-align:center;padding:40px 0;">加载中...</p>`;
    }
}

async function loadAllTemplates() {
    await Promise.all(PANEL_NAMES.map(loadPanelTemplate));
}

let currentTab = "battle";
// 批量销毁用户筛选记忆
let batchFilterCache = JSON.parse(localStorage.getItem("batch_destroy_filter")) || {
    minIlvl: 1,
    maxIlvl: 10,
    qualityList: []
};

// 实现getRarityClass函数
window.getRarityClass = function(rarityName) {
    const quality = window.RARITY_CONFIG.find(item => item.name  === rarityName);
    return quality ? quality.className : "rarity-normal";
};

// 全局局部刷新面板（调用各模块中的渲染函数）
window.refreshCharacterPanel = function () {
    if (typeof renderAttrPanel === 'function') renderAttrPanel();
    if (typeof renderEquipSlots === 'function') renderEquipSlots();
    if (typeof renderBagList === 'function') renderBagList();
    if (typeof renderBattleLog === 'function') renderBattleLog();
    if (typeof renderDropLog === 'function') renderDropLog();
    if (typeof renderBattleHpUI === 'function') renderBattleHpUI();
    if (typeof updateTownGoldDisplay === 'function') updateTownGoldDisplay();
};

// 等待DOM全部加载完成 + 面板模板加载完成再执行事件绑定
document.addEventListener('DOMContentLoaded', async function () {
    // ★ 新增：强制8秒后关闭loading（兜底）
    const loadingTimeout = setTimeout(() => {
        const loadingMask = document.getElementById('loadingMask');
        const mainWrap = document.getElementById('mainWrap');
        if (loadingMask) loadingMask.style.display = 'none';
        if (mainWrap) mainWrap.style.display = 'block';
        console.warn('⚠️ 加载超时兜底触发，可能部分资源未加载');
    }, 8000);
    // 先加载所有面板模板
    await loadAllTemplates();

    // 1. 编辑弹窗按钮绑定
    const editBtn = document.getElementById('editProfileBtn');
    const editModal = document.getElementById('accountEditModal');
    const closeEditBtn = document.getElementById('closeEditModal');
    const saveNicknameBtn = document.getElementById('saveNicknameBtn');
    const resetSaveBtn = document.getElementById('resetSaveBtn');
    const logoutEditBtn = document.getElementById('logoutFromEditBtn');

    document.querySelectorAll('#editProfileBtn').forEach(btn => {
        btn.addEventListener('click', function () {
            const save = getSaveData();
            const nickInput = document.getElementById('editNickname');
            const emailDisplay = document.getElementById('editEmailDisplay');
            const saveTimeDisplay = document.getElementById('editLastSaveTime');
            if (nickInput) nickInput.value = save.nickname || '';
            if (emailDisplay) emailDisplay.innerText = currentUser ? currentUser.email : '未登录';
            initCloudSaveTime();
            editModal.style.display = 'flex';
        });
    });

    if (closeEditBtn && editModal) {
        closeEditBtn.addEventListener('click', function () {
            editModal.style.display = 'none';
        });
        editModal.addEventListener('click', function (e) {
            if (e.target === editModal) editModal.style.display = 'none';
        });
    }

    if (saveNicknameBtn) {
        saveNicknameBtn.addEventListener('click', function () {
            const nickInput = document.getElementById('editNickname');
            if (!nickInput) return;
            const newNick = nickInput.value.trim();
            if (newNick.length > 16) {
                alert('昵称不能超过16个字符');
                return;
            }
            const save = getSaveData();
            save.nickname = newNick;
            setSaveData(save);
            updateAccountDisplay();
            if (editModal) editModal.style.display = 'none';
        });
    }

    if (resetSaveBtn) {
        resetSaveBtn.addEventListener('click', async function () {
            if (!confirm('确定要重置存档吗？云端与本地数据全部清空，操作不可恢复！')) return;
            const loginOk = await checkLogin();
            if (!loginOk) return;
            if (!supabaseClient) {
            alert('云服务不可用，无法重置云端存档');
            return;
            }
            const { error } = await supabaseClient
                .from('game_save')
                .delete()
                .eq('user_id', currentUser.id);
            if (error) {
                alert('重置云端存档失败：' + error.message);
                return;
            }
            const defaultSave = getDefaultSaveData();
            setSaveData(defaultSave);
            document.getElementById('editLastSaveTime').innerText = '无';
            if (editModal) editModal.style.display = 'none';
            alert('存档重置完成，页面即将刷新');
            location.reload();
        });
    }

    // ★ 新增：上传存档按钮
    const uploadSaveBtn = document.getElementById('uploadSaveBtn');
    if (uploadSaveBtn) {
        uploadSaveBtn.addEventListener('click', async function () {
            if (typeof window.manualUploadSave === 'function') {
                await window.manualUploadSave();
            } else {
                showToast('☁️ 上传功能未就绪', 2000);
            }
        });
    }

    if (logoutEditBtn) {
    logoutEditBtn.addEventListener('click', async function () {
        if (!confirm('确定要退出当前登录账号吗？')) return;
        if (autoSyncTimer) clearInterval(autoSyncTimer);
        const save = getSaveData();
        if(save.isBattleRunning && typeof stopBattleLoop === 'function'){
            stopBattleLoop();
        }
        updateOfflineTime();
        // ★ 新增：仅当 supabaseClient 存在时才调用登出
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        currentUser = null;
        location.reload();
    });
}

    // 2. 页面初始化：加载云端存档时间 + 自动拉取登录用户存档
    const pageInitPromise = (async function initPage() {
        await initCloudSaveTime();
    })();

    // 然后在调用 initBattleModule 前等待它完成
    pageInitPromise.catch(err => console.warn('云存档初始化异步失败:', err));

    // 3. 底部导航模块切换绑定
    const navModules = document.querySelectorAll('.nav-module');
    const tabPanels = document.querySelectorAll('.tab-panel');
    navModules.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetModule = this.dataset.module;
            currentTab = targetModule;
            navModules.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tabPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`tab-${targetModule}`).classList.add('active');
            // ★ 切换至城镇时更新金币显示
            if (targetModule === 'town' && typeof updateTownGoldDisplay === 'function') {
                updateTownGoldDisplay();
            }
            // ★ 切换模块时更新全局背景
            if (typeof updateGameBackground === 'function') {
                updateGameBackground();
            }
            // ★ 统一刷新面板内容（角色属性、装备、背包、日志、战斗血条等）
            if (typeof refreshCharacterPanel === 'function') {
                refreshCharacterPanel();
            }
        });
    });

    // 4. 初始化各业务模块
    if (typeof initCharacterModule === 'function') initCharacterModule();
    if (typeof initBattleModule === 'function') initBattleModule();
    if (typeof initTownModule === 'function') initTownModule();
    if (typeof initForgeModule === 'function') initForgeModule();
    if (typeof initSkillModule === 'function') initSkillModule();
    if (typeof initChallengeModule === 'function') initChallengeModule();

    function adjustContainerSize() {
        const mainWrap = document.getElementById('mainWrap');
        if (!mainWrap) return;
        const ww = window.innerWidth;
        if (ww < 640) {
            // 窄屏：让 CSS 的 height:100vh 生效，移除内联样式
            mainWrap.style.height = '';
        }
        // 宽屏：CSS 已经用媒体查询设置了 720px，不需要 JS 干预
    }

    // 绑定 resize 事件
    window.addEventListener('resize', adjustContainerSize);

    // 5. 强制最少展示1000ms loading
    const loadingMask = document.getElementById('loadingMask');
    const mainWrap = document.getElementById('mainWrap');
    setTimeout(() => {
        clearTimeout(loadingTimeout);  // ★ 新增
        if (loadingMask) loadingMask.style.display = 'none';
        if (mainWrap) mainWrap.style.display = 'block';
        adjustContainerSize();
        if (typeof updateGameBackground === 'function') {
            updateGameBackground();
        }
    }, 1000);
});

// ========== 全局背景切换函数 ==========
function updateGameBackground() {
    const bgEl = document.getElementById('gameBackground');
    if (!bgEl) return;

    const currentModule = getCurrentActiveModule(); // 需要实现：获取当前激活的模块名
    const playerLevel = getPlayerLevel();           // 需要实现：从存档获取当前关卡数
    
    let bgImageUrl = './assets/images/backgrounds/default-bg.jpg'; // 默认背景

    switch (currentModule) {
        case 'town':
            bgImageUrl = './assets/images/backgrounds/character-bg.jpg';  //城镇模块背景
            break;
        case 'character':
            bgImageUrl = './assets/images/backgrounds/character-bg.jpg'; //角色模块背景
            break;
        case 'battle':
            if (playerLevel >= 1 && playerLevel <= 30) {
                bgImageUrl = './assets/images/backgrounds/battle-bg.jpg';  // 战斗1~3关背景
            } else if (playerLevel >= 31 && playerLevel <= 60) {
                bgImageUrl = './assets/images/backgrounds/battle-bg.jpg';
            } else {
                bgImageUrl = './assets/images/backgrounds/battle-bg.jpg'; // 默认战斗背景
            }
            break;
        case 'skill':
            bgImageUrl = './assets/images/backgrounds/character-bg.jpg';  //技能模块背景
            break;
        case 'challenge':
            bgImageUrl = './assets/images/backgrounds/character-bg.jpg';  //挑战模块背景
            break;
        case 'forge':
            bgImageUrl = './assets/images/backgrounds/character-bg.jpg'; //锻造模块背景
            break;
        default:
            bgImageUrl = './assets/images/backgrounds/character-bg.jpg'; //默认背景
    }
    
    // 如果浏览器支持，使用 CSS custom property 或 direct style（更推荐）
    bgEl.style.backgroundImage = `url('${bgImageUrl}')`;
}

// 辅助函数：获取当前激活模块
function getCurrentActiveModule() {
    const activePanel = document.querySelector('.tab-panel.active');
    if (!activePanel) return 'battle'; // 默认
    return activePanel.id.replace('tab-', '');
}

// 辅助函数：获取玩家当前关卡
function getPlayerLevel() {
    // 根据你的存档结构获取，例如：
    try {
        const saveData = JSON.parse(localStorage.getItem('gameSaveData') || '{}');
        return saveData.currentStage || 1;
    } catch(e) {
        return 1;
    }
}