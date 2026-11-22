/* Claude Trainer — app engine.
   Routing, language switch, progress, bookmarks, highlights, notes, notebook, quizzes, practice exam.
   Saves to this browser (localStorage) and, inside claude.ai, to the viewer's private db subtree. */
(function () {
  'use strict';
  const { esc, md, icon, uid, debounce, clamp, shuffle, copyText } = window.CTK;
  const CT = window.CT;
  const W = window.W || { html: () => '', mount: () => {} };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ------------------------------------------------------------------ i18n */
  let L = 'en';
  const tx = (o) => {
    if (o == null) return '';
    if (typeof o === 'string' || Array.isArray(o)) return o;
    return o[L] != null ? o[L] : (o.en != null ? o.en : '');
  };
  const t = (k, v) => {
    let s = (CT.ui[L] && CT.ui[L][k] != null) ? CT.ui[L][k] : (CT.ui.en[k] != null ? CT.ui.en[k] : k);
    if (v) s = s.replace(/\{(\w+)\}/g, (m, n) => (v[n] != null ? v[n] : m));
    return s;
  };
  const dir = () => (L === 'he' ? 'rtl' : 'ltr');

  /* ------------------------------------------------------------- indexing */
  const LINE = { m1: 'l1', m2: 'l2', m6: 'l3', m3: 'l4', m4: 'l5', m7: 'l6', m5: 'lx', exam: 'lx' };
  // Hebrew edition: one character sticker per line (assets/stickers/lines/)
  const LINE_ART = { m1: 'learn', m2: 'power', m6: 'agents', m3: 'build', m4: 'design', m7: 'work', m5: 'exam' };
  const lineArt = (m, cls) => (L === 'he' && LINE_ART[m.id] ? `<img class="${cls}" src="assets/stickers/lines/${LINE_ART[m.id]}.webp" alt=""${cls === 'line-thumb' ? ' loading="lazy"' : ''}>` : '');
  const lineVars = (line) => `--c:var(--${line});--ci:var(--${line}-ink);--cs:var(--${line}-soft);--on-c:var(--on-${line});--accent:var(--${line});--accent-ink:var(--${line}-ink);--accent-soft:var(--${line}-soft);--on-accent:var(--on-${line})`;
  const MODS = CT.modules.slice().sort((a, b) => a.n - b.n);
  const MBY = {}; const LESSONS = []; const LBY = {};
  MODS.forEach((m) => {
    MBY[m.id] = m; m.line = LINE[m.id] || 'l1';
    m.lessons.forEach((l, i) => { l.mod = m; l.idx = i; l.gi = LESSONS.length; LESSONS.push(l); LBY[l.id] = l; });
  });
  const QBY = {}; (CT.exam || []).forEach((q) => { QBY[q.id] = q; });
  LESSONS.forEach((l) => {
    (l.check || []).forEach((q) => { q.lesson = l.id; QBY[q.id] = q; });
    (l.blocks || []).forEach((b) => { if (b.t === 'quiz' && b.q) { b.q.lesson = l.id; QBY[b.q.id] = b.q; } });
  });
  const DOM = {}; (CT.domains || []).forEach((d) => { DOM[d.id] = d; });
  // [[m1-l7]] → "1.7", [[m3]] → "Line 4": labels follow the current order of lines and lessons
  window.CTK.setRef((id) => (LBY[id] ? LBY[id].mod.n + '.' + (LBY[id].idx + 1) : MBY[id] ? t('lineN', { n: MBY[id].n }) : null));

  /* ---------------------------------------------------------------- state */
  const KEY = 'claude-trainer.state.v1';
  const defaults = () => ({
    v: 1, updatedAt: 0, lang: null, scale: 1, seenTour: false,
    done: {}, last: null, marks: [], hl: [], saved: [], notes: {}, journal: [],
    quiz: {}, checks: {}, exams: [], missed: {}, draft: null, name: '', del: {}, nbTab: 'hl'
  });
  let S = defaults();
  function loadLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) S = Object.assign(defaults(), JSON.parse(raw));
    } catch (e) { /* storage blocked: run in memory */ }
  }
  const writeLocal = debounce(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }, 300);
  function persist(opts) {
    S.updatedAt = Date.now();
    writeLocal();
    Cloud.schedule(opts && opts.quiet);
  }
  function mergeStates(a, b) {
    const newer = (b.updatedAt || 0) > (a.updatedAt || 0) ? b : a;
    const older = newer === a ? b : a;
    const out = Object.assign(defaults(), JSON.parse(JSON.stringify(newer)));
    out.del = Object.assign({}, older.del || {}, newer.del || {});
    out.done = Object.assign({}, older.done || {}, newer.done || {});
    ['hl', 'saved', 'journal', 'marks'].forEach((k) => {
      const have = new Set((out[k] || []).map((x) => x.id));
      (older[k] || []).forEach((x) => { if (!have.has(x.id) && !out.del[x.id]) out[k].push(x); });
      out[k] = out[k].filter((x) => !out.del[x.id]);
    });
    const ex = new Set((out.exams || []).map((x) => x.at));
    (older.exams || []).forEach((x) => { if (!ex.has(x.at)) out.exams.push(x); });
    out.exams.sort((x, y) => x.at - y.at);
    out.quiz = Object.assign({}, older.quiz || {}, newer.quiz || {});
    out.checks = Object.assign({}, older.checks || {}, newer.checks || {});
    Object.keys(older.notes || {}).forEach((k) => {
      const o = older.notes[k], n = out.notes[k];
      if (!n || (o && o.at > n.at)) out.notes[k] = o;
    });
    return out;
  }

  /* --------------------------------------- claude.ai capabilities (optional) */
  const Ext = { db: null, user: null, sample: null, tts: null, comments: null, downloads: null };
  const hasClaude = () => !!(window.claude && typeof window.claude.use === 'function');
  const use = (name) => (hasClaude() ? window.claude.use(name).catch(() => null) : Promise.resolve(null));
  const timeout = (p, ms) => Promise.race([p, new Promise((res, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]);

  const Cloud = {
    ref: null, on: false, state: 'local', timer: null, writing: false, again: false,
    async init() {
      if (!hasClaude()) return;
      try {
        const [db, user] = await Promise.all([use('db'), use('user')]);
        Ext.db = db; Ext.user = user;
        if (!db || !user) return;
        const id = await user.id();
        if (!id) return;
        this.ref = db.doc('data/users/' + id + '/state');
        const snap = await timeout(this.ref.get(), 10000);
        if (snap && snap.exists) {
          const remote = snap.data() || {};
          const merged = mergeStates(S, remote);
          const changed = JSON.stringify(merged) !== JSON.stringify(S);
          S = merged;
          if (changed) { writeLocal(); render({ keepScroll: true }); }
        }
        this.on = true; this.state = 'cloud';
        this.flush();
        refreshSyncStatus();
      } catch (e) {
        this.on = false; this.state = 'local'; refreshSyncStatus();
      }
    },
    schedule() {
      if (!this.on) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flush(), 2500);
    },
    async flush() {
      if (!this.on || !this.ref) return;
      if (this.writing) { this.again = true; return; }
      this.writing = true;
      try {
        const body = JSON.parse(JSON.stringify(S));
        if (JSON.stringify(body).length > 240000) { body.journal = body.journal.slice(-40); }
        await this.ref.set(body);
        this.state = 'cloud';
      } catch (e) {
        const c = e && e.code;
        if (c === 'invalid_argument' || c === 'revoked' || c === 'not_granted' || c === 'capability_disabled' || c === 'capability_removed') {
          this.on = false; this.state = 'local';
        } else if (c === 'quota_exceeded') { this.state = 'full'; }
        refreshSyncStatus();
      }
      this.writing = false;
      if (this.again) { this.again = false; this.flush(); }
    }
  };
  async function initExt() {
    if (!hasClaude()) return;
    const [sample, tts, comments, downloads] = await Promise.all([use('sample'), use('tts'), use('comments'), use('downloads')]);
    Ext.sample = sample; Ext.tts = tts; Ext.comments = comments; Ext.downloads = downloads;
    if (tts && typeof tts.onState === 'function') {
      try { tts.onState(({ state }) => { ttsOn = state === 'speaking' || state === 'paused'; paintListen(); }); } catch (e) { /* ignore */ }
    }
    paintListen(); paintDownloads();
  }

  /* ---------------------------------------------------------- small utils */
  const doneCount = (m) => (m ? m.lessons : LESSONS).filter((l) => S.done[l.id]).length;
  const pctDone = (m) => { const list = m ? m.lessons : LESSONS; return list.length ? Math.round(doneCount(m) / list.length * 100) : 0; };
  const minutes = (m) => (m ? m.lessons : LESSONS).reduce((a, l) => a + (l.minutes || 5), 0);
  const firstUndone = () => LESSONS.find((l) => !S.done[l.id]);
  const bestExam = (mode) => S.exams.filter((e) => !mode || e.mode === mode).reduce((b, e) => Math.max(b, e.pct), -1);
  const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString(L === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const lessonLabel = (l) => `${t('lineN', { n: l.mod.n })} · ${t('lessonN', { n: l.idx + 1 })}`;
  function toast(msg) {
    const el = $('#toast'); $('#toastMsg').textContent = msg; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2400);
  }
  function blockText(l, i) {
    const b = l.blocks[i]; if (!b) return '';
    const c = contentOf(b);
    if (c == null) return '';
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) return c.map((x) => (typeof x === 'string' ? x : (x.t || x.title || ''))).join(' ');
    return [c.title, c.body].filter(Boolean).join(' — ');
  }
  const stripMd = (s) => String(s || '').replace(/\[\[(m\d+(?:-l\d+)?)\]\]/g, (m, id) => window.CTK.refText(id)).replace(/\*\*|`|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  /* ------------------------------------------------------------- routing */
  let cur = { view: 'home', arg: null };
  let resumeNext = false;
  function parseHash() {
    const h = decodeURIComponent((location.hash || '').slice(1)) || 'home';
    if (LBY[h]) return { view: 'lesson', arg: h };
    if (/^m\d-quiz$/.test(h) && MBY[h.slice(0, 2)]) return { view: 'mquiz', arg: h.slice(0, 2) };
    if (MBY[h]) return { view: 'module', arg: h };
    if (['notebook', 'exam', 'glossary', 'prefs', 'finish', 'home'].indexOf(h) >= 0) return { view: h, arg: null };
    return { view: 'home', arg: null };
  }
  function go(hash) { if (location.hash === '#' + hash) route(); else location.hash = hash; }
  function route() {
    stopTTS(); hideSelbar(); closeSheet();
    leaveExam();
    cur = parseHash();
    render();
  }

  /* -------------------------------------------------------------- chrome */
  function paintChrome() {
    document.documentElement.lang = L;
    document.documentElement.dir = dir();
    document.documentElement.style.setProperty('--scale', S.scale || 1);
    applyTheme();
    $$('.langswitch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === L)));
    $('#brandName').firstChild.nodeValue = t('appName');
    const tabs = [['home', 'map', 'tabJourney'], ['notebook', 'book', 'tabNotebook'], ['exam', 'exam', 'tabExam'], ['glossary', 'glossary', 'tabGlossary'], ['prefs', 'prefs', 'tabPrefs']];
    const active = { home: 'home', module: 'home', lesson: 'home', mquiz: 'home', finish: 'home' }[cur.view] || cur.view;
    $('#tabbar').innerHTML = tabs.map(([h, ic, k]) => `<a class="tab" href="#${h}"${active === h ? ' aria-current="page"' : ''}>${icon(ic)}<span>${esc(t(k))}</span></a>`).join('');
    const back = $('#backBtn');
    const parent = backTarget();
    back.hidden = !parent;
    back.innerHTML = icon('back', 'flip');
    back.setAttribute('aria-label', t('back'));
    back.onclick = () => { if (parent) go(parent); };
    const accentLine = cur.view === 'lesson' ? LBY[cur.arg].mod.line : (cur.view === 'module' || cur.view === 'mquiz') ? MBY[cur.arg].line : cur.view === 'exam' ? 'lx' : 'l2';
    const rs = document.documentElement.style;
    rs.setProperty('--accent', `var(--${accentLine})`); rs.setProperty('--accent-ink', `var(--${accentLine}-ink)`); rs.setProperty('--accent-soft', `var(--${accentLine}-soft)`); rs.setProperty('--on-accent', `var(--on-${accentLine})`);
  }
  function applyTheme() {
    const th = S.theme || 'dark';
    if (th === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', th);
    const b = $('#themeBtn');
    if (b) {
      const dark = isDark();
      b.innerHTML = icon(dark ? 'sun' : 'moon');
      b.setAttribute('aria-label', t(dark ? 'toLight' : 'toDark'));
      b.title = t(dark ? 'toLight' : 'toDark');
    }
  }
  function isDark() {
    const th = S.theme || 'dark';
    if (th === 'auto') { try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return true; } }
    return th === 'dark';
  }
  function backTarget() {
    switch (cur.view) {
      case 'lesson': return LBY[cur.arg].mod.id;
      case 'module': return 'home';
      case 'mquiz': return cur.arg;
      case 'finish': return 'home';
      default: return null;
    }
  }

  function render(opts) {
    opts = opts || {};
    const main = $('#main');
    const y = window.scrollY;
    let html = '';
    switch (cur.view) {
      case 'lesson': html = viewLesson(LBY[cur.arg]); break;
      case 'module': html = viewModule(MBY[cur.arg]); break;
      case 'mquiz': html = viewModuleQuiz(MBY[cur.arg]); break;
      case 'notebook': html = viewNotebook(); break;
      case 'exam': html = viewExam(); break;
      case 'glossary': html = viewGlossary(); break;
      case 'prefs': html = viewPrefs(); break;
      case 'finish': html = viewFinish(); break;
      default: html = viewHome();
    }
    main.innerHTML = html;
    paintChrome();
    const after = MOUNT[cur.view]; if (after) after(main);
    if (opts.keepScroll) window.scrollTo(0, y);
    else if (!opts.noScroll) restoreScroll();
    updateReadbar();
    document.title = (cur.view === 'lesson' ? tx(LBY[cur.arg].title) + ' · ' : '') + t('appName');
  }
  function restoreScroll() {
    if (cur.view === 'lesson' && resumeNext && S.last && S.last.id === cur.arg && S.last.b > 0) {
      const el = $(`.content [data-b="${S.last.b}"]`);
      if (el) { setTimeout(() => { scrollToEl(el); el.classList.add('flash'); }, 30); resumeNext = false; return; }
    }
    resumeNext = false;
    if (pendingJump) { const j = pendingJump; pendingJump = null; setTimeout(() => jumpTo(j), 40); return; }
    window.scrollTo(0, 0);
  }
  function scrollToEl(el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  }
  let pendingJump = null;
  function jumpTo(j) {
    if (j.hl) {
      const m = $(`mark.hl[data-hl="${j.hl}"]`);
      if (m) { scrollToEl(m); m.classList.add('flash'); return; }
    }
    if (j.b != null) {
      const el = $(`.content [data-b="${j.b}"]`);
      if (el) { scrollToEl(el); el.classList.add('flash'); }
    }
  }
  function openAt(lessonId, j) { pendingJump = j; go(lessonId); }

  /* --------------------------------------------------------------- HOME */
  function stationsHTML(m, curId) {
    return `<ol class="stations">${m.lessons.map((l) => {
      const done = !!S.done[l.id]; const isCur = l.id === curId;
      const marked = S.marks.some((k) => k.lesson === l.id);
      return `<li class="station${done ? ' done' : ''}${isCur ? ' current' : ''}">
        <div class="track"><span class="stop">${done ? icon('check') : ''}</span></div>
        <a href="#${l.id}"><span class="st-title">${esc(tx(l.title))}${marked ? ` <span class="st-flag" title="${esc(t('bookmarked'))}">${icon('bookmarkOn')}</span>` : ''}</span><span class="st-meta">${l.optional ? `<span class="st-opt">${esc(t('optional'))}</span> · ` : ''}${l.minutes || 5} ${esc(t('min'))}</span></a>
      </li>`;
    }).join('')}</ol>`;
  }
  function viewHome() {
    const total = LESSONS.length, done = doneCount(), pct = pctDone();
    const R = 31, C = 2 * Math.PI * R;
    const last = S.last && LBY[S.last.id];
    const target = (last && !S.done[last.id]) ? last : firstUndone();
    const best = bestExam('full');
    const curId = target ? target.id : null;
    let cont = '';
    if (target) {
      const started = !!(last && last.id === target.id);
      cont = `<div class="card continue" style="${lineVars(target.mod.line)}">
        <span class="eyebrow">${esc(started ? t('continueWhere') : (done ? t('nextUp') : t('startHere')))}</span>
        <h3>${esc(tx(target.title))}</h3>
        <p class="muted">${esc(lessonLabel(target))} · ${target.minutes || 5} ${esc(t('min'))}</p>
        <div class="row"><a class="btn primary" href="#${target.id}" data-resume="${started ? 1 : 0}">${icon('play')}${esc(started ? t('resume') : t('start'))}</a></div>
      </div>`;
    } else {
      cont = `<div class="card continue" style="${lineVars('lx')}"><span class="eyebrow">${esc(t('allDone'))}</span><h3>${esc(t('allDoneTitle'))}</h3><div class="row"><a class="btn primary" href="#exam">${icon('exam')}${esc(t('takeExam'))}</a><a class="btn" href="#finish">${icon('award')}${esc(t('seeCompletion'))}</a></div></div>`;
    }
    const lines = MODS.map((m, i) => {
      const nxt = MODS[i + 1];
      return `<section class="line" style="${lineVars(m.line)}" aria-label="${esc(tx(m.title))}">
        <a class="line-head${L === 'he' && LINE_ART[m.id] ? ' has-art' : ''}" href="#${m.id}">
          <span class="linebadge">${m.n}</span>
          <span class="lh-text"><span class="eyebrow">${esc(t('lineN', { n: m.n }))}</span><h2>${esc(tx(m.title))}</h2><span class="sub">${esc(tx(m.subtitle))}</span>
          <span class="meta tnum"><span class="bar"><i style="width:${pctDone(m)}%"></i></span>${doneCount(m)}/${m.lessons.length} · ${Math.round(minutes(m) / 6) / 10} ${esc(t('hours'))}</span></span>
          ${lineArt(m, 'line-thumb')}
        </a>
        ${stationsHTML(m, curId)}
      </section>
      ${nxt ? `<div class="transfer" style="--c:var(--${m.line});--c2:var(--${nxt.line})"><div class="track"></div><div></div></div>` : `<div class="transfer" style="--c:var(--${m.line});--c2:var(--lx)"><div class="track"></div><div></div></div>`}`;
    }).join('');
    return `<div class="view">
      <section class="hero">
        ${L === 'he' ? `<img class="hero-art" src="assets/stickers/chat-robot.webp" width="720" height="589" alt="${esc(t('heroArtAlt'))}">` : ''}
        <span class="eyebrow">${esc(t('homeEyebrow'))}</span>
        <h1>${esc(t('homeTitle'))}</h1>
        <p>${md(t('homeIntro'))}</p>
      </section>
      <div class="card overall">
        <svg class="ring" viewBox="0 0 76 76" role="img" aria-label="${pct}%"><defs><linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--l1)"/><stop offset=".5" style="stop-color:var(--l3)"/><stop offset="1" style="stop-color:var(--l5)"/></linearGradient></defs><circle class="bg" cx="38" cy="38" r="${R}"/><circle class="fg" cx="38" cy="38" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}" transform="rotate(-90 38 38)"/><text x="38" y="45" text-anchor="middle">${pct}%</text></svg>
        <div><b>${esc(t('progressTitle'))}</b><p class="muted tnum">${esc(t('progressLine', { done, total }))}${best >= 0 ? ' · ' + esc(t('bestMock', { pct: best })) : ''}</p></div>
      </div>
      ${cont}
      <div class="map">${lines}
        <a class="terminus" href="#exam"><span class="big"></span><span><span class="eyebrow">${esc(t('terminus'))}</span><h2>${esc(t('examStation'))}</h2><span class="muted" style="font-size:.92rem">${esc(t('examStationSub'))}</span></span></a>
      </div>
      <div class="legend"><span><i></i>${esc(t('legendTodo'))}</span><span><i class="f"></i>${esc(t('legendDone'))}</span><span style="color:var(--lx)">${icon('bookmarkOn').replace('<svg', '<svg style="width:14px;height:14px"')}${esc(t('bookmarked'))}</span></div>
      <div class="home-grid">
        <a class="card tile" href="#notebook">${icon('book')}<b class="tnum">${S.hl.length + S.saved.length + Object.keys(S.notes).filter((k) => S.notes[k] && S.notes[k].text).length + S.journal.length}</b><span class="muted">${esc(t('tileNotebook'))}</span></a>
        <a class="card tile" href="#glossary">${icon('glossary')}<b class="tnum">${(CT.glossary || []).length}</b><span class="muted">${esc(t('tileGlossary'))}</span></a>
        <a class="card tile" href="#exam">${icon('target')}<b class="tnum">${(CT.exam || []).length}</b><span class="muted">${esc(t('tileExam'))}</span></a>
      </div>
      <p class="foot">${md(t('disclaimer'))}</p>
    </div>`;
  }

  /* -------------------------------------------------------------- MODULE */
  function viewModule(m) {
    const qs = (CT.exam || []).filter((q) => q.m === m.id);
    const bq = S.quiz[m.id + '-quiz'];
    const target = m.lessons.find((l) => !S.done[l.id]) || m.lessons[0];
    const nxt = MODS[MODS.indexOf(m) + 1];
    return `<div class="view" style="${lineVars(m.line)}">
      <section class="mod-hero${L === 'he' && LINE_ART[m.id] ? ' has-art' : ''}">
        ${lineArt(m, 'line-art')}
        <div class="row"><span class="linebadge">${m.n}</span><span class="eyebrow">${esc(t('lineN', { n: m.n }))} · ${m.lessons.length} ${esc(t('lessons'))} · ${Math.round(minutes(m) / 6) / 10} ${esc(t('hours'))}</span></div>
        <h1>${esc(tx(m.title))}</h1>
        <p class="lead">${md(tx(m.intro || m.subtitle))}</p>
        <div><b>${esc(t('youWillBeAble'))}</b><ul class="outcomes">${(tx(m.outcomes) || []).map((o) => `<li>${md(o)}</li>`).join('')}</ul></div>
        <div class="meta tnum spread"><span class="bar" style="flex:1"><i style="width:${pctDone(m)}%"></i></span><span>${doneCount(m)}/${m.lessons.length}</span></div>
        <div class="row"><a class="btn primary" href="#${target.id}">${icon('play')}${esc(doneCount(m) ? t('continue') : t('startLine'))}</a></div>
      </section>
      <section style="${lineVars(m.line)}">${stationsHTML(m, target.id)}</section>
      <a class="card spread" href="#${m.id}-quiz" style="text-decoration:none;color:inherit">
        <span><span class="eyebrow">${esc(t('lineQuiz'))}</span><h3 style="font-size:1.1rem">${esc(t('lineQuizTitle', { n: m.n }))}</h3><span class="muted">${esc(t('nQuestions', { n: qs.length }))}${bq ? ' · ' + esc(t('lastScore', { pct: Math.round(bq.ok / bq.of * 100) })) : ''}</span></span>
        ${icon('next', 'flip')}
      </a>
      ${nxt ? `<a class="btn" href="#${nxt.id}">${esc(t('nextLine'))}: ${esc(tx(nxt.title))}</a>` : `<a class="btn" href="#exam">${esc(t('examStation'))}</a>`}
    </div>`;
  }

  /* -------------------------------------------------------------- LESSON */
  function contentOf(b) {
    if (b.t === 'widget' || b.t === 'svg' || b.t === 'quiz') return '';
    if (b.t === 'code' && b.code != null) return b.code;
    if (Object.prototype.hasOwnProperty.call(b, L)) return b[L];
    if (L !== 'en' && !Object.prototype.hasOwnProperty.call(b, 'en')) return null;
    return b.only ? null : b.en;
  }
  const CO_ICON = { analogy: 'analogy', tip: 'bulb', warn: 'alert', exam: 'target', simple: 'simple', try: 'try', note: 'note' };
  function codeHTML(code) {
    return esc(code).split('\n').map((ln) => (/^\s*(#|\/\/)/.test(ln) ? `<span class="cm">${ln}</span>` : ln)).join('\n');
  }
  function blockHTML(l, b, i) {
    const c = contentOf(b);
    if (c === null || c === undefined) return '';
    const at = `data-b="${i}"`;
    switch (b.t) {
      case 'p': return `<p class="blk" ${at}>${md(c)}</p>`;
      case 'h': return `<h2 class="blk" ${at}>${md(c)}</h2>`;
      case 'h3': return `<h3 class="blk" ${at}>${md(c)}</h3>`;
      case 'list': return `<ul class="blk" ${at}>${c.map((x) => `<li>${md(x)}</li>`).join('')}</ul>`;
      case 'steps': return `<ol class="blk steps" ${at}>${c.map((x) => `<li><span>${md(x)}</span></li>`).join('')}</ol>`;
      case 'quote': return `<p class="pull blk" ${at}>${md(c)}</p>`;
      case 'callout': {
        const k = b.kind || 'tip';
        const body = typeof c === 'string' ? c : c.body;
        const title = typeof c === 'string' ? '' : c.title;
        return `<div class="callout ${k} blk" ${at}>${icon(CO_ICON[k] || 'bulb')}<div class="ct"><b class="lbl">${esc(title || t('co_' + k))}</b><div>${md(body)}</div></div></div>`;
      }
      case 'key': {
        const saved = S.saved.some((s) => s.lesson === l.id && s.b === i && s.kind === 'key');
        return `<div class="keycard blk" ${at}><div class="spread"><span class="eyebrow">${esc(t('keyIdea'))}</span><button type="button" class="btn small save" data-savekey="${i}" aria-pressed="${saved}">${icon(saved ? 'starOn' : 'star')}<span>${esc(saved ? t('saved') : t('saveToNotebook'))}</span></button></div><h3>${md(c.title)}</h3><p>${md(c.body)}</p></div>`;
      }
      case 'table': return `<div class="tbl-wrap blk" ${at}><table><thead><tr>${c.head.map((h) => `<th>${md(h)}</th>`).join('')}</tr></thead><tbody>${c.rows.map((r) => `<tr>${r.map((x) => `<td>${md(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'code': {
        const code = typeof c === 'string' ? c : (b.code || '');
        return `<div class="codebox blk" ${at} data-nohl><div class="cb-head"><span>${esc(b.lang || 'code')}${b.file ? ' · ' + esc(b.file) : ''}</span><button type="button" data-copycode="${i}">${esc(t('copy'))}</button></div><pre><code>${codeHTML(code)}</code></pre></div>`;
      }
      case 'prompt': {
        const text = typeof c === 'string' ? c : c.text;
        return `<div class="promptbox blk" ${at}><div class="pb-head"><span class="eyebrow">${esc(b.label ? tx(b.label) : t('examplePrompt'))}</span><span class="row"><button type="button" class="btn small" data-copyprompt="${i}">${icon('copy')}${esc(t('copy'))}</button><a class="btn small" target="_blank" rel="noopener" href="https://claude.ai/new?q=${encodeURIComponent(text)}">${icon('external')}${esc(t('tryInClaude'))}</a></span></div><div class="pb-body" dir="auto">${esc(text)}</div></div>`;
      }
      case 'compare': return `<div class="compare blk" ${at}><div class="bad"><h4>${icon('x')}${md(c.badT || t('weaker'))}</h4><ul>${c.bad.map((x) => `<li>${md(x)}</li>`).join('')}</ul></div><div class="good"><h4>${icon('check')}${md(c.goodT || t('stronger'))}</h4><ul>${c.good.map((x) => `<li>${md(x)}</li>`).join('')}</ul></div></div>`;
      case 'flow': return `<div class="flow blk${b.h ? ' h' : ''}" ${at}>${c.title ? `<h3 class="fl-title">${md(c.title)}</h3>` : ''}<ol>${c.steps.map((s, j) => `<li><span class="n">${s.ic ? icon(s.ic) : j + 1}</span><div class="fb"><b>${md(s.t)}</b>${s.d ? `<span>${md(s.d)}</span>` : ''}</div></li>`).join('')}</ol>${c.loop ? `<div class="loopback">${icon('loop')}${md(c.loop)}</div>` : ''}</div>`;
      case 'stack': {
        const tot = c.items.reduce((a, x) => a + x.v, 0);
        return `<div class="stack blk" ${at}>${c.title ? `<h3>${md(c.title)}</h3>` : ''}<div class="sbar">${c.items.map((x) => `<i style="width:${x.v / tot * 100}%;background:var(--${x.c || 'l1'})"></i>`).join('')}</div><div class="skeys">${c.items.map((x) => `<span><i style="background:var(--${x.c || 'l1'})"></i>${md(x.label)}</span>`).join('')}</div>${c.note ? `<p class="w-note">${md(c.note)}</p>` : ''}</div>`;
      }
      case 'cards': return `<div class="cards blk" ${at}>${c.map((x) => `<div class="cardx" style="--c:var(--${x.c || l.mod.line})">${x.tag ? `<span class="tag">${md(x.tag)}</span>` : ''}<h4>${md(x.title)}</h4><p>${md(x.body)}</p></div>`).join('')}</div>`;
      case 'checklist': {
        const ticks = S.checks[b.id] || [];
        return `<div class="blk" ${at}>${b.title ? `<h3 style="margin-bottom:8px">${md(tx(b.title))}</h3>` : ''}<ul class="check-list">${c.map((x, j) => `<li><label><input type="checkbox" data-check-id="${esc(b.id)}" data-j="${j}"${ticks.indexOf(j) >= 0 ? ' checked' : ''}><span>${md(x)}</span></label></li>`).join('')}</ul></div>`;
      }
      case 'quiz': return `<div class="blk" ${at} data-nohl>${qHTML(b.q, { label: t('pauseThink') })}</div>`;
      case 'widget':
      case 'svg':
        return `<div class="blk" ${at} data-nohl>${W.html(b, wctx(l, i))}</div>`;
      default: return '';
    }
  }
  function viewLesson(l) {
    const m = l.mod; const done = !!S.done[l.id];
    const prev = LESSONS[l.gi - 1]; const nextL = LESSONS[l.gi + 1];
    const isLastInLine = l.idx === m.lessons.length - 1;
    const next = isLastInLine ? { href: '#' + m.id + '-quiz', title: t('lineQuizTitle', { n: m.n }), lab: t('lineQuiz') } : (nextL ? { href: '#' + nextL.id, title: tx(nextL.title), lab: t('nextLesson') } : null);
    const marked = S.marks.some((k) => k.lesson === l.id);
    const tldr = tx(l.tldr);
    const terms = L === 'he' ? (l.terms || []) : [];
    const note = (S.notes[l.id] && S.notes[l.id].text) || '';
    const checks = l.check || [];
    return `<article class="view lesson" style="${lineVars(m.line)}" data-lesson="${l.id}">
      <header class="lesson-head">
        ${l.optional ? `<p class="opt-tag">${icon('flag')}<span><b>${esc(t('optional'))}</b> · ${esc(t('optionalNote'))}</span></p>` : ''}
        <div class="crumbs"><span class="linebadge">${m.n}</span><a href="#${m.id}">${esc(tx(m.title))}</a><span aria-hidden="true">·</span><span class="tnum">${esc(t('lessonXofY', { x: l.idx + 1, y: m.lessons.length }))}</span></div>
        <h1>${esc(tx(l.title))}</h1>
        <div class="row"><span class="chip">${icon('clock').replace('<svg', '<svg style="width:14px;height:14px"')}${l.minutes || 5} ${esc(t('min'))}</span>${(l.domains || []).map((d) => DOM[d] ? `<span class="chip dom" title="${esc(t('examDomain'))}">${esc(t('domainShort', { n: d.slice(1) }))} · ${esc(tx(DOM[d].short || DOM[d]))}</span>` : '').join('')}${done ? `<span class="chip" style="background:var(--good-soft);color:var(--good)">${icon('check').replace('<svg', '<svg style="width:14px;height:14px"')}${esc(t('completed'))}</span>` : ''}</div>
        <div class="lesson-tools">
          <button type="button" class="btn" id="markBtn" aria-pressed="${marked}">${icon(marked ? 'bookmarkOn' : 'bookmark')}<span>${esc(t('bookmarkHere'))}</span></button>
          <button type="button" class="btn" id="listenBtn" hidden>${icon('speaker')}<span>${esc(t('listen'))}</span></button>
          <a class="btn" href="#notebook">${icon('book')}<span>${esc(t('myNotebook'))}</span></a>
        </div>
      </header>
      ${tldr ? `<div class="tldr"><span class="eyebrow">${esc(t('inShort'))}</span><p>${md(tldr)}</p></div>` : ''}
      ${tx(l.goals) && tx(l.goals).length ? `<div class="goals"><span class="eyebrow">${esc(t('goalsTitle'))}</span><ul>${tx(l.goals).map((g) => `<li>${icon('target')}<span>${md(g)}</span></li>`).join('')}</ul></div>` : ''}
      ${terms.length ? `<div class="card terms"><span class="eyebrow">${esc(t('termsTitle'))}</span><dl>${terms.map((x) => `<div><dt>${esc(x[0])}</dt><dd>${md(x[1])}</dd></div>`).join('')}</dl></div>` : ''}
      <div class="content" id="content">${l.blocks.map((b, i) => blockHTML(l, b, i)).join('')}</div>
      ${checks.length ? `<section class="content" aria-label="${esc(t('quickCheck'))}"><h2>${esc(t('quickCheck'))}</h2>${checks.map((q, j) => qHTML(q, { label: t('questionN', { n: j + 1, of: checks.length }) })).join('')}</section>` : ''}
      <section class="card notes-box">
        <div class="spread"><h3 style="font-size:1.08rem">${icon('note').replace('<svg', '<svg style="width:20px;height:20px;vertical-align:-4px;margin-inline-end:6px"')}${esc(t('myNotesTitle'))}</h3><span class="saved-hint" id="noteHint"></span></div>
        <label class="sr" for="lessonNote">${esc(t('myNotesTitle'))}</label>
        <textarea id="lessonNote" dir="auto" placeholder="${esc(t('notesPlaceholder'))}">${esc(note)}</textarea>
      </section>
      <footer class="lesson-foot">
        ${done ? `<div class="donecard"><h3>${icon('check').replace('<svg', '<svg style="width:26px;height:26px;vertical-align:-5px;color:var(--good)"')} ${esc(t('lessonDone'))}</h3>${next ? `<a class="btn primary" href="${next.href}">${esc(next.lab)}${icon('next', 'flip')}</a>` : ''}<button type="button" class="btn ghost small" id="undoneBtn">${esc(t('markNotDone'))}</button></div>`
          : `<button type="button" class="btn primary block" id="doneBtn">${icon('check')}${esc(next ? t('completeAndNext') : t('complete'))}</button>`}
        <nav class="pager" aria-label="${esc(t('lessonNav'))}">
          ${prev ? `<a href="#${prev.id}"><span>${esc(t('previous'))}</span><b>${esc(tx(prev.title))}</b></a>` : '<span></span>'}
          ${next ? `<a class="next" href="${next.href}"><span>${esc(next.lab)}</span><b>${esc(next.title)}</b></a>` : '<span></span>'}
        </nav>
      </footer>
    </article>`;
  }

  /* --------------------------------------------------------- QUESTIONS */
  function qHTML(q, o) {
    o = o || {};
    const c = q[L] || q.en;
    const multi = q.a.length > 1;
    const sel = o.sel || [];
    const dom = q.d && DOM[q.d] ? `<span class="chip dom">${esc(t('domainShort', { n: q.d.slice(1) }))} · ${esc(tx(DOM[q.d].short))}</span>` : '';
    return `<div class="quiz" data-qid="${esc(q.id)}">
      <div class="qhead"><span class="eyebrow">${esc(o.label || '')}</span>${o.hideDomain ? '' : dom}</div>
      <p class="qtext">${md(c.q)}</p>
      ${multi ? `<p class="multi-hint">${esc(t('chooseN', { n: q.a.length }))}</p>` : ''}
      <div class="opts" role="${multi ? 'group' : 'radiogroup'}">${c.o.map((x, j) => `<button type="button" class="opt${multi ? ' sq' : ''}" role="${multi ? 'checkbox' : 'radio'}" aria-checked="${sel.indexOf(j) >= 0}" data-j="${j}"><span class="box">${'ABCDEFGH'[j]}</span><span>${md(x)}</span></button>`).join('')}</div>
      ${o.noCheck ? '' : `<div class="row"><button type="button" class="btn primary small" data-qcheck>${esc(t('check'))}</button></div>`}
      <div class="fb-slot"></div>
    </div>`;
  }
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.indexOf(x) >= 0);
  function revealQ(el, q, sel) {
    const c = q[L] || q.en;
    const ok = sameSet(sel, q.a);
    $$('.opt', el).forEach((b) => {
      const j = +b.dataset.j;
      b.disabled = true;
      if (q.a.indexOf(j) >= 0) b.classList.add('right');
      else if (sel.indexOf(j) >= 0) b.classList.add('wrong');
    });
    const chk = $('[data-qcheck]', el); if (chk) chk.hidden = true;
    $('.fb-slot', el).innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><b>${esc(ok ? t('correct') : t('notQuite'))}</b><div>${md(c.why || '')}</div></div>`;
    return ok;
  }
  function wireOptions(el, q, onChange) {
    const multi = q.a.length > 1;
    $$('.opt', el).forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      if (multi) b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true'));
      else $$('.opt', el).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      if (onChange) onChange(selectedOf(el));
    }));
  }
  const selectedOf = (el) => $$('.opt', el).filter((b) => b.getAttribute('aria-checked') === 'true').map((b) => +b.dataset.j);
  function mountPracticeQ(el, q, onResult) {
    wireOptions(el, q);
    const btn = $('[data-qcheck]', el);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sel = selectedOf(el);
      if (!sel.length) { toast(t('pickAnswer')); return; }
      const ok = revealQ(el, q, sel);
      if (onResult) onResult(ok);
      const again = document.createElement('button');
      again.type = 'button'; again.className = 'btn ghost small'; again.textContent = t('tryAgain');
      again.addEventListener('click', () => {
        $$('.opt', el).forEach((b) => { b.disabled = false; b.classList.remove('right', 'wrong'); b.setAttribute('aria-checked', 'false'); });
        $('.fb-slot', el).innerHTML = ''; btn.hidden = false;
      });
      $('.fb-slot', el).appendChild(again);
    });
  }

  /* -------------------------------------------------------- lesson mount */
  function wctx(l, i) {
    return { L, t, tx, md, esc, icon, Ext, lesson: l, index: i, toast, copyText, S: () => S, persist, uid, go, startExam: startMode, fmtDate };
  }
  let ttsOn = false;
  function paintListen() {
    const b = $('#listenBtn'); if (!b) return;
    b.hidden = !Ext.tts;
    b.innerHTML = icon(ttsOn ? 'stop' : 'speaker') + `<span>${esc(ttsOn ? t('stopListening') : t('listen'))}</span>`;
  }
  function stopTTS() { if (Ext.tts && ttsOn) { try { Ext.tts.stop(); } catch (e) { /* ignore */ } } ttsOn = false; }
  function lessonSpeech(l) {
    const out = [];
    out.push(tx(l.title));
    const tl = tx(l.tldr); if (tl) out.push(stripMd(tl));
    l.blocks.forEach((b, i) => {
      if (['p', 'h', 'h3', 'list', 'steps', 'callout', 'key', 'quote'].indexOf(b.t) < 0) return;
      const s = stripMd(blockText(l, i)); if (s) out.push(s);
    });
    const lines = [];
    out.forEach((s) => { while (s.length > 1800) { const cut = s.lastIndexOf('. ', 1800); const k = cut > 200 ? cut + 1 : 1800; lines.push(s.slice(0, k)); s = s.slice(k); } if (s.trim()) lines.push(s); });
    return lines;
  }

  const MOUNT = {};
  MOUNT.home = (root) => {
    $$('[data-resume="1"]', root).forEach((a) => a.addEventListener('click', () => { resumeNext = true; }));
    if (!S.seenTour) setTimeout(showTour, 350);
  };
  MOUNT.lesson = (root) => {
    const l = LBY[cur.arg];
    // highlights & bookmarks
    S.hl.filter((h) => h.lesson === l.id).forEach(applyHl);
    S.marks.filter((k) => k.lesson === l.id).forEach((k) => { const el = $(`.content [data-b="${k.b}"]`, root); if (el) el.setAttribute('data-marked', ''); });
    // widgets
    $$('.content [data-b]', root).forEach((el) => {
      const i = +el.dataset.b; const b = l.blocks[i];
      if (b && (b.t === 'widget' || b.t === 'svg')) { try { W.mount(el, b, wctx(l, i)); } catch (e) { console.error('widget', b.name, e); } }
    });
    // quizzes
    $$('.quiz', root).forEach((el) => {
      const q = QBY[el.dataset.qid]; if (!q) return;
      mountPracticeQ(el, q, (ok) => {
        const r = S.quiz[l.id] || { ok: 0, of: 0, ids: {} };
        r.ids = r.ids || {}; r.ids[q.id] = ok;
        r.of = Object.keys(r.ids).length; r.ok = Object.values(r.ids).filter(Boolean).length;
        S.quiz[l.id] = r; persist();
      });
    });
    // key-card saving
    $$('[data-savekey]', root).forEach((btn) => btn.addEventListener('click', () => {
      const i = +btn.dataset.savekey; const b = l.blocks[i]; const c = contentOf(b);
      const ex = S.saved.find((s) => s.lesson === l.id && s.b === i && s.kind === 'key');
      if (ex) { removeItem('saved', ex.id); btn.setAttribute('aria-pressed', 'false'); btn.innerHTML = icon('star') + `<span>${esc(t('saveToNotebook'))}</span>`; toast(t('removed')); return; }
      S.saved.push({ id: uid('s'), kind: 'key', lesson: l.id, b: i, title: stripMd(c.title), body: stripMd(c.body), at: Date.now() });
      persist(); btn.setAttribute('aria-pressed', 'true'); btn.innerHTML = icon('starOn') + `<span>${esc(t('saved'))}</span>`; toast(t('savedToNotebook'));
    }));
    $$('[data-copycode]', root).forEach((btn) => btn.addEventListener('click', async () => {
      const b = l.blocks[+btn.dataset.copycode]; const c = contentOf(b);
      const ok = await copyText(typeof c === 'string' && c ? c : b.code);
      toast(ok ? t('copied') : t('copyFailed'));
    }));
    $$('[data-copyprompt]', root).forEach((btn) => btn.addEventListener('click', async () => {
      const c = contentOf(l.blocks[+btn.dataset.copyprompt]);
      const ok = await copyText(typeof c === 'string' ? c : c.text); toast(ok ? t('copied') : t('copyFailed'));
    }));
    $$('[data-check-id]', root).forEach((cb) => cb.addEventListener('change', () => {
      const id = cb.dataset.checkId; const j = +cb.dataset.j;
      const arr = new Set(S.checks[id] || []); if (cb.checked) arr.add(j); else arr.delete(j);
      S.checks[id] = Array.from(arr); persist();
    }));
    // tools
    $('#markBtn').addEventListener('click', () => {
      const has = S.marks.filter((k) => k.lesson === l.id);
      if (has.length) {
        has.forEach((k) => removeItem('marks', k.id));
        $$('[data-marked]', root).forEach((e) => e.removeAttribute('data-marked'));
        $('#markBtn').setAttribute('aria-pressed', 'false'); $('#markBtn').innerHTML = icon('bookmark') + `<span>${esc(t('bookmarkHere'))}</span>`;
        toast(t('bookmarkRemoved')); return;
      }
      const b = currentBlock();
      S.marks.push({ id: uid('k'), lesson: l.id, b, label: stripMd(blockText(l, b)).slice(0, 140), at: Date.now() });
      persist();
      const el = $(`.content [data-b="${b}"]`, root); if (el) el.setAttribute('data-marked', '');
      $('#markBtn').setAttribute('aria-pressed', 'true'); $('#markBtn').innerHTML = icon('bookmarkOn') + `<span>${esc(t('bookmarkHere'))}</span>`;
      toast(t('bookmarkSaved'));
    });
    paintListen();
    $('#listenBtn').addEventListener('click', async () => {
      if (!Ext.tts) return;
      if (ttsOn) { stopTTS(); paintListen(); return; }
      ttsOn = true; paintListen();
      try { await Ext.tts.speak(lessonSpeech(l).map((text) => ({ text })), { language: L }); }
      catch (e) { if (e && e.code === 'not_granted') { Ext.tts = null; } }
      ttsOn = false; paintListen();
    });
    const ta = $('#lessonNote');
    const saveNote = debounce(() => { S.notes[l.id] = { text: ta.value, at: Date.now() }; persist(); $('#noteHint').textContent = t('savedJustNow'); }, 600);
    ta.addEventListener('input', () => { $('#noteHint').textContent = t('saving'); saveNote(); });
    const doneBtn = $('#doneBtn');
    if (doneBtn) doneBtn.addEventListener('click', () => {
      S.done[l.id] = Date.now(); persist();
      const nxt = l.idx === l.mod.lessons.length - 1 ? l.mod.id + '-quiz' : (LESSONS[l.gi + 1] && LESSONS[l.gi + 1].id);
      toast(t('lessonDoneToast'));
      if (nxt) go(nxt); else render({ keepScroll: true });
    });
    const undo = $('#undoneBtn');
    if (undo) undo.addEventListener('click', () => { delete S.done[l.id]; persist(); render({ keepScroll: true }); });
    S.last = { id: l.id, b: S.last && S.last.id === l.id ? S.last.b : 0, at: Date.now() };
    persist({ quiet: true });
  };
  function currentBlock() {
    const els = $$('.content [data-b]');
    let best = 0;
    for (const el of els) { const r = el.getBoundingClientRect(); if (r.top > 110) break; best = +el.dataset.b; }
    return best;
  }
  function updateReadbar() {
    const bar = $('#readbar');
    if (cur.view !== 'lesson') { bar.style.width = '0'; return; }
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? clamp(window.scrollY / h, 0, 1) * 100 : 0) + '%';
  }
  const trackScroll = debounce(() => {
    if (cur.view !== 'lesson') return;
    const b = currentBlock();
    if (!S.last || S.last.id !== cur.arg || S.last.b !== b) { S.last = { id: cur.arg, b, at: Date.now() }; persist({ quiet: true }); }
  }, 500);
  window.addEventListener('scroll', () => { updateReadbar(); trackScroll(); }, { passive: true });

  /* ---------------------------------------------------------- highlights */
  function applyHl(h) {
    const blk = $(`.content [data-b="${h.b}"]`);
    let ok = blk && wrapText(blk, h.text, h.occ || 0, h.id, !!h.note);
    if (!ok) { // content changed: search the whole lesson
      for (const el of $$('.content [data-b]')) { if (el.hasAttribute('data-nohl')) continue; if (wrapText(el, h.text, 0, h.id, !!h.note)) { ok = true; break; } }
    }
    return ok;
  }
  function wrapText(blk, text, occ, id, hasNote) {
    if (!text) return false;
    const walker = document.createTreeWalker(blk, NodeFilter.SHOW_TEXT);
    const nodes = []; let full = '';
    while (walker.nextNode()) { nodes.push({ n: walker.currentNode, s: full.length }); full += walker.currentNode.nodeValue; }
    let idx = -1, from = 0;
    for (let k = 0; k <= occ; k++) { const f = full.indexOf(text, from); if (f < 0) break; idx = f; from = f + 1; }
    if (idx < 0) return false;
    const end = idx + text.length;
    nodes.forEach(({ n, s }) => {
      const e = s + n.nodeValue.length;
      if (e <= idx || s >= end) return;
      const a = Math.max(idx, s) - s, z = Math.min(end, e) - s;
      let target = n;
      if (z < target.nodeValue.length) target.splitText(z);
      if (a > 0) target = target.splitText(a);
      if (!target.nodeValue.trim() && target.nodeValue.length < 2) return;
      const mk = document.createElement('mark');
      mk.className = 'hl' + (hasNote ? ' has-note' : ''); mk.dataset.hl = id;
      target.parentNode.insertBefore(mk, target); mk.appendChild(target);
    });
    return true;
  }
  function unwrapHl(id) {
    $$(`mark.hl[data-hl="${id}"]`).forEach((m) => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); });
  }
  function removeItem(kind, id) {
    S[kind] = S[kind].filter((x) => x.id !== id);
    S.del[id] = Date.now();
    if (kind === 'hl') unwrapHl(id);
    persist();
  }

  // selection bar
  let pend = null, barDown = false;
  function selInfo() {
    if (cur.view !== 'lesson') return null;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    let node = r.commonAncestorContainer; if (node.nodeType === 3) node = node.parentNode;
    const blk = node.closest && node.closest('.content [data-b]');
    if (!blk || blk.hasAttribute('data-nohl') || node.closest('[data-nohl]')) return null;
    const raw = r.toString();
    const lead = raw.length - raw.replace(/^\s+/, '').length;
    const text = raw.trim();
    if (text.length < 2) return null;
    const pre = document.createRange(); pre.setStart(blk, 0); pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length + lead;
    const full = blk.textContent;
    // occ = how many earlier copies of the same text sit before this one in the block
    return { lesson: cur.arg, b: +blk.dataset.b, text, occ: countBefore(full, text, start), range: r.cloneRange(), el: blk };
  }
  function countBefore(full, text, start) { let n = 0, f = full.indexOf(text); while (f >= 0 && f < start) { n++; f = full.indexOf(text, f + 1); } return n; }
  const onSel = debounce(() => {
    const info = selInfo();
    if (info) { pend = info; showSelbar(); }
    else setTimeout(() => { if (!barDown) hideSelbar(); }, 250);
  }, 140);
  document.addEventListener('selectionchange', onSel);
  function showSelbar() {
    const bar = $('#selbar');
    $('#selbarIn').innerHTML = [
      ['hl', '<span class="swatch"></span>', t('highlight')],
      ['note', icon('note'), t('addNote')],
      ['save', icon('star'), t('save')],
      ['copy', icon('copy'), t('copy')]
    ].concat(Ext.comments ? [['ask', icon('chat'), t('commentAuthor')]] : [])
      .map(([a, ic, lab]) => `<button type="button" data-act="${a}">${ic}<span>${esc(lab)}</span></button>`).join('');
    bar.hidden = false;
  }
  function hideSelbar() { $('#selbar').hidden = true; pend = null; }
  $('#selbar').addEventListener('pointerdown', (e) => { barDown = true; if (e.target.closest('button')) e.preventDefault(); });
  document.addEventListener('pointerup', () => { setTimeout(() => { barDown = false; }, 50); });
  $('#selbar').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]'); if (!btn || !pend) return;
    const p = pend; const act = btn.dataset.act;
    if (act === 'hl' || act === 'note') {
      const h = { id: uid('h'), lesson: p.lesson, b: p.b, text: p.text, occ: p.occ, note: '', at: Date.now() };
      S.hl.push(h); persist();
      window.getSelection().removeAllRanges(); hideSelbar();
      if (!applyHl(h)) toast(t('hlFailed')); else if (act === 'hl') toast(t('highlighted'));
      if (act === 'note') openHlSheet(h.id);
    } else if (act === 'save') {
      S.saved.push({ id: uid('s'), kind: 'quote', lesson: p.lesson, b: p.b, title: tx(LBY[p.lesson].title), body: p.text, at: Date.now() });
      persist(); window.getSelection().removeAllRanges(); hideSelbar(); toast(t('savedToNotebook'));
    } else if (act === 'copy') {
      const ok = await copyText(p.text); hideSelbar(); toast(ok ? t('copied') : t('copyFailed'));
    } else if (act === 'ask' && Ext.comments) {
      try { await Ext.comments.openComposer({ range: p.range }); }
      catch (err) { try { await Ext.comments.openComposer({ element: p.el }); } catch (e2) { toast(t('commentUnavailable')); } }
      hideSelbar();
    }
  });
  document.addEventListener('click', (e) => {
    const m = e.target.closest && e.target.closest('mark.hl');
    if (m && !window.getSelection().toString()) openHlSheet(m.dataset.hl);
  });

  /* ------------------------------------------------------------- sheets */
  function openSheet(html, mount) {
    const root = $('#sheetRoot');
    root.innerHTML = `<div class="scrim"><div class="sheet" role="dialog" aria-modal="true" dir="${dir()}"><div class="grab"></div>${html}</div></div>`;
    const scrim = $('.scrim', root);
    scrim.addEventListener('click', (e) => { if (e.target === scrim) closeSheet(); });
    const sh = $('.sheet', root);
    $$('[data-close]', sh).forEach((b) => b.addEventListener('click', closeSheet));
    if (mount) mount(sh);
    const f = $('textarea, input, button', sh); if (f) setTimeout(() => f.focus(), 30);
  }
  function closeSheet() { const r = $('#sheetRoot'); if (r) r.innerHTML = ''; }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSheet(); hideSelbar(); } });

  function openHlSheet(id) {
    const h = S.hl.find((x) => x.id === id); if (!h) return;
    const l = LBY[h.lesson];
    openSheet(`<span class="eyebrow">${esc(t('highlight'))} · ${esc(l ? lessonLabel(l) : '')}</span>
      <blockquote style="margin:0;padding-inline-start:12px;border-inline-start:4px solid var(--mark-strong)" dir="auto">${esc(h.text)}</blockquote>
      <label class="field" for="hlNote">${esc(t('yourNote'))}<textarea id="hlNote" dir="auto" placeholder="${esc(t('notePlaceholder'))}">${esc(h.note || '')}</textarea></label>
      <div class="spread"><button type="button" class="btn ghost" id="hlDel" style="color:var(--bad)">${icon('trash')}${esc(t('deleteHl'))}</button>
      <span class="row"><button type="button" class="btn" data-close>${esc(t('close'))}</button><button type="button" class="btn primary" id="hlSave">${esc(t('saveNote'))}</button></span></div>`, (sh) => {
      $('#hlSave', sh).addEventListener('click', () => {
        h.note = $('#hlNote', sh).value.trim(); h.at = Date.now(); persist();
        $$(`mark.hl[data-hl="${h.id}"]`).forEach((m) => m.classList.toggle('has-note', !!h.note));
        closeSheet(); toast(t('noteSaved'));
        if (cur.view === 'notebook') render({ keepScroll: true });
      });
      $('#hlDel', sh).addEventListener('click', () => { removeItem('hl', h.id); closeSheet(); toast(t('removed')); if (cur.view === 'notebook') render({ keepScroll: true }); });
    });
  }
  function showTour() {
    if (S.seenTour || cur.view !== 'home') return;
    const steps = [['map', 'tour1t', 'tour1'], ['marker', 'tour2t', 'tour2'], ['bookmark', 'tour3t', 'tour3'], ['globe', 'tour4t', 'tour4']];
    openSheet(`<span class="eyebrow">${esc(t('tourEyebrow'))}</span><h3>${esc(t('tourTitle'))}</h3>
      <div style="display:grid;gap:12px">${steps.map(([ic, a, b]) => `<div style="display:grid;grid-template-columns:36px 1fr;gap:12px;align-items:start"><span style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent-ink)">${icon(ic).replace('<svg', '<svg style="width:20px;height:20px"')}</span><div><b>${esc(t(a))}</b><p class="muted" style="font-size:.95rem">${md(t(b))}</p></div></div>`).join('')}</div>
      <div class="langswitch" role="group" aria-label="Language" style="justify-self:start"><button type="button" data-tl="en" aria-pressed="${L === 'en'}">English</button><button type="button" data-tl="he" aria-pressed="${L === 'he'}" lang="he">עברית</button></div>
      <button type="button" class="btn primary block" id="tourGo">${esc(t('tourGo'))}</button>`, (sh) => {
      $$('[data-tl]', sh).forEach((b) => b.addEventListener('click', () => { setLang(b.dataset.tl); S.seenTour = false; showTourAgain(); }));
      $('#tourGo', sh).addEventListener('click', () => { S.seenTour = true; persist(); closeSheet(); });
    });
  }
  function showTourAgain() { closeSheet(); setTimeout(showTour, 10); }

  /* ------------------------------------------------------------ NOTEBOOK */
  let nbQuery = '';
  function viewNotebook() {
    const notes = Object.keys(S.notes).filter((k) => S.notes[k] && S.notes[k].text && S.notes[k].text.trim() && LBY[k]).map((k) => ({ id: 'n-' + k, lesson: k, text: S.notes[k].text, at: S.notes[k].at }));
    const tabs = [['hl', t('nbHighlights'), S.hl.length], ['notes', t('nbNotes'), notes.length], ['saved', t('nbSaved'), S.saved.length], ['marks', t('nbBookmarks'), S.marks.length], ['pages', t('nbPages'), S.journal.length]];
    const tab = S.nbTab || 'hl';
    const q = nbQuery.toLowerCase();
    const match = (...xs) => !q || xs.some((x) => String(x || '').toLowerCase().indexOf(q) >= 0);
    const src = (lid) => { const l = LBY[lid]; return l ? `<span class="src"><span class="linebadge" style="${lineVars(l.mod.line)};min-width:22px;height:22px;font-size:.72rem">${l.mod.n}</span><span>${esc(tx(l.title))}</span></span>` : ''; };
    let list = '';
    const sortNew = (a, b) => b.at - a.at;
    if (tab === 'hl') {
      const items = S.hl.slice().sort(sortNew).filter((h) => match(h.text, h.note));
      list = items.map((h) => `<div class="nb-item">${src(h.lesson)}<blockquote dir="auto">${esc(h.text)}</blockquote>${h.note ? `<div class="note" dir="auto">${esc(h.note)}</div>` : ''}<div class="spread"><span class="src">${esc(fmtDate(h.at))}</span><span class="acts"><button class="btn small ghost" data-open-hl="${h.id}">${esc(t('openInLesson'))}</button><button class="btn small ghost" data-edit-hl="${h.id}">${icon('edit')}${esc(h.note ? t('editNote') : t('addNote'))}</button><button class="btn small ghost" data-del="hl:${h.id}" aria-label="${esc(t('delete'))}">${icon('trash')}</button></span></div></div>`).join('');
    } else if (tab === 'notes') {
      list = notes.sort(sortNew).filter((n) => match(n.text)).map((n) => `<div class="nb-item">${src(n.lesson)}<div class="note" dir="auto">${esc(n.text)}</div><div class="spread"><span class="src">${esc(fmtDate(n.at))}</span><span class="acts"><a class="btn small ghost" href="#${n.lesson}">${esc(t('openInLesson'))}</a></span></div></div>`).join('');
    } else if (tab === 'saved') {
      list = S.saved.slice().sort(sortNew).filter((s) => match(s.title, s.body)).map((s) => `<div class="nb-item">${src(s.lesson)}${s.kind === 'key' ? `<b>${esc(s.title)}</b><p>${esc(s.body)}</p>` : `<blockquote dir="auto">${esc(s.body)}</blockquote>`}<div class="spread"><span class="src">${esc(fmtDate(s.at))}</span><span class="acts"><button class="btn small ghost" data-open-b="${s.lesson}:${s.b}">${esc(t('openInLesson'))}</button><button class="btn small ghost" data-del="saved:${s.id}" aria-label="${esc(t('delete'))}">${icon('trash')}</button></span></div></div>`).join('');
    } else if (tab === 'marks') {
      list = S.marks.slice().sort(sortNew).filter((k) => match(k.label)).map((k) => `<div class="nb-item">${src(k.lesson)}<p class="muted" dir="auto">${esc(k.label)}…</p><div class="spread"><span class="src">${esc(fmtDate(k.at))}</span><span class="acts"><button class="btn small primary" data-open-b="${k.lesson}:${k.b}">${icon('bookmarkOn')}${esc(t('jumpThere'))}</button><button class="btn small ghost" data-del="marks:${k.id}" aria-label="${esc(t('delete'))}">${icon('trash')}</button></span></div></div>`).join('');
    } else {
      list = `<button type="button" class="btn" id="newPage">${icon('plus')}${esc(t('newPage'))}</button>` + S.journal.slice().sort(sortNew).filter((p) => match(p.title, p.body)).map((p) => `<div class="nb-item" data-page="${p.id}"><input type="text" dir="auto" value="${esc(p.title)}" data-pt="${p.id}" aria-label="${esc(t('pageTitle'))}" placeholder="${esc(t('pageTitle'))}"><textarea dir="auto" data-pb="${p.id}" aria-label="${esc(t('pageBody'))}" placeholder="${esc(t('pageBody'))}">${esc(p.body)}</textarea><div class="spread"><span class="src">${esc(fmtDate(p.at))}</span><button class="btn small ghost" data-del="journal:${p.id}">${icon('trash')}${esc(t('delete'))}</button></div></div>`).join('');
    }
    const emptyMsg = { hl: t('emptyHl'), notes: t('emptyNotes'), saved: t('emptySaved'), marks: t('emptyMarks'), pages: '' }[tab];
    const anyItems = tab === 'pages' ? true : !!list;
    return `<div class="view">
      <section class="hero"><span class="eyebrow">${esc(t('tabNotebook'))}</span><h1>${esc(t('nbTitle'))}</h1><p>${md(t('nbIntro'))}</p></section>
      <div class="tabs" role="tablist">${tabs.map(([k, lab, n]) => `<button type="button" role="tab" data-nbtab="${k}" aria-selected="${tab === k}">${esc(lab)}<span class="n">${n}</span></button>`).join('')}</div>
      <label class="sr" for="nbSearch">${esc(t('search'))}</label>
      <input type="search" id="nbSearch" placeholder="${esc(t('searchNotebook'))}" value="${esc(nbQuery)}">
      <div class="nb-list">${anyItems ? list : `<div class="empty">${icon('marker')}<p>${md(emptyMsg)}</p></div>`}</div>
      <section class="card" style="display:grid;gap:10px"><b>${esc(t('exportTitle'))}</b><p class="muted" style="font-size:.94rem">${esc(t('exportIntro'))}</p><div class="row"><button type="button" class="btn" id="copyAll">${icon('copy')}${esc(t('copyAll'))}</button><button type="button" class="btn" id="saveMd" hidden>${icon('download')}${esc(t('saveFile'))}</button></div></section>
    </div>`;
  }
  function notebookMarkdown() {
    const out = ['# ' + t('nbTitle') + ' — ' + t('appName'), ''];
    const byLesson = (arr, fn) => { LESSONS.forEach((l) => { const xs = arr.filter((x) => x.lesson === l.id); if (xs.length) { out.push('## ' + lessonLabel(l) + ' — ' + tx(l.title)); xs.forEach(fn); out.push(''); } }); };
    if (S.hl.length) { out.push('# ' + t('nbHighlights'), ''); byLesson(S.hl, (h) => { out.push('> ' + h.text); if (h.note) out.push('', '- ' + h.note); out.push(''); }); }
    if (S.saved.length) { out.push('# ' + t('nbSaved'), ''); byLesson(S.saved, (s) => { out.push(s.kind === 'key' ? '**' + s.title + '** — ' + s.body : '> ' + s.body, ''); }); }
    const notes = Object.keys(S.notes).filter((k) => S.notes[k] && S.notes[k].text && LBY[k]);
    if (notes.length) { out.push('# ' + t('nbNotes'), ''); notes.forEach((k) => out.push('## ' + tx(LBY[k].title), '', S.notes[k].text, '')); }
    if (S.journal.length) { out.push('# ' + t('nbPages'), ''); S.journal.forEach((p) => out.push('## ' + (p.title || t('untitled')), '', p.body || '', '')); }
    return out.join('\n');
  }
  function paintDownloads() { const b = $('#saveMd'); if (b) b.hidden = !Ext.downloads; }
  MOUNT.notebook = (root) => {
    $$('[data-nbtab]', root).forEach((b) => b.addEventListener('click', () => { S.nbTab = b.dataset.nbtab; writeLocal(); render({ noScroll: true }); }));
    const s = $('#nbSearch', root);
    s.addEventListener('input', debounce(() => { nbQuery = s.value; render({ noScroll: true }); const n = $('#nbSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250));
    $$('[data-del]', root).forEach((b) => b.addEventListener('click', () => { const [k, id] = b.dataset.del.split(':'); removeItem(k, id); toast(t('removed')); render({ keepScroll: true }); }));
    $$('[data-open-hl]', root).forEach((b) => b.addEventListener('click', () => { const h = S.hl.find((x) => x.id === b.dataset.openHl); if (h) openAt(h.lesson, { hl: h.id, b: h.b }); }));
    $$('[data-edit-hl]', root).forEach((b) => b.addEventListener('click', () => openHlSheet(b.dataset.editHl)));
    $$('[data-open-b]', root).forEach((b) => b.addEventListener('click', () => { const [lid, bi] = b.dataset.openB.split(':'); openAt(lid, { b: +bi }); }));
    const np = $('#newPage', root);
    if (np) np.addEventListener('click', () => { S.journal.push({ id: uid('p'), title: '', body: '', at: Date.now() }); persist(); render({ noScroll: true }); const f = $('[data-pt]'); if (f) f.focus(); });
    const savePage = debounce((id) => {
      const p = S.journal.find((x) => x.id === id); if (!p) return;
      p.title = $(`[data-pt="${id}"]`).value; p.body = $(`[data-pb="${id}"]`).value; p.at = Date.now(); persist();
    }, 600);
    $$('[data-pt],[data-pb]', root).forEach((el) => el.addEventListener('input', () => savePage(el.dataset.pt || el.dataset.pb)));
    $('#copyAll', root).addEventListener('click', async () => { const ok = await copyText(notebookMarkdown()); toast(ok ? t('copied') : t('copyFailed')); });
    paintDownloads();
    $('#saveMd', root).addEventListener('click', async () => {
      if (!Ext.downloads) return;
      try { await Ext.downloads.save({ filename: 'claude-trainer-notebook.md', data: notebookMarkdown() }); toast(t('fileSaved')); }
      catch (e) { if (e && e.code !== 'declined') toast(t('fileFailed')); }
    });
  };

  /* --------------------------------------------------------- EXAM & QUIZ */
  let examView = 'menu'; let lastResult = null; let tick = null; let resumedAt = 0;
  const DOMS = CT.domains || [];
  function lessonsFor(d) { return LESSONS.filter((l) => (l.domains || []).indexOf(d) >= 0); }
  function startRun(cfg) {
    S.draft = { mode: cfg.mode, title: cfg.title, qids: cfg.qids, ans: {}, flags: {}, checked: {}, cur: 0, elapsed: 0, timed: !!cfg.limit, limit: cfg.limit || 0, instant: !!cfg.instant, back: cfg.back || 'exam', started: Date.now() };
    persist(); examView = 'run';
    if (cur.view === 'exam') render(); else go('exam');
  }
  function pickExam(n) {
    // weight by domain like the real exam; design-line extras (mock: false) stay out of mocks
    const bank = (CT.exam || []).filter((q) => q.mock !== false);
    const pool = {}; DOMS.forEach((d) => { pool[d.id] = shuffle(bank.filter((q) => q.d === d.id)); });
    const want = {}; let sum = 0;
    DOMS.forEach((d) => { want[d.id] = Math.round(n * d.w / 100); sum += want[d.id]; });
    while (sum > n) { const k = DOMS.slice().sort((a, b) => want[b.id] - want[a.id])[0].id; want[k]--; sum--; }
    while (sum < n) { const k = DOMS.slice().sort((a, b) => b.w - a.w)[0].id; want[k]++; sum++; }
    let ids = [];
    DOMS.forEach((d) => { ids = ids.concat(pool[d.id].slice(0, want[d.id]).map((q) => q.id)); });
    if (ids.length < n) { const rest = shuffle(bank.map((q) => q.id).filter((id) => ids.indexOf(id) < 0)); ids = ids.concat(rest.slice(0, n - ids.length)); }
    return shuffle(ids);
  }
  // Start an exam mode from the Exam tab or from a lesson widget. An exam already in progress is resumed instead.
  function startMode(m) {
    if (S.draft && S.draft.back === 'exam' && (m === 'full' || m === 'quick')) { examView = 'run'; go('exam'); toast(t('resumingExam')); return; }
    if (m === 'full') startRun({ mode: 'full', title: t('modeFull'), qids: pickExam(60), limit: 120 * 60000 });
    if (m === 'quick') startRun({ mode: 'quick', title: t('modeQuick'), qids: pickExam(20) });
    if (m === 'missed') { const ids = shuffle(Object.keys(S.missed).filter((id) => QBY[id])); if (ids.length) startRun({ mode: 'missed', title: t('modeMissed'), qids: ids, instant: true }); }
  }
  function elapsedMs() { const d = S.draft; if (!d) return 0; return d.elapsed + (resumedAt ? Date.now() - resumedAt : 0); }
  function leaveExam() {
    if (tick) { clearInterval(tick); tick = null; }
    if (S.draft && resumedAt) { S.draft.elapsed += Date.now() - resumedAt; resumedAt = 0; persist({ quiet: true }); }
  }
  function fmtClock(ms) { const s = Math.max(0, Math.round(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); }

  function examTop(d, answered) {
    return `<div class="exam-top">
        <div class="spread"><b>${esc(d.title)}</b><span class="row">${d.timed ? `<span class="chip">${icon('clock').replace('<svg', '<svg style="width:14px;height:14px"')}<span class="timer" id="timer">${fmtClock(d.limit - elapsedMs())}</span></span>` : ''}<span class="chip tnum">${answered}/${d.qids.length}</span></span></div>
        ${d.review ? '' : `<div class="bar"><i style="width:${(d.cur + 1) / d.qids.length * 100}%"></i></div>`}
      </div>`;
  }
  // Exam-style review screen: every question with its status, before you submit.
  function reviewHTML(d) {
    const answered = d.qids.filter((id) => (d.ans[id] || []).length).length;
    const flagged = d.qids.filter((id) => d.flags[id]).length;
    return `<div class="view" style="${lineVars('lx')}">
      ${examTop(d, answered)}
      <section class="card" style="display:grid;gap:12px">
        <h2 style="font-size:1.3rem">${esc(t('reviewTitle'))}</h2>
        <p class="muted">${esc(t('reviewIntro'))}</p>
        <div class="rev-legend"><span><i style="background:var(--accent-soft);border-color:var(--accent)"></i>${esc(t('statusAnswered'))} · <b class="tnum">${answered}</b></span><span><i style="border-style:dashed;border-color:var(--bad)"></i>${esc(t('statusUnanswered'))} · <b class="tnum">${d.qids.length - answered}</b></span><span><i style="background:var(--lx);border-color:var(--lx);border-radius:50%"></i>${esc(t('statusFlagged'))} · <b class="tnum">${flagged}</b></span></div>
        <div class="rev-grid">${d.qids.map((id, k) => `<button type="button" data-goto="${k}" class="${(d.ans[id] || []).length ? 'ans' : 'una'}${d.flags[id] ? ' flag' : ''}" aria-label="${esc(t('questionN', { n: k + 1, of: d.qids.length }))}${d.flags[id] ? ' · ' + esc(t('statusFlagged')) : ''}">${k + 1}</button>`).join('')}</div>
      </section>
      <div class="spread"><button type="button" class="btn" id="revBack">${icon('back', 'flip')}${esc(t('backToQuestions'))}</button><button type="button" class="btn primary" id="revSubmit">${esc(t('submitExam'))}</button></div>
      <div id="finishConfirm"></div>
      <button type="button" class="btn ghost small" id="qQuit" style="justify-self:start">${esc(t('saveAndExit'))}</button>
    </div>`;
  }
  function runHTML() {
    const d = S.draft; const q = QBY[d.qids[d.cur]];
    if (!q) { S.draft = null; return menuHTML(); }
    if (d.review && !d.instant) return reviewHTML(d);
    const answered = d.qids.filter((id) => (d.ans[id] || []).length).length;
    const isLast = d.cur === d.qids.length - 1;
    return `<div class="view" style="${lineVars('lx')}">
      ${examTop(d, answered)}
      ${qHTML(q, { label: t('questionN', { n: d.cur + 1, of: d.qids.length }), sel: d.ans[q.id] || [], noCheck: !d.instant, hideDomain: !d.instant && d.mode === 'full' })}
      <div class="spread">
        <button type="button" class="btn" id="qPrev"${d.cur === 0 ? ' disabled' : ''}>${icon('back', 'flip')}${esc(t('previous'))}</button>
        <button type="button" class="btn ghost" id="qFlag" aria-pressed="${!!d.flags[q.id]}" style="${d.flags[q.id] ? 'color:var(--lx)' : ''}">${icon('flag')}${esc(d.flags[q.id] ? t('flagged') : t('flag'))}</button>
        ${isLast ? `<button type="button" class="btn primary" id="qFinish">${esc(t('finish'))}</button>` : `<button type="button" class="btn primary" id="qNext">${esc(t('next'))}${icon('next', 'flip')}</button>`}
      </div>
      <details class="card"><summary style="cursor:pointer;font-weight:600">${esc(t('allQuestions'))}</summary><div class="qdots" style="margin-top:12px">${d.qids.map((id, k) => `<button type="button" data-goto="${k}" class="${(d.ans[id] || []).length ? 'ans ' : ''}${d.flags[id] ? 'flag ' : ''}${k === d.cur ? 'cur' : ''}" aria-label="${esc(t('questionN', { n: k + 1, of: d.qids.length }))}">${k + 1}</button>`).join('')}</div></details>
      <div id="finishConfirm"></div>
      <div class="row">${d.instant ? '' : `<button type="button" class="btn small" id="qReview">${icon('list')}${esc(t('reviewTitle'))}</button>`}<button type="button" class="btn ghost small" id="qQuit">${esc(t('saveAndExit'))}</button></div>
    </div>`;
  }
  function confirmSubmit(root, d) {
    const left = d.qids.filter((id) => !(d.ans[id] || []).length).length;
    const box = $('#finishConfirm', root);
    box.innerHTML = `<div class="card" style="display:grid;gap:10px;border-color:var(--lx)"><b>${esc(left ? t('unansweredWarn', { n: left }) : t('readyToSubmit'))}</b><div class="row"><button type="button" class="btn" id="fcBack">${esc(t('keepWorking'))}</button><button type="button" class="btn primary" id="fcGo">${esc(t('submit'))}</button></div></div>`;
    $('#fcBack', root).addEventListener('click', () => { box.innerHTML = ''; });
    $('#fcGo', root).addEventListener('click', finishRun);
    box.scrollIntoView({ block: 'center' });
  }
  function startTick(d) {
    if (!resumedAt) resumedAt = Date.now();
    if (tick) clearInterval(tick);
    tick = setInterval(() => {
      if (!S.draft) { clearInterval(tick); return; }
      if (d.timed) {
        const left = d.limit - elapsedMs();
        const tm = $('#timer'); if (tm) tm.textContent = fmtClock(left);
        if (left <= 0) { clearInterval(tick); toast(t('timeUp')); finishRun(); }
      }
    }, 1000);
  }
  function mountRun(root) {
    const d = S.draft;
    if (d.review && !d.instant) {
      startTick(d);
      $$('[data-goto]', root).forEach((b) => b.addEventListener('click', () => { d.review = false; d.cur = +b.dataset.goto; persist({ quiet: true }); render({ noScroll: true }); window.scrollTo(0, 0); }));
      $('#revBack', root).addEventListener('click', () => { d.review = false; persist({ quiet: true }); render({ noScroll: true }); window.scrollTo(0, 0); });
      $('#revSubmit', root).addEventListener('click', () => confirmSubmit(root, d));
      $('#qQuit', root).addEventListener('click', () => { leaveExam(); examView = 'menu'; render(); });
      return;
    }
    const q = QBY[d.qids[d.cur]]; const el = $('.quiz', root);
    wireOptions(el, q, (sel) => { d.ans[q.id] = sel; persist({ quiet: true }); });
    if (d.instant) {
      if (d.checked[q.id]) revealQ(el, q, d.ans[q.id] || []);
      const chk = $('[data-qcheck]', el);
      if (chk) chk.addEventListener('click', () => {
        const sel = selectedOf(el); if (!sel.length) { toast(t('pickAnswer')); return; }
        d.ans[q.id] = sel; d.checked[q.id] = true; revealQ(el, q, sel); persist({ quiet: true });
      });
    }
    const goQ = (k) => { d.cur = clamp(k, 0, d.qids.length - 1); persist({ quiet: true }); render({ noScroll: true }); window.scrollTo(0, 0); };
    $('#qPrev', root).addEventListener('click', () => goQ(d.cur - 1));
    const n = $('#qNext', root); if (n) n.addEventListener('click', () => goQ(d.cur + 1));
    $$('[data-goto]', root).forEach((b) => b.addEventListener('click', () => goQ(+b.dataset.goto)));
    $('#qFlag', root).addEventListener('click', () => { d.flags[q.id] = !d.flags[q.id]; persist({ quiet: true }); render({ noScroll: true }); });
    $('#qQuit', root).addEventListener('click', () => { leaveExam(); examView = 'menu'; const back = d.back; if (back && back !== 'exam') go(back); else render(); });
    const toReview = () => { d.review = true; persist({ quiet: true }); render({ noScroll: true }); window.scrollTo(0, 0); };
    const rv = $('#qReview', root); if (rv) rv.addEventListener('click', toReview);
    const f = $('#qFinish', root);
    if (f) f.addEventListener('click', () => { if (d.instant) confirmSubmit(root, d); else toReview(); });
    startTick(d);
  }
  function finishRun() {
    const d = S.draft; if (!d) return;
    leaveExam();
    const by = {}; let ok = 0;
    const review = d.qids.map((id) => {
      const q = QBY[id]; const sel = d.ans[id] || []; const good = sameSet(sel, q.a);
      if (good) ok++;
      const k = q.d || 'x'; by[k] = by[k] || [0, 0]; by[k][1]++; if (good) by[k][0]++;
      if (good) delete S.missed[id]; else S.missed[id] = Date.now();
      return { id, sel, good };
    });
    const pct = Math.round(ok / d.qids.length * 100);
    const res = { at: Date.now(), mode: d.mode, title: d.title, ok, of: d.qids.length, pct, by, ms: d.elapsed };
    if (d.modId) S.quiz[d.modId + '-quiz'] = { ok, of: d.qids.length };
    S.exams.push(res); if (S.exams.length > 50) S.exams = S.exams.slice(-50);
    lastResult = { res, review, back: d.back };
    S.draft = null; persist();
    examView = 'result';
    if (d.back && d.back !== 'exam') { cur = parseHash(); render(); }
    else if (cur.view !== 'exam') go('exam'); else render();
  }
  function verdict(pct) { return pct >= 80 ? t('verdictReady') : pct >= 65 ? t('verdictClose') : t('verdictStudy'); }
  function resultHTML() {
    const { res, review } = lastResult;
    return `<div class="view" style="${lineVars('lx')}">
      <section class="card" style="display:grid;gap:12px;text-align:center;justify-items:center">
        <span class="eyebrow">${esc(res.title)}</span>
        <div class="score-big tnum">${res.pct}%</div>
        <p class="tnum">${esc(t('scoreLine', { ok: res.ok, of: res.of }))}${res.ms ? ' · ' + fmtClock(res.ms) : ''}</p>
        <p style="max-width:52ch">${md(verdict(res.pct))}</p>
      </section>
      <section class="card weights"><b>${esc(t('byDomain'))}</b>${DOMS.filter((d) => res.by[d.id]).map((d) => { const [a, b] = res.by[d.id]; const p = Math.round(a / b * 100); return `<div class="dom-row"><span>${esc(t('domainShort', { n: d.id.slice(1) }))} · ${esc(tx(d))}</span><span class="tnum">${a}/${b}</span><div class="bar" style="--c:${p >= 80 ? 'var(--good)' : p >= 60 ? 'var(--warn)' : 'var(--bad)'}"><i style="width:${p}%"></i></div></div>`; }).join('')}</section>
      <div class="row"><button type="button" class="btn primary" id="rAgain">${icon('reset')}${esc(t('tryAgain'))}</button><button type="button" class="btn" id="rMenu">${esc(lastResult.back && lastResult.back !== 'exam' ? t('backToLine') : t('backToExams'))}</button></div>
      <h2>${esc(t('review'))}</h2>
      ${review.map((r, k) => { const q = QBY[r.id]; const c = q[L] || q.en; return `<details class="card" ${r.good ? '' : 'open'}><summary style="cursor:pointer;display:flex;gap:10px;align-items:start"><span style="color:${r.good ? 'var(--good)' : 'var(--bad)'}">${icon(r.good ? 'check' : 'x').replace('<svg', '<svg style="width:20px;height:20px"')}</span><span><b>${k + 1}.</b> ${md(c.q)}</span></summary><div style="display:grid;gap:8px;margin-top:10px">${c.o.map((o, j) => `<div class="opt ${q.a.indexOf(j) >= 0 ? 'right' : (r.sel.indexOf(j) >= 0 ? 'wrong' : '')}" style="cursor:default"><span class="box">${'ABCDEFGH'[j]}</span><span>${md(o)}</span></div>`).join('')}<div class="feedback ${r.good ? 'ok' : 'no'}"><b>${esc(t('why'))}</b><div>${md(c.why)}</div></div>${q.d && DOM[q.d] ? `<span class="muted" style="font-size:.85rem">${esc(t('domainShort', { n: q.d.slice(1) }))} · ${esc(tx(DOM[q.d]))}</span>` : ''}</div></details>`; }).join('')}
    </div>`;
  }
  function menuHTML() {
    const d = S.draft;
    const missed = Object.keys(S.missed).filter((id) => QBY[id] && (CT.exam || []).indexOf(QBY[id]) >= 0);
    const hist = S.exams.slice().reverse().slice(0, 8);
    return `<div class="view" style="${lineVars('lx')}">
      <section class="hero"><span class="eyebrow">${esc(t('terminus'))}</span><h1>${esc(t('examTitle'))}</h1><p>${md(t('examIntro'))}</p></section>
      ${d ? `<div class="card continue" style="${lineVars('lx')}"><span class="eyebrow">${esc(t('inProgress'))}</span><h3>${esc(d.title)}</h3><p class="muted tnum">${esc(t('answeredOf', { n: d.qids.filter((id) => (d.ans[id] || []).length).length, of: d.qids.length }))}</p><div class="row"><button type="button" class="btn primary" id="resumeRun">${icon('play')}${esc(t('resume'))}</button><button type="button" class="btn ghost" id="dropRun">${esc(t('discard'))}</button></div></div>` : ''}
      <div class="modes">
        <button type="button" class="mode" data-mode="full">${icon('exam')}<h3>${esc(t('modeFull'))}</h3><p>${esc(t('modeFullD'))}</p></button>
        <button type="button" class="mode" data-mode="quick">${icon('clock')}<h3>${esc(t('modeQuick'))}</h3><p>${esc(t('modeQuickD'))}</p></button>
        <button type="button" class="mode" data-mode="missed"${missed.length ? '' : ' disabled style="opacity:.55"'}>${icon('reset')}<h3>${esc(t('modeMissed'))}</h3><p>${esc(missed.length ? t('modeMissedD', { n: missed.length }) : t('modeMissedNone'))}</p></button>
      </div>
      <section class="card weights"><div class="spread"><b>${esc(t('domainsTitle'))}</b><span class="muted" style="font-size:.85rem">${esc(t('practiceDomain'))}</span></div>
        ${DOMS.map((dm) => `<div class="dom-row"><button type="button" class="btn ghost small" data-dom="${dm.id}" style="justify-self:start;padding-inline:0;text-align:start">${esc(t('domainShort', { n: dm.id.slice(1) }))} · ${esc(tx(dm))}</button><span class="tnum muted">${dm.w}%</span><div class="bar"><i style="width:${dm.w * 4}%"></i></div><span class="muted" style="grid-column:1/-1;font-size:.84rem">${esc(t('coveredIn'))} ${lessonsFor(dm.id).slice(0, 4).map((l) => `<a href="#${l.id}">${esc(l.mod.n + '.' + (l.idx + 1))}</a>`).join(', ') || '—'}</span></div>`).join('')}
        <p class="w-note">${md(t('weightsNote'))}</p>
      </section>
      <section class="card" style="display:grid;gap:10px"><b>${esc(t('realExam'))}</b><ul class="outcomes">${(CT.ui[L].realExamFacts || CT.ui.en.realExamFacts).map((x) => `<li>${md(x)}</li>`).join('')}</ul></section>
      ${hist.length ? `<section class="card" style="display:grid;gap:8px"><b>${esc(t('history'))}</b>${hist.map((h) => `<div class="spread" style="border-bottom:1px dashed var(--rule);padding-block:6px"><span>${esc(h.title)}<br><span class="muted" style="font-size:.82rem">${esc(fmtDate(h.at))}</span></span><b class="tnum">${h.pct}%</b></div>`).join('')}</section>` : ''}
    </div>`;
  }
  function viewExam() {
    if (S.draft && S.draft.back === 'exam' && examView === 'run') return runHTML();
    if (examView === 'result' && lastResult && (!lastResult.back || lastResult.back === 'exam')) return resultHTML();
    examView = 'menu';
    return menuHTML();
  }
  MOUNT.exam = (root) => {
    if (examView === 'run' && S.draft && S.draft.back === 'exam') return mountRun(root);
    if (examView === 'result' && lastResult && (!lastResult.back || lastResult.back === 'exam')) return mountResult(root);
    $$('[data-mode]', root).forEach((b) => b.addEventListener('click', () => startMode(b.dataset.mode)));
    $$('[data-dom]', root).forEach((b) => b.addEventListener('click', () => {
      const dm = DOM[b.dataset.dom];
      const ids = shuffle((CT.exam || []).filter((q) => q.d === dm.id).map((q) => q.id));
      if (ids.length) startRun({ mode: 'domain', title: t('domainShort', { n: dm.id.slice(1) }) + ' · ' + tx(dm), qids: ids, instant: true });
    }));
    const r = $('#resumeRun', root); if (r) r.addEventListener('click', () => { const d = S.draft; examView = 'run'; if (d.back && d.back !== 'exam') go(d.back); else render(); });
    const x = $('#dropRun', root); if (x) x.addEventListener('click', () => { S.draft = null; persist(); render({ keepScroll: true }); });
  };
  function mountResult(root) {
    $('#rAgain', root).addEventListener('click', () => {
      const r = lastResult.res; const back = lastResult.back;
      if (back && back !== 'exam' && MBY[back.slice(0, 2)]) { startModuleQuiz(MBY[back.slice(0, 2)]); return; }
      if (r.mode === 'full' || r.mode === 'quick') startMode(r.mode);
      else startRun({ mode: r.mode, title: r.title, qids: lastResult.review.map((x) => x.id), instant: true });
    });
    $('#rMenu', root).addEventListener('click', () => { examView = 'menu'; lastResult = null; render(); });
  }
  // module quiz shares the runner, with instant feedback
  function startModuleQuiz(m) {
    const ids = shuffle((CT.exam || []).filter((q) => q.m === m.id).map((q) => q.id));
    S.draft = { mode: 'module', modId: m.id, title: t('lineQuizTitle', { n: m.n }), qids: ids, ans: {}, flags: {}, checked: {}, cur: 0, elapsed: 0, timed: false, limit: 0, instant: true, back: m.id + '-quiz', started: Date.now() };
    persist(); examView = 'run'; render();
  }
  function viewModuleQuiz(m) {
    if (S.draft && S.draft.back === m.id + '-quiz' && examView === 'run') return runHTML();
    if (examView === 'result' && lastResult && lastResult.back === m.id + '-quiz') return resultHTML();
    const qs = (CT.exam || []).filter((q) => q.m === m.id);
    const last = S.quiz[m.id + '-quiz'];
    const nxt = MODS[MODS.indexOf(m) + 1];
    const draftHere = S.draft && S.draft.back === m.id + '-quiz';
    return `<div class="view" style="${lineVars(m.line)}">
      <section class="mod-hero"><div class="row"><span class="linebadge">${m.n}</span><span class="eyebrow">${esc(t('lineQuiz'))}</span></div><h1>${esc(t('lineQuizTitle', { n: m.n }))}</h1><p class="lead">${esc(t('lineQuizIntro', { n: qs.length }))}</p>
      ${last ? `<p><b class="tnum">${esc(t('lastScore', { pct: Math.round(last.ok / last.of * 100) }))}</b></p>` : ''}
      <div class="row"><button type="button" class="btn primary" id="mqStart">${icon('play')}${esc(draftHere ? t('resume') : t('startQuiz'))}</button></div></section>
      <div class="pager">${`<a href="#${m.id}"><span>${esc(t('backToLine'))}</span><b>${esc(tx(m.title))}</b></a>`}${nxt ? `<a class="next" href="#${nxt.id}"><span>${esc(t('nextLine'))}</span><b>${esc(tx(nxt.title))}</b></a>` : `<a class="next" href="#exam"><span>${esc(t('terminus'))}</span><b>${esc(t('examStation'))}</b></a>`}</div>
    </div>`;
  }
  MOUNT.mquiz = (root) => {
    const m = MBY[cur.arg];
    if (examView === 'run' && S.draft && S.draft.back === m.id + '-quiz') return mountRun(root);
    if (examView === 'result' && lastResult && lastResult.back === m.id + '-quiz') return mountResult(root);
    $('#mqStart', root).addEventListener('click', () => {
      if (S.draft && S.draft.back === m.id + '-quiz') { examView = 'run'; render(); return; }
      startModuleQuiz(m);
    });
  };

  /* ------------------------------------------------------------ GLOSSARY */
  let glQuery = '';
  function viewGlossary() {
    const q = glQuery.toLowerCase();
    const items = (CT.glossary || []).slice().sort((a, b) => a.term.localeCompare(b.term))
      .filter((g) => !q || [g.term, g.heTerm, g.en, g.he].some((x) => String(x || '').toLowerCase().indexOf(q) >= 0));
    return `<div class="view">
      <section class="hero"><span class="eyebrow">${esc(t('tabGlossary'))}</span><h1>${esc(t('glTitle'))}</h1><p>${md(t('glIntro'))}</p></section>
      <label class="sr" for="glSearch">${esc(t('search'))}</label>
      <input type="search" id="glSearch" placeholder="${esc(t('searchGlossary'))}" value="${esc(glQuery)}">
      <div class="gl-list">${items.map((g) => `<div class="gl-item"><h3><span dir="ltr">${esc(g.term)}</span>${L === 'he' && g.heTerm ? `<small>${esc(g.heTerm)}</small>` : ''}</h3><p>${md(L === 'he' ? (g.he || g.en) : g.en)}</p></div>`).join('') || `<div class="empty"><p>${esc(t('noMatches'))}</p></div>`}</div>
    </div>`;
  }
  MOUNT.glossary = (root) => {
    const s = $('#glSearch', root);
    s.addEventListener('input', debounce(() => { glQuery = s.value; render({ noScroll: true }); const n = $('#glSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200));
  };

  /* --------------------------------------------------------------- PREFS */
  function syncLabel() {
    if (Cloud.state === 'cloud') return `<span class="status-dot on"></span>${esc(t('syncCloud'))}`;
    if (Cloud.state === 'full') return `<span class="status-dot"></span>${esc(t('syncFull'))}`;
    return `<span class="status-dot"></span>${esc(t('syncLocal'))}`;
  }
  function refreshSyncStatus() { const el = $('#syncStatus'); if (el) el.innerHTML = syncLabel(); }
  function encodeBackup() { const json = JSON.stringify(Object.assign({}, S, { draft: null })); return 'CT1.' + btoa(unescape(encodeURIComponent(json))); }
  function decodeBackup(code) {
    const c = String(code || '').trim().replace(/^CT1\./, '');
    const obj = JSON.parse(decodeURIComponent(escape(atob(c))));
    if (!obj || typeof obj !== 'object' || !obj.done) throw new Error('bad');
    return obj;
  }

  /* ------------------------------------------------------- named backups */
  // Saved in the learner's private space in the artifact database when signed in on claude.ai,
  // otherwise in this browser. Any backup can also be downloaded as a .json file (to keep in Git).
  const BK_LOCAL = 'claude-trainer.backups.v1';
  const Backups = {
    list: [], loaded: false, loading: false, where: 'local',
    col() { return Cloud.on && Cloud.ref ? Cloud.ref.collection('backups') : null; },
    snapshot() {
      const st = JSON.parse(JSON.stringify(Object.assign({}, S, { draft: null })));
      if (JSON.stringify(st).length > 200000) st.journal = (st.journal || []).slice(-40);
      return st;
    },
    readLocal() { try { const a = JSON.parse(localStorage.getItem(BK_LOCAL) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } },
    writeLocal(list) { try { localStorage.setItem(BK_LOCAL, JSON.stringify(list)); return true; } catch (e) { return false; } },
    async load() {
      this.loading = true;
      const col = this.col();
      if (col) {
        try {
          const snap = await timeout(col.orderBy('at', 'desc').limit(30).get(), 10000);
          this.list = snap.docs.map((d) => Object.assign({}, d.data(), { id: d.id }));
          this.where = 'cloud';
        } catch (e) { this.list = this.readLocal(); this.where = 'local'; }
      } else { this.list = this.readLocal(); this.where = 'local'; }
      this.loading = false; this.loaded = true;
    },
    async save(name) {
      const item = { name, at: Date.now(), lessons: Object.keys(S.done || {}).length, state: this.snapshot() };
      const col = this.col();
      if (col) { const ref = col.doc(); await ref.set(item); this.list.unshift(Object.assign({}, item, { id: ref.id })); this.where = 'cloud'; return; }
      const list = this.readLocal();
      list.unshift(Object.assign({ id: uid() }, item));
      if (!this.writeLocal(list.slice(0, 10))) throw { code: 'local_full' };
      this.list = list.slice(0, 10); this.where = 'local';
    },
    async remove(id) {
      if (this.where === 'cloud' && this.col()) await this.col().doc(id).delete();
      else this.writeLocal(this.readLocal().filter((x) => x.id !== id));
      this.list = this.list.filter((x) => x.id !== id);
    },
    fileOf(item) {
      const d = new Date(item.at); const pad = (n) => String(n).padStart(2, '0');
      const day = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      const slug = String(item.name || '').toLowerCase().replace(/[^a-z0-9֐-׿]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'backup';
      return { filename: `claude-trainer-${day}-${slug}.json`, data: JSON.stringify({ app: 'claude-trainer', kind: 'backup', v: 1, name: item.name, at: item.at, state: item.state }, null, 2) };
    }
  };
  async function saveFile(filename, data, type) {
    if (Ext.downloads) { await Ext.downloads.save({ filename, data }); return true; }
    if (hasClaude()) return false;
    const url = URL.createObjectURL(new Blob([data], { type: type || 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  }
  const canDownload = () => !!Ext.downloads || !hasClaude();
  function readBackupText(text) {
    const s = String(text || '').trim();
    if (s.startsWith('{')) {
      const j = JSON.parse(s);
      const st = j && j.kind === 'backup' && j.state ? j.state : j;
      if (!st || typeof st !== 'object' || !st.done) throw new Error('bad');
      return st;
    }
    return decodeBackup(s);
  }
  function askRestore(obj, box) {
    box.innerHTML = `<div class="card" style="display:grid;gap:10px;border-color:var(--warn)"><b>${esc(t('restoreConfirm', { n: Object.keys(obj.done || {}).length }))}</b><div class="row"><button type="button" class="btn" data-rs="merge">${esc(t('restoreMerge'))}</button><button type="button" class="btn primary" data-rs="replace">${esc(t('restoreReplace'))}</button><button type="button" class="btn ghost" data-rs="cancel">${esc(t('cancel'))}</button></div></div>`;
    box.querySelector('[data-rs="merge"]').addEventListener('click', () => { S = mergeStates(S, Object.assign({}, obj, { updatedAt: 0 })); persist(); toast(t('restored')); render(); });
    box.querySelector('[data-rs="replace"]').addEventListener('click', () => { const theme = S.theme; S = Object.assign(defaults(), obj); if (!S.theme) S.theme = theme; persist(); toast(t('restored')); setLang(S.lang || L); });
    box.querySelector('[data-rs="cancel"]').addEventListener('click', () => { box.innerHTML = ''; });
    box.scrollIntoView({ block: 'nearest' });
  }
  function backupListHTML() {
    if (!Backups.loaded) return `<p class="muted" style="font-size:.92rem">${esc(t('bkLoading'))}</p>`;
    if (!Backups.list.length) return `<p class="muted" style="font-size:.92rem">${esc(t('bkNone'))}</p>`;
    return `<ul class="bk-list">${Backups.list.map((b) => `<li data-bk="${esc(b.id)}"><div class="bk-meta"><b>${esc(b.name || t('bkDefaultName', { date: fmtDate(b.at) }))}</b><span class="muted tnum">${esc(fmtDate(b.at))} · ${esc(t('bkLessons', { n: b.lessons || 0 }))}</span></div>
      <div class="row"><button type="button" class="btn small" data-bkact="restore">${icon('upload')}${esc(t('bkRestore'))}</button>${canDownload() ? `<button type="button" class="btn small" data-bkact="file">${icon('download')}${esc(t('bkFileShort'))}</button>` : ''}<button type="button" class="btn small ghost" data-bkact="delete" style="color:var(--bad)" aria-label="${esc(t('bkDelete'))}">${icon('trash')}</button></div><div class="bk-msg"></div></li>`).join('')}</ul>`;
  }
  function paintBackups(root) {
    const box = $('#bkList', root || document); if (!box) return;
    box.innerHTML = backupListHTML();
    const where = $('#bkWhere', root || document); if (where) where.textContent = t(Backups.where === 'cloud' ? 'bkWhereCloud' : 'bkWhereLocal');
    $$('[data-bkact]', box).forEach((btn) => btn.addEventListener('click', async () => {
      const li = btn.closest('[data-bk]'); const item = Backups.list.find((x) => x.id === li.dataset.bk); if (!item) return;
      const msg = $('.bk-msg', li);
      if (btn.dataset.bkact === 'restore') askRestore(item.state, msg);
      else if (btn.dataset.bkact === 'file') {
        const f = Backups.fileOf(item);
        try { if (await saveFile(f.filename, f.data)) toast(t('fileSaved')); } catch (e) { /* viewer declined */ }
      } else if (btn.dataset.bkact === 'delete') {
        msg.innerHTML = `<div class="row"><span>${esc(t('bkDeleteConfirm'))}</span><button type="button" class="btn small" data-no>${esc(t('cancel'))}</button><button type="button" class="btn small primary" data-yes style="background:var(--bad);border-color:var(--bad);color:var(--surface)">${esc(t('bkDelete'))}</button></div>`;
        $('[data-no]', msg).addEventListener('click', () => { msg.innerHTML = ''; });
        $('[data-yes]', msg).addEventListener('click', async () => {
          try { await Backups.remove(item.id); toast(t('bkDeleted')); } catch (e) { toast(t('bkSaveFailed')); }
          paintBackups(root);
        });
      }
    }));
  }
  function viewPrefs() {
    const sizes = [[0.9, 'A−'], [1, 'A'], [1.12, 'A+'], [1.25, 'A++']];
    return `<div class="view">
      <section class="hero"><span class="eyebrow">${esc(t('tabPrefs'))}</span><h1>${esc(t('prefsTitle'))}</h1></section>
      <section class="card" style="display:grid;gap:12px"><b>${esc(t('language'))}</b><p class="muted" style="font-size:.94rem">${esc(t('languageD'))}</p>
        <div class="toggles"><button type="button" data-setlang="en" aria-pressed="${L === 'en'}">English</button><button type="button" data-setlang="he" aria-pressed="${L === 'he'}" lang="he">עברית — פשוט וברור</button></div></section>
      <section class="card" style="display:grid;gap:12px"><b>${esc(t('textSize'))}</b>
        <div class="toggles">${sizes.map(([v, lab]) => `<button type="button" data-scale="${v}" aria-pressed="${Math.abs((S.scale || 1) - v) < 0.01}">${lab}</button>`).join('')}</div></section>
      <section class="card" style="display:grid;gap:12px"><b>${esc(t('theme'))}</b><p class="muted" style="font-size:.94rem">${esc(t('themeD'))}</p>
        <div class="toggles">${[['dark', 'themeDark'], ['light', 'themeLight'], ['auto', 'themeAuto']].map(([v, k]) => `<button type="button" data-theme-set="${v}" aria-pressed="${(S.theme || 'dark') === v}">${esc(t(k))}</button>`).join('')}</div></section>
      <section class="card" style="display:grid;gap:12px" id="bkCard"><b>${esc(t('bkSaveTitle'))}</b><p class="muted" style="font-size:.94rem">${esc(t('bkSaveD'))}</p>
        <label class="field" for="bkName">${esc(t('bkName'))}<input type="text" id="bkName" dir="auto" maxlength="60" autocomplete="off" placeholder="${esc(t('bkNamePh'))}"></label>
        <div class="row"><button type="button" class="btn primary" id="bkSave">${icon('check')}${esc(t('bkSave'))}</button>${canDownload() ? `<button type="button" class="btn" id="bkDownload">${icon('download')}${esc(t('bkDownload'))}</button>` : ''}</div>
        <p class="muted" style="font-size:.88rem" id="bkWhere">${esc(t(Backups.where === 'cloud' ? 'bkWhereCloud' : 'bkWhereLocal'))}</p>
        <div><b style="font-size:.95rem">${esc(t('bkListTitle'))}</b><div id="bkList">${backupListHTML()}</div></div></section>
      <section class="card" style="display:grid;gap:10px"><b>${esc(t('savingTitle'))}</b><p id="syncStatus">${syncLabel()}</p><p class="muted" style="font-size:.92rem">${esc(t('savingD'))}</p></section>
      <section class="card" style="display:grid;gap:12px"><b>${esc(t('backupTitle'))}</b><p class="muted" style="font-size:.94rem">${esc(t('backupD'))}</p>
        <div class="row"><button type="button" class="btn" id="bkCopy">${icon('copy')}${esc(t('backupCopy'))}</button></div>
        <label class="field" for="bkIn">${esc(t('restoreLabel'))}<textarea id="bkIn" dir="ltr" placeholder="CT1.…" style="font-family:var(--f-mono);font-size:.8rem;min-height:70px"></textarea></label>
        <div class="row"><button type="button" class="btn" id="bkRestore">${icon('upload')}${esc(t('restore'))}</button><label class="btn" for="bkFileIn">${icon('upload')}${esc(t('restoreFile'))}</label><input type="file" id="bkFileIn" accept=".json,application/json,.txt" class="sr"></div><div id="bkMsg"></div></section>
      <section class="card" style="display:grid;gap:12px"><b>${esc(t('tourAgain'))}</b><div class="row"><button type="button" class="btn" id="tourBtn">${icon('map')}${esc(t('showTour'))}</button><a class="btn" href="#finish">${icon('award')}${esc(t('seeCompletion'))}</a></div></section>
      <section class="card" style="display:grid;gap:12px;border-color:var(--bad)"><b>${esc(t('resetTitle'))}</b><p class="muted" style="font-size:.94rem">${esc(t('resetD'))}</p><div id="resetZone"><button type="button" class="btn" id="resetBtn" style="color:var(--bad)">${icon('trash')}${esc(t('resetBtn'))}</button></div></section>
      <section class="card" style="display:grid;gap:8px"><b>${esc(t('aboutTitle'))}</b>${(CT.ui[L].about || CT.ui.en.about).map((p) => `<p class="muted" style="font-size:.94rem">${md(p)}</p>`).join('')}</section>
    </div>`;
  }
  MOUNT.prefs = (root) => {
    $$('[data-setlang]', root).forEach((b) => b.addEventListener('click', () => setLang(b.dataset.setlang)));
    $$('[data-scale]', root).forEach((b) => b.addEventListener('click', () => { S.scale = +b.dataset.scale; persist(); render({ keepScroll: true }); }));
    $('#bkCopy', root).addEventListener('click', async () => { const ok = await copyText(encodeBackup()); toast(ok ? t('backupCopied') : t('copyFailed')); if (!ok) { $('#bkIn', root).value = encodeBackup(); $('#bkIn', root).select(); } });
    $('#bkRestore', root).addEventListener('click', () => {
      const msg = $('#bkMsg', root);
      try { askRestore(readBackupText($('#bkIn', root).value), msg); } catch (e) { msg.innerHTML = `<p style="color:var(--bad)">${esc(t('restoreBad'))}</p>`; }
    });
    $('#bkFileIn', root).addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0]; const msg = $('#bkMsg', root);
      if (!file) return;
      file.text().then((txt) => askRestore(readBackupText(txt), msg)).catch(() => { msg.innerHTML = `<p style="color:var(--bad)">${esc(t('restoreBad'))}</p>`; });
      ev.target.value = '';
    });
    $$('[data-theme-set]', root).forEach((btn) => btn.addEventListener('click', () => { S.theme = btn.dataset.themeSet; persist(); applyTheme(); render({ keepScroll: true }); }));
    const nameIn = $('#bkName', root);
    const bkName = () => (nameIn.value || '').trim() || t('bkDefaultName', { date: fmtDate(Date.now()) });
    $('#bkSave', root).addEventListener('click', async (ev) => {
      const btn = ev.currentTarget; btn.disabled = true;
      const name = bkName();
      try { await Backups.save(name); toast(t('bkSaved', { name })); nameIn.value = ''; }
      catch (e) { const c = e && e.code; toast(t(c === 'quota_exceeded' || c === 'local_full' ? 'bkFull' : 'bkSaveFailed')); }
      btn.disabled = false; paintBackups(root);
    });
    nameIn.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $('#bkSave', root).click(); } });
    const dl = $('#bkDownload', root);
    if (dl) dl.addEventListener('click', async () => {
      const file = Backups.fileOf({ name: bkName(), at: Date.now(), state: Backups.snapshot() });
      try { if (await saveFile(file.filename, file.data)) toast(t('fileSaved')); } catch (e) { /* viewer declined */ }
    });
    if (!Backups.loaded && !Backups.loading) Backups.load().then(() => paintBackups(root)); else paintBackups(root);
    $('#tourBtn', root).addEventListener('click', () => { S.seenTour = false; go('home'); });
    $('#resetBtn', root).addEventListener('click', () => {
      $('#resetZone', root).innerHTML = `<div class="row"><span>${esc(t('resetSure'))}</span><button type="button" class="btn" id="rsNo">${esc(t('cancel'))}</button><button type="button" class="btn primary" id="rsYes" style="background:var(--bad);border-color:var(--bad)">${esc(t('resetYes'))}</button></div>`;
      $('#rsNo', root).addEventListener('click', () => render({ keepScroll: true }));
      $('#rsYes', root).addEventListener('click', () => { const lang = S.lang, scale = S.scale, theme = S.theme; S = defaults(); S.lang = lang; S.scale = scale; S.theme = theme; S.seenTour = true; persist(); toast(t('resetDone')); go('home'); });
    });
  };

  /* -------------------------------------------------------------- FINISH */
  function viewFinish() {
    const all = LESSONS.length, done = doneCount(); const best = bestExam('full');
    const complete = done === all;
    return `<div class="view" style="${lineVars('lx')}">
      <section class="hero"><span class="eyebrow">${esc(t('terminus'))}</span><h1>${esc(t('finishTitle'))}</h1><p>${md(t('finishIntro'))}</p></section>
      ${complete ? `<label class="field" for="certName">${esc(t('yourName'))}<input type="text" id="certName" dir="auto" value="${esc(S.name || '')}" placeholder="${esc(t('yourNamePh'))}"></label>
      <div class="cert"><span class="eyebrow">${esc(t('certEyebrow'))}</span><h2>${esc(t('certTitle'))}</h2><div class="who" id="certWho">${esc(S.name || t('yourNamePh'))}</div><p>${esc(t('certBody', { n: all }))}</p>${best >= 0 ? `<p class="tnum"><b>${esc(t('bestMock', { pct: best }))}</b></p>` : ''}<p class="muted" style="font-size:.85rem">${esc(fmtDate(Math.max.apply(null, Object.values(S.done))))} · ${esc(t('certNote'))}</p></div>`
        : `<div class="card" style="display:grid;gap:10px"><b class="tnum">${esc(t('progressLine', { done, total: all }))}</b><div class="bar"><i style="width:${pctDone()}%"></i></div><p class="muted">${esc(t('finishRemaining'))}</p><ul class="outcomes">${LESSONS.filter((l) => !S.done[l.id]).slice(0, 6).map((l) => `<li><a href="#${l.id}">${esc(lessonLabel(l))} — ${esc(tx(l.title))}</a></li>`).join('')}</ul></div>`}
      <section class="card" style="display:grid;gap:10px"><b>${esc(t('nextSteps'))}</b><ul class="outcomes">${(CT.ui[L].nextStepsList || CT.ui.en.nextStepsList).map((x) => `<li>${md(x)}</li>`).join('')}</ul></section>
    </div>`;
  }
  MOUNT.finish = (root) => {
    const n = $('#certName', root);
    if (n) n.addEventListener('input', debounce(() => { S.name = n.value.trim(); persist(); $('#certWho').textContent = S.name || t('yourNamePh'); }, 300));
  };

  /* ----------------------------------------------------------- language */
  function setLang(l) {
    if (l !== 'en' && l !== 'he') return;
    L = l; S.lang = l; persist();
    stopTTS(); hideSelbar();
    render({ keepScroll: cur.view !== 'lesson' });
  }
  $$('.langswitch button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  $('#themeBtn').addEventListener('click', () => {
    S.theme = isDark() ? 'light' : 'dark'; persist(); applyTheme();
    if (cur.view === 'prefs') render({ keepScroll: true });
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('pagehide', () => { leaveExam(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } Cloud.flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } Cloud.flush(); } });

  /* ---------------------------------------------------------------- boot */
  loadLocal();
  L = S.lang || ((navigator.language || '').toLowerCase().indexOf('he') === 0 ? 'he' : 'en');
  if (S.draft) examView = 'run';
  cur = parseHash();
  render();
  Cloud.init();
  initExt();
  window.CTApp = { go, state: () => S, setLang };
})();
