/* Claude Trainer — shared helpers: escaping, inline markdown, icons, small utils.
   Loaded before widgets.js and app.js. Everything hangs off window.CTK. */
(function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* Cross-references: write [[m1-l7]] (a lesson) or [[m3]] (a line) in course text.
     The app supplies the current label ("1.7", "Line 4"), so numbers stay right when lessons move. */
  let refLabel = null;
  const setRef = (fn) => { refLabel = fn; };
  const refText = (id) => (refLabel && refLabel(id)) || id;

  /* Inline markdown for course text: **bold**, *italic*, `code`, [text](https://link), [[lesson-id]].
     Content is escaped first, so only these constructs become markup. */
  function md(s) {
    if (s == null) return '';
    const codes = [];
    let out = esc(s).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    out = out
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
      .replace(/\[\[(m\d+(?:-l\d+)?)\]\]/g, (m, id) => '<a href="#' + id + '">' + esc(refText(id)) + '</a>')
      .replace(/\[([^\]]+)\]\((#[\w-]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    return out.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code dir="ltr">' + codes[+i] + '</code>');
  }

  const P = {
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/><path d="M9 8h5"/>',
    exam: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/>',
    glossary: '<path d="M3.5 19 8 5h1.2l4.5 14M5.2 14.2h7.2"/><path d="M15 9h5.5L15 16h5.5"/>',
    prefs: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    next: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    bookmark: '<path d="M6 3h12v18l-6-4.2L6 21z"/>',
    bookmarkOn: '<path d="M6 3h12v18l-6-4.2L6 21z" fill="currentColor"/>',
    marker: '<path d="m14.5 4.5 5 5L11 18l-5-5z"/><path d="M6 13 3.5 19.5 10 18"/><path d="M13 21h8"/>',
    note: '<path d="M4 5h16v11H9.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
    starOn: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="currentColor"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    analogy: '<circle cx="8.5" cy="12" r="5"/><circle cx="15.5" cy="12" r="5"/>',
    simple: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    try: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.2-2.3L3.5 15a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    chat: '<path d="M5 5h14v10h-8l-6 4.5z"/><path d="M9 9.5h6M9 12h3"/>',
    flag: '<path d="M5 21V4h11l-2.2 4L16 12H5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    download: '<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5m-5 5 5-5 5 5M5 20h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    loop: '<path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9c0 5-6 4-11.5 8.5"/>',
    rocket: '<path d="M5 15c-1.2 1.2-2 4-2 6 2 0 4.8-.8 6-2"/><path d="M9 15 6 12c1.5-4.5 5.5-9 13-9 0 7.5-4.5 11.5-9 13z"/><circle cx="14.5" cy="9.5" r="1.6"/>',
    cube: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16.5 6.5l3 3M14 9l2 2"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7"/><path d="M4 4v4.7h4.7"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.5-1.6 7.5 5-2.8 5 2.8-1.6-7.5"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.6A3.7 3.7 0 0 1 17.5 18z"/>',
    device: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    dollar: '<path d="M12 3v18M16.5 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H7.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    sort: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
    folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
    wand: '<path d="m4 20 11-11M13 7l2-2 2 2-2 2zM18 3v2M21 6h-2M18 9v2M15 3h0"/>',
    gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>'
  };
  function icon(name, cls) {
    const p = P[name] || P.spark;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + p + '</svg>';
  }

  const uid = (p) => (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const debounce = (fn, ms) => { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand && document.execCommand('copy');
        ta.remove(); return !!ok;
      } catch (e2) { return false; }
    }
  }

  window.CTK = { esc, md, icon, uid, debounce, clamp, shuffle, copyText, setRef, refText };
})();
