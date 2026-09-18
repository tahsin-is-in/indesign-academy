/* ============================================================
   lessons.js — lesson list + lesson detail (the 11-part structure)
   ============================================================ */

function renderLessonsList() {
  const s = getState();
  const byLevel = {};
  DATA.courses.levels.forEach(l => byLevel[l.id] = []);
  DATA.lessons.forEach(l => { if (byLevel[l.level]) byLevel[l.level].push(l); });

  const sections = DATA.courses.levels.filter(l => byLevel[l.id].length).map(lvl => `
    <div class="section-head">
      <div><h2>${lvl.number} — ${esc(lvl.title)}</h2><p class="desc">${esc(lvl.summary)}</p></div>
    </div>
    <div class="grid grid-3">
      ${byLevel[lvl.id].map(l => lessonCard(l, s)).join("")}
    </div>
  `).join("");

  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">01 — LESSONS</div>
      <h1>Learn</h1>
      <p class="lede">Every level builds on the last. Read the concept, try it in InDesign, then check your understanding.</p>
    </div>
    ${sections}
  `);
}

function lessonCard(l, s) {
  const done = s.completedLessons.includes(l.id);
  return `
    <a class="card" href="#/lesson/${l.id}" style="text-decoration:none;">
      <span class="eyebrow">${esc(l.skills[0] || "")}</span>
      <h4>${esc(l.title)}</h4>
      <p>${esc(l.whatYoullLearn)}</p>
      <div class="card-meta"><span>${esc(l.duration)}</span></div>
      <div class="card-footer">
        <span class="pill ${done ? "done" : ""}">${done ? "✓ Completed" : "Not started"}</span>
      </div>
    </a>
  `;
}

function renderLessonDetail(id) {
  const l = DATA.lessons.find(x => x.id === id);
  if (!l) return setContent(`<div class="empty">Lesson not found.</div>`);
  const s = getState();
  const done = s.completedLessons.includes(l.id);

  setContent(`
    <a href="#/lessons" class="btn-ghost">← All lessons</a>
    <div class="lesson-header" style="margin-top:16px;">
      <div class="lesson-meta"><span>${esc(l.duration)}</span><span>·</span><span>${l.skills.map(esc).join(", ")}</span></div>
      <h1>${esc(l.title)}</h1>
      <div class="lesson-skills">
        <span class="pill ${done ? "done" : "accent"}">${done ? "✓ Completed" : "In progress"}</span>
      </div>
    </div>

    <div class="block"><span class="block-label">1 · WHAT YOU'LL LEARN</span><p>${esc(l.whatYoullLearn)}</p></div>
    <div class="block"><span class="block-label">2 · WHY IT MATTERS</span><p>${esc(l.whyItMatters)}</p></div>
    <div class="block"><span class="block-label">3 · CONCEPT</span><p>${esc(l.concept)}</p></div>
    <div class="block"><span class="block-label">4 · WHERE TO FIND IT</span><p>${esc(l.interface)}</p></div>

    <div class="block">
      <span class="block-label">5 · STEP BY STEP</span>
      <ol class="steps-list">${l.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
    </div>

    <div class="block">
      <span class="block-label">6 · TRY IT YOURSELF</span>
      <div class="try-box"><p style="margin:0;">${esc(l.tryItYourself)}</p></div>
    </div>

    <div class="block">
      <span class="block-label">7 · PRACTICE CHALLENGE</span>
      <div class="challenge-box"><p style="margin:0;">${esc(l.challenge)}</p></div>
    </div>

    <div class="block">
      <span class="block-label">8 · COMMON MISTAKES</span>
      <div class="mistakes-box"><ul style="margin:0;">${l.commonMistakes.map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>
    </div>

    <div class="block">
      <span class="block-label">9 · PROFESSIONAL TIP</span>
      <div class="protip-box"><p style="margin:0;">${esc(l.proTip)}</p></div>
    </div>

    <div class="block">
      <span class="block-label">10 · KNOWLEDGE CHECK</span>
      <div id="quiz-${l.id}">${l.knowledgeCheck.map((q, i) => quizQuestion(l.id, q, i)).join("")}</div>
    </div>

    <div class="block">
      <span class="block-label">11 · COMPLETION CHECKLIST</span>
      <ul class="checklist" id="checklist-${l.id}">
        ${l.checklist.map((c, i) => checklistItem("lesson", l.id, i, c)).join("")}
      </ul>
      <button class="btn btn-primary" id="complete-lesson-btn" style="margin-top:14px;">${done ? "Mark as not completed" : "Mark lesson complete"}</button>
    </div>
  `);

  document.getElementById("complete-lesson-btn").addEventListener("click", () => {
    const nowDone = toggleInArray("completedLessons", l.id);
    touchStreak();
    announceAchievements();
    renderLessonDetail(id);
    refreshChrome();
  });

  bindChecklist(l.checklist.length, "lesson", l.id);
  bindQuizzes(l.id, l.knowledgeCheck);
}

function quizQuestion(lessonId, q, i) {
  const attempted = getQuizAttempt(lessonId, i);
  return `
    <div class="quiz-q">
      <p style="margin:0 0 4px;color:var(--ink);font-weight:600;">${i + 1}. ${esc(q.q)}</p>
      <ul class="quiz-options" data-lesson="${lessonId}" data-q="${i}" data-answer="${q.answerIndex}">
        ${q.options.map((opt, oi) => `<li><button type="button" data-i="${oi}" ${attempted !== undefined ? "disabled" : ""} class="${attempted === oi ? (oi === q.answerIndex ? "correct" : "incorrect") : ""}">${esc(opt)}</button></li>`).join("")}
      </ul>
      <p class="quiz-explain ${attempted !== undefined ? "show" : ""}">${esc(q.explanation)}</p>
    </div>
  `;
}

function bindQuizzes(lessonId, questions) {
  questions.forEach((q, i) => {
    const list = document.querySelector(`.quiz-options[data-lesson="${lessonId}"][data-q="${i}"]`);
    if (!list) return;
    list.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosen = parseInt(btn.dataset.i, 10);
        recordQuizAttempt(lessonId, i, chosen);
        list.querySelectorAll("button").forEach(b => {
          b.disabled = true;
          const bi = parseInt(b.dataset.i, 10);
          if (bi === q.answerIndex) b.classList.add("correct");
          else if (bi === chosen) b.classList.add("incorrect");
        });
        list.parentElement.querySelector(".quiz-explain").classList.add("show");
      });
    });
  });
}

function checklistItem(scope, id, i, label) {
  const key = `${scope}:${id}:${i}`;
  const checked = getChecklistItem(key);
  return `<li class="${checked ? "checked" : ""}" data-key="${key}">
    <input type="checkbox" id="${key}" ${checked ? "checked" : ""}>
    <label for="${key}">${esc(label)}</label>
  </li>`;
}

function bindChecklist(count, scope, id) {
  const container = document.getElementById(`checklist-${id}`);
  if (!container) return;
  container.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      const li = cb.closest("li");
      setChecklistItem(li.dataset.key, cb.checked);
      li.classList.toggle("checked", cb.checked);
    });
  });
}
