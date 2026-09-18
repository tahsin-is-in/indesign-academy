/* ============================================================
   exercises.js — Practice Hub, Daily Practice, Diagnostics, Recreate
   ============================================================ */

function renderPractice() {
  const s = getState();
  const cards = DATA.exercises.exercises.map(e => exerciseCard(e, s)).join("");
  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">PRACTICE</div>
      <h1>Practice</h1>
      <p class="lede">Deliberate practice, not passive reading. Attempt each task before revealing the solution.</p>
    </div>
    <div class="grid grid-3">${cards}</div>
  `);
}

function exerciseCard(e, s) {
  const done = s.completedExercises.includes(e.id);
  return `
    <a class="card" href="#/exercise/${e.id}" style="text-decoration:none;">
      <span class="eyebrow">${esc(e.difficulty)} · ${esc(e.time)}</span>
      <h4>${esc(e.title)}</h4>
      <p>${esc(e.task)}</p>
      <div class="card-meta">${e.skills.map(esc).join(", ")}</div>
      <div class="card-footer"><span class="pill ${done ? "done" : ""}">${done ? "✓ Completed" : "Start"}</span></div>
    </a>
  `;
}

function renderExerciseDetail(id) {
  const e = DATA.exercises.exercises.find(x => x.id === id);
  if (!e) return setContent(`<div class="empty">Exercise not found.</div>`);
  const s = getState();
  const done = s.completedExercises.includes(e.id);

  setContent(`
    <a href="#/practice" class="btn-ghost">← Practice Hub</a>
    <div class="lesson-header" style="margin-top:16px;">
      <div class="lesson-meta"><span>${esc(e.difficulty)}</span><span>·</span><span>${esc(e.time)}</span><span>·</span><span>${e.skills.map(esc).join(", ")}</span></div>
      <h1>${esc(e.title)}</h1>
      <span class="pill ${done ? "done" : "accent"}">${done ? "✓ Completed" : "In progress"}</span>
    </div>

    <div class="block"><span class="block-label">TASK</span><p>${esc(e.task)}</p></div>

    <div class="block">
      <span class="block-label">REQUIREMENTS</span>
      <ul>${e.requirements.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
    </div>

    <div class="block" style="display:flex;gap:10px;flex-wrap:wrap;">
      <button class="btn btn-secondary" id="show-hint">Show Hint</button>
      <button class="btn btn-secondary" id="show-instructions">Show Full Instructions</button>
      <button class="btn btn-secondary" id="show-solution">Reveal Solution</button>
    </div>

    <div class="block" id="hint-box" style="display:none;">
      <span class="block-label">HINTS</span>
      <div class="try-box"><ul style="margin:0;">${e.hints.map(h => `<li>${esc(h)}</li>`).join("")}</ul></div>
    </div>

    <div class="block" id="instructions-box" style="display:none;">
      <span class="block-label">FULL INSTRUCTIONS</span>
      <ol class="steps-list">${e.instructions.map(i => `<li>${esc(i)}</li>`).join("")}</ol>
    </div>

    <div class="block" id="solution-box" style="display:none;">
      <span class="block-label">COMMON MISTAKES (what the solution avoids)</span>
      <div class="mistakes-box"><ul style="margin:0;">${e.commonMistakes.map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>
      <p style="margin-top:10px;font-size:var(--step-1);color:var(--ink-faint);">There's no single "correct" file for an open design task — use the requirements and common mistakes above to self-check your own version.</p>
    </div>

    <div class="block">
      <span class="block-label">SELF-ASSESSMENT</span>
      <ul class="checklist" id="checklist-${e.id}">
        ${e.selfAssessment.map((c, i) => checklistItem("exercise", e.id, i, c)).join("")}
      </ul>
      <button class="btn btn-primary" id="complete-exercise-btn" style="margin-top:14px;">${done ? "Mark as not completed" : "Mark exercise complete"}</button>
    </div>
  `);

  document.getElementById("show-hint").addEventListener("click", () => toggleBox("hint-box"));
  document.getElementById("show-instructions").addEventListener("click", () => toggleBox("instructions-box"));
  document.getElementById("show-solution").addEventListener("click", () => toggleBox("solution-box"));
  document.getElementById("complete-exercise-btn").addEventListener("click", () => {
    toggleInArray("completedExercises", e.id);
    touchStreak();
    addPracticeMinutes(parseInt(e.time, 10) || 10);
    announceAchievements();
    renderExerciseDetail(id);
    refreshChrome();
  });
  bindChecklist(e.selfAssessment.length, "exercise", e.id);
}

function toggleBox(id) {
  const box = document.getElementById(id);
  box.style.display = box.style.display === "none" ? "block" : "none";
}

/* ---------- Diagnostics: "Fix This Design" ---------- */
function renderDiagnostics() {
  const cards = DATA.exercises.diagnostics.map(d => `
    <div class="panel">
      <h4>${esc(d.title)}</h4>
      <p>${esc(d.issue)}</p>
      <p style="font-weight:600;color:var(--ink);margin-bottom:10px;">What's wrong with this design?</p>
      <button class="btn btn-secondary btn-sm reveal-btn" data-target="reveal-${d.id}">Reveal Explanation</button>
      <div class="reveal-box" id="reveal-${d.id}"><p style="margin:0;">${esc(d.reveal)}</p></div>
    </div>
  `).join("");

  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">DESIGN DIAGNOSTIC</div>
      <h1>Fix This Design</h1>
      <p class="lede">Each of these has a real, specific problem. Try to name it before revealing the explanation.</p>
    </div>
    <div class="grid grid-2">${cards}</div>
  `);
  bindReveals();
}

/* ---------- Recreate mode ---------- */
function renderRecreate() {
  const cards = DATA.exercises.recreate.map(r => `
    <div class="panel">
      <span class="eyebrow">${esc(r.difficulty)} · ${esc(r.timeLimit)}</span>
      <h4 style="margin-top:6px;">${esc(r.title)}</h4>
      <p>${esc(r.reference)}</p>
      <p class="card-meta" style="margin-bottom:10px;">${esc(r.dimensions)} · ${r.tools.map(esc).join(", ")}</p>
      <button class="btn btn-secondary btn-sm reveal-btn" data-target="rec-${r.id}">Show Hints &amp; Checklist</button>
      <div class="reveal-box" id="rec-${r.id}">
        <p style="font-weight:600;color:var(--ink);">Hints</p>
        <ul>${r.hints.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
        <p style="font-weight:600;color:var(--ink);">Evaluate your recreation</p>
        <ul>${r.evaluationChecklist.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
      </div>
    </div>
  `).join("");

  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">RECREATE MODE</div>
      <h1>Recreate This Design</h1>
      <p class="lede">Analyze a reference layout and rebuild it yourself in InDesign. The goal is learning to read design, not copy-pasting a solution file.</p>
    </div>
    <div class="grid grid-2">${cards}</div>
  `);
  bindReveals();
}

function bindReveals() {
  document.querySelectorAll(".reveal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const box = document.getElementById(btn.dataset.target);
      box.classList.toggle("show");
    });
  });
}

/* ---------- Daily Practice ---------- */
let dailyTab = "15min";
function renderDaily() {
  const pools = DATA.exercises.daily;
  const seedDate = new Date().toISOString().slice(0, 10);
  const pick = (arr) => arr[hashStr(seedDate + arr.length) % arr.length];

  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">DAILY PRACTICE</div>
      <h1>Today's InDesign Practice</h1>
      <p class="lede">One small challenge, refreshed daily. Pick a length that fits your time today.</p>
    </div>
    <div class="daily-tabs">
      ${["5min", "15min", "30min"].map(k => `<button class="btn ${dailyTab === k ? "btn-primary" : "btn-secondary"} btn-sm" data-tab="${k}">${k.replace("min", " min")}</button>`).join("")}
    </div>
    <div class="daily-card" id="daily-card"></div>
  `);

  function paint() {
    const challenge = pick(pools[dailyTab]);
    document.getElementById("daily-card").innerHTML = `
      <span class="eyebrow">${dailyTab.replace("min", "-minute challenge")}</span>
      <p class="challenge-text">${esc(challenge)}</p>
      <button class="btn btn-primary" id="daily-done-btn">I did this — log ${dailyTab.replace("min", "")} min</button>
    `;
    document.getElementById("daily-done-btn").addEventListener("click", () => {
      addPracticeMinutes(parseInt(dailyTab, 10));
      touchStreak();
      announceAchievements();
      refreshChrome();
      document.getElementById("daily-done-btn").textContent = "Logged ✓";
      document.getElementById("daily-done-btn").disabled = true;
    });
  }
  paint();

  document.querySelectorAll(".daily-tabs button").forEach(btn => {
    btn.addEventListener("click", () => { dailyTab = btn.dataset.tab; renderDaily(); });
  });
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return h;
}
