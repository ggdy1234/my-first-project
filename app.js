/* ============================================================
   WorkBuddy · 温柔成长工作台  —  主逻辑
   ============================================================ */

(() => {
'use strict';

// ---------- 工具函数 ----------
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const today = () => new Date().toISOString().slice(0, 10);
const now   = () => new Date();
const fmt   = (d) => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; };
const daysDiff = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);
const randomId = () => Math.random().toString(36).slice(2, 10);
const weekDays  = ['日','一','二','三','四','五','六'];
const weekDaysShort = ['日','一','二','三','四','五','六'];

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function confettiBurst(x, y) {
  const colors = ['#FFD6E0','#A8E6CF','#D4C5F9','#FFB088','#A0D2F7','#FFF3CD'];
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = x + 'px';
    c.style.top  = y + 'px';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.animation = `confetti ${0.6+Math.random()*0.4}s ease forwards`;
    c.style.transform = `translate(${(Math.random()-0.5)*80}px, ${(Math.random()-0.5)*80}px) rotate(${Math.random()*360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }
}

// ---------- 数据存储 ----------
const DB = {
  get(k, d = null) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem(k); }
};

// ---------- 初始示例数据 ----------
function seedData() {
  if (DB.get('seeded')) return;
  DB.set('seeded', true);

  // 任务
  DB.set('tasks', [
    { id: randomId(), name: '完成工作报告', time: '09:00', cat: 'work', priority: 'high', note: '', done: false, date: today() },
    { id: randomId(), name: '阅读30分钟', time: '20:30', cat: 'study', priority: 'mid', note: '', done: false, date: today() },
    { id: randomId(), name: '整理票据', time: '14:00', cat: 'life', priority: 'low', note: '', done: false, date: today() },
  ]);

  // 三件事
  DB.set('threeThings', [
    { id: randomId(), text: '完成京剧视频脚本初稿', priority: 'high', done: false },
    { id: randomId(), text: '跑步30分钟', priority: 'mid', done: false },
    { id: randomId(), text: '读《思考，快与慢》1章', priority: 'low', done: false },
  ]);

  // 习惯
  DB.set('habits', [
    { id: randomId(), name: '早睡', emoji: '🌙', checked: false, streak: 3, history: {} },
    { id: randomId(), name: '早起', emoji: '☀️', checked: false, streak: 5, history: {} },
    { id: randomId(), name: '喝水', emoji: '💧', checked: false, streak: 7, history: {} },
    { id: randomId(), name: '运动', emoji: '🏃', checked: false, streak: 2, history: {} },
    { id: randomId(), name: '阅读', emoji: '📖', checked: false, streak: 4, history: {} },
    { id: randomId(), name: '存钱', emoji: '💰', checked: false, streak: 1, history: {} },
    { id: randomId(), name: '冥想', emoji: '🧘', checked: false, streak: 0, history: {} },
  ]);

  // 存钱目标
  DB.set('savingGoals', [
    { id: randomId(), name: '骐宝学费', icon: '🎓', target: 88000, saved: 12000, monthly: 7333, color: 'linear-gradient(90deg,#FFB088,#F5A8C8)' },
    { id: randomId(), name: '旅行基金', icon: '✈️', target: 10000, saved: 2500, color: 'linear-gradient(90deg,#A0D2F7,#D4C5F9)' },
    { id: randomId(), name: '应急金', icon: '🛡️', target: 30000, saved: 8000, color: 'linear-gradient(90deg,#A8E6CF,#A0D2F7)' },
    { id: randomId(), name: '学习基金', icon: '📚', target: 5000, saved: 1200, color: 'linear-gradient(90deg,#FFF3CD,#FFB088)' },
  ]);

  // 书籍
  DB.set('books', [
    { id: randomId(), title: '思考，快与慢', author: '丹尼尔·卡尼曼', status: 'reading', progress: 45, rating: 0, cover: '🧠', notes: [] },
    { id: randomId(), title: '被讨厌的勇气', author: '岸见一郎', status: 'reading', progress: 70, rating: 0, cover: '💪', notes: [] },
    { id: randomId(), title: '万历十五年', author: '黄仁宇', status: 'want', progress: 0, rating: 0, cover: '📜', notes: [] },
    { id: randomId(), title: '活着', author: '余华', status: 'done', progress: 100, rating: 5, cover: '🌾', notes: [] },
  ]);

  // 体重
  const w = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    w.push({ date: d.toISOString().slice(0,10), weight: (58 + Math.random()*2 - 1).toFixed(1) });
  }
  DB.set('weight', w);

  // 运动记录
  DB.set('sports', [
    { id: randomId(), type: '跑步', duration: 30, calories: 280, feeling: '畅快', date: today() },
    { id: randomId(), type: '瑜伽', duration: 20, calories: 120, feeling: '轻松', date: new Date(Date.now()-86400000).toISOString().slice(0,10) },
  ]);

  // 心情
  DB.set('moods', {});

  // 收入
  DB.set('incomes', []);

  // 存钱记录
  DB.set('savings', []);

  // 精进日记
  DB.set('growth', []);

  // 草稿
  DB.set('drafts', []);

  // 口才·话术模板
  DB.set('speechTemplates', [
    {
      id: randomId(), cat: 'self', title: '30秒自我介绍（通用版）',
      content: '你好，我是[姓名]，目前从事[行业/岗位]。\n我擅长[核心技能1]和[核心技能2]，最近在深耕[兴趣方向]。\n闲暇时我喜欢[爱好]，因为它让我[收获]。\n很高兴认识大家，期待交流！'
    },
    {
      id: randomId(), cat: 'self', title: '电梯演讲（职场版）',
      content: '我是[姓名]，在[公司]负责[业务线]。\n我们刚做完一个[项目]，把[指标]提升了[数字]%。\n核心方法是[方法论关键词]。\n如果你也关注[领域]，欢迎聊聊。'
    },
    {
      id: randomId(), cat: 'biz', title: '商务沟通·破冰开场',
      content: 'X总您好，感谢您抽出时间。\n我们之前在[场景]有过接触，一直很欣赏贵团队在[领域]的[成果]。\n今天想用15分钟，跟您聊聊一个可能双赢的[合作/想法]。\n您看从哪块开始方便？'
    },
    {
      id: randomId(), cat: 'biz', title: '商务·拒绝话术',
      content: '感谢您的提议，我能感受到您的诚意。\n从我们目前的[资源/阶段/方向]来看，暂时没办法全力配合。\n但我很认可这个方向，能否先保持联系，下个季度再评估？\n也欢迎您把资料发我，我转给相关同事参考。'
    },
    {
      id: randomId(), cat: 'live', title: '直播开场（京剧科普）',
      content: '哈喽家人们！欢迎来到[直播间名称]～\n我是你们的[昵称]，一个让京剧变好玩的[身份]。\n今天要带大家解锁[主题]，只要3分钟，保证你从"听不懂"变成"有点上头"！\n新进来的家人点点关注，咱们马上开始～'
    },
    {
      id: randomId(), cat: 'live', title: '直播·引导互动',
      content: '刚才这段[内容]你觉得怎么样？\n喜欢的家人扣个"1"，想看更多的扣"2"～\n弹幕里我看到有朋友问[问题]，特别好，我来展开说说...'
    },
  ]);

  // 即兴练习题库
  DB.set('improvQuestions', [
    '30秒介绍我的工作台',
    '用1分钟向一个小朋友解释"什么是京剧"',
    '即兴讲述：如果我有超能力，我想...',
    '30秒说服别人读一本你最爱的书',
    '用1分钟描述你理想中的一天',
    '即兴：向投资人介绍你的自媒体账号',
    '30秒讲一个让你感动的小故事',
    '用1分钟解释"为什么存钱很重要"',
    '即兴：夸夸你身边最亲近的人',
    '30秒描述你最喜欢的一句诗/词',
    '用1分钟说服孩子学一门传统艺术',
    '即兴：如果明天是世界末日，今天做什么',
    '30秒介绍一个你最喜欢的京剧角色',
    '用1分钟讲"我为什么做自媒体"',
    '即兴：向陌生人推荐你的城市',
  ]);

  // 复盘录音
  DB.set('speechRecords', []);

  // 即兴练习完成记录
  DB.set('improvDone', {});

  // 连续打卡
  DB.set('streak', 7);
}

// ---------- 导航 ----------
function initNav() {
  $$('.nav-item').forEach(nav => {
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      const page = nav.dataset.page;
      switchPage(page);
    });
  });
}

function switchPage(page) {
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  $$('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  // 更新 hash
  location.hash = page;
  window.scrollTo(0, 0);
  // 页面特定刷新
  if (page === 'sport')  renderSport();
  if (page === 'finance') renderFinance();
  if (page === 'read')   renderRead();
  if (page === 'habit')  renderHabit();
  if (page === 'mood')   renderMood();
  if (page === 'news')   renderNews();
  if (page === 'media')  renderMedia();
  if (page === 'growth') renderGrowth();
  if (page === 'review') renderReview();
  if (page === 'plan')   renderPlan();
  if (page === 'speech') renderSpeech();
}

// ---------- 首页渲染 ----------
const ENCOURAGES = [
  '每一天的努力，都在悄悄开花 🌸',
  '温柔地坚持，比用力更重要 💕',
  '你比自己想象的更强大 🌟',
  '慢慢来，比较快 🍃',
  '今天也是闪闪发光的一天 ✨',
  '小步快跑，日日精进 🏃‍♀️',
  '生活不会亏待认真的人 🎁',
  '你正在成为更好的自己 🦋',
];

const QUOTES = [
  '生活不是等待暴风雨过去，而是学会在雨中跳舞。',
  '星光不问赶路人，时光不负有心人。',
  '每一个不曾起舞的日子，都是对生命的辜负。',
  '温柔半两，从容一生。',
  '你要悄悄拔尖，然后惊艳所有人。',
  '今天也要元气满满鸭！',
  '人生没有白走的路，每一步都算数。',
  '保持热爱，奔赴山海。',
];

function getDayGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return '凌晨好，注意休息呀';
  if (h < 9)  return '早上好，新的一天开始啦';
  if (h < 12) return '上午好，元气满满';
  if (h < 14) return '中午好，记得吃饭哦';
  if (h < 18) return '下午好，继续加油';
  if (h < 22) return '晚上好，辛苦啦';
  return '夜深了，早点休息吧';
}

function renderHome() {
  // 日期
  const d = new Date();
  const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`;
  $('#dateText').textContent = dateStr;
  $('#helloText').textContent = `${getDayGreeting()} 🌷`;

  // 鼓励语
  const idx = d.getDate() % ENCOURAGES.length;
  $('#encourageText').textContent = ENCOURAGES[idx];

  // 连续打卡
  const streak = DB.get('streak', 0);
  $('#streakNum').textContent = streak;

  // 进度
  const tasks = DB.get('tasks', []).filter(t => t.date === today());
  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length || 1;
  const pct = Math.round(doneCount / totalCount * 100);
  $('#progressPercent').textContent = pct + '%';
  $('#progressBarFill').style.width = pct + '%';
  $('#progressHint').textContent = tasks.length === 0
    ? '还没有任务哦，去计划页添加吧~'
    : `已完成 ${doneCount}/${totalCount} 项任务`;

  // 三件事
  renderThreeThings();

  // 时间轴
  renderTimeline();

  // 快捷打卡
  renderQuickCheck();

  // 每周摘要
  renderWeeklyStats();

  // 鼓励语
  const qIdx = d.getDate() % QUOTES.length;
  $('#quoteText').textContent = QUOTES[qIdx];
}

