/* ============================================================
   projects.js — Project Studio: real-world, client-brief style
   ============================================================ */

function renderProjectsList() {
  const s = getState();
  const groups = { "Beginner": [], "Intermediate": [], "Advanced": [] };
  DATA.projects.forEach(p => { if (groups[p.difficulty]) groups[p.difficulty].push(p); });

  const sections = Object.entries(groups).filter(([, list]) => list.length).map(([diff, list]) => `
    <div class="section-head"><h2>${diff}</h2></div>
    <div class="grid grid-3">${list.map(p => projectCard(p, s)).join("")}</div>
  `).join("");

  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">15 — PROJECT STUDIO</div>
      <h1>Build</h1>
      <p class="lede">Real client-style briefs. Each one asks for specific deliverables, not just "practice" — treat it like paid work.</p>
    </div>
    ${sections}
    <div class="panel ticks" style="margin-top:40px;">
      <h3 style="margin-bottom:6px;">The InDesign Master Project</h3>
      <p style="margin-bottom:12px;">The capstone: one complete 50–100 page professional publication using everything you've learned — cover, contents, parent pages, styles, images, tables, cross references, a consistent grid and color system, and a print-ready, preflighted PDF.</p>
      <a class="btn btn-primary" href="#/capstone">Open the Capstone</a>
    </div>
  `);
}

function projectCard(p, s) {
  const done = s.completedProjects.includes(p.id);
  return `
    <a class="card" href="#/project/${p.id}" style="text-decoration:none;">
      <span class="eyebrow">${esc(p.client)}</span>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.brief)}</p>
      <div class="card-meta"><span>${esc(p.dimensions)}</span></div>
      <div class="card-footer"><span class="pill ${done ? "done" : ""}">${done ? "✓ Delivered" : "Open brief"}</span></div>
    </a>
  `;
}

function renderProjectDetail(id) {
  const p = DATA.projects.find(x => x.id === id);
  if (!p) return setContent(`<div class="empty">Project not found.</div>`);
  const s = getState();
  const done = s.completedProjects.includes(p.id);

  setContent(`
    <a href="#/projects" class="btn-ghost">← Project Studio</a>
    <div class="lesson-header" style="margin-top:16px;">
      <div class="lesson-meta"><span>CLIENT: ${esc(p.client)}</span><span>·</span><span>${esc(p.difficulty)}</span></div>
      <h1>${esc(p.title)}</h1>
      <span class="pill ${done ? "done" : "accent"}">${done ? "✓ Delivered" : "Brief open"}</span>
    </div>

    <div class="block"><span class="block-label">BRIEF</span><p>${esc(p.brief)}</p></div>
    <div class="block"><span class="block-label">DIMENSIONS</span><p>${esc(p.dimensions)}</p></div>

    <div class="block">
      <span class="block-label">CLIENT REQUIREMENTS</span>
      <ul>${p.requirements.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
    </div>

    <div class="block">
      <span class="block-label">SKILLS NEEDED</span>
      <div class="lesson-skills">${p.skills.map(sk => `<span class="pill">${esc(sk)}</span>`).join("")}</div>
    </div>

    <div class="block">
      <span class="block-label">STEP BY STEP</span>
      <ol class="steps-list">${p.steps.map(st => `<li>${esc(st)}</li>`).join("")}</ol>
    </div>

    <div class="block">
      <span class="block-label">COMMON MISTAKES</span>
      <div class="mistakes-box"><ul style="margin:0;">${p.commonMistakes.map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>
    </div>

    <div class="block">
      <span class="block-label">FINAL CHALLENGE</span>
      <div class="challenge-box"><p style="margin:0;">${esc(p.finalChallenge)}</p></div>
    </div>

    <div class="block">
      <span class="block-label">DELIVERABLES</span>
      <div class="lesson-skills">${p.deliverables.map(d => `<span class="pill">${esc(d)}</span>`).join("")}</div>
    </div>

    <div class="block">
      <span class="block-label">SELF-CHECKLIST</span>
      <ul class="checklist" id="checklist-${p.id}">
        ${p.checklist.map((c, i) => checklistItem("project", p.id, i, c)).join("")}
      </ul>
      <button class="btn btn-primary" id="complete-project-btn" style="margin-top:14px;">${done ? "Mark as not delivered" : "Mark project delivered"}</button>
    </div>
  `);

  document.getElementById("complete-project-btn").addEventListener("click", () => {
    toggleInArray("completedProjects", p.id);
    touchStreak();
    announceAchievements();
    renderProjectDetail(id);
    refreshChrome();
  });
  bindChecklist(p.checklist.length, "project", p.id);
}

function renderCapstone() {
  setContent(`
    <div class="hero ticks" style="padding:28px;border:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:30px;">
      <div class="kicker">16 — CAPSTONE</div>
      <h1>The InDesign Master Project</h1>
      <p class="lede">Design a complete publication: a magazine, book, academic journal, company report, portfolio, travel guide, or product catalog. Use everything you've learned, start to finish.</p>
    </div>
    <div class="block">
      <span class="block-label">REQUIREMENTS</span>
      <ul>
        <li>Cover and contents page</li>
        <li>Parent pages applied consistently</li>
        <li>Paragraph styles and character styles throughout — no manual formatting</li>
        <li>Images with correct fitting and resolution</li>
        <li>At least one table</li>
        <li>Automatic page numbers and running headers</li>
        <li>Cross references where relevant</li>
        <li>A consistent grid and color system</li>
        <li>Full preflight with zero errors</li>
        <li>A print-ready exported PDF</li>
      </ul>
    </div>
    <div class="block">
      <span class="block-label">FINAL CHECKLIST</span>
      <ul class="checklist" id="checklist-capstone">
        ${["Cover designed and on-brand with the rest of the publication","Contents page with accurate page references","Parent pages applied to every page","Paragraph and character styles used with zero stray manual formatting","All images correctly fitted and at 300+ effective PPI","At least one styled table included","Automatic page numbers and running headers throughout","Grid and color system consistent across every spread","Preflight shows zero errors","Print-ready PDF exported"].map((c, i) => checklistItem("lesson", "capstone", i, c)).join("")}
      </ul>
    </div>
  `);
  bindChecklist(10, "lesson", "capstone");
}
