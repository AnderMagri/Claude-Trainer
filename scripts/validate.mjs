// Checks course content for missing translations and broken quiz answers. Run: node scripts/validate.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = { window: {} };
ctx.window.window = ctx.window;
vm.createContext(ctx.window);
for (const f of ['content/ui.js', 'content/m1.js', 'content/m2.js', 'content/m3.js', 'content/exam.js', 'content/glossary.js']) {
  vm.runInContext(readFileSync(f, 'utf8'), ctx.window, { filename: f });
}
const CT = ctx.window.CT;
let problems = 0;
const bad = (m) => { problems++; console.log('✗', m); };
const ids = new Set();
const checkQ = (q, where) => {
  if (ids.has(q.id)) bad(`duplicate question id ${q.id}`); ids.add(q.id);
  for (const L of ['en', 'he']) {
    const c = q[L]; if (!c) { bad(`${where} ${q.id}: missing ${L}`); continue; }
    if (!c.q || !c.why || !Array.isArray(c.o)) bad(`${where} ${q.id}: ${L} incomplete`);
    q.a.forEach((a) => { if (a < 0 || a >= c.o.length) bad(`${where} ${q.id}: answer ${a} out of range (${L})`); });
  }
  if (q.en && q.he && q.en.o.length !== q.he.o.length) bad(`${where} ${q.id}: en/he option count differs`);
  if (!CT.domains.some((d) => d.id === q.d)) bad(`${where} ${q.id}: unknown domain ${q.d}`);
};
const lessonIds = new Set();
let blocks = 0, widgets = {};
for (const m of CT.modules) {
  for (const k of ['title', 'subtitle', 'intro', 'outcomes']) for (const L of ['en', 'he']) if (!m[k] || !m[k][L]) bad(`${m.id}: ${k}.${L} missing`);
  for (const l of m.lessons) {
    if (lessonIds.has(l.id)) bad(`duplicate lesson ${l.id}`); lessonIds.add(l.id);
    for (const k of ['title', 'tldr', 'goals']) for (const L of ['en', 'he']) if (!l[k] || !l[k][L]) bad(`${l.id}: ${k}.${L} missing`);
    l.blocks.forEach((b, i) => {
      blocks++;
      if (b.t === 'widget') { widgets[b.name] = (widgets[b.name] || 0) + 1; return; }
      if (b.t === 'quiz') { checkQ(b.q, l.id); return; }
      if (b.t === 'code' && b.code) return;
      const hasEn = 'en' in b, hasHe = 'he' in b;
      if (!hasEn && !hasHe) bad(`${l.id} block ${i} (${b.t}): no content`);
      if (hasEn && !hasHe && b.t !== 'code') bad(`${l.id} block ${i} (${b.t}): English only`);
    });
    (l.check || []).forEach((q) => checkQ(q, l.id));
    (l.domains || []).forEach((d) => { if (!CT.domains.some((x) => x.id === d)) bad(`${l.id}: unknown domain ${d}`); });
  }
}
CT.exam.forEach((q) => checkQ(q, 'exam'));
const byD = {}; CT.exam.forEach((q) => { byD[q.d] = (byD[q.d] || 0) + 1; });
const byM = {}; CT.exam.forEach((q) => { byM[q.m] = (byM[q.m] || 0) + 1; });
const enKeys = Object.keys(CT.ui.en), heKeys = new Set(Object.keys(CT.ui.he));
enKeys.forEach((k) => { if (!heKeys.has(k)) bad(`ui: Hebrew missing key ${k}`); });
console.log(`${CT.modules.length} lines · ${lessonIds.size} lessons · ${blocks} blocks · ${CT.exam.length} exam questions · ${CT.glossary.length} glossary terms`);
console.log('exam by domain', byD, 'by line', byM);
console.log('widgets', widgets);
console.log(problems ? `${problems} problem(s)` : 'All content checks passed');
process.exit(problems ? 1 : 0);
