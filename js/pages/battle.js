// ===== 战斗模块 - 关卡选择、战斗日志、血条 =====
// 已渲染的战斗日志数量（用于增量追加）
let _renderedBattleLogCount = 0;
let _renderedDropLogCount = 0;
let _selectedDiff = -1;

// 清空所有日志（切换关卡/进入页面时调用）
function clearBattleLog() {
    // 战斗日志
    battleLogList.length = 0;
    _renderedBattleLogCount = 0;
    const battleLog = document.getElementById('battleLog');
    const battleLogModal = document.getElementById('battleLogModal');
    if (battleLog) battleLog.innerHTML = '';
    if (battleLogModal) battleLogModal.innerHTML = '';

    // 掉落日志
    dropLogList.length = 0;
    _renderedDropLogCount = 0;
    const dropLog = document.getElementById('dropLog');
    const dropLogModal = document.getElementById('dropLogModal');
    if (dropLog) dropLog.innerHTML = '';
    if (dropLogModal) dropLogModal.innerHTML = '';
}
//更新当前大地图名称
function updateCurrentMapName() {
    const mapNameEl = document.getElementById('currentMapName');
    if (!mapNameEl) return;
    
    const save = getSaveData();
    const currentStage = save.currentStage;

    let currentDiff;
    if (_selectedDiff >= 0 && _selectedDiff < 4) {
        currentDiff = _selectedDiff;
    } else {
        currentDiff = getDiffIndex(currentStage);
    }
    
    // 获取当前活动的区域索引
    const zoneTabs = document.querySelectorAll('.stage-zone-tab');
    let activeZoneIdx = 0;
    zoneTabs.forEach((tab, idx) => {
        if (tab.classList.contains('active')) {
            activeZoneIdx = idx;
        }
    });
    
    const stageIdx = currentDiff * 3 + activeZoneIdx;
    let mapName = '未知区域';
    if (window.MONSTER_REGION_CONFIG && window.MONSTER_REGION_CONFIG[stageIdx]) {
        mapName = window.MONSTER_REGION_CONFIG[stageIdx].zone;
    }
    mapNameEl.textContent = `当前地图：${mapName}`;
}
// 渲染战斗日志（新增日志颜色分类）
function renderBattleLog() {
    const logWrap = document.getElementById('battleLog');
    const logWrapModal = document.getElementById('battleLogModal');
    if (!logWrapModal) return;
    // 安全保护
    if (_renderedBattleLogCount > battleLogList.length) {
        _renderedBattleLogCount = 0;
    }
    // 首次渲染：全量，正序
    if (_renderedBattleLogCount === 0) {
        const html = buildBattleLogHtml(battleLogList);
        if (logWrap) logWrap.innerHTML = html;
        logWrapModal.innerHTML = html;
        _renderedBattleLogCount = battleLogList.length;
        // 滚动到底部
        logWrapModal.scrollTop = logWrapModal.scrollHeight;
        if (logWrap) logWrap.scrollTop = logWrap.scrollHeight;
        return;
    }

    // 增量追加
    const newItems = battleLogList.slice(_renderedBattleLogCount);
    if (newItems.length === 0) return;

    const newHtml = buildBattleLogHtml(newItems);

    // 弹窗
    const wasAtBottomModal =
        logWrapModal.scrollTop + logWrapModal.clientHeight >= logWrapModal.scrollHeight - 10;
    logWrapModal.insertAdjacentHTML('beforeend', newHtml);
    if (wasAtBottomModal) logWrapModal.scrollTop = logWrapModal.scrollHeight;

    // 侧边
    if (logWrap) {
        const wasAtBottom =
            logWrap.scrollTop + logWrap.clientHeight >= logWrap.scrollHeight - 10;
        logWrap.insertAdjacentHTML('beforeend', newHtml);
        if (wasAtBottom) logWrap.scrollTop = logWrap.scrollHeight;
    }

    _renderedBattleLogCount = battleLogList.length;
}

