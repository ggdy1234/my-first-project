/* ============================================
   WorkBuddy · 水系温柔成长伙伴
   全部交互逻辑 + 内置题库 + 黄历库
   ============================================ */

(function () {
  "use strict";

  // ---------- 工具函数 ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const now = () => new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayKey = () => {
    const d = now();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const monthKey = () => {
    const d = now();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  };
  const get = (k, fb) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; }
  };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- 时段配色 ----------
  function applyTheme() {
    const h = now().getHours();
    let t = "morning";
    if (h >= 5 && h < 9) t = "morning-early";
    else if (h >= 9 && h < 12) t = "morning";
    else if (h >= 12 && h < 18) t = "afternoon";
    else if (h >= 18 && h < 21) t = "evening";
    else t = "night";
    document.body.dataset.theme = t;
  }

  // ---------- 日期/问候 ----------
  const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  function updateDate() {
    const d = now();
    const ds = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
    $("#current-date").textContent = ds;
    const h = d.getHours();
    let g = "夜深了 🌙";
    if (h >= 5 && h < 11) g = "早安 ☀️";
    else if (h >= 11 && h < 14) g = "午安 🌤️";
    else if (h >= 14 && h < 18) g = "下午好 🌿";
    else if (h >= 18 && h < 22) g = "晚上好 🌆";
    $("#greeting-text").textContent = g;
  }

  // ---------- 引导页 ----------
  function checkGuide() {
    if (!get("guided", false)) {
      $("#guide-overlay").style.display = "flex";
    }
  }
  window.closeGuide = function () {
    $("#guide-overlay").style.display = "none";
    set("guided", true);
    // 引导第一件事
    const top3 = get("top3", []);
    if (top3.length === 0) {
      const item = prompt("先选今天最重要的一件事吧（一句话）：", "读 30 分钟书");
      if (item) {
        set("top3", [{ text: item, done: false, date: todayKey() }]);
        renderTop3();
      }
    }
  };

  // ---------- 鼓励语 ----------
  const ENCOURAGEMENTS = [
    "✨ 你比昨天更靠近梦想了。",
    "🌊 慢慢来，水流自有它的方向。",
    "🍃 不急，你已经做得很好了。",
    "💧 一滴水也能映出整片天空。",
    "🌸 今天照顾好自己，就是最大的成就。",
    "🐚 安静地坚持，比喧哗更有力量。",
    "🌿 每一小步，都是对自己的温柔承诺。",
    "🪷 像水一样，柔软但有方向。",
    "🌙 今天也辛苦了，允许自己休息。",
    "🍀 你已经走在路上了，别怕慢。",
    "🌊 潮汐有涨落，你也有节奏。",
    "🫧 不必完美，只要真实。",
    "🌸 今天值得被好好对待。",
    "💎 小小的坚持，会积成光。",
    "🧭 没有白走的路，每一步都算数。",
  ];
  function refreshEncouragement() {
    $("#encouragement-text").textContent = rand(ENCOURAGEMENTS);
  }

  // ---------- 黄历宜忌（2026 简化版，按月规律生成） ----------
  // 用确定性算法：根据日期算宜忌，保证可复现
  const YI_POOL = [
    "祭祀", "祈福", "嫁娶", "出行", "移徙", "入宅", "开市", "交易",
    "立券", "纳财", "牧养", "放水", "修造", "动土", "安门", "作灶",
    "安床", "沐浴", "剃头", "栽种", "捕捉", "纳采", "订盟", "会亲友",
    "求医", "赴任", "上官", "入学", "竖柱", "上梁", "破土", "安葬"
  ];
  const JI_POOL = [
    "动土", "破土", "安葬", "伐木", "修造", "安门", "作灶",
    "出行", "嫁娶", "入宅", "开市", "交易", "立券", "纳财",
    "栽种", "捕捉", "沐浴", "剃头", "赴任", "上官", "入学",
    "竖柱", "上梁", "祭祀", "祈福", "纳采", "订盟"
  ];
  function hashDate(d) {
    const s = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  function toLunar(d) {
    // 简化农历近似：仅用于显示，不保证精确闰月
    const lunarMonths = [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30];
    const base = new Date(2026, 0, 1);
    const diff = Math.floor((d - base) / 86400000);
    let day = diff + 12; // 2026-1-1 近似冬月廿三
    let month = 11;
    while (day > lunarMonths[month % 12]) {
      day -= lunarMonths[month % 12];
      month++;
    }
    const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const gan = GAN[(d.getFullYear() - 4) % 10];
    const zhi = ZHI[(d.getFullYear() - 4) % 12];
    return { month: (month % 12) + 1, day, ganZhi: gan + zhi + "年" };
  }
  function renderAlmanac() {
    const d = now();
    const h = hashDate(d);
    const yi = [], ji = [];
    for (let i = 0; i < 5; i++) yi.push(YI_POOL[(h >> i) % YI_POOL.length]);
    for (let i = 0; i < 4; i++) ji.push(JI_POOL[(h >> (i + 5)) % JI_POOL.length]);
    // 方位
    const DIRS = ["正东", "东南", "正南", "西南", "正西", "西北", "正北", "东北"];
    const喜 = DIRS[(h >> 2) % 8];
    const财 = DIRS[(h >> 4) % 8];
    const lunar = toLunar(d);
    const html = `
      <span class="almanac-date">${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 农历${lunar.ganZhi} ${lunar.month}月${lunar.day}日</span>
      <span class="almanac-suitable">宜 ${yi.join(" · ")}</span>
      <span class="almanac-avoid">忌 ${ji.join(" · ")}</span>
      <span class="almanac-date">喜神${喜} 财神${财}</span>
    `;
    $("#almanac-bar").innerHTML = html;
    // 联动建议
    const suggestion = $("#guide-question");
    if (suggestion) {
      if (yi.includes("出行")) suggestion.textContent = "今天宜出行，要不要把室外的事排在前面？";
      else if (ji.includes("出行")) suggestion.textContent = "今天宜宅家，适合读书、整理、静修。";
      else if (yi.includes("会亲友")) suggestion.textContent = "今天宜会亲友，要不要约一个人喝杯茶？";
      else if (yi.includes("求医")) suggestion.textContent = "今天宜关注身体，安排一次检查或早休息。";
      else suggestion.textContent = "今天慢慢来，先做那一件最重要的事。";
    }
  }

  // ---------- 生日提醒 ----------
  function checkBirthdays() {
    const list = get("birthdays", []);
    if (list.length === 0) return;
    const today = now();
    let nearest = null;
    for (const b of list) {
      const bd = new Date(b.date);
      const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      const diff = Math.ceil((thisYear - today) / 86400000);
      const adv = b.advanceDays || 3;
      if (diff >= 0 && diff <= adv) {
        if (!nearest || diff < nearest.diff) nearest = { ...b, diff };
      }
    }
    const bar = $("#birthday-bar");
    if (nearest) {
      const d = nearest.diff;
      let txt = "";
      if (d === 0) txt = `🎂 今天是${nearest.name}的生日，别忘了说一句生日快乐 💐`;
      else txt = `🎂 ${nearest.name}的生日还有 ${d} 天，可以提前准备礼物或问候 💐`;
      bar.innerHTML = `<span>${txt}</span> <button onclick="promptBirthdayMessage('${nearest.name}')" class="btn-small btn-primary">写一句</button>`;
      bar.style.display = "flex";
    } else {
      bar.style.display = "none";
    }
  }
  window.promptBirthdayMessage = function (name) {
    const msg = prompt(`想对${name}说一句什么？`, `生日快乐，愿你被温柔以待 🎂`);
    if (msg) {
      const msgs = get("birthday-messages", []);
      msgs.push({ name, msg, date: todayKey() });
      set("birthday-messages", msgs);
      alert("已保存，等那天发出去吧 💐");
    }
  };
  window.openBirthdayPanel = function () {
    renderBirthdayList();
    $("#birthday-modal").style.display = "flex";
  };
  window.closeBirthdayPanel = function () {
    $("#birthday-modal").style.display = "none";
  };
  window.addBirthday = function () {
    const name = $("#bd-name").value.trim();
    const date = $("#bd-date").value;
    const calType = $("#bd-calendar-type").value;
    const adv = parseInt($("#bd-advance").value) || 3;
    if (!name || !date) return alert("请填写姓名和日期");
    const list = get("birthdays", []);
    list.push({ name, date, calType, advanceDays: adv });
    set("birthdays", list);
    renderBirthdayList();
    checkBirthdays();
    $("#bd-name").value = "";
    $("#bd-date").value = "";
  };
  function renderBirthdayList() {
    const list = get("birthdays", []);
    const today = now();
    const html = list.map((b, i) => {
      const bd = new Date(b.date);
      const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      const diff = Math.ceil((thisYear - today) / 86400000);
      const dTxt = diff === 0 ? "🎂 今天！" : diff > 0 ? `还有 ${diff} 天` : `已过 ${Math.abs(diff)} 天`;
      return `<div class="birthday-item"><span>${b.name} · ${b.date}${b.calType === "lunar" ? "(农历)" : ""}</span><span class="${diff <= b.advanceDays && diff >= 0 ? "days-left" : ""}">${dTxt}</span><button onclick="delBirthday(${i})" class="btn-close">✕</button></div>`;
    }).join("");
    $("#birthday-list").innerHTML = html || '<p style="font-size:13px;color:var(--text-light)">还没有添加生日，点下面添加吧。</p>';
  }
  window.delBirthday = function (i) {
    const list = get("birthdays", []);
    list.splice(i, 1);
    set("birthdays", list);
    renderBirthdayList();
    checkBirthdays();
  };

  // ---------- 底部导航 ----------
  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const page = btn.dataset.page;
      $$(".page").forEach(p => p.classList.remove("active"));
      $("#page-" + page).classList.add("active");
      if (page === "home") { renderTop3(); renderTimeline(); renderMonthlySummary(); }
      if (page === "plan") { renderTasks(); renderHabits(); }
      if (page === "finance") { renderFinance(); renderSavingGoals(); renderTuition(); }
      if (page === "health") { renderWeightChart(); renderMoodChart(); renderSportCalendar(); }
      if (page === "review") { renderReviewMonthOptions(); renderLatestReview(); }
      if (page === "hot") renderHot();
    });
  });

  // ---------- 今日三件事 ----------
  function renderTop3() {
    const list = get("top3", []);
    const today = todayKey();
    // 自动重置非今天的
    const filtered = list.filter(t => t.date === today);
    set("top3", filtered);
    const html = filtered.map((t, i) => `
      <li>
        <div class="check ${t.done ? "done" : ""}" onclick="toggleTop3(${i})"></div>
        <span class="text ${t.done ? "done" : ""}">${t.text}</span>
      </li>`).join("");
    $("#top3-list").innerHTML = html || '<p style="font-size:13px;color:var(--text-light)">还没有添加，今天想完成哪三件事？</p>';
    const done = filtered.filter(t => t.done).length;
    $("#top3-progress").textContent = `${done}/${filtered.length || 3}`;
  }
  window.toggleTop3 = function (i) {
    const list = get("top3", []);
    list[i].done = !list[i].done;
    set("top3", list);
    renderTop3();
  };
  window.addTop3Item = function () {
    const v = prompt("添加一件今天想做的事：", "");
    if (!v) return;
    const list = get("top3", []);
    const today = todayKey();
    list.push({ text: v, done: false, date: today });
    set("top3", list);
    renderTop3();
  };

  // ---------- 今日时间轴 ----------
  function renderTimeline() {
    const d = now();
    const slots = [
      { time: "05:15", text: "读书（共读）", key: "read" },
      { time: "06:40", text: "敲胆经 + 八段锦", key: "exercise" },
      { time: "13:00", text: "做脸/美容", key: "beauty" },
      { time: "17:00", text: "练字", key: "write" },
      { time: "20:00", text: "呼啦圈力量训练", key: "workout" },
    ];
    const checkins = get("checkins", {});
    const today = todayKey();
    const html = slots.map(s => {
      const done = (checkins[today] || []).includes(s.key);
      return `<div class="timeline-item ${done ? "done" : ""}">${s.time} ${s.text}</div>`;
    }).join("");
    $("#timeline").innerHTML = html;
  }

  // ---------- 快捷打卡 ----------
  window.quickCheckin = function (type) {
    const today = todayKey();
    const checkins = get("checkins", {});
    const list = checkins[today] || [];
    if (!list.includes(type)) list.push(type);
    checkins[today] = list;
    set("checkins", checkins);
    // 按钮反馈
    event.target.classList.add("done");
    setTimeout(() => event.target.classList.remove("done"), 600);
    renderTimeline();
    renderMonthlySummary();
    // 引导对话
    const guide = $("#guide-question");
    if (guide) {
      const map = { "阅读": "读完了，要不要再来 10 分钟？", "喝水": "记得慢慢喝，别牛饮哦。", "存钱": "存下一笔，未来的你会感谢现在的你。", "运动": "动起来就赢了，做完记得拉伸。", "冥想": "深呼吸，把今天轻轻放下。" };
      guide.textContent = map[type] || "完成得好，接下来做点让自己舒服的事吧。";
    }
  };

  // ---------- 番茄钟 ----------
  let pomoTimer = null;
  let pomoLeft = 0;
  window.startPomodoro = function () {
    pomoLeft = 25 * 60;
    $("#pomo-time").textContent = "25:00";
    $("#pomo-btn").textContent = "⏸ 暂停";
    if (pomoTimer) clearInterval(pomoTimer);
    pomoTimer = setInterval(() => {
      pomoLeft--;
      const m = pad(Math.floor(pomoLeft / 60));
      const s = pad(pomoLeft % 60);
      $("#pomo-time").textContent = `${m}:${s}`;
      if (pomoLeft <= 0) {
        clearInterval(pomoTimer);
        pomoTimer = null;
        $("#pomo-toast-text").textContent = "⏰ 专注结束，起来喝口水吧 💧";
        $("#pomo-toast").style.display = "block";
        setTimeout(() => $("#pomo-toast").style.display = "none", 4000);
        $("#pomo-btn").textContent = "开始专注";
      }
    }, 1000);
  };

  // ---------- 本月微摘要 ----------
  function renderMonthlySummary() {
    const mk = monthKey();
    const all = get("checkins", {});
    const tasks = get("tasks", []);
    let doneCount = 0, totalCount = 0;
    Object.keys(all).filter(k => k.startsWith(mk)).forEach(k => { doneCount += all[k].length; });
    tasks.filter(t => t.date && t.date.startsWith(mk)).forEach(t => { totalCount++; if (t.done) doneCount++; });
    const moods = get("moods", {});
    let moodDays = 0;
    Object.keys(moods).filter(k => k.startsWith(mk)).forEach(() => moodDays++);
    const sport = get("sport", []);
    const monthSport = sport.filter(s => (s.date || "").startsWith(mk));
    const save = get("savings-log", []).filter(s => (s.date || "").startsWith(mk)).reduce((a, b) => a + (b.amount || 0), 0);
    const html = `
      <div class="summary-grid">
        <div class="summary-item"><span class="label">打卡次数</span><span class="value">${doneCount}</span></div>
        <div class="summary-item"><span class="label">运动时长</span><span class="value">${monthSport.reduce((a, b) => a + (b.duration || 0), 0)} 分</span></div>
        <div class="summary-item"><span class="label">本月存钱</span><span class="value">¥${save}</span></div>
        <div class="summary-item"><span class="label">心情记录</span><span class="value">${moodDays} 天</span></div>
      </div>`;
    $("#monthly-summary-content").innerHTML = html;
  }

  // ---------- 每周小憩（周日显示） ----------
  function checkWeeklyRest() {
    const d = now();
    if (d.getDay() !== 0) return; // 仅周日
    const last = get("last-rest-week", "");
    const wk = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
    if (last === wk) return;
    $("#weekly-rest-card").style.display = "block";
  }
  window.saveWeeklyRest = function () {
    const d = now();
    const wk = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
    set("last-rest-week", wk);
    const rests = get("weekly-rests", []);
    rests.push({ week: wk, happy: $("#rest-happy").value, next: $("#rest-next").value, self: $("#rest-self").value, date: todayKey() });
    set("weekly-rests", rests);
    $("#rest-happy").value = "";
    $("#rest-next").value = "";
    $("#rest-self").value = "";
    $("#weekly-rest-card").style.display = "none";
    alert("已保存，这周辛苦了 🌙");
  };

  // ---------- 计划/任务 ----------
  window.addTask = function () {
    const text = $("#new-task-input").value.trim();
    const cat = $("#new-task-category").value;
    if (!text) return;
    const tasks = get("tasks", []);
    tasks.push({ text, cat, done: false, date: todayKey() });
    set("tasks", tasks);
    $("#new-task-input").value = "";
    renderTasks();
  };
  function renderTasks() {
    const tasks = get("tasks", []);
    const today = todayKey();
    const todays = tasks.filter(t => t.date === today);
    const html = todays.map((t, i) => `
      <div class="task-item">
        <div class="task-check ${t.done ? "done" : ""}" onclick="toggleTask(${tasks.indexOf(t)})"></div>
        <span class="task-text ${t.done ? "done" : ""}">${t.text}</span>
        <span class="task-cat">${t.cat}</span>
        <button class="task-del" onclick="delTask(${tasks.indexOf(t)})">✕</button>
      </div>`).join("");
    $("#task-list").innerHTML = html || '<p style="font-size:13px;color:var(--text-light)">今日还没有任务，添加一个吧。</p>';
    const done = todays.filter(t => t.done).length;
    const rate = todays.length ? Math.round(done / todays.length * 100) : 0;
    $("#task-completion-rate").textContent = rate + "%";
  }
  window.toggleTask = function (i) {
    const tasks = get("tasks", []);
    tasks[i].done = !tasks[i].done;
    set("tasks", tasks);
    renderTasks();
  };
  window.delTask = function (i) {
    const tasks = get("tasks", []);
    tasks.splice(i, 1);
    set("tasks", tasks);
    renderTasks();
  };

  // ---------- 习惯打卡 ----------
  const DEFAULT_HABITS = ["早起喝水", "晨间阅读", "午后散步", "睡前拉伸", "记录心情"];
  function renderHabits() {
    let habits = get("habits", []);
    if (habits.length === 0) { habits = DEFAULT_HABITS.map(n => ({ name: n })); set("habits", habits); }
    const today = todayKey();
    const checkins = get("checkins", {});
    const list = checkins[today] || [];
    const html = habits.map((h, i) => {
      const done = list.includes("habit-" + i);
      return `<div class="habit-item ${done ? "done" : ""}" onclick="toggleHabit(${i})">
        <span class="habit-icon">${done ? "✅" : "⚪"}</span>
        <span class="habit-name">${h.name}</span>
      </div>`;
    }).join("");
    $("#habit-grid").innerHTML = html;
  }
  window.toggleHabit = function (i) {
    const today = todayKey();
    const checkins = get("checkins", {});
    const list = checkins[today] || [];
    const key = "habit-" + i;
    if (list.includes(key)) list.splice(list.indexOf(key), 1);
    else list.push(key);
    checkins[today] = list;
    set("checkins", checkins);
    renderHabits();
  };
  window.addCustomHabit = function () {
    const v = $("#new-habit-name").value.trim();
    if (!v) return;
    const habits = get("habits", []);
    habits.push({ name: v });
    set("habits", habits);
    $("#new-habit-name").value = "";
    renderHabits();
  };

  // ---------- 财务 ----------
  window.saveIncome = function () {
    const mk = monthKey();
    const inc = get("income", {});
    inc[mk] = {
      salary: +$("#income-salary").value || 0,
      performance: +$("#income-performance").value || 0,
      bonus: +$("#income-bonus").value || 0,
      other: +$("#income-other").value || 0,
    };
    set("income", inc);
    renderFinance();
  };
  function addExpenseRow(name, amount) {
    const exp = get("expenses", {});
    const mk = monthKey();
    if (!exp[mk]) exp[mk] = [];
    exp[mk].push({ name: name || "其他", amount: amount || 0, date: todayKey() });
    set("expenses", exp);
    renderFinance();
  }
  window.addExpenseRow = function () {
    const name = prompt("支出类别（如：餐饮/交通/教育/医疗）：", "餐饮");
    if (!name) return;
    const amount = +prompt("金额：", "0");
    addExpenseRow(name, amount);
  };
  function renderFinance() {
    const mk = monthKey();
    const inc = get("income", {});
    const cur = inc[mk] || { salary: 0, performance: 0, bonus: 0, other: 0 };
    const totalInc = cur.salary + cur.performance + cur.bonus + cur.other;
    const exp = get("expenses", {});
    const curExp = exp[mk] || [];
    const totalExp = curExp.reduce((a, b) => a + (b.amount || 0), 0);
    const save = get("savings-log", []).filter(s => (s.date || "").startsWith(mk)).reduce((a, b) => a + (b.amount || 0), 0);
    const balance = totalInc - totalExp - save;
    $("#fin-income").textContent = "¥" + totalInc;
    $("#fin-expense").textContent = "¥" + totalExp;
    $("#fin-saving").textContent = "¥" + save;
    $("#fin-balance").textContent = "¥" + balance;
    // 支出明细
    const expHtml = curExp.length ? curExp.map((e, i) => `<div class="expense-row"><label>${e.name}</label><input type="number" value="${e.amount}" onchange="updateExpense(${i},this.value)"/><button onclick="delExpense(${i})" class="btn-close">✕</button></div>`).join("") : '<p style="font-size:12px;color:var(--text-light)">本月暂无支出记录</p>';
    $("#expense-rows").innerHTML = expHtml;
  }
  window.updateExpense = function (i, v) {
    const mk = monthKey();
    const exp = get("expenses", {});
    if (exp[mk] && exp[mk][i]) { exp[mk][i].amount = +v; set("expenses", exp); renderFinance(); }
  };
  window.delExpense = function (i) {
    const mk = monthKey();
    const exp = get("expenses", {});
    if (exp[mk]) { exp[mk].splice(i, 1); set("expenses", exp); renderFinance(); }
  };

  // ---------- 学费预存 ----------
  const DEFAULT_TUITION = {
    qb: [
      { name: "骐宝学费-春季", amount: 24000 },
      { name: "骐宝学费-秋季", amount: 17000 },
      { name: "骐宝学费-兴趣", amount: 15000 },
      { name: "骐宝学费-夏令营", amount: 4000 },
      { name: "骐宝学费-冬令营", amount: 6000 },
      { name: "骐宝学费-资料", amount: 12000 },
      { name: "骐宝学费-其他", amount: 9000 },
    ],
    zy: [
      { name: "知烨学费-春季", amount: 15000 },
      { name: "知烨学费-资料", amount: 1000 },
      { name: "知烨学费-兴趣", amount: 6000 },
    ]
  };
  function getTuition() {
    let t = get("tuition-items", null);
    if (!t) { t = JSON.parse(JSON.stringify(DEFAULT_TUITION)); set("tuition-items", t); }
    return t;
  }
  function renderTuition() {
    const t = getTuition();
    const qbTotal = t.qb.reduce((a, b) => a + b.amount, 0);
    const zyTotal = t.zy.reduce((a, b) => a + b.amount, 0);
    const total = qbTotal + zyTotal;
    const log = get("tuition-log", []);
    const saved = log.reduce((a, b) => a + (b.amount || 0), 0);
    const pct = total ? Math.min(100, Math.round(saved / total * 100)) : 0;
    $("#tuition-stream-fill").style.width = pct + "%";
    $("#tuition-saved").textContent = "已存 ¥" + saved;
    $("#tuition-target").textContent = "目标 ¥" + total;
    $("#tuition-percent").textContent = pct + "%";
    // 每月应存
    const monthsLeft = Math.max(1, 12 - now().getMonth());
    $("#tuition-monthly").textContent = "本月应存 ¥" + Math.round((total - saved) / monthsLeft);
    // 明细
    const qbHtml = t.qb.map((it, i) => `<div class="tuition-item-row"><label>${it.name}</label><input type="number" value="${it.amount}" onchange="updateTuition('qb',${i},this.value)"/></div>`).join("");
    const zyHtml = t.zy.map((it, i) => `<div class="tuition-item-row"><label>${it.name}</label><input type="number" value="${it.amount}" onchange="updateTuition('zy',${i},this.value)"/></div>`).join("");
    $("#tuition-qb-list").innerHTML = qbHtml || '<p style="font-size:12px;color:var(--text-light)">暂无</p>';
    $("#tuition-zy-list").innerHTML = zyHtml || '<p style="font-size:12px;color:var(--text-light)">暂无</p>';
    // 存入记录
    const logHtml = log.slice(-10).reverse().map(l => `<div class="history-item"><span>${l.date} +¥${l.amount}</span><span style="color:var(--text-light)">${l.note || ""}</span></div>`).join("");
    $("#tuition-history").innerHTML = logHtml || '<p style="font-size:12px;color:var(--text-light)">还没有存入记录</p>';
  }
  window.updateTuition = function (type, i, v) {
    const t = getTuition();
    t[type][i].amount = +v;
    set("tuition-items", t);
    renderTuition();
  };
  window.addTuitionItem = function (type) {
    const name = prompt("项目名称：", "新项目");
    if (!name) return;
    const amount = +prompt("金额：", "0");
    const t = getTuition();
    t[type].push({ name, amount });
    set("tuition-items", t);
    renderTuition();
  };
  window.saveTuition = function () {
    const amt = +$("#tuition-save-amount").value;
    const note = $("#tuition-save-note").value.trim();
    if (!amt) return alert("请输入金额");
    const log = get("tuition-log", []);
    log.push({ amount: amt, note, date: todayKey() });
    set("tuition-log", log);
    $("#tuition-save-amount").value = "";
    $("#tuition-save-note").value = "";
    renderTuition();
  };

  // ---------- 多目标存钱（水珠） ----------
  const DEFAULT_GOALS = [
    { name: "应急金", target: 20000, color: "emergency", saved: 0 },
    { name: "旅游基金", target: 10000, color: "travel", saved: 0 },
    { name: "学习基金", target: 5000, color: "study", saved: 0 },
    { name: "心愿清单", target: 3000, color: "wish", saved: 0 },
  ];
  function getGoals() {
    let g = get("saving-goals", null);
    if (!g) { g = JSON.parse(JSON.stringify(DEFAULT_GOALS)); set("saving-goals", g); }
    return g;
  }
  function renderSavingGoals() {
    const goals = getGoals();
    const log = get("savings-log", []);
    // 重新计算 saved
    goals.forEach(g => g.saved = 0);
    log.forEach(l => {
      if (l.goalName) {
        const g = goals.find(x => x.name === l.goalName);
        if (g) g.saved += (l.amount || 0);
      }
    });
    set("saving-goals", goals);
    const html = goals.map((g, i) => {
      const pct = g.target ? Math.min(100, Math.round(g.saved / g.target * 100)) : 0;
      const fillH = pct;
      const waterHtml = `<div class="water-drop color-${g.color}"><div class="water-fill" style="height:${fillH}%"></div><span class="water-label">${pct}%</span></div>`;
      return `<div class="saving-goal-item">
        ${waterHtml}
        <div class="saving-info">
          <div class="saving-name">${g.name} <span style="font-size:11px;color:var(--text-light)">¥${g.saved}/${g.target}</span></div>
          <div class="saving-progress">${g.name === "应急金" ? "温暖·安心" : g.name === "旅游基金" ? "远方在等" : g.name === "学习基金" ? "滋养·成长" : "期待·闪光"}</div>
        </div>
        <div class="saving-actions">
          <button class="btn-save" onclick="openSaveGoal(${i})">存入</button>
          <button class="btn-del" onclick="delGoal(${i})">删除</button>
        </div>
      </div>`;
    }).join("");
    $("#saving-goals-container").innerHTML = html;
    // 存钱池合计
    const totalSaved = goals.reduce((a, b) => a + b.saved, 0);
    const totalTarget = goals.reduce((a, b) => a + b.target, 0);
    const poolHtml = `<div class="savings-pool"><div class="savings-pool-label">💧 存钱池</div><div class="savings-pool-num">¥${totalSaved} / ¥${totalTarget}</div><div class="stream-bar"><div class="stream-fill" style="width:${totalTarget ? Math.round(totalSaved / totalTarget * 100) : 0}%"></div></div></div>`;
    // 插入到容器下方
    const existing = document.querySelector(".savings-pool");
    if (existing) existing.remove();
    $("#saving-goals-container").insertAdjacentHTML("afterend", poolHtml);
  }
  window.openSaveGoal = function (i) {
    const goals = getGoals();
    const amt = +prompt(`存入「${goals[i].name}」多少？`, "100");
    if (!amt) return;
    const note = prompt("备注（可选）：", "") || "";
    const log = get("savings-log", []);
    log.push({ amount: amt, note, goalName: goals[i].name, date: todayKey() });
    set("savings-log", log);
    renderSavingGoals();
    renderFinance();
  };
  window.delGoal = function (i) {
    if (!confirm("确定删除这个目标吗？")) return;
    const goals = getGoals();
    goals.splice(i, 1);
    set("saving-goals", goals);
    renderSavingGoals();
  };
  window.addSavingGoal = function () {
    const name = prompt("目标名称：", "新目标");
    if (!name) return;
    const target = +prompt("目标金额：", "5000");
    const color = prompt("颜色（emergency/travel/study/wish）：", "wish") || "wish";
    const goals = getGoals();
    goals.push({ name, target, color, saved: 0 });
    set("saving-goals", goals);
    renderSavingGoals();
  };

  // ---------- 运动/体重 ----------
  window.saveWeight = function () {
    const w = +$("#weight-input").value;
    if (!w) return;
    const ws = get("weights", []);
    ws.push({ date: todayKey(), weight: w });
    set("weights", ws);
    $("#weight-input").value = "";
    renderWeightChart();
  };
  window.saveSport = function () {
    const type = $("#sport-type").value;
    const dur = +$("#sport-duration").value || 0;
    const cal = +$("#sport-calories").value || 0;
    const feel = $("#sport-feeling").value.trim();
    const sport = get("sport", []);
    sport.push({ type, duration: dur, calories: cal, feeling: feel, date: todayKey() });
    set("sport", sport);
    $("#sport-duration").value = "";
    $("#sport-calories").value = "";
    $("#sport-feeling").value = "";
    renderSportCalendar();
  };
  function renderWeightChart() {
    const ws = get("weights", []);
    const c = $("#weight-chart");
    if (!c || ws.length < 2) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    const max = Math.max(...ws.map(w => w.weight));
    const min = Math.min(...ws.map(w => w.weight));
    const range = (max - min) || 1;
    const stepX = c.width / (ws.length - 1);
    ctx.strokeStyle = "#6cb4d8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ws.forEach((w, i) => {
      const x = i * stepX;
      const y = c.height - ((w.weight - min) / range) * (c.height - 30) - 10;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    // 圆点
    ctx.fillStyle = "#88c9d9";
    ws.forEach((w, i) => {
      const x = i * stepX;
      const y = c.height - ((w.weight - min) / range) * (c.height - 30) - 10;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });
  }
  function renderSportCalendar() {
    const today = now();
    const sport = get("sport", []);
    const mk = monthKey();
    const monthSport = sport.filter(s => (s.date || "").startsWith(mk));
    $("#week-sport-count").textContent = monthSport.length;
    $("#week-sport-duration").textContent = monthSport.reduce((a, b) => a + (b.duration || 0), 0);
    // 简易日历
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let html = "";
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(d)}`;
      const has = sport.some(s => s.date === key);
      const isToday = key === todayKey();
      html += `<div class="cal-day ${has ? "checked" : ""} ${isToday ? "today" : ""}">${d}</div>`;
    }
    $("#sport-calendar").innerHTML = html;
  }

  // ---------- 心情日记 ----------
  let curMood = "";
  window.selectMood = function (m) {
    curMood = m;
    $$(".mood-selector span").forEach(s => s.classList.remove("selected"));
    event.target.classList.add("selected");
  };
  window.saveMood = function () {
    const reason = $("#mood-reason").value.trim();
    const grateful = $("#grateful-list").value.trim();
    if (!curMood && !reason && !grateful) return;
    const moods = get("moods", {});
    moods[todayKey()] = { mood: curMood, reason, grateful, date: todayKey() };
    set("moods", moods);
    $("#mood-reason").value = "";
    $("#grateful-list").value = "";
    curMood = "";
    $$(".mood-selector span").forEach(s => s.classList.remove("selected"));
    renderMoodChart();
    renderMonthlySummary();
  };
  function renderMoodChart() {
    const moods = get("moods", {});
    const keys = Object.keys(moods).sort().slice(-14);
    const c = $("#mood-chart");
    if (!c || keys.length < 2) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    const stepX = c.width / (keys.length - 1);
    const map = { "😄开心": 5, "😌平静": 4, "💪充实": 4.5, "😩疲惫": 2, "😰焦虑": 1.5, "😢难过": 1 };
    ctx.strokeStyle = "#b8a9e0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    keys.forEach((k, i) => {
      const v = map[moods[k].mood] || 3;
      const x = i * stepX;
      const y = c.height - (v / 5) * (c.height - 20) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // ---------- 精进：想法 → 四步分析 ----------
  const KNOWLEDGE_BASE = {
    "焦虑": "焦虑往往是「在乎」的侧面。试着把它翻译成具体的小行动：今天可以做一件让局面稍微可控的小事。",
    "存钱": "存钱的本质不是牺牲，而是给未来的自己更多选择权。每存一笔，都是在为某个自由投票。",
    "表达": "好的表达不是口若悬河，而是让对方感到被理解。先练习「复述对方的话」再回应。",
    "健康": "身体的小信号别忽略。规律比强度重要，睡够、喝够、动起来，比任何补品都管用。",
    "时间": "时间不够用，往往不是时间少，而是没给重要的事留固定位置。先守住 05:15 的读书时间。",
    "学习": "学习不必苦大仇深。每天读 5 分钟，比一周突击 5 小时更可持续。",
    "关系": "关系需要主动维护。一句「最近好吗」比一百个朋友圈点赞都暖。",
    "育儿": "孩子不是你的作品，是独立的生命。陪他长大，而不是替他长大。",
    "工作": "工作是为了更好地生活，不是反过来。下班后学会关上电脑，是种能力。",
    "情绪": "情绪不是敌人，是信使。问问它想告诉你什么，而不是急着压下去。",
  };
  const ACTION_MAP = {
    "焦虑": ["今晚睡前写下 3 件你担心的事，再写 1 件你可以控制的事", "明天先做那件可控的小事，完成它"],
    "存钱": ["今晚算一笔账：本月已存多少，离目标差多少", "明天发工资后先转一笔到「应急金」"],
    "表达": ["明天找一个机会，先复述对方的话再回应", "本周录一段 30 秒自我介绍，回听并改一版"],
    "健康": ["明天早起先喝一杯温水", "本周安排 2 次 20 分钟散步"],
    "时间": ["今晚给明天的 05:15 读书留出固定时段", "把手机通知关掉 1 小时试试"],
    "学习": ["明天读 5 分钟英文短文并跟读", "本周背 3 个新单词，写进金句库"],
    "关系": ["明天给一个好久没联系的人发一句问候", "本周约一次面对面喝茶"],
    "育儿": ["今晚睡前和孩子说一句具体的肯定", "本周陪孩子做一件他提过想做的事"],
    "工作": ["明天下班准时关电脑", "列出 3 件工作里想减少的事"],
    "情绪": ["今晚写一句「我今天感觉…是因为…」", "明天情绪上来时先深呼吸 3 次再回应"],
  };
  const STYLES = {
    "人民日报体": (s) => `「${s}」——看似平凡的日子，正因用心而闪光。每一份坚持，都在为未来铺路。`,
    "网络金句体": (s) => `谁懂啊！${s} 这件事真的会让一整天都亮起来 ✨`,
    "心灵鸡汤体": (s) => `亲爱的，如果你正在经历${s}，请相信：这是成长在敲门。温柔地对待自己，路会越走越宽。`,
  };
  window.analyzeReflection = function () {
    const input = $("#reflection-input").value.trim();
    if (!input) return alert("先写点什么吧，哪怕一句话。");
    // 关键词匹配
    let matchedKey = "情绪";
    for (const k of Object.keys(KNOWLEDGE_BASE)) {
      if (input.includes(k)) { matchedKey = k; break; }
    }
    // 概括
    const summary = `你的想法核心是：「${input.slice(0, 40)}${input.length > 40 ? "…" : ""}」，这背后是你在意${matchedKey}。`;
    // 金句三版
    const s1 = STYLES["人民日报体"](matchedKey);
    const s2 = STYLES["网络金句体"](matchedKey);
    const s3 = STYLES["心灵鸡汤体"](matchedKey);
    // 衍生
    const derived = KNOWLEDGE_BASE[matchedKey];
    // 行动
    const actions = (ACTION_MAP[matchedKey] || ["先做一件小事", "写下明天的具体一步"]).map(a => `<li>${a}</li>`).join("");
    const html = `
      <div class="reflection-step"><h4>📝 概括整理</h4><p>${summary}</p></div>
      <div class="reflection-step"><h4>✨ 金句风格总结</h4><p>📰 ${s1}</p><p>💬 ${s2}</p><p>🌸 ${s3}</p></div>
      <div class="reflection-step"><h4>🌐 衍生思考</h4><p>${derived}</p></div>
      <div class="reflection-step"><h4>🎯 明天就能做的行动</h4><ol>${actions}</ol></div>
    `;
    $("#reflection-result").innerHTML = html;
    // 保存
    const logs = get("reflection-logs", []);
    logs.push({ input, output: html, date: todayKey(), time: now().toTimeString().slice(0, 5), key: matchedKey });
    set("reflection-logs", logs);
    $("#reflection-input").value = "";
    renderReflectionHistory();
  };
  function renderReflectionHistory() {
    const logs = get("reflection-logs", []);
    const html = logs.slice(-5).reverse().map((l, i) => `
      <div class="history-card">
        <div class="date">${l.date} ${l.time} · ${l.key}</div>
        <div class="summary">${l.input.slice(0, 60)}${l.input.length > 60 ? "…" : ""}</div>
      </div>`).join("");
    $("#reflection-history").innerHTML = html || '<p style="font-size:13px;color:var(--text-light)">还没有记录，写下第一笔吧。</p>';
  }

  // ---------- 热点（内置模板，手动刷新轮换） ----------
  const HOT_FINANCE = [
    { title: "央行年内第二次降准，释放长期资金约 1 万亿元", desc: "对普通人意味着房贷利率有望进一步下行，存款收益继续走低，理财配置需重新思考。" },
    { title: "个人养老金制度全国铺开，每年最高抵税 5400 元", desc: "每年最多缴 1.2 万，可投基金/存款/保险，长期看是普通人少有的税优工具。" },
    { title: "医保个人账户改革深化，家庭共济扩围", desc: "个人账户钱变少但统筹池变大，住院/门诊报销比例提升，对慢病家庭是利好。" },
    { title: "多地提高最低工资标准，平均涨幅 5%-8%", desc: "低收入群体直接受益，但需关注物价与服务价格的联动。" },
  ];
  const HOT_AUDIT = [
    { title: "国家医保局通报 2026 年第二批飞行检查结果", desc: "重点查处虚假住院、串换项目、过度检查，涉及 23 家机构被追回资金并处罚。" },
    { title: "DRG/DIP 付费改革覆盖全国 90% 统筹区", desc: "按病种打包付费倒逼医院控成本，患者住院天数普遍缩短，但需警惕推诿重症。" },
    { title: "医保智能监控系统上线，实时拦截可疑结算", desc: "AI 审核处方与收费明细，欺诈骗保识别率提升，合规机构反而更轻松。" },
  ];
  const HOT_GUIDE = [
    { title: "《国家医保局 2026 版医疗服务价格项目指南》发布", desc: "统一项目名称与编码，理顺比价关系，护理、中医、儿科项目价格上调，大型检查降价。" },
    { title: "新版立项指南新增「互联网+护理」「安宁疗护」项目", desc: "将居家护理、临终关怀纳入医保支付，回应老龄化刚需。" },
    { title: "口腔种植费用专项治理落地，单颗均价降至 5000 元内", desc: "耗材集采+服务限价双管齐下，种植牙从「奢侈品」变「刚需品」。" },
  ];
  const HOT_CURATED = [
    { title: "卫健委：将「睡眠健康」纳入基本公卫服务包", desc: "社区可开展睡眠筛查与干预，打鼾、失眠不再只是「个人问题」。" },
    { title: "教育部推进「每天一节体育课」落地", desc: "小学到高中逐步配齐体育师资，孩子体质提升有了制度保障。" },
    { title: "女性职业健康新规：孕期可申请远程办公", desc: "明确用人单位须为孕期女职工提供弹性工作选项，减少通勤与加班伤害。" },
    { title: "长期护理保险试点扩至 60 城", desc: "失能老人居家护理可报销，家庭照护压力有望系统性缓解。" },
  ];
  function renderHot() {
    const fi = HOT_FINANCE.map(h => `<div class="hot-item"><span class="hot-tag">财经</span><span class="hot-title">${h.title}</span><div class="hot-desc">${h.desc}</div></div>`).join("");
    const au = HOT_AUDIT.map(h => `<div class="hot-item"><span class="hot-tag">稽核</span><span class="hot-title">${h.title}</span><div class="hot-desc">${h.desc}</div></div>`).join("");
    const gu = HOT_GUIDE.map(h => `<div class="hot-item"><span class="hot-tag">立项</span><span class="hot-title">${h.title}</span><div class="hot-desc">${h.desc}</div></div>`).join("");
    const cu = HOT_CURATED.map(h => `<div class="hot-item"><span class="hot-tag">精选</span><span class="hot-title">${h.title}</span><div class="hot-desc">${h.desc}</div></div>`).join("");
    $("#hot-finance").innerHTML = fi;
    $("#hot-medical-audit").innerHTML = au;
    $("#hot-medical-guide").innerHTML = gu;
    $("#hot-curated").innerHTML = cu;
  }
  window.refreshHot = function () {
    HOT_FINANCE.reverse();
    HOT_AUDIT.reverse();
    HOT_GUIDE.reverse();
    HOT_CURATED.reverse();
    renderHot();
  };

  // ---------- 月度复盘（三封信） ----------
  function renderReviewMonthOptions() {
    const sel = $("#review-month-select");
    if (sel.options.length > 0) return;
    const cur = now();
    for (let m = 0; m < 6; m++) {
      const d = new Date(cur.getFullYear(), cur.getMonth() - m, 1);
      const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const opt = new Option(`${d.getFullYear()}年${d.getMonth() + 1}月`, val);
      sel.add(opt);
    }
  }
  window.generateMonthlyReview = function () {
    const mk = $("#review-month-select").value || monthKey();
    const [y, m] = mk.split("-").map(Number);
    const all = get("checkins", {});
    let checkinCount = 0;
    Object.keys(all).filter(k => k.startsWith(mk)).forEach(k => checkinCount += all[k].length);
    const tasks = get("tasks", []).filter(t => (t.date || "").startsWith(mk));
    const doneTasks = tasks.filter(t => t.done).length;
    const taskRate = tasks.length ? Math.round(doneTasks / tasks.length * 100) : 0;
    const sport = get("sport", []).filter(s => (s.date || "").startsWith(mk));
    const sportDur = sport.reduce((a, b) => a + (b.duration || 0), 0);
    const moods = get("moods", {});
    const moodDays = Object.keys(moods).filter(k => k.startsWith(mk)).length;
    const weights = get("weights", []).filter(w => (w.date || "").startsWith(mk));
    const inc = get("income", {});
    const curInc = inc[mk] || { salary: 0, performance: 0, bonus: 0, other: 0 };
    const totalInc = curInc.salary + curInc.performance + curInc.bonus + curInc.other;
    const exp = get("expenses", {});
    const curExp = exp[mk] || [];
    const totalExp = curExp.reduce((a, b) => a + (b.amount || 0), 0);
    const save = get("savings-log", []).filter(s => (s.date || "").startsWith(mk)).reduce((a, b) => a + (b.amount || 0), 0);
    const balance = totalInc - totalExp - save;
    const rests = get("weekly-rests", []).filter(r => r.week.startsWith(mk));
    const monthName = `${y}年${m}月`;
    const html = `
      <div class="review-letter">
        <h4>💌 给过去的自己</h4>
        <p>${monthName}，你一共打卡 ${checkinCount} 次，完成任务 ${doneTasks}/${tasks.length}（完成率 ${taskRate}%），运动 ${sportDur} 分钟，记录了 ${moodDays} 天心情。</p>
        <p>你在这个月启动了 WorkBuddy，把一些混乱慢慢收拢。不必追求完美，能坚持记录本身，就已经很了不起了。</p>
      </div>
      <div class="review-letter">
        <h4>🌿 给现在的自己</h4>
        <p>本月收入 ¥${totalInc}，支出 ¥${totalExp}，存钱 ¥${save}，结余 ¥${balance}。</p>
        <p>${balance >= 0 ? "收支平衡，做得不错。可以把存钱的目标再往前推一推。" : "这个月有点紧，没关系，下个月调整一下支出结构就好。"}</p>
        ${weights.length ? `<p>体重从 ${weights[0].weight} 到 ${weights[weights.length - 1].weight}，变化 ${(weights[weights.length - 1].weight - weights[0].weight).toFixed(1)} kg。</p>` : ""}
      </div>
      <div class="review-letter">
        <h4>🌊 给下个月的自己</h4>
        <p>想改善的三件事：</p>
        <ol>
          <li>${rests.length ? rests[rests.length - 1].next || "______" : "______"}</li>
          <li>______</li>
          <li>______</li>
        </ol>
        <p style="margin-top:8px;color:var(--text-light);font-size:13px;">不急，慢慢来。下个月，你只要比这个月多温柔一点点，就够了。</p>
      </div>
      <div class="review-grid">
        <div class="summary-item"><span class="label">打卡</span><span class="value">${checkinCount}</span></div>
        <div class="summary-item"><span class="label">任务完成率</span><span class="value">${taskRate}%</span></div>
        <div class="summary-item"><span class="label">运动时长</span><span class="value">${sportDur}分</span></div>
        <div class="summary-item"><span class="label">本月结余</span><span class="value">¥${balance}</span></div>
      </div>
    `;
    $("#review-content").innerHTML = html;
    // 保存
    const reviews = get("monthly-reviews", []);
    if (!reviews.find(r => r.month === mk)) {
      reviews.push({ month: mk, content: html, date: todayKey() });
      set("monthly-reviews", reviews);
    }
  };
  function renderLatestReview() {
    const reviews = get("monthly-reviews", []);
    if (reviews.length === 0) return;
    const latest = reviews[reviews.length - 1];
    $("#review-content").innerHTML = latest.content;
    $("#review-month-select").value = latest.month;
  }

  // ---------- 引导对话初始化 ----------
  function initGuideChat() {
    const today = todayKey();
    const list = get("top3", []).filter(t => t.date === today);
    const actions = $("#guide-actions");
    if (list.length > 0) {
      actions.innerHTML = list.map((t, i) => `<button onclick="quickPickTop3(${i})">${t.text}</button>`).join("");
    } else {
      actions.innerHTML = `<button onclick="quickPickTop3(-1)">先来添加今天最重要的一件事</button>`;
    }
  }
  window.quickPickTop3 = function (i) {
    if (i < 0) { addTop3Item(); return; }
    const list = get("top3", []).filter(t => t.date === todayKey());
    list[i].done = true;
    const all = get("top3", []);
    const idx = all.findIndex(t => t.date === todayKey() && t.text === list[i].text);
    if (idx >= 0) all[idx].done = true;
    set("top3", all);
    renderTop3();
    $("#pomodoro-row").style.display = "flex";
    $("#guide-question").textContent = `好的，先把「${list[i].text}」做完。需要我 25 分钟后提醒你休息吗？`;
  };

  // ---------- 初始化 ----------
  function init() {
    applyTheme();
    updateDate();
    renderAlmanac();
    checkBirthdays();
    checkGuide();
    refreshEncouragement();
    initGuideChat();
    renderTop3();
    renderTimeline();
    renderMonthlySummary();
    checkWeeklyRest();
    renderFinance();
    renderSavingGoals();
    renderTuition();
    renderReflectionHistory();
    // 每 10 分钟换一次配色
    setInterval(applyTheme, 600000);
    // 每天 0 点刷新日期
    setInterval(updateDate, 60000);
  }

  // 等 DOM 就绪
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