function renderThreeThings() {
  const items = DB.get('threeThings', []);
  const list = $('#threeThingsList');
  list.innerHTML = items.map(item => `
    <div class="three-item ${item.done?'done':''}" data-id="${item.id}">
      <div class="three-check ${item.done?'done':''}" data-action="toggle-three" data-id="${item.id}"></div>
      <div class="three-priority ${item.priority||'mid'}"></div>
      <span class="three-text">${item.text}</span>
      <button class="three-delete" data-action="del-three" data-id="${item.id}">🗑️</button>
    </div>
  `).join('') || '<p class="empty-state-text">还没有设置三件事哦~</p>';

  // 绑定事件
  list.querySelectorAll('[data-action="toggle-three"]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const arr = DB.get('threeThings', []);
      const item = arr.find(t => t.id === id);
      if (item) { item.done = !item.done; DB.set('threeThings', arr); renderThreeThings(); }
    });
  });
  list.querySelectorAll('[data-action="del-three"]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      DB.set('threeThings', DB.get('threeThings', []).filter(t => t.id !== id));
      renderThreeThings();
    });
  });
}

// 固定行程
const FIXED_ROUTINE = [
  { time: '05:15', name: '读书（共读）', tag: '学习' },
  { time: '06:40', name: '敲胆经（站立，八段锦）', tag: '健康' },
  { time: '13:00', name: '做脸/美容', tag: '生活' },
  { time: '17:00', name: '练字', tag: '成长' },
  { time: '20:00', name: '呼啦圈力量训练', tag: '健康' },
];

function renderTimeline() {
  const tasks = DB.get('tasks', []).filter(t => t.date === today()).sort((a,b) => (a.time||'').localeCompare(b.time||''));
  const all = [...FIXED_ROUTINE.map(r => ({...r, fixed: true})), ...tasks.map(t => ({...t, fixed: false}))];
  all.sort((a,b) => (a.time||'').localeCompare(b.time||''));

  $('#timelineList').innerHTML = all.length ? all.map(item => `
    <div class="timeline-item">
      <span class="timeline-time">${item.time}</span>
      <div class="timeline-dot ${item.done?'done':''}"></div>
      <div class="timeline-content ${item.done?'done':''}">
        <div class="tl-title">${item.name}</div>
        <div class="tl-cat">${item.tag || catLabel(item.cat)} ${item.fixed?'· 固定':''}</div>
      </div>
    </div>
  `).join('') : '<p class="empty-state-text">今天还没有安排哦~</p>';
}

function catLabel(cat) {
  return { work:'工作', study:'学习', life:'生活', health:'健康', growth:'成长' }[cat] || '';
}

function renderQuickCheck() {
  const habits = DB.get('habits', []);
  const todayKey = today();
  const quickItems = [
    { key: 'read', label: '阅读', icon: '📖' },
    { key: 'save', label: '存钱', icon: '💰' },
    { key: 'water', label: '饮水', icon: '💧' },
    { key: 'sport', label: '运动', icon: '🏃' },
    { key: 'speech', label: '口才', icon: '🗣️' },
    { key: 'meditate', label: '冥想', icon: '🧘' },
    { key: 'early', label: '早起', icon: '☀️' },
    { key: 'gratitude', label: '感恩', icon: '🙏' },
  ];

  $('#quickGrid').innerHTML = quickItems.map(q => {
    const checked = DB.get(`quick_${q.key}_${todayKey}`, false);
    return `
      <div class="quick-btn ${checked?'checked':''}" data-key="${q.key}">
        <span class="quick-icon">${q.icon}</span>
        <span class="quick-label">${q.label}</span>
      </div>
    `;
  }).join('');

  $$('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (key === 'speech') { switchPage('speech'); return; }
      const storageKey = `quick_${key}_${todayKey}`;
      const now = !DB.get(storageKey, false);
      DB.set(storageKey, now);
      btn.classList.toggle('checked', now);
      if (now) {
        confettiBurst(btn.offsetLeft + 30, btn.offsetTop + 20);
        showToast(`${btn.querySelector('.quick-label').textContent}打卡成功！`);
      }
    });
  });
}

function renderWeeklyStats() {
  const tasks = DB.get('tasks', []);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekTasks = tasks.filter(t => new Date(t.date) >= weekStart);
  const doneTasks = weekTasks.filter(t => t.done).length;

  const sports = DB.get('sports', []);
  const weekSports = sports.filter(s => new Date(s.date) >= weekStart);
  const sportTimes = weekSports.length;
  const sportMins = weekSports.reduce((s,r) => s + (r.duration||0), 0);

  const books = DB.get('books', []);
  const readingBooks = books.filter(b => b.status === 'reading').length;

  const moods = DB.get('moods', {});
  const weekMoods = Object.keys(moods).filter(d => new Date(d) >= weekStart);

  const improvDone = DB.get('improvDone', {});
  const weekImprov = Object.keys(improvDone).filter(d => new Date(d) >= weekStart).length;
  const speechRecs = DB.get('speechRecords', []).filter(r => new Date(r.date) >= weekStart).length;

  $('#weeklyStats').innerHTML = `
    <div class="weekly-item"><span class="weekly-num peach">${doneTasks}</span><span class="weekly-label">完成任务</span></div>
    <div class="weekly-item"><span class="weekly-num mint">${sportTimes}</span><span class="weekly-label">运动次数</span></div>
    <div class="weekly-item"><span class="weekly-num lavender">${weekImprov}</span><span class="weekly-label">口才练习</span></div>
    <div class="weekly-item"><span class="weekly-num pink">${weekMoods.length}</span><span class="weekly-label">记录心情</span></div>
  `;
}

