import {getSaveData,setSaveData,initLocalSave,calcOfflineReward,claimOfflineReward,updateOfflineTime} from "./core/saveManager.js";
import {calcTotalAttr} from "./core/attrCalculator.js";
import {initBattleCallback,startBattleLoop,stopBattleLoop,clearBattleLog,getPlayerCurrentHp,getCurrentMonster} from "./core/battleEngine.js";
import {loginAccount,getLocalCloudAccount,getCloudSlots,uploadSaveToSlot,downloadSaveFromSlot,logoutAccount} from "./core/cloudSave.js";
import {POSITION_NAME} from "./config/gameConfig.js";

// ================= 全局变量 =================
let currentTab = "battle";
let battleTimer = null;
let bagRefreshTimer = null;
let cloudAccountInfo = null;
let currentSelectSlot = 0;
// 批量销毁用户筛选记忆
let batchFilterCache = JSON.parse(localStorage.getItem("batch_destroy_filter")) || {
    minIlvl: 1,
    maxIlvl: 10,
    qualityList: []
};
// 品质映射（名称+样式类+显示文字颜色）
const QUALITY_MAP = [
    {key:"普通", className:"rarity-normal", label:"普通(灰色)"},
    {key:"优秀", className:"rarity-fine", label:"优秀(绿色)"},
    {key:"稀有", className:"rarity-rare", label:"稀有(蓝色)"},
    {key:"史诗", className:"rarity-epic", label:"史诗(紫色)"},
    {key:"传说", className:"rarity-legend", label:"传说(橙色)"},
    {key:"神话", className:"rarity-myth", label:"神话(红色)"},
    {key:"至臻", className:"rarity-cosmic", label:"至臻(金色)"}
];

// 战斗DOM
const stageInfoDom = document.getElementById("stageInfo");
const waveInfoDom = document.getElementById("waveInfo");
const playerHpBar = document.getElementById("playerHpBar");
const monsterNameDom = document.getElementById("monsterName");
const monsterHpBar = document.getElementById("monsterHpBar");
const battleLogDom = document.getElementById("battleLog");
const dropLogDom = document.getElementById("dropLog");
const startBattleBtn = document.getElementById("startBattleBtn");
const stopBattleBtn = document.getElementById("stopBattleBtn");

// 角色背包DOM
const attrWrap = document.getElementById("attrWrap");
const equipGrid = document.getElementById("equipGrid");
const bagGrid = document.getElementById("bagGrid");
const bagCountDom = document.getElementById("bagCount");

// 云存档DOM
const loginShowDom = document.getElementById("loginShow");
const saveSlotSelect = document.getElementById("saveSlotSelect");
const uploadSaveBtn = document.getElementById("uploadSaveBtn");
const downloadSaveBtn = document.getElementById("downloadSaveBtn");
const lastCloudSaveTimeDom = document.getElementById("lastCloudSaveTime");
const loginModal = document.getElementById("loginModal");
const accInput = document.getElementById("accInput");
const pwdInput = document.getElementById("pwdInput");
const loginSubmitBtn = document.getElementById("loginSubmit");




// ================= 初始化 =================
initLocalSave();
bindTabEvent();
bindCloudEvent();
bindBattleEvent();
initBattleCallback(onBattleUpdate);
checkOfflineReward();
refreshCloudUI();
// 背包每秒轮询刷新
bagRefreshTimer = setInterval(refreshCharacterPanel,1000);

// 页面关闭保存离线时间
window.addEventListener("beforeunload",()=>{
    updateOfflineTime();
    if(battleTimer) clearInterval(battleTimer);
    if(bagRefreshTimer) clearInterval(bagRefreshTimer);
});

// ================= Tab切换 =================
function bindTabEvent(){
    document.querySelectorAll(".tab-btn").forEach(btn=>{
        btn.addEventListener("click",()=>{
            const tab = btn.dataset.tab;
            currentTab = tab;
            document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
            document.getElementById(`tab-${tab}`).classList.add("active");
        });
    });
}

