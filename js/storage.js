/* ============================================================
   storage.js — localStorage persistence layer
   No backend, no accounts. Everything lives in the browser.
   ============================================================ */

const STORAGE_KEY = "indesignAcademy.v1";

const DEFAULT_STATE = {
  completedLessons: [],       // lesson ids
  completedExercises: [],     // exercise ids
  completedProjects: [],      // project ids
  checklistState: {},         // "lesson:<id>:<index>" -> bool, "project:<id>:<index>" -> bool
  quizAttempts: {},           // "<lessonId>:<qIndex>" -> chosen index
  achievements: [],           // achievement ids unlocked
  streak: { count: 0, lastActiveDate: null },
  practiceMinutes: 0,
  theme: "auto",              // "auto" | "light" | "dark"
  lastVisitedRoute: "#/home"
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredCloneState(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredCloneState(DEFAULT_STATE), ...parsed };
  } catch (e) {
    console.warn("Could not read saved progress, starting fresh.", e);
    return structuredCloneState(DEFAULT_STATE);
  }
}

function structuredCloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save progress — storage may be full or disabled.", e);
  }
}

function getState() {
  return state;
}

function resetState() {
  state = structuredCloneState(DEFAULT_STATE);
  saveState();
}

function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last = state.streak.lastActiveDate;
  if (last === today) return;
  if (!last) {
    state.streak = { count: 1, lastActiveDate: today };
  } else {
    const diffDays = Math.round((new Date(today) - new Date(last)) / 86400000);
    if (diffDays === 1) {
      state.streak = { count: state.streak.count + 1, lastActiveDate: today };
    } else {
      state.streak = { count: 1, lastActiveDate: today };
    }
  }
  saveState();
}

function toggleInArray(key, id) {
  const arr = state[key];
  const i = arr.indexOf(id);
  if (i === -1) arr.push(id); else arr.splice(i, 1);
  saveState();
  return arr.includes(id);
}

function setChecklistItem(scopeKey, checked) {
  state.checklistState[scopeKey] = checked;
  saveState();
}

function getChecklistItem(scopeKey) {
  return !!state.checklistState[scopeKey];
}

function recordQuizAttempt(lessonId, qIndex, chosenIndex) {
  state.quizAttempts[`${lessonId}:${qIndex}`] = chosenIndex;
  saveState();
}

function getQuizAttempt(lessonId, qIndex) {
  return state.quizAttempts[`${lessonId}:${qIndex}`];
}

function unlockAchievement(id) {
  if (!state.achievements.includes(id)) {
    state.achievements.push(id);
    saveState();
    return true;
  }
  return false;
}

function addPracticeMinutes(mins) {
  state.practiceMinutes += mins;
  saveState();
}

function setTheme(theme) {
  state.theme = theme;
  saveState();
  applyTheme();
}

function applyTheme() {
  const root = document.documentElement;
  if (state.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", state.theme);
}