// ---------- 每日计划页 ----------
function renderPlan() {
  const filter = DB.get('taskFilter', 'all');
  $$('.task-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));

  const tasks = DB.get('tasks', []).filter(t => t.date === today());
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.cat === filter);
  const sorted = filtered.sort((a,b) => (a.time||'').localeCompare(b.time||''));

  $('#taskList').innerHTML = sorted.length ? sorted.map(t => `
    <div class="task-item ${t.done?'done':''}" data-id="${t.id}">
      <div class="task-check ${t.done?'done':''}" data-action="toggle-task" data-id="${t.id}"></div>
      <span class="task-cat-icon">${catIcon(t.cat)}</span>
      <div class="task-body">
        <div class="task-name">${t.name}</div>
        <div class="task-meta">${t.time||'未设时间'} · ${catLabel(t.cat)} · ${priLabel(t.priority)}</div>
      </div>
      <div class="task-actions">
        <button class="task-edit" data-action="edit-task" data-id="${t.id}">✏️</button>
        <button class="task-del" data-action="del-task" data-id="${t.id}">🗑️</button>
      </div>
    </div>
  `).join('') : '<p class="empty-state-text">暂无任务，点击右上角添加~</p>';

  // 完成率
  const total = tasks.length || 1;
  const done = tasks.filter(t => t.done).length;
  const pct = Math.round(done / total * 100);
  const circle = $('#completionCircle');
  if (circle) {
    const C = 2 * Math.PI * 50;
    circle.style.strokeDasharray = C;
    circle.style.strokeDashoffset = C * (1 - pct/100);
    // gradient
    if (!document.getElementById('gradient')) {
      const svg = circle.closest('svg');
      const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
      defs.innerHTML = `<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#FFB088"/>
        <stop offset="100%" style="stop-color:#D4C5F9"/>
      </linearGradient>`;
      svg.insertBefore(defs, svg.firstChild);
    }
  }
  const ct = $('#completionText'); if (ct) ct.textContent = pct + '%';

  // 绑定事件
  $$('[data-action="toggle-task"]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const arr = DB.get('tasks', []);
      const t = arr.find(x => x.id === id);
      if (t) { t.done = !t.done; DB.set('tasks', arr); renderPlan(); renderHome(); }
    });
  });
  $$('[data-action="del-task"]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      DB.set('tasks', DB.get('tasks', []).filter(t => t.id !== id));
      renderPlan(); renderHome();
    });
  });

  // 固定行程
  $('#routineList').innerHTML = FIXED_ROUTINE.map(r => `
    <div class="routine-item">
      <span class="routine-time">${r.time}</span>
      <span class="routine-name">${r.name}</span>
      <span class="routine-tag">${r.tag}</span>
    </div>
  `).join('');
}

function catIcon(cat) {
  return { work:'💼', study:'📖', life:'🏠', health:'💪', growth:'🌱' }[cat] || '📌';
}
function priLabel(p) {
  return { high:'🔴 高', mid:'🟡 中', low:'🟢 低' }[p] || '';
}

// 任务标签筛选
$$('.task-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    DB.set('taskFilter', tab.dataset.filter);
    renderPlan();
  });
});

// 添加任务模态框
$('#addTaskBtn').addEventListener('click', () => {
  $('#taskModal').classList.add('active');
  $('#modalTaskName').value = '';
  $('#modalTaskTime').value = '';
  $('#modalTaskNote').value = '';
  $('#modalTaskCat').value = 'work';
  $('#modalTaskPriority').value = 'mid';
});
$('#cancelTaskBtn').addEventListener('click', () => $('#taskModal').classList.remove('active'));
$('#confirmTaskBtn').addEventListener('click', () => {
  const name = $('#modalTaskName').value.trim();
  if (!name) { showToast('请输入任务名称'); return; }
  const task = {
    id: randomId(),
    name,
    time: $('#modalTaskTime').value,
    cat: $('#modalTaskCat').value,
    priority: $('#modalTaskPriority').value,
    note: $('#modalTaskNote').value,
    done: false,
    date: today()
  };
  const arr = DB.get('tasks', []);
  arr.push(task);
  DB.set('tasks', arr);
  $('#taskModal').classList.remove('active');
  renderPlan(); renderHome();
  showToast('任务已添加 ✨');
});

// 添加三件事
$('#addThreeBtn').addEventListener('click', () => {
  const text = prompt('输入一件重要的事：');
  if (text && text.trim()) {
    const arr = DB.get('threeThings', []);
    arr.push({ id: randomId(), text: text.trim(), priority: 'mid', done: false });
    DB.set('threeThings', arr);
    renderThreeThings();
  }
});

// 换鼓励语
$('#refreshQuote').addEventListener('click', () => {
  const d = new Date();
  const idx = Math.floor(Math.random() * QUOTES.length);
  $('#quoteText').textContent = QUOTES[idx];
  showToast('换了一句新的~');
});

// ---------- 运动页 ----------
function renderSport() {
  // 体重图表
  const weights = DB.get('weight', []);
  drawWeightChart(weights);

  // 统计
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekSports = DB.get('sports', []).filter(s => new Date(s.date) >= weekStart);
  $('#weekSportTimes').textContent = weekSports.length;
  $('#weekSportMinutes').textContent = weekSports.reduce((s,r) => s + (r.duration||0), 0);

  // 连续天数
  const sports = DB.get('sports', []);
  let streak = 0;
  let check = today();
  while (sports.some(s => s.date === check)) { streak++; check = new Date(new Date(check).getTime()-86400000).toISOString().slice(0,10); }
  $('#sportStreak').textContent = streak;

  // 日历
  renderSportCalendar(sports);

  // 列表
  const list = sports.slice(-10).reverse();
  $('#sportList').innerHTML = list.length ? list.map(s => `
    <div class="sport-record">
      <span class="sport-record-type">${sportIcon(s.type)}</span>
      <div class="sport-record-info">
        <div class="sport-record-name">${s.type} · ${s.duration}分钟</div>
        <div class="sport-record-detail">${s.calories} kcal · ${s.feeling} · ${fmt(s.date)}</div>
      </div>
      <button class="sport-record-del" data-id="${s.id}">🗑️</button>
    </div>
  `).join('') : '<p class="empty-state-text">还没有运动记录~</p>';

  $$('.sport-record-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      DB.set('sports', DB.get('sports', []).filter(s => s.id !== id));
      renderSport();
    });
  });
}

function sportIcon(type) {
  return { '跑步':'🏃','散步':'🚶','瑜伽':'🧘','力量训练':'💪','骑行':'🚴','呼啦圈':'🌀','八段锦':'🥋' }[type] || '✨';
}

function drawWeightChart(data) {
  const canvas = $('#weightChart');
  if (!canvas || !data.length) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth;
  const h = 120;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);

  const pad = 30;
  const vals = data.map(d => parseFloat(d.weight));
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const xStep = (w - pad*2) / (data.length - 1);

  // 渐变填充
  const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
  grad.addColorStop(0, 'rgba(168,230,207,0.4)');
  grad.addColorStop(1, 'rgba(168,230,207,0.02)');

  // 曲线
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - (vals[i] - min)/(max-min)) * (h - pad*2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad + (data.length-1)*xStep, h - pad);
  ctx.lineTo(pad, h - pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 线条
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - (vals[i] - min)/(max-min)) * (h - pad*2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#5BA88C';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 点
  data.forEach((d, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - (vals[i] - min)/(max-min)) * (h - pad*2);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI*2);
    ctx.fillStyle = '#5BA88C';
    ctx.fill();
  });

  // 最后值
  const last = vals[vals.length-1];
  const lx = pad + (data.length-1)*xStep;
  const ly = pad + (1 - (last-min)/(max-min)) * (h - pad*2);
  ctx.fillStyle = '#4A3F5C';
  ctx.font = '12px system-ui';
  ctx.fillText(last + 'kg', lx - 28, ly - 10);
}

function renderSportCalendar(sports) {
  const cal = $('#sportCalendar');
  const d = new Date();
  const year = d.getFullYear(), month = d.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const sportDates = new Set(sports.map(s => s.date));

  let html = '<div class="cal-header">';
  weekDaysShort.forEach(w => html += `<div class="cal-day-header">${w}</div>`);
  html += '</div>';

  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day).toISOString().slice(0,10);
    const isToday = dt === today();
    const isSport = sportDates.has(dt);
    html += `<div class="cal-cell ${isToday?'today':''} ${isSport?'sport-day':''}">${day}</div>`;
  }
  cal.innerHTML = html;
}

// 保存体重
$('#saveWeightBtn').addEventListener('click', () => {
  const v = parseFloat($('#weightInput').value);
  if (!v || v < 20 || v > 200) { showToast('请输入有效体重(20-200kg)'); return; }
  const arr = DB.get('weight', []);
  arr.push({ date: today(), weight: v.toFixed(1) });
  // 只保留30天
  while (arr.length > 30) arr.shift();
  DB.set('weight', arr);
  $('#weightInput').value = '';
  renderSport();
  showToast('体重已记录 ⚖️');
});

