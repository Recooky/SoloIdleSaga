// Supabase配置
const SUPABASE_URL = "https://ubkwwcuzzxyoobblloqj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVia3d3Y3V6enh5b29iYmxsb3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTAzODEsImV4cCI6MjA5Nzk2NjM4MX0.xMtpUO4OqRh-2Cib8iB_V7zUiERGDtn6Mg3D8s5ilK8";

let supabaseClient = null;

try {
  if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn('Supabase SDK 加载失败，云功能不可用');
  }
} catch (e) {
  console.error('Supabase 初始化异常：', e);
}

let currentUser = null;
window.currentUser = currentUser; 
let isRegisterMode = false;
let modalInited = false;
// 新增：防止离线结算+自动挂机重复执行
let autoBattleExecuted = false;



// 错误码中文翻译表
const errorZhMap = {
  "invalid_credentials": "邮箱或密码错误，请检查账号信息",
  "email_exists": "该邮箱已注册，请直接登录",
  "email_not_confirmed": "邮箱尚未验证，请前往邮箱点击验证链接",
  "over_email_send_rate_limit": "邮箱发送频率超限，请等待1小时后重试",
  "email_rate_limit_exceeded": "邮箱发送频率超限，请等待1小时后重试",
  "weak_password": "密码强度太弱，建议包含大小写、数字",
  "password_too_short": "密码长度不能少于6位",
  "invalid_email": "邮箱格式不正确，请输入合法邮箱",
  "user_already_registered": "该邮箱已经注册过账号",
  "too_many_requests": "请求过于频繁，请稍后再试"
};

// 错误翻译工具函数
function getZhErrorMessage(error) {
  if (!error) return "未知错误，请稍后重试";
  if (error.code && errorZhMap[error.code]) {
    return errorZhMap[error.code];
  }
  const msg = error.message || "";
  if (msg.includes("rate limit exceeded")) return "邮箱发送频率超限，请等待1小时后重试";
  if (msg.includes("already registered")) return "该邮箱已注册，请直接登录";
  if (msg.includes("Invalid login credentials")) return "邮箱或密码错误，请检查账号信息";
  if (msg.includes("Email not confirmed")) return "邮箱尚未验证，请先去邮箱完成验证";
  return msg;
}

/**
 * 公共方法：离线收益结算 + 自动开启挂机
 * 新增try-catch防止离线结算异常阻塞自动战斗 + 防重复执行
 */
function doOfflineSettleAndAutoBattle() {
    if (autoBattleExecuted) {
        console.log("【提示】离线结算&自动挂机已执行过，跳过本次重复调用");
        return;
    }
    autoBattleExecuted = true;

    console.log("【流程】开始执行离线结算与自动挂机");
    try {
        const offlineResult = claimOfflineReward();
        console.log("【离线结算结果】", offlineResult);
        if (offlineResult.equipList.length > 0) {
            alert(`离线挂机结算完成！\n离线时长：${offlineResult.hour}小时\n共获得 ${offlineResult.equipList.length} 件装备，已存入背包`);
        }
    } catch (err) {
        console.error("【离线结算异常】结算失败，跳过结算直接启动战斗：", err);
    }

    // ===== 新增：清理残留战斗状态，避免卡死误判 =====
    const save = getSaveData();
    if (save.isBattleRunning) {
        console.log("【清理】发现上次战斗残留状态，手动停止...");
        if (typeof stopBattleLoop === "function") {
            stopBattleLoop();   // 停止可能的定时器（即使不存在也不会报错）
        }
        save.isBattleRunning = false;
        setSaveData(save);
    }
    // ================================================

    if (typeof startBattleLoop === "function") {
        console.log("【流程】准备调用startBattleLoop启动挂机");
        startBattleLoop();
        console.log("【流程】挂机战斗已成功发起");
    } else {
        console.error("错误：startBattleLoop 全局函数不存在，请检查JS引入顺序和battleEngine全局挂载");
    }
}

/**
 * 启动每分钟自动云存档（仅登录用户生效）
 */
let autoSyncTimer = null;

function startAutoSync() {
    if (autoSyncTimer) clearInterval(autoSyncTimer);
    if (!supabaseClient) return;

    // 每分钟自动上传一次本地存档到云端
    autoSyncTimer = setInterval(async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;
        await syncLocalToCloudInternal();
    }, 60000);
}

// 初始化登录弹窗事件只执行一次
function initLoginModal() {
  if (modalInited) return;
  modalInited = true;

  const modal = document.getElementById("loginModal");
  const title = document.getElementById("modalTitle");
  const submitBtn = document.getElementById("submitBtn");
  const switchBtn = document.getElementById("switchBtn");
  const errorTip = document.getElementById("errorTip");
  const emailInput = document.getElementById("loginEmail");
  const pwdInput = document.getElementById("loginPwd");

  // 切换登录注册
  switchBtn.onclick = () => {
    isRegisterMode = !isRegisterMode;
    errorTip.style.display = "none";
    if (isRegisterMode) {
      title.innerText = "账号注册";
      submitBtn.innerText = "立即注册";
      switchBtn.innerText = "已有账号？去登录";
    } else {
      title.innerText = "账号登录";
      submitBtn.innerText = "登录";
      switchBtn.innerText = "没有账号？去注册";
    }
  };

  // 提交登录/注册（增加请求置灰防重复提交）
  submitBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = pwdInput.value.trim();
    errorTip.style.display = "none";

    if (!email) {
      errorTip.innerText = "请输入邮箱地址";
      errorTip.style.display = "block";
      return;
    }
    if (!password) {
      errorTip.innerText = "请输入登录密码";
      errorTip.style.display = "block";
      return;
    }
    if (password.length < 6) {
      errorTip.innerText = "密码长度至少6位";
      errorTip.style.display = "block";
      return;
    }

    // 请求发起：所有输入框、按钮置灰禁用
    emailInput.disabled = true;
    pwdInput.disabled = true;
    submitBtn.disabled = true;
    switchBtn.disabled = true;
    submitBtn.style.opacity = "0.6";
    switchBtn.style.opacity = "0.6";

    let result;
    if (isRegisterMode) {
      result = await supabaseClient.auth.signUp({ email, password });
    } else {
      result = await supabaseClient.auth.signInWithPassword({ email, password });
    }

    const { data, error } = result;

    // 请求结束：恢复控件可交互
    emailInput.disabled = false;
    pwdInput.disabled = false;
    submitBtn.disabled = false;
    switchBtn.disabled = false;
    submitBtn.style.opacity = "1";
    switchBtn.style.opacity = "1";

    if (error) {
      errorTip.innerText = getZhErrorMessage(error);
      errorTip.style.display = "block";
      return;
    }

    // 刷新最新用户信息
    const { data: userRes } = await supabaseClient.auth.getUser();
    currentUser = userRes.user;
    updateAccountDisplay();

    modal.style.display = "none";
    emailInput.value = "";
    pwdInput.value = "";

    await initCloudSaveTime();
    await window.syncCloudToLocal();
    doOfflineSettleAndAutoBattle();
    startAutoSync();
  };
}

