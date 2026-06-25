import { getSaveData, setSaveData } from "./saveManager.js";
import { calcTotalAttr, calcDamage, getMonsterAttrByLevel, getMonsterTypeByWave, getDefDamageReduce } from "./attrCalculator.js";
import { monsterDropEquip } from "./equipGenerator.js";
import { getStageByLevel } from "../config/levelConfig.js";

let playerAttackTimer = null;
let monsterAttackTimer = null;
let currentMonster = null;
let playerCurrentHp = 0;
let battleLogList = [];
let dropLogList = [];
let battleCallback = null;

export function initBattleCallback(callback) {
    battleCallback = callback;
}

export function clearBattleLog() {
    battleLogList = [];
    dropLogList = [];
}

function addBattleLog(msg) {
    battleLogList.push(msg);
    if (battleCallback) battleCallback({ type: "battleLog", data: battleLogList.slice(-50) });
}

function addDropLog(monsterName, equip) {
    dropLogList.push({ monsterName, equip });
    if (battleCallback) battleCallback({ type: "dropLog", data: dropLogList.slice(-50) });
}

function spawnMonster() {
    const save = getSaveData();
    const { currentStage, currentWave } = save;
    const monsterAttr = getMonsterAttrByLevel(currentStage, currentWave);
    const stageInfo = getStageByLevel(currentStage);
    const monsterTypeKey = getMonsterTypeByWave(currentWave);

    let monsterName;
    if (monsterTypeKey === "normalMonster") monsterName = stageInfo.normal;
    else if (monsterTypeKey === "eliteMonster") monsterName = stageInfo.elite;
    else monsterName = stageInfo.boss;

    currentMonster = {
        name: monsterName,
        typeKey: monsterTypeKey,
        hp: monsterAttr.hp,
        maxHp: monsterAttr.maxHp,
        atk: monsterAttr.atk,
        def: monsterAttr.def,
        attackSpeed: monsterAttr.attackSpeed,
        isDead: false
    };

    if (battleCallback) battleCallback({ type: "refreshMonster", data: currentMonster });
}

function playerAttack() {
    if (!currentMonster || currentMonster.isDead) return;

    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    const { damage, isCrit } = calcDamage(totalAttr.atk, currentMonster.def, totalAttr.critRate, totalAttr.critDamage);

    currentMonster.hp = Math.max(0, currentMonster.hp - damage);

    if (isCrit) {
        addBattleLog(`你发动暴击，对【${currentMonster.name}】造成 ${damage} 点暴击伤害！`);
    } else {
        addBattleLog(`你攻击【${currentMonster.name}】，造成 ${damage} 点伤害`);
    }

    if (battleCallback) battleCallback({ type: "refreshMonster", data: currentMonster });

    // ========== 核心修复：怪物死亡立刻停定时器，杜绝重复执行 ==========
    if (currentMonster.hp <= 0 && !currentMonster.isDead) {
        currentMonster.isDead = true;
        // 先停止攻击循环，防止重复执行卡死
        clearInterval(playerAttackTimer);
        clearInterval(monsterAttackTimer);
        playerAttackTimer = null;
        monsterAttackTimer = null;

        // 执行装备掉落
        const dropEquip = monsterDropEquip(save.currentStage, currentMonster.typeKey);
        if (dropEquip) {
            // 深拷贝生成全新独立装备对象，彻底断开引用关联
            const equipClone = structuredClone(dropEquip);
            // 背包、日志分别使用独立拷贝对象，互不影响
            save.bag.push(equipClone);
            setSaveData(save);
            addDropLog(currentMonster.name, structuredClone(dropEquip));
        }

        // 异步进入下一波，避免同步阻塞
        setTimeout(() => {
            nextWaveOrStage();
            // 重启战斗定时器
            const newAttr = calcTotalAttr(save.baseAttr, save.equipWear);
            playerAttackTimer = setInterval(playerAttack, 1000 / newAttr.attackSpeed);
            monsterAttackTimer = setInterval(monsterAttack, 1000 / currentMonster.attackSpeed);
        }, 300);
    }
}

function monsterAttack() {
    if (!currentMonster || currentMonster.isDead || playerCurrentHp <= 0) return;

    const save = getSaveData();
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    const reduce = getDefDamageReduce(totalAttr.def);
    let damage = Math.floor(currentMonster.atk * (1 - reduce));
    damage = Math.max(1, damage);

    playerCurrentHp -= damage;
    addBattleLog(`【${currentMonster.name}】攻击你，造成 ${damage} 点伤害`);

    if (battleCallback) battleCallback({ type: "refreshPlayerHp", data: playerCurrentHp });

    if (playerCurrentHp <= 0) {
        playerDie();
    }
}

function playerDie() {
    stopBattleLoop();
    const save = getSaveData();
    save.currentWave = 1;
    setSaveData(save);
    addBattleLog(`你在第${save.currentStage}关阵亡，5秒后从本关卡第1波重新挑战...`);

    setTimeout(() => {
        const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
        playerCurrentHp = totalAttr.hp;
        spawnMonster();
        startBattleLoop();
    }, 5000);
}

function nextWaveOrStage() {
    const save = getSaveData();
    // 当前波数+1
    save.currentWave += 1;
    // 5波打完通关，进入下一关第1波
    if (save.currentWave > 5) {
        save.currentStage += 1;
        save.currentWave = 1;
        addBattleLog(`恭喜通关第${save.currentStage - 1}关，自动挑战第${save.currentStage}关！`);
    }
    setSaveData(save);
    
    // 每一波胜利，角色血量回满
    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    playerCurrentHp = totalAttr.hp;
    addBattleLog(`本波怪物已清理完毕，角色血量已完全恢复！`);

    // 关键：同步刷新玩家血条UI，不然页面不会显示满血
    if (battleCallback) {
        battleCallback({
            type: "refreshPlayerHp",
            data: playerCurrentHp
        });
    }

    spawnMonster();
}

export function startBattleLoop() {
    stopBattleLoop();
    const save = getSaveData();
    save.isBattleRunning = true;
    setSaveData(save);

    const totalAttr = calcTotalAttr(save.baseAttr, save.equipWear);
    playerCurrentHp = totalAttr.hp;
    spawnMonster();

    playerAttackTimer = setInterval(playerAttack, 1000 / totalAttr.attackSpeed);
    monsterAttackTimer = setInterval(monsterAttack, 1000 / currentMonster.attackSpeed);
}

export function stopBattleLoop() {
    if (playerAttackTimer) clearInterval(playerAttackTimer);
    if (monsterAttackTimer) clearInterval(monsterAttackTimer);
    playerAttackTimer = null;
    monsterAttackTimer = null;

    const save = getSaveData();
    save.isBattleRunning = false;
    setSaveData(save);
}

export function getPlayerCurrentHp() {
    return playerCurrentHp;
}

export function getCurrentMonster() {
    return currentMonster;
}