// 提取公共的日志HTML构建（正序，不 reverse）
function buildBattleLogHtml(items) {
    return items.map(item => {
        let displayItem = item;
        let cls = "log-item player-normal";
        if (item.startsWith('[怪物]')) {
            displayItem = item.slice(4);
            cls = "log-item monster-attack";
        } else if (item.includes("暴击")) {
            cls = "log-item player-crit";
        } else if (item.includes("【") && item.includes("攻击你")) {
            cls = "log-item monster-attack";
        } else if (item.startsWith("你攻击") || item.startsWith("物理")) {
            cls = "log-item player-normal";
        } else if (item.includes("恭喜") || item.includes("已完全恢复") || item.includes("阵亡") || item.includes("循环刷怪")) {
            cls = "log-item system-tip";
        }
        return `<div class="${cls}">${displayItem}</div>`;
    }).join('');
}

// 渲染装备掉落日志
function renderDropLog() {
    const logWrap = document.getElementById('dropLog');
    const logWrapModal = document.getElementById('dropLogModal');
    if (!logWrapModal) return;

    // 安全保护：如果外部重置了 dropLogList 但计数器没重置，自动修正
    if (_renderedDropLogCount > dropLogList.length) {
        _renderedDropLogCount = 0;
    }
    // 首次渲染：全量，正序
    if (_renderedDropLogCount === 0) {
        const html = buildDropLogHtml(dropLogList);
        if (logWrap) logWrap.innerHTML = html;
        logWrapModal.innerHTML = html;
        _renderedDropLogCount = dropLogList.length;
        // 滚动到底部
        logWrapModal.scrollTop = logWrapModal.scrollHeight;
        if (logWrap) logWrap.scrollTop = logWrap.scrollHeight;
        return;
    }

    // 增量追加
    const newItems = dropLogList.slice(_renderedDropLogCount);
    if (newItems.length === 0) return;

    const newHtml = buildDropLogHtml(newItems);

    // 弹窗
    const wasAtBottomModal =
        logWrapModal.scrollTop + logWrapModal.clientHeight >= logWrapModal.scrollHeight - 10;
    logWrapModal.insertAdjacentHTML('beforeend', newHtml);
    if (wasAtBottomModal) logWrapModal.scrollTop = logWrapModal.scrollHeight;

    // 侧边
    if (logWrap) {
        const wasAtBottom =
            logWrap.scrollTop + logWrap.clientHeight >= logWrap.scrollHeight - 10;
        logWrap.insertAdjacentHTML('beforeend', newHtml);
        if (wasAtBottom) logWrap.scrollTop = logWrap.scrollHeight;
    }

    _renderedDropLogCount = dropLogList.length;
}

// 提取公共的掉落日志HTML构建（正序，不 reverse）
function buildDropLogHtml(items) {
    return items.map(item => {
        if (item.isOther) {
            // 其他物品（宝箱等）
            return `<div class="log-item rarity-normal">${item.monsterName} 掉落了【${item.otherName}】</div>`;
        }
        const cls = getRarityClass(item.equip.rarityName);
        if (item.equip.autoSold) {
            return `<div class="log-item ${cls}">${item.monsterName} 掉落【${item.equip.name}】<span style="color:#4a2c11;"> ⚡自动出售${item.equip.sellPrice}金币</span></div>`;
        } else {
            return `<div class="log-item ${cls}">${item.monsterName} 掉落【${item.equip.name}】</div>`;
        }
    }).join('');
}