// 保存运动
$('#saveSportBtn').addEventListener('click', () => {
  const type = $('#sportType').value;
  const dur = parseInt($('#sportDuration').value);
  const cal = parseInt($('#sportCalories').value) || 0;
  const feeling = $('#sportFeeling').value;
  if (!dur || dur <= 0) { showToast('请输入运动时长'); return; }
  const arr = DB.get('sports', []);
  arr.push({ id: randomId(), type, duration: dur, calories: cal, feeling, date: today() });
  DB.set('sports', arr);
  $('#sportDuration').value = '';
  $('#sportCalories').value = '';
  renderSport();
  showToast('运动记录已保存 💪');
  confettiBurst(window.innerWidth/2, 200);
});

// 运动目标
$('#weeklyGoalTimes').addEventListener('change', () => showToast('目标已更新'));
$('#weeklyGoalMinutes').addEventListener('change', () => showToast('目标已更新'));

// ---------- 财务页 ----------
function renderFinance() {
  // 收入
  const incomes = DB.get('incomes', []).filter(i => i.date.startsWith(today().slice(0,7)));
  const total = incomes.reduce((s,i) => s + i.amount, 0);
  $('#monthlyIncome').textContent = '¥' + total.toLocaleString();

  // 学费
  const tuitionItems = [
    { name: '骐宝学费', items: [
      { label: '学费1', amount: 24000 },
      { label: '学费2', amount: 17000 },
      { label: '学费3', amount: 15000 },
      { label: '杂费1', amount: 4000 },
      { label: '杂费2', amount: 6000 },
      { label: '兴趣班', amount: 12000 },
      { label: '夏令营', amount: 9000 },
    ]},
    { name: '知烨学费', items: [
      { label: '学费', amount: 15000 },
      { label: '教材', amount: 1000 },
      { label: '活动', amount: 6000 },
    ]},
  ];
  const tuitionTotal = tuitionItems.reduce((s,c) => s + c.items.reduce((a,b) => a+b.amount,0), 0);
  const tuitionSaved = DB.get('savingGoals', []).find(g => g.name === '骐宝学费');
  const saved = tuitionSaved ? tuitionSaved.saved : 0;
  const tPct = Math.min(100, Math.round(saved / tuitionTotal * 100));
  $('#tuitionTotal').textContent = '¥' + tuitionTotal.toLocaleString();
  $('#tuitionSaved').textContent = '¥' + saved.toLocaleString();
  $('#tuitionFill').style.width = tPct + '%';

  // 明细
  const detailOpen = $('#tuitionDetail').style.display !== 'none';
  $('#toggleTuition').textContent = detailOpen ? '收起明细' : '展开明细';
  let detailHtml = '';
  tuitionItems.forEach(cat => {
    detailHtml += `<div style="font-weight:600;margin-top:8px;color:var(--text-primary);font-size:0.85rem;">📌 ${cat.name}</div>`;
    cat.items.forEach(item => {
      detailHtml += `<div class="tuition-row"><span>${item.label}</span><span>¥${item.amount.toLocaleString()}</span></div>`;
    });
  });
  detailHtml += `<div class="tuition-row"><span>合计</span><span>¥${tuitionTotal.toLocaleString()}</span></div>`;
  detailHtml += `<div class="tuition-row"><span>月均（÷12）</span><span>¥${Math.round(tuitionTotal/12).toLocaleString()}/月</span></div>`;
  $('#tuitionDetail').innerHTML = detailHtml;

  // 存钱目标
  const goals = DB.get('savingGoals', []);
  $('#savingGoals').innerHTML = goals.map(g => {
    const pct = Math.min(100, Math.round(g.saved / g.target * 100));
    return `
      <div class="saving-goal-card">
        <div class="sg-header">
          <span class="sg-name"><span class="sg-icon">${g.icon}</span>${g.name}</span>
          <span class="sg-amount">¥${g.saved.toLocaleString()} / ¥${g.target.toLocaleString()}</span>
        </div>
        <div class="sg-bar"><div class="sg-bar-fill" style="width:${pct}%;background:${g.color}"></div></div>
        <div class="sg-footer">
          <span>${pct}% 完成</span>
          <span>剩余 ¥${(g.target - g.saved).toLocaleString()}</span>
        </div>
        <div class="sg-actions" style="margin-top:10px;">
          <button class="sg-btn" data-action="add-save" data-id="${g.id}">＋ 存入</button>
          <button class="sg-btn" data-action="edit-goal" data-id="${g.id}">✏️ 编辑</button>
          <button class="sg-btn" data-action="del-goal" data-id="${g.id}">🗑️ 删除</button>
        </div>
      </div>
    `;
  }).join('') || '<p class="empty-state-text">还没有存钱目标，去添加吧~</p>';

  // 绑定目标操作
  $$('[data-action="add-save"]').forEach(btn => {
    btn.addEventListener('click', () => openSavingModal(btn.dataset.id));
  });
  $$('[data-action="del-goal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('确定删除这个目标吗？')) {
        DB.set('savingGoals', DB.get('savingGoals', []).filter(g => g.id !== btn.dataset.id));
        renderFinance();
      }
    });
  });

  // 存钱记录
  const savings = DB.get('savings', []).slice(-10).reverse();
  const goalsMap = {};
  goals.forEach(g => goalsMap[g.id] = g);
  $('#savingList').innerHTML = savings.length ? savings.map(s => `
    <div class="saving-record">
      <div class="sr-info">
        <span class="sr-amount">+¥${s.amount.toLocaleString()}</span>
        <span class="sr-date">${fmt(s.date)}</span>
      </div>
      <span class="sr-note">${s.note || goalsMap[s.goalId]?.name || ''}</span>
      <button class="sport-record-del" data-id="${s.id}">🗑️</button>
    </div>
  `).join('') : '<p class="empty-state-text">还没有存钱记录~</p>';

  $$('#savingList .sport-record-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const rec = DB.get('savings', []).find(s => s.id === id);
      if (rec) {
        // 回退金额
        const goals = DB.get('savingGoals', []);
        const g = goals.find(g => g.id === rec.goalId);
        if (g) { g.saved = Math.max(0, g.saved - rec.amount); DB.set('savingGoals', goals); }
      }
      DB.set('savings', DB.get('savings', []).filter(s => s.id !== id));
      renderFinance();
    });
  });
}

$('#toggleTuition').addEventListener('click', () => {
  const el = $('#tuitionDetail');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  renderFinance();
});

// 收入
$('#saveIncomeBtn').addEventListener('click', () => {
  const type = $('#incomeType').value;
  const amount = parseInt($('#incomeAmount').value);
  if (!amount || amount <= 0) { showToast('请输入有效金额'); return; }
  const arr = DB.get('incomes', []);
  arr.push({ id: randomId(), type, amount, date: today() });
  DB.set('incomes', arr);
  $('#incomeAmount').value = '';
  renderFinance();
  showToast('收入已记录 💵');
});

// 存钱模态框
function openSavingModal(goalId) {
  const goals = DB.get('savingGoals', []);
  const sel = $('#modalSavingGoal');
  sel.innerHTML = goals.map(g => `<option value="${g.id}">${g.icon} ${g.name}</option>`).join('');
  sel.value = goalId;
  $('#modalSavingAmount').value = '';
  $('#modalSavingNote').value = '';
  $('#savingModal').classList.add('active');
}

$('#addSavingBtn').addEventListener('click', () => openSavingModal(DB.get('savingGoals',[])[0]?.id || ''));
$('#cancelSavingBtn').addEventListener('click', () => $('#savingModal').classList.remove('active'));
$('#confirmSavingBtn').addEventListener('click', () => {
  const goalId = $('#modalSavingGoal').value;
  const amount = parseInt($('#modalSavingAmount').value);
  if (!amount || amount <= 0) { showToast('请输入有效金额'); return; }
  const goals = DB.get('savingGoals', []);
  const g = goals.find(x => x.id === goalId);
  if (g) g.saved += amount;
  DB.set('savingGoals', goals);
  const arr = DB.get('savings', []);
  arr.push({ id: randomId(), goalId, amount, note: $('#modalSavingNote').value, date: today() });
  DB.set('savings', arr);
  $('#savingModal').classList.remove('active');
  renderFinance();
  showToast('存入成功！💰');
  confettiBurst(window.innerWidth/2, 300);
});

