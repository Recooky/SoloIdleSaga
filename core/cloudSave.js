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
// 自动云存档定时器
let autoSaveTimer = null;
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
            alert(`离线挂机结算完成！
离线时长：${offlineResult.hour}小时
共获得 ${offlineResult.equipList.length} 件装备，已存入背包`);
        }
    } catch (err) {
        console.error("【离线结算异常】结算失败，跳过结算直接启动战斗：", err);
    }

    // 校验战斗函数是否存在并启动
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
function startAutoCloudSave() {
  if (autoSaveTimer) clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    try {
      const saveData = getSaveData();
      const now = new Date();
      const { data: existSave } = await supabaseClient
        .from("game_save")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      let res;
      if (existSave) {
        res = await supabaseClient
          .from("game_save")
          .update({
            save_data: saveData,
            last_upload_at: now
          })
          .eq("user_id", user.id);
      } else {
        res = await supabaseClient
          .from("game_save")
          .insert([{
            user_id: user.id,
            save_data: saveData,
            last_upload_at: now
          }]);
      }
      if (!res.error) {
        document.getElementById("editLastSaveTime").innerText = now.toLocaleString();
      }
    } catch (err) {
      console.error("自动存档失败：", err);
    }
  }, 60 * 1000);
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
    await autoLoadCloudSaveAfterLogin();

    // 调用公共方法：离线结算+自动挂机
    doOfflineSettleAndAutoBattle();
    // 启动每分钟云存档
    startAutoCloudSave();
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
    // 已有登录会话，调用公共方法结算离线+自动挂机+开启云存档
    doOfflineSettleAndAutoBattle();
    startAutoCloudSave();
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
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    document.getElementById("editLastSaveTime").innerText = "未登录";
    return;
  }
  const { data } = await supabaseClient
    .from("game_save")
    .select("last_upload_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data?.last_upload_at) {
    document.getElementById("editLastSaveTime").innerText = new Date(data.last_upload_at).toLocaleString();
  } else {
    document.getElementById("editLastSaveTime").innerText = "暂无云端备份";
  }
}

/**
 * 自动加载云端存档
 */
async function autoLoadCloudSaveAfterLogin() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  const { data } = await supabaseClient
    .from("game_save")
    .select("save_data")
    .eq("user_id", user.id)
    .maybeSingle();
  if (data?.save_data) {
    setSaveData(data.save_data);
    refreshCharacterPanel();
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