// 渲染玩家、怪物血量UI + 战斗攻击动画
function renderBattleHpUI() {
    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    const playerMaxHp = totalAttr.hp;
    // 玩家血条蓝条
    const playerHpPercent = Math.max(0, playerCurrentHp / playerMaxHp) * 100;
    const playerHpBar = document.getElementById('playerHpBar');
    const playerHpText = document.getElementById('playerHpText');
    const playerMaxMp = totalAttr.mp;
    const playerMpPercent = Math.max(0, playerCurrentMp / playerMaxMp) * 100;
    const playerMpBar = document.getElementById('playerMpBar');
    if (playerHpBar) playerHpBar.style.width = `${playerHpPercent}%`;
    if (playerHpText) playerHpText.textContent = `${Math.floor(playerCurrentHp)} / ${playerMaxHp}`;
    if (playerMpBar) playerMpBar.style.width = `${playerMpPercent}%`;

    // 在 renderBattleHpUI 函数中，添加：
    const playerNameText = document.getElementById('playerNameText');
    if (playerNameText) {
        const nick = save.nickname || (save.email ? save.email.split('@')[0] : '冒险者');
        playerNameText.textContent = nick;
    }
    // 怪物血条
    if (currentMonster) {
        const monsterHpPercent = Math.max(0, currentMonster.hp / currentMonster.maxHp) * 100;
        const monsterHpBar = document.getElementById('monsterHpBar');
        const monsterHpText = document.getElementById('monsterHpText');
        const monsterNameText = document.getElementById('monsterNameText');
        if (monsterHpBar) monsterHpBar.style.width = `${monsterHpPercent}%`;
        if (monsterHpText) monsterHpText.textContent = `${Math.floor(currentMonster.hp)} / ${currentMonster.maxHp}`;
        if (monsterNameText && currentMonster) monsterNameText.textContent = currentMonster.rarityName + ' ' + currentMonster.name;
    }
    // 合并外部怪物名牌设置，添加 currentMonster 检查
    const monsterNameText = document.getElementById('monsterNameText');
    if (monsterNameText && currentMonster) {
    monsterNameText.textContent = currentMonster.rarityName + ' ' + currentMonster.name;
    monsterNameText.style.color = currentMonster.rarityColor;
    }
    // 增加品质标签（添加 currentMonster 检查）
    const rarityLabel = document.getElementById('monsterRarityLabel');
    if (rarityLabel && currentMonster) {
        rarityLabel.textContent = currentMonster.rarityName;
        rarityLabel.style.color = currentMonster.rarityColor;
    }
    // ===== ★ 新增：更新怪物头像 =====
    const monsterAvatarImg = document.getElementById('monsterAvatarImg');
    if (monsterAvatarImg && currentMonster) {
        // 构建完整图片路径（从 pages/battle.html 出发）
        let imgPath = currentMonster.image;
        if (imgPath) {
            // 配置中的路径格式为 "images/monster/xxx/xxx.png"
            // 需要转换为相对于 pages/battle.html 的路径
            imgPath = `assets/${imgPath}`;
        }
        
        if (imgPath) {
            // 尝试加载配置的图片
            monsterAvatarImg.src = imgPath;
            // 如果加载失败，自动回退到默认图片
            monsterAvatarImg.onerror = function() {
                this.src = './assets/images/battle/monster-avatar.png';
                this.onerror = null; // 防止默认图片也加载失败时死循环
            };
        } else {
            // 没有配置图片路径，使用默认图片
            monsterAvatarImg.src = './assets/images/battle/monster-avatar.png';
        }
    }
}

// ========== 关卡选择系统 ==========
// 当前用户手动选择的区域索引（-1 表示未手动选择过，由当前关卡决定）
let _userSelectedZoneIdx = -1;