// ---------- 阅读页 ----------
function renderRead() {
  const books = DB.get('books', []);
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10);
  const yearRead = books.filter(b => b.status === 'done' && b._doneDate && b._doneDate >= yearStart).length;
  const readDays = new Set(books.filter(b => b._lastRead).map(b => b._lastRead)).size;
  $('#yearReadCount').textContent = yearRead;
  $('#readDayCount').textContent = readDays;

  const coverColors = ['#FFB088','#D4C5F9','#A0D2F7','#A8E6CF','#FFF3CD','#F5A8C8'];
  $('#bookshelf').innerHTML = books.map((b, i) => `
    <div class="book-card">
      <div class="book-cover" style="background:${coverColors[i%coverColors.length]}">${b.cover || '📖'}</div>
      <div class="book-info">
        <div class="book-title">${b.title}</div>
        <div class="book-author">${b.author}</div>
        <div class="book-progress-bar">
          <div class="book-progress-fill" style="width:${b.progress}%;background:${coverColors[i%coverColors.length]}"></div>
        </div>
        <div class="book-meta">
          <span class="book-status ${b.status}">${{reading:'在读',want:'想读',done:'已读'}[b.status]}</span>
          <span>${b.progress}%</span>
          ${b.rating ? '⭐'.repeat(b.rating) : ''}
        </div>
      </div>
      <button class="book-del" data-id="${b.id}">🗑️</button>
    </div>
  `).join('') || '<p class="empty-state-text">书架空空如也~</p>';

  // 笔记书籍选择
  const sel = $('#noteBook');
  sel.innerHTML = books.map(b => `<option value="${b.id}">${b.title}</option>`).join('');

  // 笔记列表
  const allNotes = [];
  books.forEach(b => (b.notes || []).forEach(n => allNotes.push({...n, bookTitle: b.title})));
  allNotes.sort((a,b) => (b.date||'').localeCompare(a.date||''));
  $('#noteList').innerHTML = allNotes.length ? allNotes.slice(0,8).map(n => `
    <div class="note-item">
      <div class="note-book">📖 ${n.bookTitle} · ${fmt(n.date)}</div>
      <div class="note-text">${n.text}</div>
    </div>
  `).join('') : '<p class="empty-state-text">还没有笔记~</p>';

  $$('.book-del').forEach(btn => {
    btn.addEventListener('click', () => {
      DB.set('books', DB.get('books', []).filter(b => b.id !== btn.dataset.id));
      renderRead();
    });
  });
}

$('#addBookBtn').addEventListener('click', () => {
  const title = prompt('书名：');
  if (!title) return;
  const author = prompt('作者：') || '未知';
  const status = prompt('状态(reading/want/done)：') || 'want';
  const progress = parseInt(prompt('进度(0-100)：') || '0');
  const coverOpts = ['📖','🧠','💡','🌟','🎭','🎨','🔬','📜','🌍','💊'];
  const book = {
    id: randomId(), title, author, status,
    progress: status === 'done' ? 100 : progress,
    rating: 0, cover: coverOpts[Math.floor(Math.random()*coverOpts.length)],
    notes: [], _doneDate: status==='done'?today():null
  };
  const arr = DB.get('books', []);
  arr.push(book);
  DB.set('books', arr);
  renderRead();
  showToast('已添加到书架 📚');
});

$('#saveNoteBtn').addEventListener('click', () => {
  const bookId = $('#noteBook').value;
  const text = $('#noteContent').value.trim();
  if (!text) { showToast('请输入笔记内容'); return; }
  const books = DB.get('books', []);
  const b = books.find(x => x.id === bookId);
  if (b) {
    if (!b.notes) b.notes = [];
    b.notes.push({ id: randomId(), text, date: today() });
    b._lastRead = today();
    DB.set('books', books);
    $('#noteContent').value = '';
    renderRead();
    showToast('笔记已保存 ✍️');
  }
});

// 阅读目标
$('#monthlyReadGoal').addEventListener('change', () => showToast('阅读目标已更新'));

// ---------- 精进页 ----------
function renderGrowth() {
  const list = DB.get('growth', []).slice(-5).reverse();
  $('#growthList').innerHTML = list.length ? list.map(g => `
    <div class="growth-item">
      <div class="growth-item-date">${fmt(g.date)}</div>
      <div class="growth-item-text">${g.input.substring(0, 80)}${g.input.length>80?'...':''}</div>
    </div>
  `).join('') : '<p class="empty-state-text">还没有记录~</p>';
}

$('#growthAnalyzeBtn').addEventListener('click', () => {
  const input = $('#growthInput').value.trim();
  if (!input) { showToast('请先写下你的想法或问题'); return; }

  // 模拟智能分析
  const summary = input.length > 50 ? input.substring(0, 50) + '...' : input;
  const quotes = [
    '每一个认真思考的瞬间，都在为未来铺路。',
    '不积跬步，无以至千里；不积小流，无以成江海。',
    '真正的成长，是每天都在比昨天的自己更好一点。',
    '路虽远，行则将至；事虽难，做则必成。',
  ];
  const thinkings = [
    '从系统思维角度看，这个问题涉及多个维度的平衡。建议将大目标拆解为可量化的小步骤，每周复盘一次进度。',
    '结合当前社会趋势，持续学习和自我迭代是核心竞争力。可以考虑建立"输入-消化-输出"的闭环系统。',
    '从心理学角度，行动力不足往往源于目标模糊。建议用SMART原则重新定义目标，并找到内在驱动力。',
  ];

  $('#resultSummary').textContent = `概括：${summary}`;
  $('#resultQuote').textContent = quotes[Math.floor(Math.random()*quotes.length)];
  $('#resultThinking').textContent = thinkings[Math.floor(Math.random()*thinkings.length)];
  $('#resultAction').textContent = '建议下一步：① 将想法转化为具体行动项 ② 设定可量化的里程碑 ③ 每周回顾调整 ④ 寻找同类社群互相督促';
  $('#growthResult').style.display = 'block';

  // 保存
  const arr = DB.get('growth', []);
  arr.push({ id: randomId(), input, date: today(), summary });
  DB.set('growth', arr);
  $('#growthInput').value = '';
  renderGrowth();
  showToast('分析完成 ✨');
});

// ---------- 京剧页 ----------
const TOPIC_SUGGESTIONS = [
  '京剧脸谱色彩科普', '儿童京剧入门动作', '京剧四大行当介绍', '京剧经典唱段赏析',
  '京剧服饰文化故事', '如何教孩子唱京剧', '京剧与古诗词结合', '京剧小知识趣味问答',
  '京剧名家童年故事', '京剧打击乐器认知', '京剧身段基础教学', '京剧亲子互动游戏'
];

function renderMedia() {
  const drafts = DB.get('drafts', []);
  $('#draftList').innerHTML = drafts.length ? drafts.slice(-5).reverse().map(d => `
    <div class="draft-item">
      <div class="draft-title">${d.title}</div>
      <div class="draft-meta">${fmt(d.date)} · ${d.content.substring(0,40)}...</div>
    </div>
  `).join('') : '<p class="empty-state-text">草稿箱空空如也~</p>';

  $('#topicTags').innerHTML = TOPIC_SUGGESTIONS.map(t => `<span class="topic-tag">${t}</span>`).join('');
  $$('.topic-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      $('#mediaTopic').value = tag.textContent;
    });
  });
}

$('#genMediaBtn').addEventListener('click', () => {
  const topic = $('#mediaTopic').value.trim() || '儿童京剧启蒙';
  const titles = [
    `${topic}：让孩子爱上国粹的3个秘诀`,
    `🌸 今日京剧小课堂：${topic}`,
    `${topic}——亲子共学指南`,
  ];
  const title = titles[Math.floor(Math.random()*titles.length)];
  const content = `今天和大家分享关于"${topic}"的内容。京剧是中华民族的瑰宝，让孩子从小接触京剧，不仅能培养艺术素养，更能增强文化自信。本文将从趣味性、互动性和知识性三个维度，为你提供一套完整的儿童京剧启蒙方案...`;

  $('#previewContent').innerHTML = `
    <div class="preview-title">${title}</div>
    <div class="preview-body">${content}</div>
  `;
  $('#previewContent').dataset.title = title;
  $('#previewContent').dataset.content = content;
  showToast('内容已生成 🎭');
});

$('#saveDraftBtn').addEventListener('click', () => {
  const title = $('#previewContent').dataset.title;
  const content = $('#previewContent').dataset.content;
  if (!title) { showToast('请先生成内容'); return; }
  const arr = DB.get('drafts', []);
  arr.push({ id: randomId(), title, content, date: today() });
  DB.set('drafts', arr);
  renderMedia();
  showToast('已存入草稿箱 📂');
});

$('#publishMediaBtn').addEventListener('click', () => {
  const title = $('#previewContent').dataset.title;
  if (!title) { showToast('请先生成内容'); return; }
  showToast('发布指导已生成（模拟）🚀');
  confettiBurst(window.innerWidth/2, 200);
});

