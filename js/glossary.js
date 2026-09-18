/* ============================================================
   glossary.js — Terminology Dictionary
   ============================================================ */

function renderGlossary() {
  const sorted = [...DATA.glossary].sort((a, b) => a.term.localeCompare(b.term));
  setContent(`
    <div class="hero" style="padding-top:0;border-bottom:none;margin-bottom:10px;">
      <div class="kicker">REFERENCE</div>
      <h1>Terminology</h1>
      <p class="lede">${sorted.length} InDesign terms, explained simply.</p>
    </div>
    <input type="search" id="glossary-filter" placeholder="Filter terms…" style="width:100%;max-width:360px;padding:9px 12px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--ink);margin-bottom:20px;">
    <dl id="glossary-list">${sorted.map(glossaryEntry).join("")}</dl>
  `);

  document.getElementById("glossary-filter").addEventListener("input", (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    document.getElementById("glossary-list").innerHTML = sorted
      .filter(g => !q || g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q))
      .map(glossaryEntry).join("") || `<p class="empty">No terms match "${esc(q)}".</p>`;
  });
}

function glossaryEntry(g) {
  return `
    <div class="term-entry">
      <span class="label">TERM</span>
      <dt>${esc(g.term)}</dt>
      <dd>${esc(g.definition)}</dd>
      <dd><strong style="color:var(--ink);">Why it matters:</strong> ${esc(g.whyItMatters)}</dd>
      <dd><strong style="color:var(--ink);">Example:</strong> ${esc(g.example)}</dd>
      ${g.related && g.related.length ? `<dd><strong style="color:var(--ink);">Related:</strong> ${g.related.map(esc).join(", ")}</dd>` : ""}
    </div>
  `;
}
