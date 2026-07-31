/* ============================================
   WorkBuddy v3 · 水系温柔成长伙伴
   全部交互逻辑
   ============================================ */

(function () {
  'use strict';

  // ========== 工具函数 ==========
  var $ = function (id) { return document.getElementById(id); };
  var today = function () { return new Date().toISOString().slice(0, 10); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var fmtMoney = function (n) { return '¥' + Number(n || 0).toLocaleString('zh-CN'); };
  var STORAGE_KEY = 'workbuddy_v3_data';

  // 读取数据
  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  // 保存数据
  function saveData(d) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  }
  var DATA = loadData();

  // 初始化结构
  DATA.tasks = DATA.tasks || [];
  DATA.habits = DATA.habits || [
    { name: '喝水 8 杯', done: false },
    { name: '早睡 23:00', done: false },
    { name: '拉伸 5 分钟', done: false }
  ];
  DATA.weight = DATA.weight || [];
  DATA.sports = DATA.sports || [];
  DATA.moods = DATA.moods || [];
  DATA.reflections = DATA.reflections || [];
  DATA.incomes = DATA.incomes || {};
  DATA.expenses = DATA.expenses || {};
  DATA.savings = DATA.savings || [];
  DATA.goals = DATA.goals || [
    { name: '应急金', target: 20000, saved: 0, color: 'peach' },
    { name: '旅游基金', target: 10000, saved: 0, color: 'lavender' },
    { name: '学习基金', target: 5000, saved: 0, color: 'pink' },
    { name: '心愿清单', target: 3000, saved: 0, color: 'cream' }
  ];
  DATA.tuition = DATA.tuition || {
    qibao: {
      name: '骐宝',
      items: [
        { name: '春季学费', amount: 24000 },
        { name: '夏季学费', amount: 17000 },
        { name: '秋季学费', amount: 15000 },
        { name: '教材费', amount: 4000 },
        { name: '活动费', amount: 6000 },
        { name: '冬令营', amount: 12000 },
        { name: '保险费', amount: 9000 }
      ],
      saved: 0
    },
    zhiye: {
      name: '知烨',
      items: [
        { name: '春季学费', amount: 15000 },
        { name: '教材费', amount: 1000 },
        { name: '兴趣班', amount: 6000 }
      ],
      saved: 0
    }
  };
  DATA.birthdays = DATA.birthdays || [];
  DATA.checkins = DATA.checkins || {};
  DATA.top3 = DATA.top3 || { date: '', items: [] };
  DATA.weeklyRest = DATA.weeklyRest || {};
  saveData(DATA);

  // ========== 时段配色 ==========
  function updateTheme() {
    var h = new Date().getHours();
    var theme = 'morning';
    if (h >= 5 && h < 9) theme = 'morning';
    else if (h >= 9 && h < 12) theme = 'forenoon';
    else if (h >= 12 && h < 18) theme = 'afternoon';
    else if (h >= 18 && h < 21) theme = 'evening';
    else theme = 'night';
    document.body.dataset.theme = theme;
  }
  updateTheme();
  setInterval(updateTheme, 60000);

  // ========== 引导页 ==========
  window.closeOnboarding = function () {
    $('onboarding').style.display = 'none';
    localStorage.setItem('wb_onboarded', '1');
  };
  if (!localStorage.getItem('wb_onboarded')) {
    $('onboarding').style.display = 'flex';
  }

  // ========== 底部导航 ==========
  document.querySelectorAll('.nav-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.nav-item').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var page = document.getElementById('page-' + btn.dataset.page);
      if (page) page.classList.add('active');
      if (btn.dataset.page === 'review') renderReview();
      if (btn.dataset.page === 'finance') renderFinance();
      if (btn.dataset.page === 'health') renderHealth();
    });
  });

  // ========== 日期 & 问候 ==========
  var WEEKDAY = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  function updateDate() {
    var d = new Date();
    var ds = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEKDAY[d.getDay()];
    if ($('current-date')) $('current-date').textContent = ds;
    var h = d.getHours();
    var g = '早安 ☀️', e = '☀️';
    if (h >= 5 && h < 9) { g = '早安 ☀️'; e = '🌅'; }
    else if (h >= 9 && h < 12) { g = '上午好 🌿'; e = '🌿'; }
    else if (h >= 12 && h < 14) { g = '午安 🍲'; e = '🍲'; }
    else if (h >= 14 && h < 18) { g = '下午好 🌤️'; e = '🌤️'; }
    else if (h >= 18 && h < 21) { g = '傍晚好 🌇'; e = '🌇'; }
    else { g = '夜深了 🌙'; e = '🌙'; }
    if ($('greeting-text')) $('greeting-text').textContent = g;
    if ($('greeting-emoji')) $('greeting-emoji').textContent = e;
  }
  updateDate();

  // ========== 鼓励语 ==========
  var ENCOURAGEMENTS = [
    '✨ 你比昨天更靠近梦想了。',
    '🌊 慢慢来，水流虽缓，终能穿石。',
    '🍃 不急，今天你已经在路上了。',
    '🌸 温柔地对待自己，也是一种力量。',
    '💧 一滴水也有它的方向。',
    '🌿 你不需要完美，只需要持续。',
    '🎐 风会记住每一朵花的香气，时间会记住你的努力。',
    '🪷 像水一样，柔软但有力量。',
    '🌙 今晚好好休息，明天又是新的一天。',
    '🫧 你已经做得很好了，真的。',
    '🌊 每一个小小的坚持，都在改变流向。',
    '🍀 今天也是被自己温柔以待的一天。',
    '🌷 进步不需要被看见，它在发生就已经足够。',
    '💫 你正在成为你想成为的人。',
    '🧸 累了就歇一歇，溪流也会拐弯。'
  ];
  window.refreshEncouragement = function () {
    if ($('encouragement-text')) {
      $('encouragement-text').textContent = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    }
  };
  refreshEncouragement();

  // ========== 黄历宜忌 ==========
  var YI_POOL = [
    '祭祀', '嫁娶', '祈福', '求嗣', '开光', '出行', '入学', '习艺', '赴任', '动土',
    '纳采', '订盟', '安机械', '会亲友', '裁衣', '合帐', '冠笄', '订婚', '纳婿',
    '沐浴', '剃头', '修造', '安门', '放水', '作灶', '架马', '牧养', '安碓硙', '修仓',
    '开市', '立券', '交易', '纳财', '开仓', '出货', '栽种', '纳畜'
  ];
  var JI_POOL = [
    '安葬', '破土', '伐木', '作灶', '行丧', '造庙', '置产', '诉讼', '开仓', '动土',
    '安门', '出行', '赴任', '上梁', '竖柱', '盖屋', '修坟', '启钻', '开渠',
    '破屋', '坏垣', '畋猎', '取鱼', '乘船', '渡水'
  ];
  function seedFromDate(d) {
    return d.getFullYear() * 370 + d.getMonth() * 31 + d.getDate();
  }
  function makeRng(seed) {
    var s = seed % 2147483647;
    return function () {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
  }
  function getHuangLi() {
    var d = new Date();
    var seed = seedFromDate(d);
    var r = makeRng(seed);
    var yi = [], ji = [];
    while (yi.length < 4) {
      var w = YI_POOL[Math.floor(r() * YI_POOL.length)];
      if (yi.indexOf(w) === -1) yi.push(w);
    }
    while (ji.length < 4) {
      var w2 = JI_POOL[Math.floor(r() * JI_POOL.length)];
      if (ji.indexOf(w2) === -1) ji.push(w2);
    }
    var lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    var lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    var lMonth = lunarMonths[(d.getMonth() + 1) % 12];
    var lDay = lunarDays[(dayOfYear + 3) % 30];
    var dirs = [
      { xi: '西南', cai: '正南' }, { xi: '正南', cai: '东南' },
      { xi: '东南', cai: '正西' }, { xi: '正西', cai: '西北' },
      { xi: '西北', cai: '正北' }, { xi: '正北', cai: '东北' },
      { xi: '东北', cai: '正东' }, { xi: '正东', cai: '西南' }
    ];
    var dir = dirs[seed % 8];
    return { yi: yi, ji: ji, lunar: lMonth + lDay, dir: dir, seed: seed };
  }
  function renderHuangLi() {
    var hl = getHuangLi();
    if ($('huangli-lunar')) $('huangli-lunar').textContent = '农历 ' + hl.lunar;
    if ($('huangli-yi-list')) $('huangli-yi-list').innerHTML = hl.yi.map(function (w) { return '<span class="yi-tag">' + w + '</span>'; }).join(' ');
    if ($('huangli-ji-list')) $('huangli-ji-list').innerHTML = hl.ji.map(function (w) { return '<span class="ji-tag">' + w + '</span>'; }).join(' ');
    if ($('huangli-direction')) $('huangli-direction').innerHTML = '🧭 喜神' + hl.dir.xi + '　财神' + hl.dir.cai;
    var tips = [
      '今日宜静修读书，不宜远行。',
      '今日适合出门散步，感受微风。',
      '今日宜与人沟通，重要的话说出来。',
      '今日宜整理空间，清爽心情。',
      '今日宜静坐片刻，与自己对话。'
    ];
    if ($('huangli-tip')) $('huangli-tip').textContent = '💡 ' + tips[hl.seed % tips.length];
  }
  renderHuangLi();

  // ========== 生日提醒 ==========
  function renderBirthdayReminder() {
    var el = $('birthday-reminder');
    var content = $('birthday-content');
    if (!el || !content) return;
    if (!DATA.birthdays.length) {
      el.style.display = 'block';
      content.innerHTML = '<p style="font-size:13px;color:var(--text-light)">暂无生日记录，点下方按钮添加。</p>';
      return;
    }
    var today0 = new Date(); today0.setHours(0, 0, 0, 0);
    var nearest = null, nearestDays = 999;
    DATA.birthdays.forEach(function (b) {
      var bd = new Date(b.date);
      var thisYear = new Date(today0.getFullYear(), bd.getMonth(), bd.getDate());
      var diff = Math.ceil((thisYear - today0) / 86400000);
      if (diff < 0) {
        thisYear.setFullYear(today0.getFullYear() + 1);
        diff = Math.ceil((thisYear - today0) / 86400000);
      }
      b._days = diff;
      if (diff < nearestDays) { nearestDays = diff; nearest = b; }
    });
    el.style.display = 'block';
    if (nearestDays === 0) {
      content.innerHTML =
        '<div class="birthday-item urgent">' +
          '<span class="birthday-name">🎂 今天是 ' + nearest.name + ' 的生日！</span>' +
          '<span class="birthday-countdown today">就是今天！</span>' +
        '</div>' +
        '<p style="margin-top:8px;font-size:13px;">要不要现在写一句想对 TA 说的话？</p>' +
        '<input type="text" id="birthday-msg" placeholder="想对 TA 说的话..." style="margin-top:6px;" />' +
        '<button onclick="saveBirthdayMsg()" class="btn-small btn-primary" style="margin-top:6px;">保存祝福</button>';
    } else if (nearestDays <= (nearest.remindDays || 3)) {
      content.innerHTML =
        '<div class="birthday-item urgent">' +
          '<span class="birthday-name">🎂 ' + nearest.name + ' 还有 ' + nearestDays + ' 天</span>' +
          '<span class="birthday-countdown soon">' + nearestDays + ' 天后</span>' +
        '</div>' +
        '<p style="margin-top:6px;font-size:13px;color:var(--text-light)">日期：' + nearest.date + '（' + (nearest.calendar === 'lunar' ? '农历' : '公历') + '）</p>';
    } else {
      content.innerHTML = '<p style="font-size:13px;color:var(--text-light)">最近的生日：' + nearest.name + '（' + nearestDays + ' 天后）</p>';
    }
  }
  window.saveBirthdayMsg = function () {
    var msg = $('birthday-msg');
    if (!msg || !msg.value.trim()) return;
    var td = new Date().toISOString().slice(0, 10);
    DATA.birthdays._msgs = DATA.birthdays._msgs || {};
    DATA.birthdays._msgs[td] = msg.value.trim();
    saveData(DATA);
    alert('祝福已保存 ✨');
  };
  window.openBirthdayManager = function () {
    var m = $('birthday-modal');
    if (m) m.style.display = 'flex';
    renderBirthdayList();
  };
  window.closeBirthdayModal = function () {
    var m = $('birthday-modal');
    if (m) m.style.display = 'none';
  };
  window.addBirthday = function () {
    var name = $('bd-name'), date = $('bd-date'), cal = $('bd-calendar'), days = $('bd-remind-days');
    if (!name || !date || !name.value.trim() || !date.value) { alert('请填写姓名和日期'); return; }
    DATA.birthdays.push({
      name: name.value.trim(),
      date: date.value,
      calendar: cal ? cal.value : 'solar',
      remindDays: Number(days && days.value) || 3
    });
    saveData(DATA);
    name.value = ''; date.value = '';
    renderBirthdayList();
    renderBirthdayReminder();
  };
  window.deleteBirthday = function (idx) {
    DATA.birthdays.splice(idx, 1);
    saveData(DATA);
    renderBirthdayList();
    renderBirthdayReminder();
  };
  function renderBirthdayList() {
    var el = $('birthday-list');
    if (!el) return;
    if (!DATA.birthdays.length) { el.innerHTML = '<p style="font-size:13px;color:var(--text-light)">还没有添加生日。</p>'; return; }
    el.innerHTML = DATA.birthdays.map(function (b, i) {
      return '<div class="birthday-list-item">' +
        '<span>🎂 ' + b.name + '（' + b.date + '）</span>' +
        '<span style="font-size:12px;color:var(--text-light)">提前' + (b.remindDays || 3) + '天提醒</span>' +
        '<button onclick="deleteBirthday(' + i + ')">🗑️</button>' +
      '</div>';
    }).join('');
  }
  renderBirthdayReminder();

  // ========== 今日三件事 ==========
  function renderTop3() {
    var t3 = $('top3-list');
    if (!t3) return;
    var td = today();
    if (DATA.top3.date !== td) { DATA.top3 = { date: td, items: [] }; saveData(DATA); }
    var items = DATA.top3.items;
    t3.innerHTML = items.map(function (it, i) {
      return '<li class="' + (it.done ? 'done' : '') + '">' +
        '<input type="checkbox" ' + (it.done ? 'checked' : '') + ' onchange="toggleTop3(' + i + ')" />' +
        '<span>' + it.text + '</span>' +
        '<button onclick="removeTop3(' + i + ')" style="margin-left:auto;">✕</button>' +
      '</li>';
    }).join('');
    var done = items.filter(function (i) { return i.done; }).length;
    if ($('top3-progress')) $('top3-progress').textContent = done + '/' + items.length;
  }
  window.addTop3 = function () {
    var inp = $('top3-input');
    if (!inp) return;
    var v = inp.value.trim();
    if (!v) return;
    if (DATA.top3.items.length >= 3) { alert('每天只设三件事哦，专注更重要 🌊'); return; }
    DATA.top3.items.push({ text: v, done: false });
    inp.value = '';
    saveData(DATA);
    renderTop3();
  };
  window.toggleTop3 = function (i) {
    DATA.top3.items[i].done = !DATA.top3.items[i].done;
    saveData(DATA);
    renderTop3();
  };
  window.removeTop3 = function (i) {
    DATA.top3.items.splice(i, 1);
    saveData(DATA);
    renderTop3();
  };
  renderTop3();

  // ========== 今日时间轴 ==========
  function renderTimeline() {
    var tl = $('timeline');
    if (!tl) return;
    var schedule = [
      { time: '05:15', task: '读书（共读）' },
      { time: '06:40', task: '敲胆经 + 八段锦' },
      { time: '13:00', task: '做脸/美容' },
      { time: '17:00', task: '练字' },
      { time: '20:00', task: '呼啦圈力量训练' }
    ];
    var now = new Date();
    var cur = now.getHours() * 60 + now.getMinutes();
    tl.innerHTML = schedule.map(function (s) {
      var parts = s.time.split(':');
      var mins = Number(parts[0]) * 60 + Number(parts[1]);
      var done = mins < cur;
      return '<div class="timeline-item ' + (done ? 'done' : '') + '">' +
        '<span style="font-size:13px;color:var(--text-light);min-width:48px;">' + s.time + '</span>' +
        '<span>' + s.task + '</span>' +
      '</div>';
    }).join('');
  }
  renderTimeline();
  setInterval(renderTimeline, 60000);

  // ========== 快捷打卡 ==========
  function getCheckinKey() { return today() + '_checkins'; }
  function renderCheckins() {
    var key = getCheckinKey();
    var done = JSON.parse(localStorage.getItem(key) || '[]');
    document.querySelectorAll('.checkin-btn').forEach(function (btn) {
      var span = btn.querySelector('span:last-child');
      if (!span) return;
      var type = span.textContent;
      if (done.indexOf(type) !== -1) btn.classList.add('checked');
      else btn.classList.remove('checked');
    });
  }
  window.quickCheckin = function (type) {
    var key = getCheckinKey();
    var done = JSON.parse(localStorage.getItem(key) || '[]');
    var idx = done.indexOf(type);
    if (idx !== -1) done.splice(idx, 1);
    else done.push(type);
    localStorage.setItem(key, JSON.stringify(done));
    renderCheckins();
  };
  renderCheckins();

  // ========== 番茄钟 ==========
  var pomoTimer = null, pomoLeft = 0;
  window.startPomodoro = function () {
    pomoLeft = 25 * 60;
    var disp = $('pomodoro-display');
    if (disp) disp.style.display = 'block';
    updatePomo();
    clearInterval(pomoTimer);
    pomoTimer = setInterval(function () {
      pomoLeft--;
      updatePomo();
      if (pomoLeft <= 0) {
        clearInterval(pomoTimer);
        var pd = $('pomodoro-display');
        if (pd) pd.innerHTML = '<span style="color:var(--accent-warm);font-size:18px;">✨ 你做得很好，起来喝口水吧。</span>';
        setTimeout(function () {
          var p = $('pomodoro-display');
          if (p) p.style.display = 'none';
        }, 8000);
      }
    }, 1000);
  };
  window.stopPomodoro = function () {
    clearInterval(pomoTimer);
    var p = $('pomodoro-display');
    if (p) p.style.display = 'none';
  };
  function updatePomo() {
    var m = Math.floor(pomoLeft / 60), s = pomoLeft % 60;
    var el = $('pomo-time');
    if (el) el.textContent = pad(m) + ':' + pad(s);
  }

  // ========== 本月微摘要 ==========
  function renderMonthlySummary() {
    var d = new Date();
    var ym = d.getFullYear() + '-' + pad(d.getMonth() + 1);
    var monthIncomes = 0, obj = DATA.incomes[ym];
    if (obj) Object.keys(obj).forEach(function (k) { monthIncomes += Number(obj[k] || 0); });
    var monthExpenses = 0, eobj = DATA.expenses[ym];
    if (eobj) Object.keys(eobj).forEach(function (k) { monthExpenses += Number(eobj[k] || 0); });
    var monthSavings = DATA.savings.filter(function (s) { return s.date && s.date.indexOf(ym) === 0; })
      .reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
    var balance = monthIncomes - monthExpenses - monthSavings;
    var checkinDays = Object.keys(localStorage).filter(function (k) { return k.endsWith('_checkins') && k.indexOf(ym) !== -1; }).length;
    var sportCount = DATA.sports.filter(function (s) { return s.date && s.date.indexOf(ym) === 0; }).length;
    var el = $('monthly-summary-content');
    if (!el) return;
    el.innerHTML =
      '<div class="summary-item"><span class="label">💵 收入</span><span class="value">' + fmtMoney(monthIncomes) + '</span></div>' +
      '<div class="summary-item"><span class="label">💸 支出</span><span class="value">' + fmtMoney(monthExpenses) + '</span></div>' +
      '<div class="summary-item"><span class="label">🐷 存钱</span><span class="value">' + fmtMoney(monthSavings) + '</span></div>' +
      '<div class="summary-item"><span class="label">✅ 结余</span><span class="value">' + fmtMoney(balance) + '</span></div>' +
      '<div class="summary-item"><span class="label">🏃 运动</span><span class="value">' + sportCount + ' 次</span></div>' +
      '<div class="summary-item"><span class="label">✅ 打卡</span><span class="value">' + checkinDays + ' 天</span></div>';
  }
  renderMonthlySummary();

  // ========== 计划·任务 ==========
  window.addTask = function () {
    var inp = $('new-task-input'), cat = $('new-task-category');
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) return;
    DATA.tasks.push({ text: text, cat: cat ? cat.value : '生活', done: false, date: today() });
    inp.value = '';
    saveData(DATA);
    renderTasks();
  };
  window.toggleTask = function (i) {
    DATA.tasks[i].done = !DATA.tasks[i].done;
    saveData(DATA);
    renderTasks();
  };
  window.deleteTask = function (i) {
    DATA.tasks.splice(i, 1);
    saveData(DATA);
    renderTasks();
  };
  function renderTasks() {
    var list = $('task-list');
    if (!list) return;
    var td = today();
    var todays = DATA.tasks.filter(function (t) { return t.date === td; });
    if (!todays.length) { list.innerHTML = '<p style="font-size:13px;color:var(--text-light)">今天还没有任务，加一个吧。</p>'; }
    else {
      list.innerHTML = todays.map(function (t) {
        var realIdx = DATA.tasks.indexOf(t);
        return '<div class="task-item ' + (t.done ? 'done' : '') + '">' +
          '<input type="checkbox" ' + (t.done ? 'checked' : '') + ' onchange="toggleTask(' + realIdx + ')" />' +
          '<span class="task-name">' + t.text + '</span>' +
          '<span class="task-cat task-cat-' + t.cat + '">' + t.cat + '</span>' +
          '<button onclick="deleteTask(' + realIdx + ')">✕</button>' +
        '</div>';
      }).join('');
    }
    var all = todays;
    var done = all.filter(function (t) { return t.done; }).length;
    if ($('task-completion-rate')) $('task-completion-rate').textContent = all.length ? Math.round(done / all.length * 100) + '%' : '0%';
    var streak = 0;
    for (var si = 0; si < 365; si++) {
      var sd = new Date(); sd.setDate(sd.getDate() - si);
      var ds = sd.toISOString().slice(0, 10);
      var arr = JSON.parse(localStorage.getItem(ds + '_checkins') || '[]');
      if (arr.length > 0) streak++;
      else if (si > 0) break;
    }
    if ($('task-streak')) $('task-streak').textContent = streak;
  }
  renderTasks();

  // ========== 习惯打卡 ==========
  window.addCustomHabit = function () {
    var inp = $('new-habit-name');
    if (!inp) return;
    var name = inp.value.trim();
    if (!name) return;
    DATA.habits.push({ name: name, done: false });
    inp.value = '';
    saveData(DATA);
    renderHabits();
  };
  window.toggleHabit = function (i) {
    DATA.habits[i].done = !DATA.habits[i].done;
    saveData(DATA);
    renderHabits();
  };
  function renderHabits() {
    var el = $('habit-grid');
    if (!el) return;
    el.innerHTML = DATA.habits.map(function (h, i) {
      return '<div class="habit-item">' +
        '<input type="checkbox" ' + (h.done ? 'checked' : '') + ' onchange="toggleHabit(' + i + ')" />' +
        '<span>' + h.name + '</span>' +
      '</div>';
    }).join('');
  }
  if (DATA.habitsDate !== today()) {
    DATA.habits.forEach(function (h) { h.done = false; });
    DATA.habitsDate = today();
    saveData(DATA);
  }
  renderHabits();

  // ========== 财务·收入 ==========
  window.saveIncome = function () {
    var ym = new Date().getFullYear() + '-' + pad(new Date().getMonth() + 1);
    DATA.incomes[ym] = {
      salary: $('income-salary').value || 0,
      performance: $('income-performance').value || 0,
      bonus: $('income-bonus').value || 0,
      other: $('income-other').value || 0
    };
    saveData(DATA);
    renderFinance();
    renderMonthlySummary();
    alert('收入已保存 💰');
  };

  // ========== 财务·支出 ==========
  window.saveExpense = function () {
    var ym = new Date().getFullYear() + '-' + pad(new Date().getMonth() + 1);
    DATA.expenses[ym] = {
      daily: $('expense-daily').value || 0,
      edu: $('expense-edu').value || 0,
      medical: $('expense-medical').value || 0,
      other: $('expense-other').value || 0
    };
    saveData(DATA);
    renderFinance();
    renderMonthlySummary();
    alert('支出已保存 💸');
  };

  // ========== 学费溪流 ==========
  window.saveTuition = function () {
    var child = $('tuition-child'), amt = $('tuition-amount'), note = $('tuition-note');
    if (!amt) return;
    var amount = Number(amt.value) || 0;
    if (!amount) return;
    var c = child ? child.value : 'qibao';
    DATA.tuition[c].saved += amount;
    DATA.savings.push({ goal: '学费', amount: amount, note: (note && note.value) || '', date: today() });
    if (amt) amt.value = ''; if (note) note.value = '';
    saveData(DATA);
    renderFinance();
    renderMonthlySummary();
  };
  function renderTuition() {
    var qTotal = DATA.tuition.qibao.items.reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
    var zTotal = DATA.tuition.zhiye.items.reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
    var total = qTotal + zTotal;
    var saved = (DATA.tuition.qibao.saved || 0) + (DATA.tuition.zhiye.saved || 0);
    var pct = total ? Math.min(100, Math.round(saved / total * 100)) : 0;
    if ($('tuition-percent')) $('tuition-percent').textContent = pct + '%';
    if ($('tuition-saved')) $('tuition-saved').textContent = fmtMoney(saved);
    if ($('tuition-target')) $('tuition-target').textContent = fmtMoney(total);
    var monthNow = new Date().getMonth() + 1;
    var monthsLeft = 12 - monthNow + 1;
    if ($('tuition-monthly')) $('tuition-monthly').textContent = fmtMoney(Math.round(total / Math.max(monthsLeft, 1)));
    var tw = $('tuition-water');
    if (tw) tw.style.height = pct + '%';
    if ($('tuition-qibao-list')) {
      $('tuition-qibao-list').innerHTML = DATA.tuition.qibao.items.map(function (i) {
        return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;"><span>' + i.name + '</span><span>' + fmtMoney(i.amount) + '</span></div>';
      }).join('') +
      '<div style="display:flex;justify-content:space-between;font-weight:600;font-size:13px;padding:4px 0;border-top:1px solid rgba(0,0,0,0.04);"><span>已存</span><span>' + fmtMoney(DATA.tuition.qibao.saved) + '</span></div>';
    }
    if ($('tuition-zhiye-list')) {
      $('tuition-zhiye-list').innerHTML = DATA.tuition.zhiye.items.map(function (i) {
        return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;"><span>' + i.name + '</span><span>' + fmtMoney(i.amount) + '</span></div>';
      }).join('') +
      '<div style="display:flex;justify-content:space-between;font-weight:600;font-size:13px;padding:4px 0;border-top:1px solid rgba(0,0,0,0.04);"><span>已存</span><span>' + fmtMoney(DATA.tuition.zhiye.saved) + '</span></div>';
    }
  }

  // ========== 水珠存钱目标 ==========
  window.addGoal = function () {
    var name = $('new-goal-name'), amt = $('new-goal-amount'), color = $('new-goal-color');
    if (!name || !amt) return;
    if (!name.value.trim() || !Number(amt.value)) { alert('请填写名称和金额'); return; }
    DATA.goals.push({
      name: name.value.trim(),
      target: Number(amt.value) || 0,
      saved: 0,
      color: color ? color.value : 'peach'
    });
    name.value = ''; amt.value = '';
    saveData(DATA);
    renderFinance();
  };
  window.saveSaving = function () {
    var sel = $('saving-goal-select');
    var amt = $('saving-amount'), note = $('saving-note');
    if (!sel || sel.selectedIndex < 0 || !amt) return;
    var amount = Number(amt.value) || 0;
    if (!amount) return;
    DATA.goals[sel.selectedIndex].saved += amount;
    DATA.savings.push({ goal: DATA.goals[sel.selectedIndex].name, amount: amount, note: (note && note.value) || '', date: today() });
    amt.value = ''; if (note) note.value = '';
    saveData(DATA);
    renderFinance();
    renderMonthlySummary();
  };
  function renderGoals() {
    var container = $('water-drop-container');
    if (!container) return;
    container.innerHTML = DATA.goals.map(function (g) {
      var pct = g.target ? Math.min(100, Math.round(g.saved / g.target * 100)) : 0;
      var fill = Math.max(20, pct);
      return '<div class="water-drop ' + g.color + ' ' + (pct >= 100 ? 'full' : '') + '">' +
        '<div class="water-drop-shape" style="--drop-height:' + fill + '%;">' +
          '<div style="position:absolute;top:6px;left:0;right:0;text-align:center;font-size:11px;color:white;z-index:2;text-shadow:0 1px 2px rgba(0,0,0,0.2);">' + pct + '%</div>' +
        '</div>' +
        '<div class="water-drop-name">' + g.name + '</div>' +
        '<div class="water-drop-amount">' + fmtMoney(g.saved) + ' / ' + fmtMoney(g.target) + '</div>' +
        '<div class="water-drop-progress">' + (pct >= 100 ? '✨ 已满！' : '还差 ' + fmtMoney(g.target - g.saved)) + '</div>' +
      '</div>';
    }).join('');
    var sel = $('saving-goal-select');
    if (sel) sel.innerHTML = DATA.goals.map(function (g) { return '<option>' + g.name + '</option>'; }).join('');
    var hist = $('saving-history');
    if (hist) {
      var recent = DATA.savings.slice(-10).reverse();
      hist.innerHTML = recent.length ? recent.map(function (s) {
        return '<div class="saving-entry"><span>📅 ' + s.date + '</span><span>' + s.goal + '</span><span style="margin-left:auto;color:var(--primary-dark);">+' + fmtMoney(s.amount) + '</span></div>';
      }).join('') : '<p style="font-size:13px;color:var(--text-light)">还没有存钱记录。</p>';
    }
  }

  // ========== 财务总渲染 ==========
  function renderFinance() {
    var d = new Date();
    var ym = d.getFullYear() + '-' + pad(d.getMonth() + 1);
    var monthIncomes = 0, obj = DATA.incomes[ym];
    if (obj) Object.keys(obj).forEach(function (k) { monthIncomes += Number(obj[k] || 0); });
    var monthExpenses = 0, eobj = DATA.expenses[ym];
    if (eobj) Object.keys(eobj).forEach(function (k) { monthExpenses += Number(eobj[k] || 0); });
    var monthSavings = DATA.savings.filter(function (s) { return s.date && s.date.indexOf(ym) === 0; })
      .reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
    if ($('month-income')) $('month-income').textContent = fmtMoney(monthIncomes);
    if ($('month-expense')) $('month-expense').textContent = fmtMoney(monthExpenses);
    if ($('month-saving')) $('month-saving').textContent = fmtMoney(monthSavings);
    if ($('month-balance')) $('month-balance').textContent = fmtMoney(monthIncomes - monthExpenses - monthSavings);
    renderGoals();
    renderTuition();
  }

  // ========== 健康·体重 ==========
  window.saveWeight = function () {
    var w = $('weight-input');
    if (!w || !Number(w.value)) return;
    DATA.weight.push({ date: today(), value: Number(w.value) });
    w.value = '';
    saveData(DATA);
    renderHealth();
  };

  // ========== 健康·运动 ==========
  window.saveSport = function () {
    var type = $('sport-type'), dur = $('sport-duration'), cal = $('sport-calories'), feel = $('sport-feeling');
    if (!dur || !Number(dur.value)) return;
    DATA.sports.push({
      type: type ? type.value : '跑步',
      duration: Number(dur.value) || 0,
      calories: Number((cal && cal.value) || 0),
      feeling: (feel && feel.value) || '',
      date: today()
    });
    if (dur) dur.value = ''; if (cal) cal.value = ''; if (feel) feel.value = '';
    saveData(DATA);
    renderHealth();
  };

  // ========== 健康·心情 ==========
  window.selectMood = function (mood) {
    DATA._currentMood = mood;
    document.querySelectorAll('.mood-selector span').forEach(function (s) { s.classList.remove('selected'); });
    if (event && event.target) event.target.classList.add('selected');
  };
  window.saveMood = function () {
    var mood = DATA._currentMood || '😊 一般';
    var reason = $('mood-reason'), grateful = $('grateful-list');
    DATA.moods.push({
      mood: mood,
      reason: (reason && reason.value) || '',
      grateful: (grateful && grateful.value) || '',
      date: today()
    });
    if (reason) reason.value = ''; if (grateful) grateful.value = '';
    saveData(DATA);
    renderHealth();
    alert('心情已记录 🌊');
  };

  function renderHealth() {
    var cv = $('weight-chart');
    if (cv && DATA.weight.length) {
      var ctx = cv.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      cv.width = cv.clientWidth * dpr; cv.height = 120 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var w = cv.clientWidth, h = 120;
      ctx.clearRect(0, 0, w, h);
      var vals = DATA.weight.slice(-14);
      var min = Math.min.apply(null, vals.map(function (v) { return v.value; })) - 1;
      var max = Math.max.apply(null, vals.map(function (v) { return v.value; })) + 1;
      var stepX = w / Math.max(vals.length - 1, 1);
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1;
      for (var i = 0; i <= 4; i++) { var y = h - 20 - i * (h - 40) / 4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = '#88c9d9'; ctx.lineWidth = 2.5; ctx.beginPath();
      vals.forEach(function (v, i) {
        var x = i * stepX + 10;
        var y = h - 20 - (v.value - min) / (max - min) * (h - 40);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      vals.forEach(function (v, i) {
        var x = i * stepX + 10;
        var y = h - 20 - (v.value - min) / (max - min) * (h - 40);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#5baab8'; ctx.fill();
      });
    }
    var weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    var ws = weekStart.toISOString().slice(0, 10);
    var weekSports = DATA.sports.filter(function (s) { return s.date >= ws; });
    if ($('week-sport-count')) $('week-sport-count').textContent = weekSports.length;
    if ($('week-sport-duration')) $('week-sport-duration').textContent = weekSports.reduce(function (a, b) { return a + b.duration; }, 0);
    var sh = $('sport-history');
    if (sh) {
      var recent = DATA.sports.slice(-8).reverse();
      sh.innerHTML = recent.length ? recent.map(function (s) {
        return '<div class="sport-entry"><span>' + s.date + '</span><span>' + s.type + ' ' + s.duration + '分钟</span><span style="margin-left:auto;font-size:12px;color:var(--text-light)">' + (s.feeling || '') + '</span></div>';
      }).join('') : '<p style="font-size:13px;color:var(--text-light)">还没有运动记录。</p>';
    }
    var mc = $('mood-chart');
    if (mc && DATA.moods.length) {
      var ctx2 = mc.getContext('2d');
      var dpr2 = window.devicePixelRatio || 1;
      mc.width = mc.clientWidth * dpr2; mc.height = 80 * dpr2;
      ctx2.setTransform(dpr2, 0, 0, dpr2, 0, 0);
      var w2 = mc.clientWidth, h2 = 80;
      ctx2.clearRect(0, 0, w2, h2);
      var recent2 = DATA.moods.slice(-14);
      var moodScore = function (m) {
        var map = { '😄开心': 5, '😌平静': 4, '💪充实': 4, '😩疲惫': 2, '😰焦虑': 1, '😢难过': 1, '😊一般': 3 };
        return map[m] || 3;
      };
      var min2 = 1, max2 = 5, stepX2 = w2 / Math.max(recent2.length - 1, 1);
      ctx2.strokeStyle = 'rgba(0,0,0,0.04)'; ctx2.lineWidth = 1;
      for (var i2 = 0; i2 <= 4; i2++) { var y2 = h2 - 10 - i2 * (h2 - 20) / 4; ctx2.beginPath(); ctx2.moveTo(0, y2); ctx2.lineTo(w2, y2); ctx2.stroke(); }
      ctx2.strokeStyle = '#b794f6'; ctx2.lineWidth = 2; ctx2.beginPath();
      recent2.forEach(function (m, i) {
        var x = i * stepX2 + 5;
        var y = h2 - 10 - (moodScore(m.mood) - min2) / (max2 - min2) * (h2 - 20);
        if (i === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
      });
      ctx2.stroke();
    }
  }

  // ========== 精进·四步 ==========
  window.analyzeReflection = function () {
    var inp = $('reflection-input');
    if (!inp) return;
    var input = inp.value.trim();
    if (!input) { alert('先写点什么吧 🌊'); return; }
    var result = $('reflection-result');
    if (!result) return;
    var sentences = input.split(/[。！？!?]/).filter(function (s) { return s.trim(); }).slice(0, 5);
    var summary = sentences.map(function (s, i) { return '<li>' + s.trim().slice(0, 40) + '</li>'; }).join('');
    var styles = [
      { name: '人民日报体', gen: function (t) { return '「' + t.slice(0, 12) + '……」——这不仅是个人选择，更是时代缩影。'; } },
      { name: '网络金句体', gen: function (t) { return '你有没有发现：' + t.slice(0, 15) + '？这就是生活给你的答案。'; } },
      { name: '心灵鸡汤体', gen: function (t) { return '亲爱的，请记住：' + t.slice(0, 15) + '。你已经很棒了。'; } }
    ];
    var quotes = styles.map(function (s) { return '<p><strong>【' + s.name + '】</strong> ' + s.gen(input) + '</p>'; }).join('');
    var keywords = { '时间': '时间管理', '焦虑': '情绪调节', '钱': '财务规划', '英语': '语言学习', '学习': '自我成长', '健康': '身心健康', '口才': '表达能力', '存钱': '财务自由' };
    var tag = '自我成长';
    Object.keys(keywords).forEach(function (k) { if (input.indexOf(k) !== -1) tag = keywords[k]; });
    var thoughts = {
      '时间管理': '把大目标拆成每天 25 分钟的小块，比"我要好好利用时间"有效 10 倍。',
      '情绪调节': '焦虑的反面不是快乐，而是"具体"——把担心的事写下来，一件件变成可执行的动作。',
      '财务规划': '先存再花，而不是花完再存。哪怕每月只存 500 元，也是在给未来的自己投票。',
      '语言学习': '每天读 1 句 + 跟读 3 遍，比一周猛学 3 小时效果好得多。',
      '自我成长': '成长不是直线上升，而是螺旋式前进。允许自己有"平台期"。',
      '身心健康': '身体的小信号（失眠/肩酸/疲惫）是它在向你求救，别等到崩溃才重视。',
      '表达能力': '先说结论，再说理由，最后给一个例子。这个结构能解决 80% 的表达问题。',
      '财务自由': '财务自由不是"有很多钱"，而是"被动收入 > 日常支出"。先算清你的数字。'
    };
    var actions = [
      '明天早上起床后，花 5 分钟写下今天最想完成的一件事。',
      '本周内，针对"' + tag + '"这个主题，做一件具体的小事（哪怕只花 15 分钟）。',
      '今晚睡前，写下今天做得好的 1 件小事，对自己说一句谢谢。'
    ];
    result.innerHTML =
      '<div class="reflection-step"><h4>📝 第一步 · 概括整理</h4><ul>' + (summary || '<li>（内容较短，已记录）</li>') + '</ul></div>' +
      '<div class="reflection-step"><h4>✨ 第二步 · 金句风格</h4>' + quotes + '</div>' +
      '<div class="reflection-step"><h4>🌐 第三步 · 延展思考（' + tag + '）</h4><p>' + (thoughts[tag] || thoughts['自我成长']) + '</p></div>' +
      '<div class="reflection-step"><h4>🎯 第四步 · 明天就能做的行动</h4><ul>' + actions.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul></div>';
    DATA.reflections.push({ input: input, result: result.innerHTML, date: today(), tag: tag });
    saveData(DATA);
    renderReflections();
  };
  function renderReflections() {
    var el = $('reflection-history');
    if (!el) return;
    var recent = DATA.reflections.slice(-6).reverse();
    el.innerHTML = recent.length ? recent.map(function (r) {
      return '<div class="history-item"><span style="font-size:12px;color:var(--text-light)">' + r.date + ' · ' + r.tag + '</span><p style="font-size:13px;margin-top:4px;">' + r.input.slice(0, 60) + '</p></div>';
    }).join('') : '<p style="font-size:13px;color:var(--text-light)">还没有记录。</p>';
  }
  renderReflections();

  // ========== 热点 ==========
  var HOT_DATA = {
    finance: [
      { title: '央行宣布降准0.5个百分点，释放长期资金约1万亿元', tag: '财经' },
      { title: '医保局：2026年居民医保人均财政补助标准提高30元', tag: '医保' },
      { title: '个人养老金制度扩围：年缴费上限拟提至18000元', tag: '财经' },
      { title: '多地调整最低工资标准，平均涨幅约5.6%', tag: '民生' }
    ],
    audit: [
      { title: '国家医保局飞检组进驻12省，重点核查骨科、心内科高值耗材', tag: '稽核' },
      { title: 'DRG/DIP支付方式改革三年行动计划收官评估启动', tag: '稽核' },
      { title: '2026年上半年医保基金监管追回资金超42亿元', tag: '稽核' }
    ],
    guide: [
      { title: '国家医保局发布《2026版医疗服务价格项目立项指南》', tag: '立项' },
      { title: '新增"互联网+护理""安宁疗护"等28个立项项目', tag: '立项' },
      { title: '口腔种植费用治理：单颗均价降至5000元以内', tag: '立项' }
    ],
    curated: [
      { title: '卫健委：将"睡眠健康"纳入基本公共卫生服务包', tag: '精选' },
      { title: '教育部：推进"每天一节体育课"，中小学体质健康标准再升级', tag: '精选' },
      { title: '女性职业健康新规：孕期可申请远程办公', tag: '精选' },
      { title: '长期护理保险试点扩至60城，覆盖失能人群超2000万', tag: '精选' }
    ]
  };
  window.refreshHot = function () {
    var r = Math.floor(Math.random() * 4);
    if ($('hot-finance')) $('hot-finance').innerHTML = HOT_DATA.finance.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-财经">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
    if ($('hot-medical-audit')) $('hot-medical-audit').innerHTML = HOT_DATA.audit.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-医保">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
    if ($('hot-medical-guide')) $('hot-medical-guide').innerHTML = HOT_DATA.guide.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-立项">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
    if ($('hot-curated')) $('hot-curated').innerHTML = HOT_DATA.curated.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-精选">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
  };
  // 首次加载
  if ($('hot-finance')) $('hot-finance').innerHTML = HOT_DATA.finance.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-财经">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
  if ($('hot-medical-audit')) $('hot-medical-audit').innerHTML = HOT_DATA.audit.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-医保">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
  if ($('hot-medical-guide')) $('hot-medical-guide').innerHTML = HOT_DATA.guide.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-立项">' + h.tag + '</span>' + h.title + '</div>'; }).join('');
  if ($('hot-curated')) $('hot-curated').innerHTML = HOT_DATA.curated.map(function (h) { return '<div class="hot-item"><span class="hot-tag hot-tag-精选">' + h.tag + '</span>' + h.title + '</div>'; }).join('');

  // ========== 月度复盘（三封信） ==========
  function buildMonthOptions() {
    var sel = $('review-month-select');
    if (!sel) return;
    var d = new Date();
    var html = '';
    for (var i = 0; i < 6; i++) {
      var dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
      var ym = dt.getFullYear() + '-' + pad(dt.getMonth() + 1);
      html += '<option value="' + ym + '">' + dt.getFullYear() + '年' + (dt.getMonth() + 1) + '月</option>';
    }
    sel.innerHTML = html;
    sel.value = d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }
  window.generateMonthlyReview = function () {
    var sel = $('review-month-select');
    if (!sel) return;
    var ym = sel.value;
    var monthIncomes = 0, obj = DATA.incomes[ym];
    if (obj) Object.keys(obj).forEach(function (k) { monthIncomes += Number(obj[k] || 0); });
    var monthExpenses = 0, eobj = DATA.expenses[ym];
    if (eobj) Object.keys(eobj).forEach(function (k) { monthExpenses += Number(eobj[k] || 0); });
    var monthSavings = DATA.savings.filter(function (s) { return s.date && s.date.indexOf(ym) === 0; })
      .reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
    var balance = monthIncomes - monthExpenses - monthSavings;
    var monthTasks = DATA.tasks.filter(function (t) { return t.date && t.date.indexOf(ym) === 0; });
    var doneTasks = monthTasks.filter(function (t) { return t.done; });
    var monthSports = DATA.sports.filter(function (s) { return s.date && s.date.indexOf(ym) === 0; });
    var monthMoods = DATA.moods.filter(function (m) { return m.date && m.date.indexOf(ym) === 0; });
    var goodMoods = monthMoods.filter(function (m) { return ['😄开心', '😌平静', '💪充实'].indexOf(m.mood) !== -1; }).length;
    var monthRefs = DATA.reflections.filter(function (r) { return r.date.indexOf(ym) === 0; });
    var rc = $('review-content');
    if (!rc) return;
    rc.innerHTML =
      '<div class="review-letter">' +
        '<h3>💌 给过去的自己</h3>' +
        '<p>这个月你' + (monthTasks.length ? '完成了 ' + doneTasks.length + '/' + monthTasks.length + ' 件计划中的事' : '还没有正式记录计划') + '，</p>' +
        '<p>运动了 ' + monthSports.length + ' 次，累计 ' + monthSports.reduce(function (a, b) { return a + b.duration; }, 0) + ' 分钟，</p>' +
        '<p>存下了 ' + fmtMoney(monthSavings) + '，</p>' +
        '<p>写下了 ' + monthRefs.length + ' 条精进笔记。</p>' +
        '<p style="margin-top:8px;color:var(--primary-dark);">' + (monthTasks.length ? '光是坚持打开 WorkBuddy 这件事，就值得一句谢谢。' : '这个月或许有些忙乱，但你在尝试，这本身就很重要。') + '</p>' +
      '</div>' +
      '<div class="review-letter">' +
        '<h3>🌊 给现在的自己</h3>' +
        '<p>本月收入 ' + fmtMoney(monthIncomes) + '，支出 ' + fmtMoney(monthExpenses) + '，存钱 ' + fmtMoney(monthSavings) + '，结余 ' + fmtMoney(balance) + '。</p>' +
        '<p>心情平稳度：' + (monthMoods.length ? Math.round(goodMoods / monthMoods.length * 100) + '% 处于积极状态' : '暂无心情记录') + '。</p>' +
        '<p style="margin-top:8px;color:var(--text-light);">' + (balance >= 0 ? '收支结构健康，继续保持这个节奏。' : '本月支出略高，下月可以稍微留意一下日常开支。') + '</p>' +
      '</div>' +
      '<div class="review-letter">' +
        '<h3>🌱 给下个月的自己</h3>' +
        '<p>想改善的三件事：</p>' +
        '<p>1. <input type="text" placeholder="第一件想改善的事..." style="width:70%;" /></p>' +
        '<p>2. <input type="text" placeholder="第二件想改善的事..." style="width:70%;" /></p>' +
        '<p>3. <input type="text" placeholder="第三件想改善的事..." style="width:70%;" /></p>' +
        '<p style="margin-top:8px;color:var(--text-light);font-size:13px;">不用写得多宏大，小到"每天多喝一杯水"都可以。</p>' +
      '</div>';
  };
  buildMonthOptions();

  // ========== 每周小憩（周日弹出） ==========
  function checkWeeklyRest() {
    var d = new Date();
    if (d.getDay() !== 0) return;
    var key = 'weekly_rest_' + d.getFullYear() + '_' + Math.floor(d.getDate() / 7);
    if (localStorage.getItem(key)) return;
    var rest = $('weekly-rest-content');
    if (!rest) return;
    rest.innerHTML =
      '<p style="font-size:14px;margin-bottom:8px;">这周你做得很好。停下来，跟自己待一分钟。</p>' +
      '<p>这周最让你开心的一件事：</p>' +
      '<input type="text" id="wr-happy" placeholder="写下来..." style="margin-bottom:6px;" />' +
      '<p>下周你最想做的一件事：</p>' +
      '<input type="text" id="wr-next" placeholder="写下来..." style="margin-bottom:6px;" />' +
      '<p>对自己说一句话：</p>' +
      '<input type="text" id="wr-self" placeholder="温柔一点..." />' +
      '<button onclick="saveWeeklyRest(\'' + key + '\')" class="btn-primary" style="margin-top:10px;">保存这份温柔</button>';
  }
  window.saveWeeklyRest = function (key) {
    var happy = $('wr-happy'), next = $('wr-next'), self = $('wr-self');
    var data = {
      happy: happy ? happy.value : '',
      next: next ? next.value : '',
      self: self ? self.value : '',
      date: today()
    };
    DATA.weeklyRest[key] = data;
    localStorage.setItem(key, JSON.stringify(data));
    saveData(DATA);
    var rest = $('weekly-rest-content');
    if (rest) rest.innerHTML = '<p style="color:var(--primary-dark);">🌙 谢谢你自己。好好休息吧。</p>';
  };
  checkWeeklyRest();

  // ========== 初始化 ==========
  renderFinance();
  renderHealth();
  renderTasks();
  updateDate();

})();