// 渲染整个关卡选择器
function renderStageGrid(forceZoneIdx) {
    // 如果传入了强制区域索引，覆盖用户选择
    if (forceZoneIdx !== undefined && forceZoneIdx >= 0) {
        _userSelectedZoneIdx = forceZoneIdx;
    }
    const save = getSaveData();
    const currentStage = save.currentStage;
    const maxStage = save.unlockData && save.unlockData.maxStage >= 1 ? save.unlockData.maxStage : 0;

    const diffSelect = document.getElementById('diffSelect');
    let currentDiff;
    if (_selectedDiff >= 0 && _selectedDiff < 4) {
        currentDiff = _selectedDiff;
    } else {
        currentDiff = getDiffIndex(currentStage);
    }


    // 2. 更新区域 TAB + 计算 activeZoneIdx
    const zoneTabs = document.querySelectorAll('.stage-zone-tab');
    const grid = document.getElementById('stageGrid');
    if (!zoneTabs.length || !grid) return;

    let activeZoneIdx = 0;
    zoneTabs.forEach((tab, idx) => {
        const zoneConfigIdx = currentDiff * 3 + idx;
        let label = `${idx + 1}.未知区域`;
        if (window.MONSTER_REGION_CONFIG && window.MONSTER_REGION_CONFIG[zoneConfigIdx]) {
            label = `${window.MONSTER_REGION_CONFIG[zoneConfigIdx].stage}.${window.MONSTER_REGION_CONFIG[zoneConfigIdx].name}`;
        }
        tab.textContent = label;
        const zoneFirstStage = currentDiff * 30 + idx * 10 + 1;
        const isUnlockedZone = (zoneFirstStage <= maxStage + 1);
        tab.disabled = !isUnlockedZone;
    });

    if (_userSelectedZoneIdx >= 0 && _userSelectedZoneIdx < zoneTabs.length && !zoneTabs[_userSelectedZoneIdx].disabled) {
        activeZoneIdx = _userSelectedZoneIdx;
    } else {
        const currentUd = calcUnlockData(currentStage);
        if (currentUd.zoneIdx < zoneTabs.length && !zoneTabs[currentUd.zoneIdx].disabled) {
            activeZoneIdx = currentUd.zoneIdx;
        } else {
            for (let i = 0; i < zoneTabs.length; i++) {
                if (!zoneTabs[i].disabled) {
                    activeZoneIdx = i;
                    break;
                }
            }
        }
        _userSelectedZoneIdx = activeZoneIdx;
    }

    zoneTabs.forEach((tab, idx) => {
        if (idx === activeZoneIdx && !tab.disabled) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // 抗性衰减提示
    const resistBar = document.getElementById('resistPenaltyBar');
    if (resistBar) {
        const stageIdxResist = currentDiff * 3 + activeZoneIdx;
        const stageConfig = window.MONSTER_REGION_CONFIG && window.MONSTER_REGION_CONFIG[stageIdxResist];
        const penalty = stageConfig ? stageConfig.resistPenalty : 0;
        if (penalty > 0) {
            const penaltyPercent = (penalty * 100).toFixed(0);
            resistBar.innerHTML = `<span class="penalty-icon penalty-warn">⚠</span> 当前区域抗性衰减：<span class="penalty-value">-${penaltyPercent}% 全元素抗性</span>`;
        } else {
            resistBar.innerHTML = `<span class="penalty-icon penalty-ok">✓</span> 当前区域无抗性衰减`;
            resistBar.className = 'resist-penalty-bar penalty-none';
        }
        resistBar.style.display = 'block';
    }

    // 3. 计算 gridStages
    const gridStages = [];
    const stageIdx = currentDiff * 3 + activeZoneIdx;
    if (window.MONSTER_REGION_CONFIG && window.MONSTER_REGION_CONFIG[stageIdx]) {
        const range = window.MONSTER_REGION_CONFIG[stageIdx].range;
        for (let i = range[0]; i <= range[1]; i++) {
            gridStages.push(i);
        }
    } else {
        for (let i = 1; i <= 10; i++) {
            gridStages.push(currentDiff * 30 + activeZoneIdx * 10 + i);
        }
    }

    // ===== ★ 修改点：每次重建网格，确保区域切换时数字正确 =====
    // 事件委托（只绑定一次）
    if (!grid.dataset.initialized) {
        grid.addEventListener('click', function stageClickHandler(e) {
            const cell = e.target.closest('.stage-cell');
            if (!cell || cell.classList.contains('locked')) return;
            const targetStage = parseInt(cell.dataset.stage);
            if (isNaN(targetStage) || targetStage <= 0 || targetStage > 120) return;
            const s = getSaveData();
            if (s.isBattleRunning) {
                stopBattleLoop();
                s.isBattleRunning = false;
            }
            s.currentStage = targetStage;
            s.currentWave = 1;
            setSaveData(s);
            const totalAttr = calcTotalAttr(s.baseAttr, s.equipWear);
            playerCurrentHp = totalAttr.hp;
            refreshCharacterPanel();
            renderStageGrid();
            clearBattleLog();
            // ★ 手动点击关卡后立即更新背景
            if (typeof updateGameBackground === 'function') {
                updateGameBackground();
            }
            startBattleLoop();
        });
        grid.dataset.initialized = 'true';
    }

    // 清空旧网格，重新生成
    grid.innerHTML = '';
    gridStages.forEach(gs => {
    const cls = getStageCellClass(gs, currentStage, maxStage, currentDiff, activeZoneIdx);
    const div = document.createElement('div');
    div.className = cls;
    div.dataset.stage = gs;

    let html = `<div class="stage-bg"></div>`;
    html += `<div class="stage-label">${gs}</div>`;
    if (gs === currentStage) {
        html += `<div class="stage-current-overlay">当前</div>`;
    }
    div.innerHTML = html;
    grid.appendChild(div);
    });
}

// 在 renderStageGrid 函数外添加或替换原有的 getStageCellClass
function getStageCellClass(gs, currentStage, maxStage, currentDiff, activeZoneIdx) {
  let cls = 'stage-cell';
  
  // 先判断是否已通关
  if (gs <= maxStage) {
    cls += ' unlocked-cleared';
  } else if (gs === maxStage + 1) {
    const nextUd = calcUnlockData(gs);
    const currentUdForCheck = calcUnlockData(currentStage);
    if (nextUd.diffIdx === currentDiff && nextUd.zoneIdx === activeZoneIdx) {
      cls += ' unlocked-uncleared';
    } else {
      cls += ' locked';
    }
  } else {
    cls += ' locked';
  }
  
  // 当前选中关卡 - 最后添加，覆盖状态但不影响背景图
  if (gs === currentStage) {
    cls += ' current';
  }
  
  return cls;
}

// 初始化战斗模块（在 DOMContentLoaded 中调用）
function initBattleModule() {
    // 初始化关卡、波次展示 + 渲染关卡网格
    const save = getSaveData();
    const stageDom = document.getElementById('stageInfo');
    const waveDom = document.getElementById('waveInfo');
    if (waveDom) waveDom.textContent = `波次：${save.currentWave}/5`;
    renderStageGrid();

    // 关卡区域 TAB 切换事件
    document.querySelectorAll('.stage-zone-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.disabled) return;
            const idx = parseInt(this.dataset.zone);
            if (!isNaN(idx)) {
                _userSelectedZoneIdx = idx;
            }
            renderStageGrid();
        });
    });

    const switchMapBtn = document.getElementById('switchMapBtn');

    // 点击“切换大地图”按钮
    if (switchMapBtn) {
        switchMapBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showZonePopup();
        });
    }

    function showZonePopup() {
        const popup = document.getElementById('zonePopup');
        const list = document.getElementById('zoneList');
        if (!popup || !list) return;

        const save = getSaveData();
        const currentStage = save.currentStage;
        const maxStage = save.unlockData && save.unlockData.maxStage >= 1 ? save.unlockData.maxStage : 0;

        const zones = [];
        for (let diffIdx = 0; diffIdx < 4; diffIdx++) {
            const idx = diffIdx * 3;
            const config = window.MONSTER_REGION_CONFIG[idx];
            if (!config) continue;
            const diffFirstStage = diffIdx * 30 + 1;
            const isUnlocked = diffFirstStage <= maxStage + 1;
            const isSelected = (_selectedDiff === diffIdx) || 
                            (_selectedDiff === -1 && getDiffIndex(currentStage) === diffIdx);

            const bgUrl = config.background ? `../${config.background}` : '';  // ← 只取config的background，没有则空字符串

            zones.push({
                diffIdx: diffIdx,
                zoneName: config.zone,
                stageName: config.name,
                thumb: bgUrl,       // 缩略图背景，没有就空
                background: bgUrl,  // 卡片内背景图，没有就空
                unlocked: isUnlocked,
                selected: isSelected
            });
        }

        // 渲染列表：如果背景图为空，thumb 就不设 background-image
        list.innerHTML = zones.map(z => {
            // 如果 config 有 background 则设背景图，否则空
            const bgStyle = z.background ? `style="background-image:url('${z.background}')"` : '';
            return `
                <div class="zone-item ${z.unlocked ? 'unlocked' : 'locked'} ${z.selected ? 'selected' : ''}" 
                    data-diff="${z.diffIdx}" ${bgStyle}>
                    <div class="zone-item-overlay"></div>
                    <div class="zone-name">${z.zoneName}</div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        list.querySelectorAll('.zone-item').forEach(item => {
            item.addEventListener('click', function() {
                // 如果是锁定状态，弹出提示
                if (this.classList.contains('locked')) {
                    showToast('当前地图尚未解锁', 2000);
                    return;
                }
                // 解锁卡片 → 切换大地图
                const diffIdx = parseInt(this.dataset.diff);
                _selectedDiff = diffIdx;
                renderStageGrid();
                updateCurrentMapName();
                hideZonePopup();
            });
        });

        popup.style.display = 'flex';
    }

    function hideZonePopup() {
        document.getElementById('zonePopup').style.display = 'none';
    }

    // 点击弹窗外部关闭（点击背景 .zone-popup-bg 或 .zone-popup 自身）
    document.addEventListener('click', function(e) {
        const popup = document.getElementById('zonePopup');
        if (popup && popup.style.display === 'flex') {
            // 如果点击的是背景（popup 本身）或 bg 层，关闭
            if (e.target === popup || e.target.classList.contains('zone-popup-bg')) {
                hideZonePopup();
            }
        }
    });

    // ====== 循环刷怪按钮交互 ======
    // 修改后：
    const loopFarmingBtn = document.getElementById('loopFarmingBtn');
    if (loopFarmingBtn) {
        const overlayText = loopFarmingBtn.querySelector('.btn-text-overlay');
        const img = loopFarmingBtn.querySelector('img');
        
        // 根据存档初始化
        if (save.isLoopFarming) {
            img.src = './assets/images/battle/loop-on.png';
            if (overlayText) overlayText.textContent = '本关循环';
            loopFarmingBtn.title = '当前：本关循环（通关后重复挑战同一关）';
        } else {
            img.src = './assets/images/battle/loop-off.png';
            if (overlayText) overlayText.textContent = '继续闯关';
            loopFarmingBtn.title = '当前：继续闯关（通关后自动进入下一关）';
        }
        
        loopFarmingBtn.addEventListener('click', function() {
            const s = getSaveData();
            s.isLoopFarming = !s.isLoopFarming;
            setSaveData(s);
            
            if (s.isLoopFarming) {
                img.src = './assets/images/battle/loop-on.png';
                if (overlayText) overlayText.textContent = '本关循环';
                this.title = '当前：本关循环（通关后重复挑战同一关）';
            } else {
                img.src = './assets/images/battle/loop-off.png';
                if (overlayText) overlayText.textContent = '继续闯关';
                this.title = '当前：继续闯关（通关后自动进入下一关）';
            }
            
            const msg = s.isLoopFarming ? '已开启循环刷怪模式，通关后不再跳关' : '已关闭循环刷怪模式，恢复自动闯关';
            addBattleLog(msg);
        });
    }

    // 日志弹窗 - 打开
    const logToggleBtn = document.getElementById('logToggleBtn');
    if (logToggleBtn) {
        logToggleBtn.addEventListener('click', function() {
            document.getElementById('logModal').style.display = 'flex';
            // 打开时自动激活战斗日志标签
            document.querySelectorAll('#logModal .log-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('#logModal .log-tab-btn[data-log="battle"]').classList.add('active');
            document.getElementById('battleLogModal').classList.add('active');
            document.getElementById('dropLogModal').classList.remove('active');
            requestAnimationFrame(() => {
                const battleLogModal = document.getElementById('battleLogModal');
                if (battleLogModal) battleLogModal.scrollTop = battleLogModal.scrollHeight;
            });
        });
    }

    // 日志弹窗 - 关闭
    const logModalCloseBtn = document.getElementById('logModalCloseBtn');
    if (logModalCloseBtn) {
        logModalCloseBtn.addEventListener('click', function() {
            document.getElementById('logModal').style.display = 'none';
        });
    }

    // 日志弹窗 - 点击遮罩关闭
    document.getElementById('logModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // 日志弹窗内 Tab 切换
    document.querySelectorAll('#logModal .log-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#logModal .log-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const targetType = this.dataset.log;
            document.getElementById('battleLogModal').classList.remove('active');
            document.getElementById('dropLogModal').classList.remove('active');
            if (targetType === 'battle') {
                document.getElementById('battleLogModal').classList.add('active');
                renderBattleLog();
                // 滚动到底部（最新日志）
                requestAnimationFrame(() => {
                    const panel = document.getElementById('battleLogModal');
                    if (panel) panel.scrollTop = panel.scrollHeight;
                });
            } else {
                document.getElementById('dropLogModal').classList.add('active');
                renderDropLog();
                // 滚动到底部（最新掉落日志）
                requestAnimationFrame(() => {
                    const panel = document.getElementById('dropLogModal');
                    if (panel) panel.scrollTop = panel.scrollHeight;
                });
            }
        });
    });

    // 首次渲染战斗日志、掉落日志、血条
    renderBattleLog();
    renderDropLog();
    renderBattleHpUI();

    // 战斗全局回调刷新UI
    // 战斗全局回调刷新UI
    initBattleCallback((data) => {
        // ===== 1. 死亡事件处理（优先，提前 return，避免执行多余刷新） =====
        if (data.type === "playerDead") {
            const card = document.getElementById('playerCard');
            const img = document.getElementById('playerDeathImage');
            if (data.data) {
                card.classList.add('dead');
                img.style.display = 'block';
                // ★ 新增：显示阵亡弹窗
                showDeathModal();
            } else {
                card.classList.remove('dead');
                img.style.display = 'none';
                // ★ 新增：隐藏阵亡弹窗
                hideDeathModal();
            }
            return;
        }
        if (data.type === "monsterDead") {
            const card = document.getElementById('monsterCard');
            const img = document.getElementById('monsterDeathImage');
            if (data.data) {
                card.classList.add('dead');
                img.style.display = 'block';
            } else {
                card.classList.remove('dead');
                img.style.display = 'none';
            }
            return;
        }

        // ===== 2. 其他正常 UI 更新 =====
        const save = getSaveData();
        const stageDom = document.getElementById('stageInfo');
        const waveDom = document.getElementById('waveInfo');
        if (waveDom) waveDom.textContent = `波次：${save.currentWave}/5`;
        refreshCharacterPanel();
        // 通关后刷新关卡选择器（解锁新关卡、更新置灰状态）
        renderStageGrid();
        updateCurrentMapName();
        // ★ 战斗关卡变化后更新全局背景
        if (typeof updateGameBackground === 'function') {
            updateGameBackground();
        }
    });

    // ===== 倍速控制 =====
    // js/pages/battle.js — 在 initBattleModule 函数内

    // ===== 倍速控制 =====
    const speedBtn = document.getElementById('speedBtn');
    if (speedBtn) {
        // 从存档读取（旧档可能没有，用 || 1 兜底）
        const save = getSaveData();
        const initialSpeed = save.gameSpeed || 1;
        window.gameSpeed = initialSpeed;                     // 同步到全局
        speedBtn.dataset.speed = initialSpeed;
        speedBtn.textContent = 'x' + initialSpeed;
        speedBtn.className = 'speed-btn speed-' + initialSpeed;

        speedBtn.addEventListener('click', function () {
            let currentSpeed = parseInt(this.dataset.speed) || 1;
            let nextSpeed = currentSpeed < 3 ? currentSpeed + 1 : 1;
            this.dataset.speed = nextSpeed;
            this.textContent = 'x' + nextSpeed;
            this.className = 'speed-btn speed-' + nextSpeed;

            if (typeof window.setGameSpeed === 'function') {
                window.setGameSpeed(nextSpeed);
            }

            // 持久化到存档
            const s = getSaveData();
            s.gameSpeed = nextSpeed;
            setSaveData(s);

            addBattleLog('⚡ 战斗速度已切换至 x' + nextSpeed);
        });
    }

    // 进入页面自动开启战斗
    clearBattleLog();
    startBattleLoop();
}

// ===== 阵亡弹窗控制 =====
function showDeathModal() {
    const modal = document.getElementById('deathModal');       // 仍然通过 ID 找到 modal-overlay
    const countdownEl = document.getElementById('deathCountdown');
    if (!modal || !countdownEl) return;

    let remaining = 5;
    countdownEl.innerText = `${remaining}秒后自动复活`;
    modal.style.display = 'flex';      // ★ 全局 modal-overlay 使用 flex 居中

    // 清除旧计时器
    if (window.deathCountdownTimer) {
        clearInterval(window.deathCountdownTimer);
    }
    window.deathCountdownTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(window.deathCountdownTimer);
            window.deathCountdownTimer = null;
            modal.style.display = 'none';
        } else {
            countdownEl.innerText = `${remaining}秒后自动复活`;
        }
    }, 1000);
}

function hideDeathModal() {
    const modal = document.getElementById('deathModal');
    if (modal) modal.style.display = 'none';
    if (window.deathCountdownTimer) {
        clearInterval(window.deathCountdownTimer);
        window.deathCountdownTimer = null;
    }
}