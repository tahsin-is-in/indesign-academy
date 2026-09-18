/* ============================================================
   app.js — router, data loading, homepage, chrome
   ============================================================ */

let DATA = null;

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function setContent(html) {
  document.getElementById("content").innerHTML = html;
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

async function loadData() {
  const files = ["courses", "lessons", "projects", "exercises", "glossary", "shortcuts", "troubleshooting"];
  const entries = await Promise.all(files.map(async f => {
    const res = await fetch(`data/${f}.json`);
    if (!res.ok) throw new Error(`Failed to load data/${f}.json`);
    return [f, await res.json()];
  }));
  const obj = Object.fromEntries(entries);
  return {
    courses: obj.courses,
    lessons: obj.lessons,
    projects: obj.projects,
    exercises: obj.exercises,
    glossary: obj.glossary,
    shortcuts: obj.shortcuts,
    troubleshooting: obj.troubleshooting
  };
}

/* ---------- Homepage ---------- */
function renderHome() {
  const s = getState();
  const totals = computeTotals(DATA);
  const lvl = currentLevel(DATA);
  const rec = recommendNext(DATA);
  const featured = DATA.projects[Math.floor(hashStr(new Date().toISOString().slice(0, 10)) % DATA.projects.length)];
  const journeyLevels = DATA.courses.levels.slice(0, 8);

  setContent(`
    <div class="hero ticks" style="padding:32px;border:1px solid var(--line);">
      <div class="kicker">INDESIGN ACADEMY</div>
      <h1>Learn InDesign by<br>building real things.</h1>
      <p class="lede">A step-by-step interactive learning system that takes you from your first document to professional publications.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/lessons">Start Learning</a>
        <a class="btn btn-secondary" href="#/projects">Explore Projects</a>
        <a class="btn btn-secondary" href="#/practice">Practice Now</a>
      </div>
      <div class="journey">
        ${journeyLevels.map((l, i) => `<span class="node">${esc(l.title)}</span>${i < journeyLevels.length - 1 ? '<span class="sep">→</span>' : ""}`).join("")}
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat"><span class="num">${totals.overallPct}%</span><span class="label">MASTERY</span></div>
      <div class="stat"><span class="num">${totals.lessonsCompleted}/${totals.lessonsTotal}</span><span class="label">LESSONS</span></div>
      <div class="stat"><span class="num">${totals.exercisesCompleted}/${totals.exercisesTotal}</span><span class="label">EXERCISES</span></div>
      <div class="stat"><span class="num">${totals.projectsCompleted}/${totals.projectsTotal}</span><span class="label">PROJECTS</span></div>
      <div class="stat"><span class="num">${s.streak.count}</span><span class="label">DAY STREAK</span></div>
      <div class="stat"><span class="num">${s.practiceMinutes}</span><span class="label">PRACTICE MIN</span></div>
    </div>

    <div class="grid grid-2" style="align-items:stretch;">
      <div class="panel">
        <span class="block-label">CURRENT LEVEL</span>
        <h3 style="margin-bottom:6px;">${lvl.number} — ${esc(lvl.title)}</h3>
        <p>${esc(lvl.summary)}</p>
        <a class="btn btn-secondary btn-sm" href="#/lessons">Continue this level</a>
      </div>
      <div class="panel">
        <span class="block-label">WHAT SHOULD I LEARN NEXT?</span>
        ${rec ? `
          <h3 style="margin-bottom:6px;">${esc(rec.lesson.title)}</h3>
          <p>${esc(rec.reason)}</p>
          <a class="btn btn-primary btn-sm" href="#/lesson/${rec.lesson.id}">Go to lesson</a>
        ` : `<p>You've completed every lesson. Head to the Capstone.</p><a class="btn btn-primary btn-sm" href="#/capstone">Open Capstone</a>`}
      </div>
    </div>

    <div class="section-head"><h2>Featured Project</h2></div>
    <div class="grid grid-3">${projectCard(featured, s)}</div>

    <div class="section-head"><h2>Today's Challenge</h2><p class="desc"><a href="#/daily">Open Daily Practice →</a></p></div>
    <div class="grid grid-3">
      ${["5min", "15min", "30min"].map(k => `
        <div class="card">
          <span class="eyebrow">${k.replace("min", "-minute")}</span>
          <p>${esc(DATA.exercises.daily[k][hashStr(new Date().toISOString().slice(0,10) + k) % DATA.exercises.daily[k].length])}</p>
          <div class="card-footer"><a class="btn btn-secondary btn-sm" href="#/daily">Open</a></div>
        </div>
      `).join("")}
    </div>
  `);
}

/* ---------- Skill tree ---------- */
function renderSkills() {
  const nodes = skillTreeState(DATA);
  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">PROGRESS</div>
      <h1>Skill Tree</h1>
      <p class="lede">Each level unlocks once the previous one is complete. Locked levels are visible so you always know what's next.</p>
    </div>
    <div class="skill-tree">
      ${nodes.map(n => `
        <div class="skill-node ${n.status}">
          <div>
            <div class="title">${n.number} — ${esc(n.title)}</div>
            <div style="font-size:var(--step-1);color:var(--ink-faint);">${esc(n.summary)}</div>
          </div>
          <div class="status">${n.status === "done" ? "✓ Complete" : n.status === "available" ? `${n.doneCount}/${n.total || "—"}` : "🔒 Locked"}</div>
        </div>
      `).join("")}
    </div>
  `);
}

/* ---------- Achievements ---------- */
function renderAchievements() {
  const s = getState();
  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">PROGRESS</div>
      <h1>Achievements</h1>
      <p class="lede">${s.achievements.length} of ${ACHIEVEMENTS.length} unlocked.</p>
    </div>
    <div class="achv-grid">
      ${ACHIEVEMENTS.map(a => `
        <div class="achv ${s.achievements.includes(a.id) ? "unlocked" : ""}">
          <span class="emoji">${a.emoji}</span>
          <span class="name">${esc(a.name)}</span>
        </div>
      `).join("")}
    </div>
  `);
}

function announceAchievements() {
  const newly = checkAchievements(DATA);
  if (newly.length) {
    // Simple non-blocking toast via title flash could go here; kept minimal per design restraint.
    console.log("Achievements unlocked:", newly.map(a => a.name).join(", "));
  }
}

/* ---------- Sidebar / chrome ---------- */
function buildSidebarNav() {
  const nav = document.getElementById("nav-levels");
  nav.innerHTML = DATA.courses.levels.map(l => `
    <a class="nav-link" href="#/level/${l.id}" data-level="${l.id}">
      <span class="num">${l.number}</span> ${esc(l.title)}
    </a>
  `).join("");
}

function refreshChrome() {
  const totals = computeTotals(DATA);
  document.getElementById("sidebar-progress-fill").style.width = totals.overallPct + "%";
  document.getElementById("sidebar-progress-pct").textContent = totals.overallPct + "%";

  const hash = location.hash || "#/home";
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
}

/* ---------- Router ---------- */
function renderLevel(id) {
  const lvl = DATA.courses.levels.find(l => l.id === id);
  if (!lvl) return renderLessonsList();
  const s = getState();
  const lessons = DATA.lessons.filter(l => lvl.lessonIds.includes(l.id));
  const projects = DATA.projects.filter(p => lvl.projectIds.includes(p.id));
  setContent(`
    <a href="#/lessons" class="btn-ghost">← All lessons</a>
    <div class="hero" style="padding-top:16px;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">LEVEL ${lvl.number}</div>
      <h1>${esc(lvl.title)}</h1>
      <p class="lede">${esc(lvl.summary)}</p>
    </div>
    ${lessons.length ? `<div class="section-head"><h2>Lessons</h2></div><div class="grid grid-3">${lessons.map(l => lessonCard(l, s)).join("")}</div>` : ""}
    ${projects.length ? `<div class="section-head"><h2>Projects</h2></div><div class="grid grid-3">${projects.map(p => projectCard(p, s)).join("")}</div>` : ""}
  `);
}

const ROUTES = [
  { pattern: /^#\/home$/, handler: renderHome },
  { pattern: /^#\/lessons$/, handler: renderLessonsList },
  { pattern: /^#\/lesson\/(.+)$/, handler: (m) => renderLessonDetail(m[1]) },
  { pattern: /^#\/level\/(.+)$/, handler: (m) => renderLevel(m[1]) },
  { pattern: /^#\/projects$/, handler: renderProjectsList },
  { pattern: /^#\/project\/(.+)$/, handler: (m) => renderProjectDetail(m[1]) },
  { pattern: /^#\/capstone$/, handler: renderCapstone },
  { pattern: /^#\/practice$/, handler: renderPractice },
  { pattern: /^#\/exercise\/(.+)$/, handler: (m) => renderExerciseDetail(m[1]) },
  { pattern: /^#\/daily$/, handler: renderDaily },
  { pattern: /^#\/diagnostics$/, handler: renderDiagnostics },
  { pattern: /^#\/recreate$/, handler: renderRecreate },
  { pattern: /^#\/skills$/, handler: renderSkills },
  { pattern: /^#\/glossary$/, handler: renderGlossary },
  { pattern: /^#\/shortcuts$/, handler: renderShortcuts },
  { pattern: /^#\/troubleshooting$/, handler: renderTroubleshooting },
  { pattern: /^#\/achievements$/, handler: renderAchievements }
];

function router() {
  const hash = location.hash || "#/home";
  getState().lastVisitedRoute = hash;
  saveState();

  const match = ROUTES.find(r => r.pattern.test(hash));
  if (match) {
    const m = hash.match(match.pattern);
    match.handler(m);
  } else {
    renderHome();
  }
  refreshChrome();
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-scrim").classList.remove("open");
  document.getElementById("search-results").classList.remove("open");
}

/* ---------- Init ---------- */
async function init() {
  applyTheme();

  try {
    DATA = await loadData();
  } catch (e) {
    document.getElementById("content").innerHTML = `
      <div class="empty">
        <h2>Couldn't load course content</h2>
        <p>InDesign Academy loads its lessons from JSON files in the <code>data/</code> folder. If you're opening index.html directly from disk, your browser may block that. Serve the folder locally (e.g. <code>python3 -m http.server</code>) or view it on GitHub Pages.</p>
      </div>`;
    console.error(e);
    return;
  }

  buildSidebarNav();
  SEARCH_INDEX = buildSearchIndex();

  document.getElementById("menu-btn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebar-scrim").classList.toggle("open");
  });
  document.getElementById("sidebar-scrim").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebar-scrim").classList.remove("open");
  });

  document.getElementById("theme-btn").addEventListener("click", () => {
    const s = getState();
    const next = s.theme === "dark" ? "light" : s.theme === "light" ? "auto" : "dark";
    setTheme(next);
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset all InDesign Academy progress on this device? This can't be undone.")) {
      resetState();
      location.hash = "#/home";
      router();
    }
  });

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (ev) => runSearch(ev.target.value));
  document.addEventListener("click", (ev) => {
    if (!ev.target.closest(".search-box")) {
      document.getElementById("search-results").classList.remove("open");
    }
  });

  window.addEventListener("hashchange", router);
  touchStreak();
  router();
}

document.addEventListener("DOMContentLoaded", init);
