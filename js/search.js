/* ============================================================
   search.js — fast client-side search across all content
   ============================================================ */

function buildSearchIndex() {
  const idx = [];
  DATA.lessons.forEach(l => idx.push({ kind: "Lesson", title: l.title, text: l.whatYoullLearn, route: `#/lesson/${l.id}` }));
  DATA.projects.forEach(p => idx.push({ kind: "Project", title: p.title, text: p.brief, route: `#/project/${p.id}` }));
  DATA.exercises.exercises.forEach(e => idx.push({ kind: "Exercise", title: e.title, text: e.task, route: `#/exercise/${e.id}` }));
  DATA.glossary.forEach(g => idx.push({ kind: "Glossary", title: g.term, text: g.definition, route: `#/glossary` }));
  DATA.shortcuts.forEach(s => idx.push({ kind: "Shortcut", title: s.action, text: `${s.win} / ${s.mac}`, route: `#/shortcuts` }));
  DATA.troubleshooting.forEach(t => idx.push({ kind: "Troubleshooting", title: t.problem, text: t.fix, route: `#/troubleshooting` }));
  return idx;
}

let SEARCH_INDEX = [];

function runSearch(query) {
  const q = query.trim().toLowerCase();
  const resultsEl = document.getElementById("search-results");
  if (!q) { resultsEl.classList.remove("open"); resultsEl.innerHTML = ""; return; }
  const matches = SEARCH_INDEX
    .filter(item => item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q))
    .slice(0, 12);

  if (!matches.length) {
    resultsEl.innerHTML = `<div class="search-result">No results for "${esc(query)}"</div>`;
  } else {
    resultsEl.innerHTML = matches.map(m => `
      <a class="search-result" href="${m.route}">
        <span class="kind">${esc(m.kind)}</span><br>
        ${highlight(m.title, q)}
      </a>
    `).join("");
  }
  resultsEl.classList.add("open");
}

function highlight(text, q) {
  const escaped = esc(text);
  const idx = escaped.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return escaped;
  return escaped.slice(0, idx) + `<mark>${escaped.slice(idx, idx + q.length)}</mark>` + escaped.slice(idx + q.length);
}