// ================= 云存档绑定 =================
function bindCloudEvent(){
    cloudAccountInfo = getLocalCloudAccount();
    if(!cloudAccountInfo){
        loginModal.style.display = "flex";
    }else{
        loginShowDom.textContent = `账号：${cloudAccountInfo.account}`;
        renderLastSaveTime();
    }

    // 登录
    loginSubmitBtn.onclick = ()=>{
        const acc = accInput.value.trim();
        const pwd = pwdInput.value.trim();
        if(!acc||!pwd){
            alert("账号密码不能为空");
            return;
        }
        const res = loginAccount(acc,pwd);
        if(res.success){
            cloudAccountInfo = getLocalCloudAccount();
            loginShowDom.textContent = `账号：${acc}`;
            loginModal.style.display = "none";
            alert("登录成功");
            renderLastSaveTime();
        }else{
            alert(res.msg);
        }
    };

    // 存档下拉切换
    saveSlotSelect.onchange = ()=>{
        currentSelectSlot = parseInt(saveSlotSelect.value);
        renderLastSaveTime();
    };

    // 上传存档
    uploadSaveBtn.onclick = ()=>{
        if(!cloudAccountInfo){
            alert("请先登录账号");
            loginModal.style.display = "flex";
            return;
        }
        const save = getSaveData();
        const res = uploadSaveToSlot(currentSelectSlot,save);
        alert(res.msg);
        renderLastSaveTime();
    };

    // 下载存档
    downloadSaveBtn.onclick = ()=>{
        if(!cloudAccountInfo){
            alert("请先登录账号");
            loginModal.style.display = "flex";
            return;
        }
        const res = downloadSaveFromSlot(currentSelectSlot);
        alert(res.msg);
        if(res.success){
            location.reload();
        }
    };
}

// 渲染当前存档位上次保存时间
function renderLastSaveTime(){
    if(!cloudAccountInfo){
        lastCloudSaveTimeDom.textContent = "未登录";
        return;
    }
    const slots = getCloudSlots().slots;
    const slotData = slots[currentSelectSlot];
    if(!slotData){
        lastCloudSaveTimeDom.textContent = "暂无存档";
    }else{
        const date = new Date(slotData.time);
        lastCloudSaveTimeDom.textContent = date.toLocaleString();
    }
}

function refreshCloudUI(){
    currentSelectSlot = parseInt(saveSlotSelect.value);
    renderLastSaveTime();
}

// ================= 战斗绑定 =================
function bindBattleEvent(){
    const save = getSaveData();
    refreshBattleUI();
    refreshButtonStatus(save.isBattleRunning);

    startBattleBtn.onclick = ()=>{
        clearBattleLog();
        startBattleLoop();
        refreshButtonStatus(true);
    };
    stopBattleBtn.onclick = ()=>{
        stopBattleLoop();
        refreshButtonStatus(false);
    };
}

function refreshButtonStatus(isRunning){
    startBattleBtn.disabled = isRunning;
    stopBattleBtn.disabled = !isRunning;
}

function refreshBattleUI(){
    const save = getSaveData();
    stageInfoDom.textContent = `当前关卡：${save.currentStage}/120`;
    waveInfoDom.textContent = `当前波次：${save.currentWave}/5`;
}

function onBattleUpdate(res){
    const save = getSaveData();
    switch(res.type){
        case "refreshMonster":
            refreshBattleUI();
            const monster = res.data;
            monsterNameDom.textContent = monster.name;
            monsterHpBar.style.width = (monster.hp/monster.maxHp*100)+"%";
            break;
        case "refreshPlayerHp":
            const totalAttr = calcTotalAttr(save.baseAttr,save.equipWear);
            playerHpBar.style.width = (res.data/totalAttr.hp*100)+"%";
            break;
        case "battleLog":
            const battleList = res.data.slice().reverse();
            battleLogDom.innerHTML = battleList.map(item=>`<div class="log-item">${item}</div>`).join("");
            break;
        case "dropLog":
            const dropList = res.data.slice().reverse();
            dropLogDom.innerHTML = dropList.map(item=>{
                const cls = window.getRarityClass(item.equip?.rarityName)||"";
                return `<div class="log-item ${cls}">${item.monsterName} 掉落【${item.equip.name}】</div>`;
            }).join("");
            break;
    }
}

