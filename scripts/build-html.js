const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf-8"));

// Strip leading "n. " from category titles, keep the number separately.
const categories = data.categories.map((c) => {
  const m = c.title.match(/^(\d+)\.\s*(.+)$/);
  return {
    num: m ? m[1] : "",
    title: m ? m[2] : c.title,
    questions: c.questions.map((q) => ({
      q: q.q,
      choices: q.choices,
      correct: q.correct,
      explain: q.explain,
    })),
  };
});

const dataJson = JSON.stringify(categories).replace(/<\/script/gi, "<\\/script");

const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);
const pageSub = `${categories.length}カテゴリ・全${totalQuestions}問。選んで、確かめて、次へ進みます。`;

const html = `<title>Git・GitHub学習クイズ</title>
<style>
  @font-face { font-family: "system-mono"; src: local("SF Mono"); }

  :root {
    --bg: #f6f5f1;
    --surface: #ffffff;
    --surface-2: #edeae2;
    --ink: #1e2430;
    --ink-dim: #656d7a;
    --ink-faint: #9198a3;
    --border: #ded9cd;
    --accent: #2b56d6;
    --accent-ink: #ffffff;
    --accent-soft: #e8edfc;
    --good: #1c9457;
    --good-bg: #e3f5ea;
    --good-ink: #14603a;
    --bad: #c8433f;
    --bad-bg: #fbeaea;
    --bad-ink: #8f2e2b;
    --shadow: 0 1px 2px rgba(30, 36, 48, 0.04), 0 8px 24px -12px rgba(30, 36, 48, 0.18);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #14171d;
      --surface: #1b1f27;
      --surface-2: #242a34;
      --ink: #e8eaef;
      --ink-dim: #9aa3b2;
      --ink-faint: #6b7280;
      --border: #2c323d;
      --accent: #6f8dff;
      --accent-ink: #0c1220;
      --accent-soft: rgba(111, 141, 255, 0.14);
      --good: #3ed687;
      --good-bg: rgba(62, 214, 135, 0.12);
      --good-ink: #7fe8ae;
      --bad: #ff6f6a;
      --bad-bg: rgba(255, 111, 106, 0.12);
      --bad-ink: #ff9c98;
      --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 12px 28px -14px rgba(0, 0, 0, 0.6);
    }
  }

  :root[data-theme="dark"] {
    --bg: #14171d;
    --surface: #1b1f27;
    --surface-2: #242a34;
    --ink: #e8eaef;
    --ink-dim: #9aa3b2;
    --ink-faint: #6b7280;
    --border: #2c323d;
    --accent: #6f8dff;
    --accent-ink: #0c1220;
    --accent-soft: rgba(111, 141, 255, 0.14);
    --good: #3ed687;
    --good-bg: rgba(62, 214, 135, 0.12);
    --good-ink: #7fe8ae;
    --bad: #ff6f6a;
    --bad-bg: rgba(255, 111, 106, 0.12);
    --bad-ink: #ff9c98;
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 12px 28px -14px rgba(0, 0, 0, 0.6);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans",
      "Yu Gothic", "Noto Sans JP", sans-serif;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  .mono {
    font-family: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Menlo, Consolas, monospace;
    font-variant-numeric: tabular-nums;
  }

  #app {
    max-width: 720px;
    margin: 0 auto;
    padding: 28px 20px 80px;
  }

  a, button { font: inherit; color: inherit; }

  button {
    cursor: pointer;
    border: none;
    background: none;
    -webkit-tap-highlight-color: transparent;
  }

  button:focus-visible, [tabindex]:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* ---------- top bar ---------- */

  .topbar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    letter-spacing: 0.06em;
    color: var(--ink-faint);
  }

  .brand .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    flex: none;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--ink-dim);
    padding: 6px 4px;
    border-radius: 6px;
  }
  .back-link:hover { color: var(--ink); }

  /* ---------- home ---------- */

  h1.page-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 6px;
    text-wrap: balance;
  }

  .page-sub {
    color: var(--ink-dim);
    font-size: 14.5px;
    margin: 0 0 24px;
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .stat-tile {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
  }

  .stat-tile .label {
    font-size: 11.5px;
    color: var(--ink-faint);
    letter-spacing: 0.03em;
    margin-bottom: 4px;
  }

  .stat-tile .value {
    font-size: 20px;
    font-weight: 700;
  }
  .stat-tile .value.good { color: var(--good-ink); }
  .stat-tile .value.bad { color: var(--bad-ink); }

  .random-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--accent);
    color: var(--accent-ink);
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 28px;
    box-shadow: var(--shadow);
    transition: transform 0.15s ease;
  }
  .random-btn:hover { transform: translateY(-1px); }
  @media (prefers-reduced-motion: reduce) { .random-btn { transition: none; } }

  .random-btn .rb-text { display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
  .random-btn .rb-title { font-weight: 700; font-size: 15px; }
  .random-btn .rb-sub { font-size: 12.5px; opacity: 0.85; }
  .random-btn .rb-arrow { font-size: 18px; opacity: 0.9; }

  .cat-rail {
    position: relative;
    padding-left: 22px;
  }

  .cat-rail::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 14px;
    bottom: 14px;
    width: 1.5px;
    background: var(--border);
  }

  .cat-item {
    position: relative;
    display: block;
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 13px 14px 13px 16px;
    margin-bottom: 10px;
  }

  .cat-item:hover { border-color: var(--accent); }

  .cat-item::before {
    content: "";
    position: absolute;
    left: -22px;
    top: 22px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--ink-faint);
  }

  .cat-item[data-state="progress"]::before { border-color: var(--accent); background: var(--accent-soft); }
  .cat-item[data-state="done"]::before { border-color: var(--good); background: var(--good); }

  .cat-head {
    display: flex;
    align-items: baseline;
    gap: 9px;
    margin-bottom: 6px;
  }

  .cat-num {
    font-size: 12px;
    color: var(--ink-faint);
  }

  .cat-title {
    font-size: 15.5px;
    font-weight: 600;
  }

  .cat-stats {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--ink-dim);
    margin-bottom: 8px;
  }
  .cat-stats b.good { color: var(--good-ink); font-weight: 700; }
  .cat-stats b.bad { color: var(--bad-ink); font-weight: 700; }

  .bar-track {
    height: 4px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
  }

  /* ---------- quiz ---------- */

  .quiz-head {
    margin-bottom: 18px;
  }

  .quiz-cat-label {
    font-size: 12.5px;
    color: var(--ink-faint);
    letter-spacing: 0.02em;
    margin-bottom: 10px;
  }

  .progress-dots {
    display: flex;
    gap: 5px;
  }

  .progress-dots span {
    flex: 1;
    height: 4px;
    border-radius: 3px;
    background: var(--surface-2);
  }
  .progress-dots span[data-s="current"] { background: var(--ink-faint); }
  .progress-dots span[data-s="good"] { background: var(--good); }
  .progress-dots span[data-s="bad"] { background: var(--bad); }

  .q-eyebrow {
    font-size: 12.5px;
    color: var(--ink-faint);
    margin: 16px 0 8px;
  }

  .q-text {
    font-size: 18.5px;
    font-weight: 700;
    line-height: 1.6;
    text-wrap: balance;
    margin: 0 0 18px;
  }

  .choice-list { display: flex; flex-direction: column; gap: 8px; }

  .choice {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
  }

  .choice:not([disabled]):hover { border-color: var(--accent); }

  .choice .mark {
    flex: none;
    width: 14px;
    font-size: 13px;
    font-weight: 700;
    color: transparent;
    padding-top: 1px;
  }

  .choice .badge {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--surface-2);
    color: var(--ink-dim);
    font-size: 12.5px;
    font-weight: 700;
  }

  .choice .ctext { padding-top: 2px; font-size: 14.5px; }

  .choice[data-result="correct"] {
    background: var(--good-bg);
    border-color: var(--good);
  }
  .choice[data-result="correct"] .badge { background: var(--good); color: #fff; }
  .choice[data-result="correct"] .mark { color: var(--good-ink); }

  .choice[data-result="wrong"] {
    background: var(--bad-bg);
    border-color: var(--bad);
  }
  .choice[data-result="wrong"] .badge { background: var(--bad); color: #fff; }
  .choice[data-result="wrong"] .mark { color: var(--bad-ink); }

  .choice[data-result="muted"] { opacity: 0.55; }

  .explain-panel {
    margin-top: 14px;
    background: var(--surface-2);
    border-left: 3px solid var(--accent);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 13.5px;
    color: var(--ink-dim);
    animation: rise 0.22s ease both;
  }
  @media (prefers-reduced-motion: reduce) { .explain-panel { animation: none; } }
  @keyframes rise {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .explain-panel .tag {
    display: block;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 4px;
  }

  .next-row { margin-top: 20px; display: flex; justify-content: flex-end; min-height: 44px; }

  .btn-primary {
    background: var(--ink);
    color: var(--bg);
    padding: 11px 20px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
  }
  :root:not([data-theme="light"]) .btn-primary,
  :root[data-theme="dark"] .btn-primary { background: var(--accent); color: var(--accent-ink); }

  .btn-ghost {
    border: 1px solid var(--border);
    padding: 11px 20px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }

  /* ---------- result ---------- */

  .result-wrap { text-align: center; padding: 30px 0 10px; }
  .result-score {
    font-size: 46px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .result-score span { font-size: 20px; font-weight: 600; color: var(--ink-faint); }
  .result-rate { color: var(--ink-dim); font-size: 14px; margin: 6px 0 26px; }
  .result-actions { display: flex; gap: 10px; justify-content: center; }

  .hidden { display: none !important; }
</style>

<div id="app"></div>

<script>
  const DATA = ${dataJson};
  const STORAGE_KEY = "gitgithub-quiz-progress-v1";

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  let progress = loadProgress();

  function ensureCat(ci) {
    if (!progress[ci]) {
      progress[ci] = { seen: new Array(DATA[ci].questions.length).fill(false), hits: 0, misses: 0, combo: 0, best: 0 };
    }
    return progress[ci];
  }

  const app = document.getElementById("app");

  // ---- session state for an in-progress quiz ----
  let session = null; // { catIndex, order: [qIndexes], pos, answers: [null|bool], isRandom, pool: [{ci,qi}] }

  function letters() { return ["ア", "イ", "ウ", "エ"]; }

  function overallStats() {
    let answered = 0, hits = 0, misses = 0, best = 0;
    DATA.forEach((c, i) => {
      const p = progress[i];
      if (!p) return;
      answered += p.seen.filter(Boolean).length;
      hits += p.hits;
      misses += p.misses;
      best = Math.max(best, p.best || 0);
    });
    return { answered, hits, misses, best, total: DATA.reduce((s, c) => s + c.questions.length, 0) };
  }

  function renderHome() {
    session = null;
    const os = overallStats();
    const rate = os.hits + os.misses > 0 ? Math.round((os.hits / (os.hits + os.misses)) * 100) : 0;

    let html = '';
    html += '<div class="topbar"><div class="brand"><span class="dot"></span><span class="mono">git log --learn</span></div></div>';
    html += '<h1 class="page-title">Git・GitHub 学習クイズ</h1>';
    html += '<p class="page-sub">${pageSub}</p>';

    html += '<div class="stat-row">';
    html += '<div class="stat-tile"><div class="label">回答済み</div><div class="value mono">' + os.answered + ' <span style="font-size:13px;color:var(--ink-faint);font-weight:500;">/ ' + os.total + '</span></div></div>';
    html += '<div class="stat-tile"><div class="label">正答率</div><div class="value mono ' + (rate >= 70 ? 'good' : '') + '">' + rate + '%</div></div>';
    html += '<div class="stat-tile"><div class="label">ベストコンボ</div><div class="value mono">' + os.best + '</div></div>';
    html += '</div>';

    html += '<button class="random-btn" id="randomBtn"><span class="rb-text"><span class="rb-title">ランダム10問に挑戦</span><span class="rb-sub">全カテゴリから出題</span></span><span class="rb-arrow">→</span></button>';

    html += '<div class="cat-rail">';
    DATA.forEach((c, i) => {
      const p = progress[i];
      const total = c.questions.length;
      const seenCount = p ? p.seen.filter(Boolean).length : 0;
      const hits = p ? p.hits : 0;
      const misses = p ? p.misses : 0;
      const unseen = total - seenCount;
      const state = seenCount === 0 ? "todo" : (seenCount === total ? "done" : "progress");
      const pct = Math.round((seenCount / total) * 100);
      html += '<button class="cat-item" data-state="' + state + '" data-cat="' + i + '">';
      html += '<div class="cat-head"><span class="cat-num mono">' + c.num.padStart(2, "0") + '</span><span class="cat-title">' + escapeHtml(c.title) + '</span></div>';
      html += '<div class="cat-stats mono"><span>未出題 ' + unseen + '</span><span class="good">正答 ' + hits + '</span><span class="bad">誤答 ' + misses + '</span></div>';
      html += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>';
      html += '</button>';
    });
    html += '</div>';

    app.innerHTML = html;

    document.getElementById("randomBtn").addEventListener("click", startRandomQuiz);
    document.querySelectorAll(".cat-item").forEach((el) => {
      el.addEventListener("click", () => startCategoryQuiz(parseInt(el.dataset.cat, 10)));
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function startCategoryQuiz(ci) {
    ensureCat(ci);
    session = {
      mode: "cat",
      catIndex: ci,
      pool: DATA[ci].questions.map((q, qi) => ({ ci, qi })),
      pos: 0,
      results: [],
    };
    renderQuestion();
  }

  function startRandomQuiz() {
    const all = [];
    DATA.forEach((c, ci) => c.questions.forEach((q, qi) => all.push({ ci, qi })));
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    session = { mode: "random", pool: all.slice(0, 10), pos: 0, results: [] };
    renderQuestion();
  }

  function currentQuestion() {
    const { ci, qi } = session.pool[session.pos];
    return { cat: DATA[ci], q: DATA[ci].questions[qi], ci, qi };
  }

  function renderQuestion() {
    const { cat, q, ci } = currentQuestion();
    const total = session.pool.length;
    const pos = session.pos;

    let html = '';
    html += '<div class="topbar"><button class="back-link" id="backBtn">← カテゴリ一覧</button></div>';
    html += '<div class="quiz-head">';
    html += '<div class="quiz-cat-label mono">' + (session.mode === "random" ? "ランダム10問" : cat.num.padStart(2, "0") + " " + escapeHtml(cat.title)) + '</div>';
    html += '<div class="progress-dots" id="dots">';
    for (let i = 0; i < total; i++) {
      let state = i < pos ? (session.results[i] ? "good" : "bad") : (i === pos ? "current" : "todo");
      html += '<span data-s="' + state + '"></span>';
    }
    html += '</div></div>';

    html += '<div class="q-eyebrow mono">問 ' + (pos + 1) + ' / ' + total + '</div>';
    html += '<div class="q-text">' + escapeHtml(q.q) + '</div>';

    html += '<div class="choice-list" id="choiceList">';
    q.choices.forEach((c, idx) => {
      html += '<button class="choice" data-idx="' + idx + '"><span class="mark mono" data-mark></span><span class="badge mono">' + letters()[idx] + '</span><span class="ctext">' + escapeHtml(c) + '</span></button>';
    });
    html += '</div>';

    html += '<div id="explainWrap"></div>';
    html += '<div class="next-row" id="nextRow"></div>';

    app.innerHTML = html;

    document.getElementById("backBtn").addEventListener("click", renderHome);
    document.querySelectorAll("#choiceList .choice").forEach((el) => {
      el.addEventListener("click", () => selectChoice(parseInt(el.dataset.idx, 10)));
    });
  }

  function selectChoice(idx) {
    const { cat, q, ci, qi } = currentQuestion();
    const correct = idx === q.correct;

    if (session.mode === "cat") {
      const p = ensureCat(ci);
      if (!p.seen[qi]) p.seen[qi] = true;
      if (correct) { p.hits++; p.combo++; p.best = Math.max(p.best, p.combo); }
      else { p.misses++; p.combo = 0; }
      saveProgress(progress);
    }
    session.results[session.pos] = correct;

    document.querySelectorAll("#choiceList .choice").forEach((el) => {
      const i = parseInt(el.dataset.idx, 10);
      el.setAttribute("disabled", "true");
      const markEl = el.querySelector("[data-mark]");
      if (i === q.correct) { el.dataset.result = "correct"; markEl.textContent = "+"; }
      else if (i === idx) { el.dataset.result = "wrong"; markEl.textContent = "−"; }
      else { el.dataset.result = "muted"; }
    });

    document.getElementById("dots").children[session.pos].dataset.s = correct ? "good" : "bad";

    const explainWrap = document.getElementById("explainWrap");
    explainWrap.innerHTML = '<div class="explain-panel"><span class="tag">解説</span>' + escapeHtml(q.explain) + '</div>';

    const isLast = session.pos === session.pool.length - 1;
    const nextRow = document.getElementById("nextRow");
    nextRow.innerHTML = '<button class="btn-primary" id="nextBtn">' + (isLast ? "結果を見る" : "次の問題へ →") + '</button>';
    document.getElementById("nextBtn").addEventListener("click", () => {
      if (isLast) { renderResult(); }
      else { session.pos++; renderQuestion(); }
    });
  }

  function renderResult() {
    const total = session.pool.length;
    const correctCount = session.results.filter(Boolean).length;
    const rate = Math.round((correctCount / total) * 100);

    let html = '';
    html += '<div class="topbar"><button class="back-link" id="backBtn">← カテゴリ一覧</button></div>';
    html += '<div class="result-wrap">';
    html += '<div class="q-eyebrow mono" style="text-align:center;">' + (session.mode === "random" ? "ランダム10問" : escapeHtml(DATA[session.catIndex].title)) + '</div>';
    html += '<div class="result-score mono">' + correctCount + '<span> / ' + total + ' 正解</span></div>';
    html += '<div class="result-rate mono">正答率 ' + rate + '%</div>';
    html += '<div class="result-actions">';
    html += '<button class="btn-ghost" id="retryBtn">もう一度解く</button>';
    html += '<button class="btn-primary" id="homeBtn">カテゴリ一覧に戻る</button>';
    html += '</div></div>';

    app.innerHTML = html;
    document.getElementById("backBtn").addEventListener("click", renderHome);
    document.getElementById("homeBtn").addEventListener("click", renderHome);
    document.getElementById("retryBtn").addEventListener("click", () => {
      if (session.mode === "random") startRandomQuiz();
      else startCategoryQuiz(session.catIndex);
    });
  }

  renderHome();
</script>
`;

fs.writeFileSync(path.join(ROOT, "dist", "gitquiz_app.html"), html);
console.log("wrote", html.length, "bytes");
