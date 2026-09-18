/* ============================================================
   shortcuts.js — Cheat Sheet (shortcuts) + Troubleshooting Center
   ============================================================ */

let shortcutOS = "win";

function renderShortcuts() {
  const categories = [...new Set(DATA.shortcuts.map(s => s.category))];
  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">REFERENCE</div>
      <h1>Cheat Sheet</h1>
      <p class="lede">${DATA.shortcuts.length} shortcuts across every panel and tool.</p>
    </div>
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:20px;">
      <input type="search" id="shortcut-filter" placeholder="Filter shortcuts…" style="flex:1;min-width:200px;max-width:340px;padding:9px 12px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--ink);">
      <div class="toggle-group">
        <button data-os="win" class="${shortcutOS === "win" ? "active" : ""}">Windows</button>
        <button data-os="mac" class="${shortcutOS === "mac" ? "active" : ""}">macOS</button>
      </div>
    </div>
    <table class="shortcut-table">
      <thead><tr><th>Action</th><th>Shortcut</th><th>Category</th></tr></thead>
      <tbody id="shortcut-body">${categories.map(c => shortcutRows(c, DATA.shortcuts.filter(s => s.category === c))).join("")}</tbody>
    </table>
  `);

  document.querySelectorAll(".toggle-group button").forEach(btn => {
    btn.addEventListener("click", () => { shortcutOS = btn.dataset.os; renderShortcuts(); });
  });
  document.getElementById("shortcut-filter").addEventListener("input", (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    const filtered = DATA.shortcuts.filter(s => !q || s.action.toLowerCase().includes(q));
    document.getElementById("shortcut-body").innerHTML = categories
      .map(c => shortcutRows(c, filtered.filter(s => s.category === c)))
      .join("") || `<tr><td colspan="3">No shortcuts match.</td></tr>`;
  });
}

function shortcutRows(category, rows) {
  if (!rows.length) return "";
  return rows.map(s => `
    <tr>
      <td>${esc(s.action)}</td>
      <td class="keys">${esc(shortcutOS === "win" ? s.win : s.mac)}</td>
      <td class="cat">${esc(category)}</td>
    </tr>
  `).join("");
}

/* ---------- Troubleshooting Center ---------- */
function renderTroubleshooting() {
  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">REFERENCE</div>
      <h1>Troubleshooting Center</h1>
      <p class="lede">Something not working the way you expect? Start here.</p>
    </div>
    <input type="search" id="trbl-filter" placeholder="Search problems…" style="width:100%;max-width:360px;padding:9px 12px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--ink);margin-bottom:20px;">
    <div id="trbl-list">${DATA.troubleshooting.map(trblEntry).join("")}</div>
  `);

  document.getElementById("trbl-filter").addEventListener("input", (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    document.getElementById("trbl-list").innerHTML = DATA.troubleshooting
      .filter(t => !q || t.problem.toLowerCase().includes(q) || t.causes.join(" ").toLowerCase().includes(q))
      .map(trblEntry).join("") || `<p class="empty">No matching entries.</p>`;
  });
}

function trblEntry(t) {
  return `
    <details class="trbl-entry">
      <summary>${esc(t.problem)}</summary>
      <p style="font-weight:600;color:var(--ink);margin-bottom:4px;">Possible causes</p>
      <ul>${t.causes.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
      <p style="font-weight:600;color:var(--ink);margin-bottom:4px;">Fix</p>
      <p style="margin:0;">${esc(t.fix)}</p>
    </details>
  `;
}