// 离线收益
function checkOfflineReward(){
    const reward = calcOfflineReward();
    if(reward.offlineHour>0.01){
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
        <div class="modal-box">
            <h3>离线挂机收益</h3>
            <p>离线时长：${reward.offlineHour.toFixed(2)}小时</p>
            <p>挂机关卡：第${reward.currentIlvl}关</p>
            <button id="claimBtn">一键领取</button>
        </div>`;
        document.body.appendChild(modal);
        document.getElementById("claimBtn").onclick = ()=>{
            claimOfflineReward();
            modal.remove();
        };
    }
}

// ================= 角色背包实时刷新 =================
function refreshCharacterPanel(){
    const save = getSaveData();
    renderAttrPanel(save);
    renderWearEquip(save);
    renderBagPanel(save);
}

function renderAttrPanel(save){
    const attr = calcTotalAttr(save.baseAttr,save.equipWear);
    const list = [
        {label:"最大生命值",value:attr.hp},
        {label:"攻击力",value:attr.atk},
        {label:"护甲",value:attr.def},
        {label:"攻击速度",value:attr.attackSpeed+" 次/秒"},
        {label:"暴击率",value:(attr.critRate*100).toFixed(2)+"%"},
        {label:"暴击伤害",value:(attr.critDamage*100).toFixed(0)+"%"}
    ];
    attrWrap.innerHTML = list.map(item=>`
        <div class="attr-item">
            <span>${item.label}</span>
            <span>${item.value}</span>
        </div>`).join("");
}

function renderWearEquip(save){
    equipGrid.querySelectorAll(".equip-slot").forEach(slot=>{
        const pos = slot.dataset.pos;
        const equip = save.equipWear[pos];
        if(equip){
            const cls = window.getRarityClass(equip?.rarityName)||"";
            slot.className = `equip-slot has-equip ${cls}`;
            slot.innerHTML = `<div>${equip.name}</div><div>Lv.${equip.equipLv}</div>`;
            slot.onclick = ()=>{
                save.equipWear[pos] = null;
                save.bag.push(structuredClone(equip));
                setSaveData(save);
                refreshCharacterPanel();
            };
        }else{
            slot.className = "equip-slot";
            slot.innerHTML = POSITION_NAME[pos];
            slot.onclick = null;
        }
    });
}

function renderBagPanel(save){
    bagCountDom.textContent = `(${save.bag.length}件)`;
    bagGrid.innerHTML = "";
    save.bag.forEach((equip,idx)=>{
        const cls = window.getRarityClass(equip?.rarityName)||"";
        const div = document.createElement("div");
        div.className = `bag-item ${cls}`;
        div.innerHTML = `${equip.name}<br>Lv.${equip.equipLv}`;
        div.onclick = ()=>showEquipTip(save,equip,idx);
        bagGrid.appendChild(div);
    });
}

// ================= 装备弹窗 =================// 
function showEquipTip(save,equip,idx){
    const oldModal = document.querySelector(".equip-tip-modal");
    if(oldModal) oldModal.remove();
    const cls = window.getRarityClass(equip?.rarityName)||"";
    // 获取当前部位已穿戴装备
    const currentWearEquip = save.equipWear[equip.position];

    // 基础属性格式化
    let baseStr = "";
    Object.entries(equip.baseAttr).forEach(([k,v])=>{
        if(k==="hp") baseStr += `最大生命值 +${v}<br>`;
        if(k==="atk") baseStr += `攻击力 +${v}<br>`;
        if(k==="def") baseStr += `护甲 +${v}<br>`;
        if(k==="critRate") baseStr += `暴击率 +${(v*100).toFixed(2)}%<br>`;
        if(k==="critDmg") baseStr += `暴击伤害 +${(v*100).toFixed(2)}%<br>`;
    });

    // 词条属性美化
    let affixStr = "";
    equip.affixes.forEach(aff=>{
        let val = aff.type.startsWith("percent") ? (aff.value*100).toFixed(2)+"%" : aff.value;
        affixStr += `<span style="color:#a5f3fc">T${aff.tier}</span> ${aff.name} +${val}<br>`;
    });
    // 无词条固定显示【随机词条】+内容写无
    const equipAffixHtml = `<p><strong>【随机词条】</strong><br>${equip.affixes.length ? affixStr : "无"}</p>`;

    // 已穿戴装备面板HTML
    let wearPanelHtml = "";
    if(currentWearEquip){
        const wearCls = window.getRarityClass(currentWearEquip?.rarityName)||"";
        let wearBase = "";
        Object.entries(currentWearEquip.baseAttr).forEach(([k,v])=>{
            if(k==="hp") wearBase += `生命值 +${v}<br>`;
            if(k==="atk") wearBase += `攻击力 +${v}<br>`;
            if(k==="def") wearBase += `护甲 +${v}<br>`;
            if(k==="critRate") wearBase += `暴击率 +${(v*100).toFixed(2)}%<br>`;
            if(k==="critDmg") wearBase += `暴伤 +${(v*100).toFixed(2)}%<br>`;
        });
        let wearAffix = "";
        currentWearEquip.affixes.forEach(aff=>{
            let val = aff.type.startsWith("percent") ? (aff.value*100).toFixed(2)+"%" : aff.value;
            wearAffix += `<span style="color:#a5f3fc">T${aff.tier}</span> ${aff.name} +${val}<br>`;
        });
        // 左侧词条固定标签，无则显示无
        const wearAffixHtml = `<p><strong>【随机词条】</strong><br>${currentWearEquip.affixes.length ? wearAffix : "无"}</p>`;

        wearPanelHtml = `
        <div class="wear-equip-panel">
            <h4 class="${wearCls}">${currentWearEquip.rarityName} · ${currentWearEquip.name}<span class="wear-tag">穿戴中</span></h4>
            <p>装备等级：${currentWearEquip.ilvl}</p>
            <p><strong>基础属性</strong><br>${wearBase}</p>
            ${wearAffixHtml}
        </div>
        `;
    }else{
        wearPanelHtml = `
        <div class="wear-equip-panel empty-wear">
            <p>当前部位暂无穿戴装备</p>
        </div>
        `;
    }

    const modal = document.createElement("div");
    modal.className = "equip-tip-modal";
    modal.innerHTML = `
    <div class="equip-tip-box equip-compare-wrap">
        ${wearPanelHtml}
        <div class="select-equip-panel">
            <h3 class="${cls}">${equip.rarityName} · ${equip.name}</h3>
            <p>装备等级：${equip.ilvl}</p>
            <p><strong>【基础属性】</strong><br>${baseStr}</p>
            ${equipAffixHtml}
        </div>
        <div class="tip-btn-group">
            <button class="tip-btn btn-close" id="destroyBtn">销毁装备</button>    
            <button class="tip-btn btn-wear" id="wearBtn">立即穿戴</button>
            <button class="tip-btn btn-close" id="closeTip">关闭</button>
        </div>
    </div>`;
    document.body.appendChild(modal);

    // 关闭弹窗
    document.getElementById("closeTip").onclick = ()=>modal.remove();

    // 穿戴装备
    document.getElementById("wearBtn").onclick = ()=>{
        const old = save.equipWear[equip.position];
        if(old) save.bag.push(structuredClone(old));
        save.equipWear[equip.position] = structuredClone(equip);
        save.bag.splice(idx,1);
        setSaveData(save);
        modal.remove();
        refreshCharacterPanel();
    };

    // 销毁装备
    document.getElementById("destroyBtn").onclick = () => {
            // 从背包数组删除当前装备
            save.bag.splice(idx, 1);
            setSaveData(save);
            modal.remove();
            // 刷新背包面板
            refreshCharacterPanel();
        
    };
}

// ================= 批量销毁 =================//
const batchDestroyBtn = document.getElementById("batchDestroyBtn");
batchDestroyBtn.onclick = openBatchDestroyModal;

// 打开批量销毁弹窗
function openBatchDestroyModal(){
    // 移除旧弹窗
    const oldModal = document.querySelector(".batch-modal");
    if(oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.className = "batch-modal";

    // 渲染多选品质框
    let qualityHtml = "";
    QUALITY_MAP.forEach(item=>{
        const checked = batchFilterCache.qualityList.includes(item.key) ? "checked" : "";
        qualityHtml += `
        <div class="quality-check-item">
            <input type="checkbox" value="${item.key}" ${checked}>
            <span class="${item.className}">${item.label}</span>
        </div>
        `;
    });

    modal.innerHTML = `
    <div class="batch-box">
        <h3>批量销毁装备</h3>
        <div class="form-item">
            <label>物品等级范围</label>
            <div class="ilvl-range">
                <input type="number" id="minIlvl" value="${batchFilterCache.minIlvl}" min="1">
                ~
                <input type="number" id="maxIlvl" value="${batchFilterCache.maxIlvl}" min="1">
            </div>
        </div>
        <div class="form-item">
            <label>选择装备品质（可多选）</label>
            <div class="quality-check-group">
                ${qualityHtml}
            </div>
        </div>
        <div class="batch-btn-wrap">
            <button class="tip-btn btn-close" id="confirmBatchDestroy">确定销毁</button>
            <button class="tip-btn btn-close" id="closeBatchModal">取消</button>
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    // 取消关闭
    document.getElementById("closeBatchModal").onclick = ()=>modal.remove();

    // 确认批量销毁
    document.getElementById("confirmBatchDestroy").onclick = ()=>{
        const minIlvl = parseInt(document.getElementById("minIlvl").value) || 1;
        const maxIlvl = parseInt(document.getElementById("maxIlvl").value) || 10;
        if(minIlvl > maxIlvl){
            alert("最小等级不能大于最大等级");
            return;
        }

        // 获取选中品质
        const checkInputs = modal.querySelectorAll(".quality-check-item input:checked");
        const selectQuality = Array.from(checkInputs).map(el=>el.value);

        // 保存用户筛选配置，下次打开记忆
        batchFilterCache = {
            minIlvl,
            maxIlvl,
            qualityList: selectQuality
        };
        localStorage.setItem("batch_destroy_filter", JSON.stringify(batchFilterCache));

        // 筛选背包装备
        const save = getSaveData();
        const newBag = save.bag.filter(equip=>{
            // 等级不在范围内 保留
            if(equip.ilvl < minIlvl || equip.ilvl > maxIlvl) return true;
            // 没有勾选任何品质 不销毁
            if(selectQuality.length === 0) return true;
            // 选中的品质才销毁
            return !selectQuality.includes(equip.rarityName);
        });

        // 覆盖背包
        save.bag = newBag;
        setSaveData(save);
        modal.remove();
        refreshCharacterPanel();
    };
}