/**
 * 检查登录：已登录直接放行，仅未登录才弹出登录窗口
 */
async function checkLogin() {
  if (currentUser) {
    return true;
  }
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    currentUser = user;
    updateAccountDisplay();
    // 已登录用户 → 先拉取云端存档覆盖本地
    await window.syncCloudToLocal();   
    doOfflineSettleAndAutoBattle();
    startAutoSync();                  
    return true;
  }

  initLoginModal();
  document.getElementById("loginModal").style.display = "flex";
  return false;
}


/**
 * 初始化存档时间
 */
async function initCloudSaveTime() {
  const saveTimeEl = document.getElementById("editLastSaveTime");
  if (!saveTimeEl) return;  // 元素不存在则直接跳过，不报错

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    saveTimeEl.innerText = "未登录";
    return;
  }
  const { data } = await supabaseClient
    .from("game_save")
    .select("last_upload_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data?.last_upload_at) {
    saveTimeEl.innerText = new Date(data.last_upload_at).toLocaleString();
  } else {
    saveTimeEl.innerText = "暂无云端备份";
  }
}

/**
 * 更新账号展示
 */
function updateAccountDisplay() {
  const userInfoDoms = document.querySelectorAll("#loginAccountShow");
  if (!userInfoDoms.length) return;
  const displayText = currentUser 
    ? (getSaveData().nickname || currentUser.email?.split("@")[0] || "未登录")
    : "未登录";
  userInfoDoms.forEach(dom => { dom.innerText = displayText; });
}

/**
 * 请求一次单向同步：将本地存档上传到云端（被动调用，由 saveManager.setSaveData 触发）
 * 避免与自动定时器冲突，只做上传，不做拉取。
 */
window.requestCloudSync = async function() {
    if (!supabaseClient || !supabaseClient.auth) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await syncLocalToCloudInternal();
};

/**
 * 内部上传函数（可被定时器或手动调用）
 */
async function syncLocalToCloudInternal() {
    const localData = getLocalSaveData();
    const user = (await supabaseClient.auth.getUser()).data.user;
    if (!user) return;

    const { data: rows } = await supabaseClient
      .from("game_save")
      .select("id")
      .eq("user_id", user.id);

    const timestamp = new Date().toISOString();
    let result;
    if (rows && rows.length > 0) {
        result = await supabaseClient
            .from("game_save")
            .update({ save_data: localData, last_upload_at: timestamp })  // ← updated_at → last_upload_at
            .eq("user_id", user.id);
    } else {
        result = await supabaseClient
            .from("game_save")
            .insert([{ user_id: user.id, save_data: localData, last_upload_at: timestamp }]);  // ← 同上
    }

    if (result && result.error) {
        console.error("☁️ 上传失败:", result.error);
    } else {
        console.log("☁️ 本地存档已上传");
    }
}

/**
 * 从云端拉取最新存档并覆盖本地（用于切换设备首次同步、登录后同步）
 */
window.syncCloudToLocal = async function() {
    if (!supabaseClient || !supabaseClient.auth) return false;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;

    const { data: rows, error } = await supabaseClient
      .from("game_save")
      .select("save_data")          // 只取 save_data，不再取不存在的 updated_at
      .eq("user_id", user.id)
      .limit(1);

    if (error) {
        console.error("☁️ 同步下载失败:", error);
        return false;
    }
    if (!rows || rows.length === 0) return false;
    
    const cloudSave = rows[0].save_data;
    if (!cloudSave) return false;

    setLocalSaveData(cloudSave);
    console.log("☁️ 已从云端拉取存档覆盖本地");
    return true;
};

// ===== 手动上传存档（供账号设置弹窗的按钮调用） =====
window.manualUploadSave = async function() {
    if (!supabaseClient || !supabaseClient.auth) {
        showToast('☁️ 云服务未就绪，无法上传', 2000);
        return false;
    }
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showToast('⚠️ 请先登录账号再上传', 2000);
        return false;
    }

    // 上传前先停一下战斗（避免上传途中存档被改写），但可以不严格停下，因为同步只是一瞬间
    // 直接调用内部上传
    await syncLocalToCloudInternal();

    // 更新弹窗中的最后云存档时间
    const saveTimeEl = document.getElementById('editLastSaveTime');
    if (saveTimeEl) {
        saveTimeEl.innerText = new Date().toLocaleString();
    }

    showToast('☁️ 上传存档成功！', 2000);
    return true;
};