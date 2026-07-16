let timerEpoch = 0; // ★ 新增：定时器版本号，避免并发重建
let playerAttackTimer = null;
let monsterAttackTimer = null;
let currentMonster = null;
let playerCurrentHp = 0;
let battleLogList = [];
let dropLogList = [];
let battleCallback = null;
let playerCurrentMp = 0;
let hpRegenTimer = null;
let mpRegenTimer = null; 
window.gameSpeed = 1;   // 新增：默认1倍速

window.initBattleCallback = function(callback) {
    battleCallback = callback;
}
const MAX_BATTLE_LOG = 500;

function addBattleLog(msg) {
    battleLogList.push(msg);
    if (battleLogList.length > MAX_BATTLE_LOG) {
        battleLogList.splice(0, battleLogList.length - MAX_BATTLE_LOG);
    }
    if (battleCallback) battleCallback({ type: "battleLog", data: battleLogList.slice(-50) });
}

// 掉落日志：最多保留 200 条（掉落少，保留更多也无妨）
const MAX_DROP_LOG = 200;

function addDropLog(monsterName, item) {
    // item 可能是装备对象（含 equip 结构），也可能是其他物品信息 { isOther: true, name, cfgId }
    if (item.isOther) {
        dropLogList.push({
            monsterName: monsterName,
            isOther: true,
            otherName: item.name,
            otherCfgId: item.cfgId
        });
    } else {
        dropLogList.push({ monsterName, equip: item });
    }
    if (dropLogList.length > MAX_DROP_LOG) {
        dropLogList.splice(0, dropLogList.length - MAX_DROP_LOG);
    }
    if (battleCallback) battleCallback({ type: "dropLog", data: dropLogList.slice(-50) });
}

function spawnMonster() {
    const save = getSaveData();
    const attr = getMonsterAttrByLevel(save.currentStage, save.currentWave);
    if (!attr) {
        console.error(`spawnMonster: 无法生成关卡 ${save.currentStage} 波次 ${save.currentWave} 的怪物配置`);
        currentMonster = null;
        return;
    }
    const rarityConfig = MONSTER_RARITY[attr.qualityIdx];
    
    currentMonster = {
        name: attr.monsterName,
        qualityIdx: attr.qualityIdx,
        rarityName: rarityConfig.name,
        rarityColor: rarityConfig.color,
        hp: attr.hp,
        maxHp: attr.maxHp,
        atk: attr.atk,
        def: attr.def,
        attackSpeed: attr.attackSpeed,
        hpRegen: attr.hpRegen,
        dodge: attr.dodge,
        hit: attr.hit,
        fireResist: attr.fireResist,
        coldResist: attr.coldResist,
        lightResist: attr.lightResist,
        skills: attr.skills,
        isDead: false,
        // ★ 新增元素点伤
        fireDmg: attr.fireDmg  || 0,
        coldDmg: attr.coldDmg || 0,
        lightDmg: attr.lightDmg || 0,
        image: attr.monsterImage || null,
    };
    if (battleCallback) battleCallback({ type: "refreshMonster", data: currentMonster });
    if (battleCallback) battleCallback({ type: "monsterDead", data: false });
}

// ===== 战斗动画辅助函数 =====
function triggerAttackEffect(type) {
    const el = document.getElementById(type === 'player' ? 'playerAttackEffect' : 'monsterAttackEffect');
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
}

function triggerPlayerAttackAnim() {
    const el = document.getElementById('playerCard');
    if (!el) return;
    el.classList.remove('player-attacking');
    void el.offsetWidth;
    el.classList.add('player-attacking');
}

function triggerHitBack(target) {
    const elId = target === 'player' ? 'playerCard' : 'monsterCard';
    const el = document.getElementById(elId);
    if (!el) {
        console.warn('triggerHitBack: 未找到元素', elId);
        return;
    }
    el.classList.remove('hit-back');
    void el.offsetWidth;          // 强制回流
    el.classList.add('hit-back');
}