// 11:30 自动生成（模拟）
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 11 && now.getMinutes() === 30) {
    if (!DB.get('autoGenToday', '') === today()) {
      DB.set('autoGenToday', today());
      const topics = TOPIC_SUGGESTIONS;
      $('#mediaTopic').value = topics[Math.floor(Math.random()*topics.length)];
      $('#genMediaBtn').click();
    }
  }
}, 60000);

// ---------- 新闻页 ----------
const HOT_NEWS = [
  { rank: 1, title: '2026年医保新规正式实施', heat: '9,823,441' },
  { rank: 2, title: '全国医疗服务价格改革最新进展', heat: '7,234,512' },
  { rank: 3, title: '儿童中医药健康管理服务规范发布', heat: '5,678,901' },
  { rank: 4, title: 'AI辅助诊断纳入医保支付范围', heat: '4,567,123' },
  { rank: 5, title: '多地调整门诊统筹报销比例', heat: '3,456,789' },
];

const MEDICAL_NEWS = [
  { title: '医保违规问题专项整治：聚焦过度检查、串换项目', desc: '国家医保局通报最新一批违规案例，涉及重复收费、超标准收费等问题，提醒医疗机构加强自查自纠。' },
  { title: '医疗服务价格立项指南更新', desc: '新增一批体现技术劳务价值的项目，调整部分检验检查类项目价格，总体不增加患者负担。' },
  { title: '异地就医直接结算覆盖所有统筹区', desc: '跨省异地就医门诊、住院费用直接结算实现全覆盖，备案流程进一步简化。' },
];

function renderNews() {
  $('#hotList').innerHTML = HOT_NEWS.map(h => `
    <div class="hot-item">
      <span class="hot-rank ${h.rank<=3?'top':''}">${h.rank}</span>
      <span class="hot-title">${h.title}</span>
      <span class="hot-heat">🔥 ${h.heat}</span>
    </div>
  `).join('');

  $('#medicalList').innerHTML = MEDICAL_NEWS.map(m => `
    <div class="medical-item">
      <h4>🏥 ${m.title}</h4>
      <p>${m.desc}</p>
    </div>
  `).join('');

  $('#policyList').innerHTML = `
    <div class="policy-item">
      <h4>📋 2026年医保政策核心变化</h4>
      <p>① 个人账户家庭共济范围扩大至祖辈 ② 门诊慢特病保障病种增加 ③ 谈判药品"双通道"管理常态化 ④  DRG/DIP支付改革全面深化</p>
    </div>
    <div class="policy-item">
      <h4>📋 医保违规常见情形提醒</h4>
      <p>① 挂床住院 ② 串换药品/诊疗项目 ③ 虚记费用 ④ 重复收费 ⑤ 超标准收费 ⑥ 分解住院。建议定期自查，规范运营。</p>
    </div>
  `;
}

$('#refreshNewsBtn').addEventListener('click', () => {
  showToast('正在刷新热点...');
  setTimeout(() => {
    // 随机打乱热度
    HOT_NEWS.forEach(h => { h.heat = (Math.random()*5000000+3000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,','); });
    renderNews();
    showToast('热点已更新 🔥');
  }, 800);
});

// 10:30 自动推送（模拟）
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 10 && now.getMinutes() === 30) {
    if (DB.get('newsPushToday') !== today()) {
      DB.set('newsPushToday', today());
      showToast('📰 今日热点已更新');
    }
  }
}, 60000);

// ---------- 口才·表达训练页 ----------
const SPEECH_CAT_LABEL = { self:'🙋 自我介绍', biz:'💼 商务沟通', live:'🎙️ 直播开场', custom:'✨ 自定义' };
let speechCat = 'self';
let improvTimer = null;
let improvSeconds = 30;
let mediaRecorder = null;
let recordChunks = [];
let recordStartTime = 0;

function renderSpeech() {
  // 今日即兴题
  const done = DB.get('improvDone', {});
  const qPool = DB.get('improvQuestions', []);
  let q = DB.get('todayImprov', '');
  if (!q || done[today()] === undefined) {
    q = qPool[Math.floor(Math.random()*qPool.length)] || '用30秒介绍你自己';
    DB.set('todayImprov', q);
  }
  $('#improvTopic').textContent = q;
  const isDone = !!done[today()];
  $('#finishImprovBtn').textContent = isDone ? '✅ 今日已完成' : '✅ 完成练习';
  $('#finishImprovBtn').disabled = isDone;
  if (isDone) $('#finishImprovBtn').style.opacity = '0.5';

  // 话术模板
  $$('.template-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === speechCat));
  const tpls = DB.get('speechTemplates', []).filter(t => t.cat === speechCat);
  $('#templateList').innerHTML = tpls.length ? tpls.map(t => `
    <div class="template-item" data-id="${t.id}">
      <div class="template-item-header">
        <span class="template-item-title">${t.title}</span>
        <span class="template-item-cat">${SPEECH_CAT_LABEL[t.cat]||''}</span>
      </div>
      <div class="template-item-content">${t.content}</div>
      <div class="template-item-actions">
        <button data-act="copy" data-id="${t.id}">📋 复制</button>
        <button data-act="edit" data-id="${t.id}">✏️ 编辑</button>
        <button data-act="del" data-id="${t.id}">🗑️ 删除</button>
      </div>
    </div>
  `).join('') : '<p class="empty-state-text">还没有该分类的话术，点「＋新建」添加~</p>';

  // 绑定话术按钮
  $$('#templateList [data-act="copy"]').forEach(b => b.addEventListener('click', () => {
    const t = DB.get('speechTemplates',[]).find(x=>x.id===b.dataset.id);
    if (t) { navigator.clipboard?.writeText(t.content); showToast('已复制 📋'); }
  }));
  $$('#templateList [data-act="del"]').forEach(b => b.addEventListener('click', () => {
    DB.set('speechTemplates', DB.get('speechTemplates',[]).filter(t=>t.id!==b.dataset.id));
    renderSpeech();
  }));
  $$('#templateList [data-act="edit"]').forEach(b => b.addEventListener('click', () => {
    const t = DB.get('speechTemplates',[]).find(x=>x.id===b.dataset.id);
    if (!t) return;
    $('#templateCat').value = t.cat;
    $('#templateTitle').value = t.title;
    $('#templateContent').value = t.content;
    $('#templateModal').classList.add('active');
    $('#confirmTemplateBtn').onclick = () => {
      t.cat = $('#templateCat').value;
      t.title = $('#templateTitle').value.trim() || '未命名话术';
      t.content = $('#templateContent').value.trim();
      DB.set('speechTemplates', DB.get('speechTemplates',[]));
      $('#templateModal').classList.remove('active');
      renderSpeech();
      showToast('话术已更新 ✏️');
    };
  }));

  // 录音统计
  const recs = DB.get('speechRecords', []);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekRecs = recs.filter(r => new Date(r.date) >= weekStart);
  $('#totalRecords').textContent = recs.length;
  $('#weekRecords').textContent = weekRecs.length;
  $('#totalDuration').textContent = recs.reduce((s,r)=>s+(r.duration||0),0);

  // 录音列表
  const list = recs.slice(-8).reverse();
  $('#recordList').innerHTML = list.length ? list.map(r => `
    <div class="record-item" data-id="${r.id}">
      <button class="record-play" data-act="play" data-id="${r.id}">▶️</button>
      <div class="record-info">
        <div class="record-title">${r.title || '未命名练习'}</div>
        <div class="record-detail">${fmt(r.date)} · ${r.duration||0}分钟</div>
        ${r.improve ? `<div class="record-improve">💡 ${r.improve}</div>` : ''}
      </div>
      <button class="sport-record-del" data-act="del-rec" data-id="${r.id}">🗑️</button>
    </div>
  `).join('') : '<p class="empty-state-text">还没有录音记录~</p>';

  $$('#recordList [data-act="del-rec"]').forEach(b => b.addEventListener('click', () => {
    DB.set('speechRecords', DB.get('speechRecords',[]).filter(r=>r.id!==b.dataset.id));
    renderSpeech();
  }));
  $$('#recordList [data-act="play"]').forEach(b => b.addEventListener('click', () => {
    showToast('播放功能需在支持Audio playback的环境中使用');
  }));
}

// 换一题
$('#refreshImprov').addEventListener('click', () => {
  const pool = DB.get('improvQuestions', []);
  const q = pool[Math.floor(Math.random()*pool.length)];
  DB.set('todayImprov', q);
  $('#improvTopic').textContent = q;
  showToast('新题目已生成 🎲');
});

// 30秒计时器
$('#startImprovTimer').addEventListener('click', () => {
  if (improvTimer) return;
  improvSeconds = 30;
  $('#improvTimer').style.display = 'block';
  const C = 2*Math.PI*44;
  const fill = $('#timerFill');
  fill.style.strokeDasharray = C;
  const tick = () => {
    improvSeconds--;
    $('#timerText').textContent = Math.max(0, improvSeconds);
    fill.style.strokeDashoffset = C * (1 - improvSeconds/30);
    if (improvSeconds <= 0) {
      clearInterval(improvTimer); improvTimer = null;
      showToast('时间到！说说看吧 🎤');
    }
  };
  improvTimer = setInterval(tick, 1000);
  showToast('计时开始 ▶️');
});

// 完成练习
$('#finishImprovBtn').addEventListener('click', () => {
  const done = DB.get('improvDone', {});
  done[today()] = true;
  DB.set('improvDone', done);
  if (improvTimer) { clearInterval(improvTimer); improvTimer = null; }
  $('#improvTimer').style.display = 'none';
  renderSpeech();
  confettiBurst(window.innerWidth/2, 200);
  showToast('今日即兴练习完成！🎉');
});

// 话术分类tab
$$('.template-tab').forEach(tab => {
  tab.addEventListener('click', () => { speechCat = tab.dataset.cat; renderSpeech(); });
});

// 新建话术模态框
$('#addTemplateBtn').addEventListener('click', () => {
  $('#templateCat').value = speechCat;
  $('#templateTitle').value = '';
  $('#templateContent').value = '';
  $('#templateModal').classList.add('active');
  $('#confirmTemplateBtn').onclick = () => {
    const title = $('#templateTitle').value.trim();
    const content = $('#templateContent').value.trim();
    if (!title || !content) { showToast('请填写标题和内容'); return; }
    const arr = DB.get('speechTemplates', []);
    arr.push({ id: randomId(), cat: $('#templateCat').value, title, content });
    DB.set('speechTemplates', arr);
    $('#templateModal').classList.remove('active');
    renderSpeech();
    showToast('话术已保存 📝');
  };
});
$('#cancelTemplateBtn').addEventListener('click', () => $('#templateModal').classList.remove('active'));

// 录音模态框
$('#addSpeechRecordBtn').addEventListener('click', () => {
  $('#recordTitle').value = '';
  $('#recordImprove').value = '';
  $('#recordStatus').textContent = '点击下方按钮开始';
  $('#recordModal').classList.add('active');
});
$('#cancelRecordBtn').addEventListener('click', () => {
  stopRecording();
  $('#recordModal').classList.remove('active');
});

$('#startRecordBtn').addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordChunks = [];
    recordStartTime = Date.now();
    mediaRecorder.ondataavailable = e => { if (e.data.size>0) recordChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordChunks, { type: 'audio/webm' });
      const dur = Math.round((Date.now() - recordStartTime)/60000);
      const arr = DB.get('speechRecords', []);
      arr.push({
        id: randomId(),
        title: $('#recordTitle').value.trim() || '未命名练习',
        improve: $('#recordImprove').value.trim(),
        duration: dur || 1,
        date: today(),
        audioUrl: URL.createObjectURL(blob)
      });
      DB.set('speechRecords', arr);
      stream.getTracks().forEach(t => t.stop());
      $('#recordModal').classList.remove('active');
      renderSpeech();
      showToast('录音已保存 🎤');
    };
    mediaRecorder.start();
    $('#recordStatus').textContent = '🔴 正在录音...再点停止';
    $('#startRecordBtn').textContent = '⏹ 停止录音';
    $('#startRecordBtn').classList.add('recording-pulse');
  } catch(e) {
    showToast('麦克风权限被拒绝或未支持');
  }
});

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
  $('#startRecordBtn').textContent = '🔴 开始录音';
  $('#startRecordBtn').classList.remove('recording-pulse');
  $('#recordStatus').textContent = '已停止';
}

