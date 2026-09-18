/* ============================================================
   progress.js — progress math, skill tree, achievements, recs
   ============================================================ */

const ACHIEVEMENTS = [
  { id: "first-doc", emoji: "🏁", name: "First Document", check: (s) => s.completedLessons.includes("orientation-02") },
  { id: "typography-explorer", emoji: "✍️", name: "Typography Explorer", check: (s) => s.completedLessons.includes("typography-01") && s.completedLessons.includes("typography-02") },
  { id: "layout-builder", emoji: "📐", name: "Layout Builder", check: (s) => s.completedLessons.includes("layout-01") },
  { id: "publication-designer", emoji: "📚", name: "Publication Designer", check: (s) => s.completedLessons.includes("longdocs-01") },
  { id: "color-master", emoji: "🎨", name: "Color Master", check: (s) => s.completedLessons.includes("color-01") },
  { id: "print-ready", emoji: "🖨️", name: "Print Ready", check: (s) => s.completedLessons.includes("print-01") },
  { id: "workflow-pro", emoji: "⚡", name: "Workflow Pro", check: (s) => s.completedLessons.includes("styles-01") },
  { id: "automation-beginner", emoji: "🤖", name: "Automation Beginner", check: (s) => s.completedLessons.includes("automation-01") },
  { id: "indesign-master", emoji: "🏆", name: "InDesign Master", check: (s, ctx) => ctx.overallPct >= 100 }
];

function computeTotals(ctx) {
  const { lessons, projects, exercises } = ctx;
  const s = getState();
  const totalItems = lessons.length + projects.length + exercises.exercises.length;
  const doneItems = s.completedLessons.length + s.completedProjects.length + s.completedExercises.length;
  const overallPct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;
  return {
    overallPct,
    lessonsCompleted: s.completedLessons.length,
    lessonsTotal: lessons.length,
    exercisesCompleted: s.completedExercises.length,
    exercisesTotal: exercises.exercises.length,
    projectsCompleted: s.completedProjects.length,
    projectsTotal: projects.length
  };
}

function currentLevel(ctx) {
  const s = getState();
  const { courses } = ctx;
  for (const lvl of courses.levels) {
    const items = [...lvl.lessonIds, ...lvl.projectIds];
    const done = items.every(id => s.completedLessons.includes(id) || s.completedProjects.includes(id));
    if (items.length === 0) continue;
    if (!done) return lvl;
  }
  return courses.levels[courses.levels.length - 1];
}

function skillTreeState(ctx) {
  const s = getState();
  const { courses } = ctx;
  let previousDone = true;
  return courses.levels.map(lvl => {
    const items = [...lvl.lessonIds, ...lvl.projectIds];
    const doneCount = items.filter(id => s.completedLessons.includes(id) || s.completedProjects.includes(id)).length;
    const isDone = items.length > 0 ? doneCount === items.length : doneCount >= 0 && s.completedLessons.length > 0;
    let status;
    if (items.length > 0 && isDone) status = "done";
    else if (previousDone) status = "available";
    else status = "locked";
    if (items.length > 0) previousDone = isDone;
    return { ...lvl, status, doneCount, total: items.length };
  });
}

function checkAchievements(ctx) {
  const s = getState();
  const totals = computeTotals(ctx);
  const newly = [];
  ACHIEVEMENTS.forEach(a => {
    if (a.check(s, { overallPct: totals.overallPct })) {
      if (unlockAchievement(a.id)) newly.push(a);
    }
  });
  return newly;
}

function recommendNext(ctx) {
  const s = getState();
  const { lessons } = ctx;
  const byId = Object.fromEntries(lessons.map(l => [l.id, l]));

  // Typography done but Styles not started
  const typographyDone = ["typography-01", "typography-02"].every(id => s.completedLessons.includes(id));
  if (typographyDone && !s.completedLessons.includes("styles-01")) {
    return { lesson: byId["styles-01"], reason: "You already understand typography fundamentals. Styles will help you apply that knowledge efficiently across long documents instead of formatting by hand every time." };
  }
  const fundamentalsDone = ["fundamentals-01", "fundamentals-02", "fundamentals-03"].every(id => s.completedLessons.includes(id));
  if (fundamentalsDone && !typographyDone) {
    return { lesson: byId["typography-01"], reason: "You've got the fundamentals down. Typography is where layouts start looking genuinely professional." };
  }
  const stylesDone = s.completedLessons.includes("styles-01");
  if (stylesDone && !s.completedLessons.includes("parentpages-01")) {
    return { lesson: byId["parentpages-01"], reason: "With styles under your belt, Parent Pages is the next multiplier — it handles repeating structure the same way styles handle repeating text formatting." };
  }
  // default: first incomplete lesson in level order
  for (const l of lessons) {
    if (!s.completedLessons.includes(l.id)) return { lesson: l, reason: "Picking up where you left off." };
  }
  return null;
}