function triggerMonsterAttackAnim() {
    const el = document.getElementById('monsterCard');
    if (!el) return;
    el.classList.remove('monster-attacking');
    void el.offsetWidth;          // 强制回流，重置动画
    el.classList.add('monster-attacking');
}

function showDamageNumber(damage, isCrit, isPlayerDamage) {
    const container = document.getElementById('damageNumbers');
    if (!container) return;
    
    const el = document.createElement('div');
    el.className = `dmg-number ${isPlayerDamage ? 'player-dmg' : 'monster-dmg'}`;
    el.textContent = isCrit ? `暴击! ${damage}` : `-${damage}`;
    
    // 暴击时额外加一个样式
    if (isCrit) el.classList.add('crit-text');
    
    // 随机偏移位置，避免重叠
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 20;
    el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    container.appendChild(el);
    
    // 动画结束后移除
    setTimeout(() => el.remove(), 800);
}
/*** 显示回血数字（绿色，向上飘动）*/
function showHealNumber(amount, isMp = false) {
    const container = document.getElementById('damageNumbers');
    if (!container) return;
    
    const el = document.createElement('div');
    el.className = `dmg-number heal-number${isMp ? ' mp-heal' : ''}`;
    el.textContent = `+${Math.floor(amount)}`;
    
    // 随机偏移，避免重叠
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 10;
    el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function showMissText(target) {
    const container = document.getElementById('damageNumbers');
    if (!container) return;
    
    const el = document.createElement('div');
    el.className = 'dmg-number miss-text';
    el.textContent = 'Miss';
    
    // 定位到目标（玩家或怪物）上方
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 10;
    el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    container.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function calcHitRate(hit, monsterDodge) {
    // 玩家基础命中率 85% + hit/(hit+150)
    let baseHitRate = 0.85 + hit / (hit + 150);
    // 怪物闪避因子 monsterDodge/(monsterDodge+300)，抵消命中
    let dodgeFactor = monsterDodge / (monsterDodge + 300);
    let hitRate = Math.min(0.95, baseHitRate - dodgeFactor);
    return Math.max(0.05, hitRate);  // 保底5%
}

function calcMonsterHitPlayer(dodge, monsterHit) {
    // 玩家基础闪避率 dodge/(dodge+250)
    let baseDodgeRate = dodge / (dodge + 250);
    // 怪物命中因子 monsterHit/(monsterHit+300)，抵消闪避
    let hitFactor = monsterHit / (monsterHit + 300);
    let dodgeRate = Math.min(0.60, baseDodgeRate - hitFactor);
    return Math.max(0.02, dodgeRate);  // 保底2%
}

function playerAttack() {
    if (!currentMonster || currentMonster.isDead || playerCurrentHp <= 0) return;

    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    
        // ===== 命中判定 =====
    const playerHit = totalAttr.hit || 0;
    const monsterDodge = currentMonster.dodge || 0;
    const hitRate = calcHitRate(playerHit, monsterDodge);
    const isMiss = Math.random() > hitRate;

    // ★ 总是执行前摇：玩家前冲动画
    triggerPlayerAttackAnim();            // 玩家前冲
    triggerAttackEffect('player');        // 闪光

    if (isMiss) {
        addBattleLog(`你的攻击未命中【${currentMonster.name}】(命中率${(hitRate*100).toFixed(1)}%)`);
        const hitDetail = `命中率计算: 基础85% + 命中${playerHit}/(${playerHit}+150)=${(0.85 + playerHit/(playerHit+150)).toFixed(3)}；减去闪避因子${monsterDodge}/(${monsterDodge}+300)=${(monsterDodge/(monsterDodge+300)).toFixed(3)}；最终命中=${(hitRate*100).toFixed(1)}%`;
        addBattleLog(hitDetail);
        // ★ 在怪物身上显示 Miss 文字
        showMissText('monster');
        return;  // 不扣血，不计算伤害
    }

    // 传入第四个参数 penetrateDef
    const { damage, isCrit, effectiveDef } = calcDamage(
        totalAttr.atk, 
        currentMonster.def, 
        totalAttr.critRate, 
        totalAttr.critDmg,
        totalAttr.penetrateDef || 0   // 新增：传入防御穿透
    );

    // ★ 新增：元素伤害计算,假设怪物拥有抗性属性（暂为0，后续可配置）
    const playerFireDmg  = totalAttr.fireDmg  || 0;
    const playerColdDmg  = totalAttr.coldDmg  || 0;
    const playerLightDmg = totalAttr.lightDmg || 0;
    const monsterFireRes  = currentMonster.fireResist  || 0;
    const monsterColdRes  = currentMonster.coldResist  || 0;
    const monsterLightRes = currentMonster.lightResist || 0;
    const firePen  = totalAttr.firePen  || 0;
    const coldPen  = totalAttr.coldPen  || 0;
    const lightPen = totalAttr.lightPen || 0;

    const fireElemDmg   = calcElementDamage(playerFireDmg,  monsterFireRes,  firePen);
    const coldElemDmg   = calcElementDamage(playerColdDmg,  monsterColdRes,  coldPen);
    const lightElemDmg  = calcElementDamage(playerLightDmg, monsterLightRes, lightPen);

    const totalElemDmg = fireElemDmg + coldElemDmg + lightElemDmg;

    // ====== 构建详细伤害日志 ======
    // 1. 物理伤害计算详情
    const defReduce = getDefDamageReduce(effectiveDef);
    const critPart = isCrit ? `(暴击倍率${(totalAttr.critDmg*100).toFixed(0)}%)` : '';
    let physDetail = `物理：攻击${totalAttr.atk.toFixed(1)}`;
    physDetail += ` × 减伤${(1-defReduce).toFixed(2)}(1 - ${effectiveDef.toFixed(0)}/(${effectiveDef.toFixed(0)}+100)`;
    if (totalAttr.penetrateDef > 0) {
        physDetail += ` [穿透${(totalAttr.penetrateDef*100).toFixed(0)}%：防御${currentMonster.def}→${effectiveDef.toFixed(0)}]`;
    }
    physDetail += ` = ${damage}${isCrit ? ' (暴击)' : ''}`;

    // 2. 元素伤害计算详情（仅显示大于0的元素）
    let elemDetails = [];
    if (fireElemDmg > 0) {
        let effRes = Math.max(0, monsterFireRes * (1 - Math.min(0.95, totalAttr.firePen)));
        const RESIST_CAP = 0.70;
        let resistReduce = Math.min(RESIST_CAP, effRes);
        elemDetails.push(`火焰${totalAttr.fireDmg} × 抗性(${monsterFireRes}→${effRes.toFixed(2)}) × (1-${resistReduce.toFixed(2)}) = ${fireElemDmg}`);
    }
    if (coldElemDmg > 0) {
        let effRes = Math.max(0, monsterColdRes * (1 - Math.min(0.95, totalAttr.coldPen)));
        // 直接使用抗性小数作为减伤比例（与 calcElementDamage 一致）
        const RESIST_CAP = 0.70;
        let resistReduce = Math.min(RESIST_CAP, effRes);
        elemDetails.push(`冰霜${totalAttr.coldDmg} × 抗性(${monsterColdRes}→${effRes.toFixed(2)}) × (1-${resistReduce.toFixed(2)}) = ${coldElemDmg}`);
    }
    if (lightElemDmg > 0) {
        let effRes = Math.max(0, monsterLightRes * (1 - Math.min(0.95, totalAttr.lightPen)));
        const RESIST_CAP = 0.70;
        let resistReduce = Math.min(RESIST_CAP, effRes);
        elemDetails.push(`闪电${totalAttr.lightDmg} × 抗性(${monsterLightRes}→${effRes.toFixed(2)}) × (1-${resistReduce.toFixed(2)}) = ${lightElemDmg}`);
    }

    // 3. 组合日志：物理 + 元素 + 总计
    const totalDamage = damage + totalElemDmg;

    // 先扣血 + 显示简版结果
    currentMonster.hp = Math.max(0, currentMonster.hp - totalDamage);
    if (isCrit) {
        addBattleLog(`⚡ 暴击！对【${currentMonster.name}】造成 ${totalDamage} 点伤害 (命中率${(hitRate*100).toFixed(1)}%)`);
    } else {
        addBattleLog(`你攻击【${currentMonster.name}】造成 ${totalDamage} 点伤害 (命中率${(hitRate*100).toFixed(1)}%)`);
    }

    // 物理详情单独一行
    addBattleLog(`* ${physDetail}`);
    // 每个元素单独一行
    elemDetails.forEach(detail => addBattleLog(`* 元素：${detail}`));
    // 总伤害单独一行
    addBattleLog(`* 总伤 ${totalDamage} (物理${damage} + 元素${totalElemDmg})`);
    
    showDamageNumber(totalDamage, isCrit, true); // 数字
    triggerHitBack('monster');            // 怪物后仰
    
    if (battleCallback) battleCallback({ type: "refreshMonster", data: currentMonster });

    // ========== 核心修复：怪物死亡立刻停定时器，杜绝重复执行 ==========
    if (currentMonster.hp <= 0 && !currentMonster.isDead) {
        currentMonster.isDead = true;
        if (battleCallback) battleCallback({ type: "monsterDead", data: true });
        // 先停止攻击循环，防止重复执行卡死
        clearInterval(playerAttackTimer);
        clearInterval(monsterAttackTimer);
        clearInterval(hpRegenTimer);
        clearInterval(mpRegenTimer);
        playerAttackTimer = null;
        monsterAttackTimer = null;
        hpRegenTimer = null;
        mpRegenTimer = null;

        // 执行装备掉落
        const dropEquip = monsterDropEquip(save.currentStage, currentMonster.qualityIdx);
        if (dropEquip) {
            const equipClone = structuredClone(dropEquip);

            const sellPrice = processAutoSell(equipClone, save);
            if (sellPrice !== null) {
                // 自动出售：加金币 + 记录日志（附带出售价格）
                setSaveData(save);
                const logEquip = structuredClone(equipClone);
                logEquip.autoSold = true;
                logEquip.sellPrice = sellPrice;
                addDropLog(currentMonster.name, logEquip);
                addBattleLog(`【自动出售】${equipClone.name}(${equipClone.rarityName}) 已自动出售，获得 ${sellPrice} 金币`);
            } else {
                // 正常掉落
                save.bag.push(equipClone);
                setSaveData(save);
                const equipForLog = structuredClone(dropEquip);
                addDropLog(currentMonster.name, equipForLog);
            }
        }

                // ★ 宝箱掉落 ↓
        // 前置检查：确保配置已就绪，再调用 generateChestDrop
        let chestCfgId = null;
        if (window.OTHER_ITEM_CONFIG && typeof window.OTHER_ITEM_CONFIG === 'object') {
            chestCfgId = window.generateChestDrop(save.currentStage, currentMonster.qualityIdx);
        } else {
            console.warn('window.OTHER_ITEM_CONFIG 未加载或为空，跳过宝箱掉落');
            addBattleLog('【警告】宝箱配置未加载，无法掉落');
        }
        if (chestCfgId) {
            // 二次保障（虽然 generateChestDrop 内已有检查）
            const chestConfig = window.OTHER_ITEM_CONFIG[chestCfgId];
            if (chestConfig) {
                save.otherItems[chestCfgId] = (save.otherItems[chestCfgId] || 0) + 1;
                setSaveData(save);
                addDropLog(currentMonster.name, { isOther: true, name: chestConfig.name, cfgId: chestCfgId });
                addBattleLog('【掉落】' + currentMonster.name + ' 掉落了 ' + chestConfig.name);
            }
        }
        
         // ★ 改为 3 秒后进入下一波（原为 300ms）
        setTimeout(() => {
            if (battleCallback) battleCallback({ type: "monsterDead", data: false });
            nextWaveOrStage();
            
            const speed = window.gameSpeed || 1;                      // ← 获取当前倍速
            const newAttr = calcTotalAttr(save.baseAttr, save.equipWear);
            playerAttackTimer  = setInterval(playerAttack,  1000 / (newAttr.attackSpeed * speed));
            monsterAttackTimer = setInterval(monsterAttack, 1000 / (currentMonster.attackSpeed * speed));
            hpRegenTimer = setInterval(hpRegenTick, 3000 / speed);
            mpRegenTimer = setInterval(mpRegenTick, 3000 / speed);
        }, 3000 / (window.gameSpeed || 1));        
    }
}

function monsterAttack() {
    if (!currentMonster || currentMonster.isDead || playerCurrentHp <= 0) return;

    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    
    // ===== 玩家闪避判定（只判断一次） =====
    const playerDodge = totalAttr.dodge || 0;
    const monsterHit = currentMonster.hit || 0;
    const dodgeRate = calcMonsterHitPlayer(playerDodge, monsterHit);
    
    if (Math.random() < dodgeRate) {
        addBattleLog(`你闪避了【${currentMonster.name}】的攻击！(闪避率${(dodgeRate*100).toFixed(1)}%)`);
        if (battleCallback) battleCallback({ type: "refreshPlayerHp", data: playerCurrentHp });
        return;  // 闪避成功，不触发任何动画和扣血
    }

    // ===== 动画：怪物攻击前摇 =====
    triggerMonsterAttackAnim();
    triggerAttackEffect('monster');

    // ===== 1. 物理伤害计算 =====
    const reduce = getDefDamageReduce(totalAttr.def);
    let physDamage = Math.floor(currentMonster.atk * (1 - reduce));
    physDamage = Math.max(0, physDamage);

    // ===== 2. 元素伤害计算（仅当怪物有元素攻击时） =====
    const monsterFireDmg  = currentMonster.fireDmg  || 0;
    const monsterColdDmg  = currentMonster.coldDmg  || 0;
    const monsterLightDmg = currentMonster.lightDmg || 0;

    // ===== 获取当前区域抗性惩罚 =====
    const region = getRegionByLevel(save.currentStage);
    const penalty = region ? (region.resistPenalty || 0) : 0; // 已经是小数
    // 计算受惩罚后的玩家抗性
    const effectiveFireRes   = Math.max(0, totalAttr.fireResist  - penalty);
    const effectiveColdRes   = Math.max(0, totalAttr.coldResist  - penalty);
    const effectiveLightRes  = Math.max(0, totalAttr.lightResist - penalty);
    const fireElemDmg   = calcElementDamage(monsterFireDmg,  effectiveFireRes,  0);
    const coldElemDmg   = calcElementDamage(monsterColdDmg,  effectiveColdRes,  0);
    const lightElemDmg  = calcElementDamage(monsterLightDmg, effectiveLightRes, 0);
    const totalElemDmg  = fireElemDmg + coldElemDmg + lightElemDmg;

    // ===== 3. 总伤害 =====
    const totalDamage = Math.max(1, physDamage + totalElemDmg);
    playerCurrentHp = Math.max(0, playerCurrentHp - totalDamage);

    // ===== 4. 日志 =====
    // ===== 4. 详细伤害日志（按怪物规则：无穿透、无暴击、不展示区域惩罚过程） =====
    // 先输出简版结果
    addBattleLog(`【${currentMonster.name}】攻击你，造成 ${totalDamage} 点伤害(闪避率${(dodgeRate*100).toFixed(1)}%)`);
    // 4a. 物理伤害计算详情
    const defReduce = getDefDamageReduce(totalAttr.def);
    let physDetail = `物理：攻击${currentMonster.atk.toFixed(1)}`;
    physDetail += ` × 减伤${(1 - defReduce).toFixed(2)}(1 - ${totalAttr.def.toFixed(0)}/(${totalAttr.def.toFixed(0)}+100))`;
    physDetail += ` = ${physDamage}`;
    

    // 4b. 元素伤害计算详情（仅显示大于0的元素）
    let elemDetails = [];
    if (fireElemDmg > 0) {
        const RESIST_CAP = 0.70;
        let resistReduce = Math.min(RESIST_CAP, effectiveFireRes);
        elemDetails.push(`火焰：${monsterFireDmg.toFixed(1)} × 抗性(${(effectiveFireRes*100).toFixed(2)}%) × (1-${resistReduce.toFixed(2)}) = ${fireElemDmg}`);
    }
    if (coldElemDmg > 0) {
        const RESIST_CAP = 0.70;
        let resistReduce = Math.min(RESIST_CAP, effectiveFireRes);
        elemDetails.push(`冰霜：${monsterColdDmg.toFixed(1)} × 抗性(${(effectiveColdRes*100).toFixed(2)}%) × (1-${resistReduce.toFixed(2)}) = ${coldElemDmg}`);
    }
    if (lightElemDmg > 0) {
        const RESIST_CAP = 0.70;
        let resistReduce = Math.min(RESIST_CAP, effectiveFireRes);
        elemDetails.push(`闪电：${monsterLightDmg.toFixed(1)} × 抗性(${(effectiveLightRes*100).toFixed(2)}%) × (1-${resistReduce.toFixed(2)}) = ${lightElemDmg}`);
    }
    addBattleLog(`[怪物] *${physDetail}`);
    // 每个元素单独一行
    elemDetails.forEach(detail => addBattleLog(`[怪物] *元素：${detail}`));
    // 总伤害
    addBattleLog(`[怪物] *总伤 ${totalDamage} (物理${physDamage} + 元素${totalElemDmg})`);
    // ===== 5. 视觉反馈 =====
    showDamageNumber(totalDamage, false, false);
    triggerHitBack('player');

    if (battleCallback) battleCallback({ type: "refreshPlayerHp", data: playerCurrentHp });

    // ===== 6. 玩家死亡判定 =====
    if (playerCurrentHp <= 0) {
        playerDie();
    }
}

/**
 * 每秒触发一次的生命恢复
 */
function hpRegenTick() {
    if (playerCurrentHp <= 0) return;
    // 1. 恢复角色
    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    const maxHp = totalAttr.hp;
    const regenAmount = totalAttr.hpRegen;
    
    // [新增] 越界修正：如果当前血量超过最大血量，回落到最大血量
    if (playerCurrentHp > maxHp) {
        playerCurrentHp = maxHp;
        if (battleCallback) battleCallback({ type: "refreshPlayerHp", data: playerCurrentHp });
        return;
    }

    if (playerCurrentHp > 0 && playerCurrentHp < maxHp) {
        const actualHeal = Math.min(maxHp - playerCurrentHp, regenAmount);
        playerCurrentHp = Math.min(maxHp, playerCurrentHp + regenAmount);
    
        // ✅ 新增：显示回血数字
        showHealNumber(actualHeal, false);
        if (battleCallback) battleCallback({ type: "refreshPlayerHp", data: playerCurrentHp });
    }
    
        

    // 2. 恢复怪物
    if (currentMonster && !currentMonster.isDead && currentMonster.hp < currentMonster.maxHp) {
        const monsterRegen = currentMonster.hpRegen || 2; // 防御性取值
        currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + monsterRegen);
        if (battleCallback) battleCallback({ type: "refreshMonster", data: currentMonster });
    }
}

/**
 * 每秒触发一次魔力恢复
 *（后续技能系统可在此处增加消耗魔力的逻辑）
 */
function mpRegenTick() {
    if (playerCurrentHp <= 0) return;
    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    const maxMp = totalAttr.mp;
    const regenAmount = totalAttr.mpRegen;

    // [新增] 越界修正：如果当前魔力超过最大魔力，回落到最大魔力
    if (playerCurrentMp > maxMp) {
        playerCurrentMp = maxMp;
        if (battleCallback) battleCallback({ type: "refreshPlayerMp", data: playerCurrentMp });
        return;
    }

    if (playerCurrentMp < maxMp) {
        const actualHeal = Math.min(maxMp - playerCurrentMp, regenAmount);
        playerCurrentMp = Math.min(maxMp, playerCurrentMp + regenAmount);
    
        showHealNumber(actualHeal, true);
        
        if (battleCallback) battleCallback({ type: "refreshPlayerMp", data: playerCurrentMp });
    }
}


function playerDie() {
    stopBattleLoop();
    // ★ 通知 UI 显示玩家阵亡图
    if (battleCallback) battleCallback({ type: "playerDead", data: true });

    const save = getSaveData();
    // ★ 删除此行：save.currentWave = 1;  // 移除立即重置波次
    setSaveData(save);
    addBattleLog(`你在第${save.currentStage}关阵亡，5秒后从本关卡第1波重新挑战...`);

    setTimeout(() => {
        const save = getSaveData();   // 重新获取最新存档（可能在其他地方被修改）
        save.currentWave = 1;         // ★ 新增：在复活时重置波次
        setSaveData(save);
        
        const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
        playerCurrentHp = totalAttr.hp;
        playerCurrentMp = totalAttr.mp;
        spawnMonster();
        // ★ 通知 UI 隐藏玩家阵亡图（即将复活）
        if (battleCallback) battleCallback({ type: "playerDead", data: false });
        startBattleLoop();   // startBattleLoop 内部也会设置 save.currentWave = 1，可以复用；不过这里已经设置了一次，无影响
    }, 5000);
}

function nextWaveOrStage() {
    const save = getSaveData();
    // 当前波数+1
    save.currentWave += 1;
                // 5波打完通关
    if (save.currentWave > 5) {
        const clearedStage = save.currentStage; // 刚打通的关卡

        // ====== 循环刷怪模式：记录通关但重置波次，不跳关 ======
        if (save.isLoopFarming) {
            save.currentWave = 1;
            // 循环模式下也要更新最高通关记录（首次通关），解锁下一关让玩家可选
            if (!save.unlockData) {
                save.unlockData = { maxDifficulty: 0, maxZone: 0, maxStage: 0 };
            }
            if (clearedStage > save.unlockData.maxStage) {
                save.unlockData.maxStage = clearedStage;
                const ud = calcUnlockData(clearedStage);
                save.unlockData.maxDifficulty = ud.diffIdx;
                save.unlockData.maxZone = ud.zoneIdx;
            }
            addBattleLog(`循环刷怪模式：第${save.currentStage}关所有波次已清空，继续挑战同一关卡！`);
        } else {
            // ====== 原有跳关逻辑 ======
            save.currentStage += 1;
            save.currentWave = 1;
            // 更新最高通关记录
            if (!save.unlockData) {
                save.unlockData = { maxDifficulty: 0, maxZone: 0, maxStage: 0 };
            }
            if (clearedStage > save.unlockData.maxStage) {
                save.unlockData.maxStage = clearedStage;
                // 同步更新难度和区域
                const ud = calcUnlockData(clearedStage);
                save.unlockData.maxDifficulty = ud.diffIdx;
                save.unlockData.maxZone = ud.zoneIdx;
            }
            addBattleLog(`恭喜通关第${clearedStage}关，自动挑战第${save.currentStage}关！`);
        }
        // ✅ 将血量回满逻辑移到这里：仅在通关成功时执行
        const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
        playerCurrentHp = totalAttr.hp;
        playerCurrentMp = totalAttr.mp;
        addBattleLog(`闯关成功，生命和魔力已完全恢复！`);
        
        // 刷新血条UI
        if (battleCallback) {
            battleCallback({ type: "refreshPlayerHp", data: playerCurrentHp });
            battleCallback({ type: "refreshPlayerMp", data: playerCurrentMp });
        }
    }
    setSaveData(save);
    

    // 通关后刷新关卡选择器（解锁新关卡、更新置灰状态）
    if (typeof renderStageGrid === 'function') {
        renderStageGrid();
    }

    spawnMonster();
}

window.startBattleLoop = function () {
    // ★ 增：登录守卫
    const isLoggedIn = currentUser != null;
    if (!isLoggedIn) {
        console.warn("登录后才可开始战斗");
        return;
    }
    const save = getSaveData();
    save.currentWave = 1;
    setSaveData(save);
    // 拦截重复开启战斗
    if (save.isBattleRunning) {
        console.log("检测到战斗卡死状态，强制重置...");  // 仅普通日志
        stopBattleLoop();
        save.isBattleRunning = false;
        setSaveData(save);
    }

    console.log("开始执行挂机战斗函数");
    console.log("读取存档数据：", save);

    // 标记战斗运行中并持久化
    save.isBattleRunning = true;
    setSaveData(save);

    // 计算角色总属性
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    console.log("玩家总属性：", totalAttr);
    playerCurrentHp = totalAttr.hp;
    playerCurrentMp = totalAttr.mp;

    // 生成当前怪物
    spawnMonster();
    // ★ 新增：如果怪物生成失败，终止启动
    if (!currentMonster) {
        console.error("startBattleLoop: 怪物生成失败，无法开始战斗");
        save.isBattleRunning = false;
        setSaveData(save);
        addBattleLog("⚠ 怪物配置错误，请检查数据或联系管理员");
        if (battleCallback) battleCallback({ type: "battleLog", data: battleLogList });
        return;
    }

        // 战斗开始时刷新关卡选择器状态
    if (typeof renderStageGrid === 'function') {
        renderStageGrid();
    }

    // ★ 在函数开始处增加清除旧定时器防御
    clearInterval(playerAttackTimer);
    clearInterval(monsterAttackTimer);
    clearInterval(hpRegenTimer);
    clearInterval(mpRegenTimer);

    const speed = window.gameSpeed || 1;

    // ★ 使用定时器版本号包裹回调
    timerEpoch++;
    const currentEpoch = timerEpoch;

    hpRegenTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        hpRegenTick();
    }, 3000 / speed);

    mpRegenTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        mpRegenTick();
    }, 3000 / speed);

    playerAttackTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        playerAttack();
    }, 1000 / (totalAttr.attackSpeed * speed));

    monsterAttackTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        monsterAttack();
    }, 1000 / (currentMonster.attackSpeed * speed));
};