// 录音确认保存（即使没录音也能保存文字复盘）
$('#confirmRecordBtn').addEventListener('click', () => {
  const title = $('#recordTitle').value.trim();
  const improve = $('#recordImprove').value.trim();
  if (!title && !improve) { showToast('请填写点内容'); return; }
  const arr = DB.get('speechRecords', []);
  const dur = mediaRecorder && mediaRecorder.state === 'recording'
    ? Math.round((Date.now()-recordStartTime)/60000) : 0;
  stopRecording();
  // 如果还没在onstop里存过，就在这里存
  if (!arr.find(r => r.date === today() && r.title === title)) {
    arr.push({
      id: randomId(),
      title: title || '未命名练习',
      improve,
      duration: dur || 1,
      date: today(),
    });
    DB.set('speechRecords', arr);
  }
  $('#recordModal').classList.remove('active');
  renderSpeech();
  showToast('复盘已保存 💾');
});

// ---------- 心情页 ----------
const MOODS = [
  { key: 'happy', emoji: '😄', label: '开心' },
  { key: 'calm', emoji: '😌', label: '平静' },
  { key: 'fulfilled', emoji: '💪', label: '充实' },
  { key: 'tired', emoji: '😮‍💨', label: '疲惫' },
  { key: 'anxious', emoji: '😰', label: '焦虑' },
  { key: 'down', emoji: '😢', label: '难过' },
];

function renderMood() {
  const todayMood = DB.get('moods', {})[today()];
  $('#moodSelector').innerHTML = MOODS.map(m => `
    <div class="mood-opt ${todayMood===m.key?'selected':''}" data-mood="${m.key}">
      <span class="mood-emoji">${m.emoji}</span>
      <span class="mood-label">${m.label}</span>
    </div>
  `).join('');

  $$('.mood-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const moods = DB.get('moods', {});
      moods[today()] = opt.dataset.mood;
      DB.set('moods', moods);
      renderMood();
      showToast('心情已记录 💖');
    });
  });

  // 热力图
  const moods = DB.get('moods', {});
  const d = new Date();
  let html = '';
  for (let i = 27; i >= 0; i--) {
    const dt = new Date(d); dt.setDate(d.getDate() - i);
    const key = dt.toISOString().slice(0,10);
    const mood = moods[key];
    const colors = { happy:'#FFD6E0', calm:'#A0D2F7', fulfilled:'#A8E6CF', tired:'#FFF3CD', anxious:'#D4C5F9', down:'#FFB088' };
    const bg = mood ? colors[mood] : '#F5F0F5';
    html += `<div class="mood-heat-cell" style="background:${bg}" title="${key}: ${mood||'未记录'}"></div>`;
  }
  $('#moodHeatmap').innerHTML = html;

  // 图表
  drawMoodChart(moods);
}

function drawMoodChart(moods) {
  const canvas = $('#moodChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth;
  const h = 100;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);

  const pad = 20;
  const moodVals = { happy:5, fulfilled:4, calm:3, tired:2, anxious:1, down:1 };
  const d = new Date();
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(d); dt.setDate(d.getDate() - i);
    const key = dt.toISOString().slice(0,10);
    data.push({ date: key, val: moodVals[moods[key]] || 0 });
  }

  const max = 5, min = 0;
  const xStep = (w - pad*2) / (data.length - 1);

  // 渐变
  const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
  grad.addColorStop(0, 'rgba(212,197,249,0.4)');
  grad.addColorStop(1, 'rgba(212,197,249,0.02)');

  // 填充
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - d.val/(max-min)) * (h - pad*2);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.lineTo(pad+(data.length-1)*xStep, h-pad);
  ctx.lineTo(pad, h-pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 线
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad + i * xStep;
    const y = pad + (1 - d.val/(max-min)) * (h - pad*2);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = '#9B7ED8';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

$('#saveMoodBtn').addEventListener('click', () => {
  const moods = DB.get('moods', {});
  moods[today()] = moods[today()] || 'calm';
  // 保存日记
  const diary = DB.get('diary', {});
  diary[today()] = {
    mood: moods[today()],
    text: $('#moodText').value,
    gratitude: [$('#grate1').value, $('#grate2').value, $('#grate3').value].filter(Boolean),
  };
  DB.set('diary', diary);
  $('#moodText').value = '';
  $('#grate1').value = '';
  $('#grate2').value = '';
  $('#grate3').value = '';
  showToast('日记已保存 💖');
  confettiBurst(window.innerWidth/2, 300);
});

// ---------- 习惯页 ----------
function renderHabit() {
  const habits = DB.get('habits', []);
  const todayKey = today();

  $('#habitGrid').innerHTML = habits.map(h => `
    <div class="habit-card ${h.checked?'checked':''}" data-id="${h.id}">
      <div class="habit-emoji">${h.emoji}</div>
      <div class="habit-name">${h.name}</div>
      <div class="habit-streak">🔥 ${h.streak}天连续</div>
      <div class="habit-rate">${calcHabitRate(h)}%</div>
      <button class="habit-check-btn" data-id="${h.id}">${h.checked?'✓ 已打卡':'打卡'}</button>
    </div>
  `).join('');

  $$('.habit-check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const arr = DB.get('habits', []);
      const h = arr.find(x => x.id === id);
      if (h) {
        h.checked = !h.checked;
        if (h.checked) {
          h.streak++;
          if (!h.history) h.history = {};
          h.history[todayKey] = true;
          confettiBurst(btn.offsetLeft + 40, btn.offsetTop - 10);
          showToast(`${h.name}打卡成功！`);
        } else {
          h.streak = Math.max(0, h.streak - 1);
        }
        DB.set('habits', arr);
        renderHabit();
        // 更新连续打卡总天数
        const totalStreak = Math.max(...arr.map(h => h.streak));
        DB.set('streak', totalStreak);
        renderHome();
      }
    });
  });

  // 月度完成率
  $('#habitMonthlyList').innerHTML = habits.map(h => {
    const rate = calcHabitRate(h);
    const colors = ['#FFB088','#A8E6CF','#D4C5F9','#A0D2F7','#FFF3CD','#F5A8C8','#FFD6E0'];
    const idx = habits.indexOf(h);
    return `
      <div class="habit-monthly-item">
        <span class="hm-name">${h.emoji} ${h.name}</span>
        <div class="hm-bar-wrap">
          <div class="hm-bar-fill" style="width:${rate}%;background:${colors[idx%colors.length]}"></div>
        </div>
        <span class="hm-percent">${rate}%</span>
      </div>
    `;
  }).join('');
}