window.stopBattleLoop = function () {
    if (playerAttackTimer) clearInterval(playerAttackTimer);
    if (monsterAttackTimer) clearInterval(monsterAttackTimer);
    if (hpRegenTimer) clearInterval(hpRegenTimer);
    if (mpRegenTimer) clearInterval(mpRegenTimer);
    playerAttackTimer = null;
    monsterAttackTimer = null;
    hpRegenTimer = null; 
    mpRegenTimer = null; 

    // ★ 递增版本号，使所有旧版本的回调立即失效
    timerEpoch++;

    const save = getSaveData();
    save.isBattleRunning = false;
    setSaveData(save);
    console.log("战斗已停止");
};

/**
 * 设置战斗倍速（1/2/3 倍）
 * 如果战斗正在运行，会立即重建所有定时器以应用新速度，不打断战斗进度
 */
window.setGameSpeed = function(speed) {
    speed = Math.max(1, Math.min(3, speed));
    window.gameSpeed = speed;

    const speedBtn = document.getElementById('speedBtn');
    if (speedBtn) {
        speedBtn.dataset.speed = speed;
        speedBtn.textContent = 'x' + speed;
        speedBtn.className = 'speed-btn speed-' + speed;
    }
    
    const save = getSaveData();
    if (!save.isBattleRunning) return;
    if (!currentMonster) {
        console.warn('setGameSpeed: currentMonster 未初始化，跳过定时器重建');
        return;
    }

    // 清除旧定时器
    clearInterval(playerAttackTimer);
    clearInterval(monsterAttackTimer);
    clearInterval(hpRegenTimer);
    clearInterval(mpRegenTimer);

    // ★ 使用新版本号
    timerEpoch++;
    const currentEpoch = timerEpoch;
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);

    playerAttackTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        playerAttack();
    }, 1000 / (totalAttr.attackSpeed * speed));

    monsterAttackTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        monsterAttack();
    }, 1000 / (currentMonster.attackSpeed * speed));

    hpRegenTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        hpRegenTick();
    }, 3000 / speed);

    mpRegenTimer = setInterval(() => {
        if (timerEpoch !== currentEpoch) return;
        mpRegenTick();
    }, 3000 / speed);
};