function calcHabitRate(habit) {
  const history = habit.history || {};
  const d = new Date();
  let count = 0, days = 0;
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(d); dt.setDate(d.getDate() - i);
    const key = dt.toISOString().slice(0,10);
    days++;
    if (history[key]) count++;
  }
  return Math.round(count / days * 100);
}

$('#addHabitBtn').addEventListener('click', () => {
  const name = prompt('习惯名称：');
  if (!name) return;
  const emoji = prompt('选择一个emoji代表它：') || '✨';
  const arr = DB.get('habits', []);
  arr.push({ id: randomId(), name, emoji, checked: false, streak: 0, history: {} });
  DB.set('habits', arr);
  renderHabit();
  showToast('习惯已添加 ✅');
});

// ---------- 复盘页 ----------
function renderReview() {
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const wsStr = weekStart.toISOString().slice(0,10);

  const tasks = DB.get('tasks', []).filter(t => t.date >= wsStr);
  const doneTasks = tasks.filter(t => t.done);
  const sports = DB.get('sports', []).filter(s => s.date >= wsStr);
  const books = DB.get('books', []);
  const moods = DB.get('moods', {});
  const weekMoods = Object.keys(moods).filter(d => d >= wsStr);

  const html = `
    <div class="review-section">
      <h3>📋 本周计划完成</h3>
      <div class="review-stat-row">
        <div class="review-stat"><span class="review-stat-num" style="color:var(--peach)">${tasks.length}</span><span class="review-stat-label">总任务</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--mint)">${doneTasks.length}</span><span class="review-stat-label">已完成</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--lavender)">${tasks.length?Math.round(doneTasks.length/tasks.length*100):0}%</span><span class="review-stat-label">完成率</span></div>
      </div>
      <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:8px;">
        ${doneTasks.length ? doneTasks.slice(0,5).map(t => `✅ ${t.name}`).join('<br>') : '本周还没有完成任务记录~'}
      </div>
    </div>

    <div class="review-section">
      <h3>🏃 运动数据</h3>
      <div class="review-stat-row">
        <div class="review-stat"><span class="review-stat-num" style="color:var(--mint)">${sports.length}</span><span class="review-stat-label">运动次数</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--sky-blue)">${sports.reduce((s,r)=>s+r.duration,0)}</span><span class="review-stat-label">总时长(分)</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--peach)">${sports.reduce((s,r)=>s+(r.calories||0),0)}</span><span class="review-stat-label">消耗(kcal)</span></div>
      </div>
    </div>

    <div class="review-section">
      <h3>📚 阅读进度</h3>
      <div class="review-stat-row">
        <div class="review-stat"><span class="review-stat-num" style="color:var(--lavender)">${books.filter(b=>b.status==='reading').length}</span><span class="review-stat-label">在读</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--mint)">${books.filter(b=>b.status==='done').length}</span><span class="review-stat-label">已读</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--peach)">${books.length?Math.round(books.reduce((s,b)=>s+(b.progress||0),0)/books.length):0}%</span><span class="review-stat-label">平均进度</span></div>
      </div>
    </div>

    <div class="review-section">
      <h3>💰 存钱进度</h3>
      ${DB.get('savingGoals',[]).map(g => {
        const pct = Math.round(g.saved/g.target*100);
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.85rem;">
          <span>${g.icon} ${g.name}</span>
          <span style="color:var(--peach);font-weight:600;">¥${g.saved.toLocaleString()} (${pct}%)</span>
        </div>`;
      }).join('') || '<p class="empty-state-text">还没有存钱目标~</p>'}
    </div>

    <div class="review-section">
      <h3>🗣️ 口才训练</h3>
      <div class="review-stat-row">
        <div class="review-stat"><span class="review-stat-num" style="color:var(--peach)">${DB.get('improvDone',{})[wsStr]||Object.keys(DB.get('improvDone',{})).filter(d=>d>=wsStr).length}</span><span class="review-stat-label">即兴练习</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--lavender)">${DB.get('speechRecords',[]).filter(r=>r.date>=wsStr).length}</span><span class="review-stat-label">复盘录音</span></div>
        <div class="review-stat"><span class="review-stat-num" style="color:var(--mint)">${DB.get('speechTemplates',[]).length}</span><span class="review-stat-label">话术模板</span></div>
      </div>
    </div>

    <div class="review-section">
      <h3>💖 心情回顾</h3>
      <p style="font-size:0.85rem;color:var(--text-secondary);">
        本周记录了 ${weekMoods.length} 天心情
        ${weekMoods.length >= 5 ? '，情绪管理做得不错哦~ 🌸' : '，多关注自己的感受，每天记录一下吧~'}
      </p>
    </div>

    <div class="review-section">
      <h3>⭐ 本周最满意的事</h3>
      <textarea class="review-textarea" placeholder="写下本周让你最有成就感的事..." id="reviewBest"></textarea>
    </div>

    <div class="review-section">
      <h3>🔧 下周想改善的事</h3>
      <textarea class="review-textarea" placeholder="下周想在哪方面做得更好？" id="reviewImprove"></textarea>
    </div>

    <button class="btn-primary" style="width:100%;margin-top:8px;" id="saveReviewBtn">💾 保存复盘</button>
  `;
  $('#reviewContent').innerHTML = html;

  $('#saveReviewBtn').addEventListener('click', () => {
    const data = {
      weekStart: wsStr,
      best: $('#reviewBest').value,
      improve: $('#reviewImprove').value,
      date: today()
    };
    const arr = DB.get('reviews', []);
    arr.push(data);
    DB.set('reviews', arr);
    showToast('复盘已保存 🔄');
    confettiBurst(window.innerWidth/2, 300);
  });
}

$('#genReviewBtn').addEventListener('click', () => {
  renderReview();
  showToast('复盘已生成 📊');
});

// ---------- 引导页 ----------
function initOnboarding() {
  if (!DB.get('onboarded', false)) {
    $('#onboardingOverlay').classList.remove('hidden');
  }
  $('#startBtn').addEventListener('click', () => {
    DB.set('onboarded', true);
    $('#onboardingOverlay').classList.add('hidden');
    showToast('欢迎使用 WorkBuddy 🌸');
  });
}

// ---------- 初始化 ----------
function init() {
  seedData();
  initNav();
  initOnboarding();
  renderHome();

  // 路由
  const hash = location.hash.slice(1) || 'home';
  switchPage(hash);

  // 每日问候定时更新
  setInterval(renderHome, 60000);

  // 未完成任务顺延
  const lastDay = DB.get('lastDayCheck', '');
  if (lastDay && lastDay !== today()) {
    const tasks = DB.get('tasks', []);
    tasks.forEach(t => {
      if (t.date === lastDay && !t.done) { t.date = today(); }
      if (t.date === lastDay && t.done) { t.done = false; t.date = today(); } // 重置每日任务
    });
    DB.set('tasks', tasks);
  }
  DB.set('lastDayCheck', today());

  // 每日重置习惯打卡
  const habitReset = DB.get('habitResetDay', '');
  if (habitReset !== today()) {
    const habits = DB.get('habits', []);
    habits.forEach(h => h.checked = false);
    DB.set('habits', habits);
    DB.set('habitResetDay', today());
  }
}

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
