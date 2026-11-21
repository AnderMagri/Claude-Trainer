/* Claude Trainer — interactive widgets and simulators.
   W.html(block, ctx) returns markup; W.mount(el, block, ctx) wires it up.
   Widgets: terminal (shell, git, npm, vercel, claude code, curl), nextword, tokenizer,
   promptbuilder, chat, mcpbuilder, agentloop, apibuilder, costcalc, spotcheck, sorter. */
(function () {
  'use strict';
  const K = window.CTK;
  const { esc, md, icon } = K;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));

  /* Widget UI strings (EN / HE). Hebrew is kept short and plain on purpose. */
  const WS = {
    en: {
      terminal: 'Practice terminal (simulated)', mission: 'Your mission', tapHint: 'Tap a command to put it in the box, then press Run.',
      run: 'Run', reset: 'Reset', missionDone: 'Mission complete! You did it.', typeHere: 'type a command…', safe: 'This is a safe simulation. Nothing on your computer changes.',
      nextword: 'Next-word predictor', temp: 'Randomness (temperature)', predictable: 'predictable', creative: 'creative', generate: 'Let the model pick', another: 'New sentence', picks: 'Picks so far',
      tlow: 'Low randomness: the model almost always picks the most likely word. Good for facts and code.', thigh: 'High randomness: less likely words get a real chance. More variety, more risk of nonsense.', tmid: 'Medium randomness: usually the top word, sometimes a surprise.',
      tokenizer: 'Token counter', yourText: 'Type or paste any text', chars: 'characters', words: 'words', tokens: 'tokens (approx.)', ofWindow: 'of a 1M-token context window', tokNote: 'This is an estimate for learning. Real tokenizers split text a little differently. Hebrew and other non-English text usually needs more tokens per word.',
      promptbuilder: 'Prompt builder', ingredients: 'Add ingredients to the prompt', yourPrompt: 'Your prompt', quality: 'Prompt strength', copy: 'Copy', openClaude: 'Open in Claude', askHere: 'Ask Claude here', missing: 'Try adding', allIn: 'All ingredients in. This is a strong prompt.',
      chat: 'Practice with Claude', send: 'Send', thinking: 'Claude is thinking…', liveOff: 'Live answers work when this page is opened inside Claude (claude.ai). Here is a sample answer, and a button to try it in Claude.', liveOn: 'Live: answers come from Claude, using your own Claude account.', placeholder: 'Write your message…', clear: 'Clear chat', errRate: 'Too many requests right now. Wait a moment and try again.', errNo: 'Live answers are turned off for this page. You can still try the prompt in Claude.',
      mcp: 'MCP setup builder', pickServers: 'Pick what Claude should connect to', config: 'Config file (example)', host: 'Claude app (host)', client: 'MCP client', mcpNote: 'Example settings for learning. Check each server\'s own docs for exact values.',
      agentloop: 'Watch an agent work', nextStep: 'Next step', restart: 'Start over', loopDone: 'Task finished. Notice how Claude checked its own work before saying it was done.',
      apibuilder: 'API request builder', model: 'Model', system: 'System prompt', message: 'User message', maxTokens: 'max_tokens', sendSim: 'Send (simulated)', response: 'Response', cost: 'Cost of this call', apiNote: 'Simulated. A real call needs an API key and should run on a server, never in the browser.',
      costcalc: 'Monthly cost calculator', convs: 'Conversations per day', turns: 'Messages per conversation', inTok: 'Input tokens per message', outTok: 'Output tokens per message', perMonth: 'per month', perConv: 'per conversation', priceNote: 'Prices per million tokens, as listed in Nov 2026. Always check the current price list before you quote a client.', cheaper: 'Cheaper options',
      spot: 'Spot the problems', facts: 'The facts (source)', answer: 'Claude\'s draft answer — tap every sentence that is wrong or unsupported', checkIt: 'Check', found: 'Found', missed: 'Missed', falseAlarm: 'Not a problem', score: 'Score',
      sorter: 'Sort it', cardOf: 'Card {n} of {of}', right: 'Right!', wrong: 'Not quite.', next: 'Next', done: 'Done! Score: {s} of {of}', again: 'Try again',
      contrast: 'Contrast checker', textColor: 'Text', bgColor: 'Background', sample: 'Fresh bread every morning', sampleSmall: 'Small text like this must be easy to read too — for everyone.', ratioL: 'contrast ratio', aaNormal: 'Normal text · AA 4.5:1', aaLarge: 'Large text · AA 3:1', aaa: 'Enhanced · AAA 7:1', presets: 'Try these:', pGrey: 'Light grey on white', pBrand: 'Brand on cream', pYellow: 'White on yellow', pDark: 'Dark on light', contrastNote: 'Based on the WCAG contrast rules. Aim for at least 4.5:1 for normal text, 3:1 for large text and icons.',
      tokens: 'Design token playground', brand: 'Brand colour', radius: 'Corner radius', spacing: 'Spacing unit', font: 'Font style', fSans: 'Sans', fSerif: 'Serif', fRound: 'Rounded', cssTab: 'CSS variables', jsonTab: 'Design tokens (JSON)', prevTitle: 'Bakery Nur', prevBody: 'Fresh sourdough and challah, baked every morning in Haifa.', prevTag: 'New today', prevBtn: 'Order now', prevBtn2: 'See the menu', onBrand: 'text on the brand colour', tokNote2: 'The JSON follows the Design Tokens Community Group format (2025.10). Check designtokens.org for the full specification.',
      eliminate: 'Eliminate the wrong answers', elimHint: 'Tap every answer you can rule out. Keep the best one.', elimOut: 'Ruled out', elimCareful: 'Careful — this is the best answer. Keep it.', elimDone: 'Only the best answer is left. That is how you work through hard questions.', elimReset: 'Start over',
      filetree: 'Explore the folder', ftHint: 'Tap a file or folder to see what it is for and what is inside.',
      examsim: 'Exam simulation', simRules: 'Before you start (for a realistic run)', simStart: 'Start the 120-minute simulation', simQuick: 'Warm-up: quick 20', simResume: 'Resume your exam', simHistory: 'Your simulations', simNone: 'No simulations yet. Your results will appear here.', simTarget: 'Target: 80% or more, twice, on different days.'
    },
    he: {
      terminal: 'טרמינל לתרגול (סימולציה)', mission: 'המשימה שלך', tapHint: 'לוחצים על פקודה כדי להכניס אותה לתיבה, ואז לוחצים "הרץ".',
      run: 'הרץ', reset: 'התחל מחדש', missionDone: 'המשימה הושלמה! כל הכבוד.', typeHere: 'הקלידו פקודה…', safe: 'זו סימולציה בטוחה. שום דבר במחשב שלכם לא משתנה.',
      nextword: 'מנחש המילה הבאה', temp: 'רמת אקראיות (טמפרטורה)', predictable: 'צפוי', creative: 'יצירתי', generate: 'תן למודל לבחור', another: 'משפט חדש', picks: 'בחירות עד עכשיו',
      tlow: 'אקראיות נמוכה: המודל כמעט תמיד בוחר את המילה הכי סבירה. טוב לעובדות ולקוד.', thigh: 'אקראיות גבוהה: גם מילים פחות סבירות נבחרות. יותר גיוון, אבל גם יותר סיכוי לשטויות.', tmid: 'אקראיות בינונית: לרוב המילה הראשונה, לפעמים הפתעה.',
      tokenizer: 'מונה טוקנים', yourText: 'כתבו או הדביקו טקסט', chars: 'תווים', words: 'מילים', tokens: 'טוקנים (הערכה)', ofWindow: 'מחלון הקשר של מיליון טוקנים', tokNote: 'זו הערכה ללימוד בלבד. המודל האמיתי מחלק קצת אחרת. בעברית בדרך כלל יש יותר טוקנים לכל מילה מאשר באנגלית.',
      promptbuilder: 'בונה הפרומפטים', ingredients: 'הוסיפו רכיבים לפרומפט', yourPrompt: 'הפרומפט שלכם', quality: 'חוזק הפרומפט', copy: 'העתק', openClaude: 'פתח ב-Claude', askHere: 'שאל את Claude כאן', missing: 'כדאי להוסיף', allIn: 'כל הרכיבים בפנים. זה פרומפט חזק.',
      chat: 'מתרגלים עם Claude', send: 'שלח', thinking: 'Claude חושב…', liveOff: 'תשובות חיות עובדות כשהעמוד פתוח בתוך Claude ‏(claude.ai). הנה תשובה לדוגמה, וכפתור לנסות ב-Claude.', liveOn: 'חי: התשובות מגיעות מ-Claude, דרך החשבון שלכם.', placeholder: 'כתבו הודעה…', clear: 'נקה שיחה', errRate: 'יותר מדי בקשות כרגע. חכו רגע ונסו שוב.', errNo: 'תשובות חיות כבויות בעמוד הזה. אפשר עדיין לנסות את הפרומפט ב-Claude.',
      mcp: 'בונה הגדרות MCP', pickServers: 'בחרו למה Claude יתחבר', config: 'קובץ הגדרות (דוגמה)', host: 'אפליקציית Claude ‏(Host)', client: 'לקוח MCP', mcpNote: 'הגדרות לדוגמה, לצורך לימוד. את הערכים המדויקים בודקים בתיעוד של כל שרת.',
      agentloop: 'צפו בסוכן עובד', nextStep: 'הצעד הבא', restart: 'מההתחלה', loopDone: 'המשימה הסתיימה. שימו לב: Claude בדק את העבודה של עצמו לפני שאמר "סיימתי".',
      apibuilder: 'בונה בקשת API', model: 'מודל', system: 'הנחיית מערכת (System prompt)', message: 'הודעת המשתמש', maxTokens: 'max_tokens', sendSim: 'שלח (סימולציה)', response: 'תשובה', cost: 'עלות הקריאה', apiNote: 'סימולציה. קריאה אמיתית צריכה מפתח API, וצריכה לרוץ על שרת — אף פעם לא בדפדפן.',
      costcalc: 'מחשבון עלות חודשית', convs: 'שיחות ביום', turns: 'הודעות בכל שיחה', inTok: 'טוקנים נכנסים להודעה', outTok: 'טוקנים יוצאים להודעה', perMonth: 'לחודש', perConv: 'לשיחה', priceNote: 'מחירים למיליון טוקנים, לפי המחירון של נובמבר 2026. תמיד בודקים מחיר עדכני לפני שנותנים הצעת מחיר ללקוח.', cheaper: 'אפשרויות זולות יותר',
      spot: 'מצאו את הטעויות', facts: 'העובדות (המקור)', answer: 'הטיוטה של Claude — לחצו על כל משפט שגוי או שאין לו בסיס', checkIt: 'בדוק', found: 'מצאתם', missed: 'פספסתם', falseAlarm: 'זה דווקא בסדר', score: 'ציון',
      sorter: 'מיינו', cardOf: 'כרטיס {n} מתוך {of}', right: 'נכון!', wrong: 'לא בדיוק.', next: 'הבא', done: 'סיימתם! ציון: {s} מתוך {of}', again: 'שוב',
      contrast: 'בודק ניגודיות', textColor: 'טקסט', bgColor: 'רקע', sample: 'לחם טרי כל בוקר', sampleSmall: 'גם טקסט קטן כמו זה צריך להיות קריא — לכולם.', ratioL: 'יחס ניגודיות', aaNormal: 'טקסט רגיל · AA ‏4.5:1', aaLarge: 'טקסט גדול · AA ‏3:1', aaa: 'משופר · AAA ‏7:1', presets: 'נסו:', pGrey: 'אפור בהיר על לבן', pBrand: 'צבע מותג על שמנת', pYellow: 'לבן על צהוב', pDark: 'כהה על בהיר', contrastNote: 'לפי כללי הניגודיות של WCAG. מכוונים ל-4.5:1 לפחות בטקסט רגיל, ו-3:1 בטקסט גדול ובאייקונים.',
      tokens: 'מגרש משחקים לטוקנים', brand: 'צבע המותג', radius: 'עיגול פינות', spacing: 'יחידת ריווח', font: 'סגנון גופן', fSans: 'בלי תגים', fSerif: 'עם תגים', fRound: 'מעוגל', cssTab: 'משתני CSS', jsonTab: 'טוקנים (JSON)', prevTitle: 'מאפיית נור', prevBody: 'מחמצת וחלות טריות, נאפות כל בוקר בחיפה.', prevTag: 'חדש היום', prevBtn: 'להזמנה', prevBtn2: 'לתפריט', onBrand: 'טקסט על צבע המותג', tokNote2: 'ה-JSON בנוי לפי הפורמט של Design Tokens Community Group ‏(2025.10). את המפרט המלא בודקים ב-designtokens.org.',
      eliminate: 'מוציאים תשובות לא נכונות', elimHint: 'לוחצים על כל תשובה שאפשר לפסול. משאירים את הטובה ביותר.', elimOut: 'נפסלה', elimCareful: 'זהירות — זו התשובה הטובה ביותר. משאירים אותה.', elimDone: 'נשארה רק התשובה הטובה ביותר. ככה עוברים על שאלות קשות.', elimReset: 'מההתחלה',
      filetree: 'מסיירים בתיקייה', ftHint: 'לוחצים על קובץ או תיקייה כדי לראות בשביל מה הם ומה יש בפנים.',
      examsim: 'סימולציית מבחן', simRules: 'לפני שמתחילים (כדי שזה יהיה אמיתי)', simStart: 'מתחילים סימולציה של 120 דקות', simQuick: 'חימום: 20 שאלות', simResume: 'ממשיכים את המבחן', simHistory: 'הסימולציות שלכם', simNone: 'עוד אין סימולציות. התוצאות יופיעו כאן.', simTarget: 'יעד: 80% ומעלה, פעמיים, בימים שונים.'
    }
  };
  const ws = (ctx, k, v) => { let s = (WS[ctx.L] && WS[ctx.L][k]) || WS.en[k] || k; if (v) s = s.replace(/\{(\w+)\}/g, (m, n) => (v[n] != null ? v[n] : m)); return s; };
  const head = (ctx, ic, title, extra) => `<div class="w-head">${icon(ic)}<b>${esc(title)}</b>${extra || ''}</div>`;

  const MODELS = [
    { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', in: 0.10, out: 0.50, tag: { en: 'fastest, lowest cost', he: 'הכי מהיר וזול' } },
    { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', in: 2, out: 10, tag: { en: 'balanced everyday choice', he: 'בחירה מאוזנת ליום-יום' } },
    { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', in: 4, out: 20, tag: { en: 'deep reasoning, complex work', he: 'חשיבה עמוקה, עבודה מורכבת' } },
    { id: 'claude-fable-5-2', name: 'Claude Fable 5.2', in: 8, out: 40, tag: { en: 'most capable, hardest tasks', he: 'הכי חזק, למשימות הכי קשות' } }
  ];
  const money = (x) => (x < 0.01 ? '$' + x.toFixed(4) : x < 1 ? '$' + x.toFixed(3) : '$' + x.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }));

  /* ======================================================== TERMINAL */
  const HOME = '/home/you';
  const SITE_HTML = '<!doctype html>\n<html>\n<head>\n  <title>Bakery Nur</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Bakery Nur</h1>\n  <p>Fresh bread every morning.</p>\n  <section id="menu">\n    <h2>Menu</h2>\n    <ul><li>Sourdough — 24</li><li>Challah — 18</li></ul>\n  </section>\n</body>\n</html>';
  // The team "brain" repository used in the shared-brain mission (git clone …/brain.git)
  const BRAIN = {
    'CLAUDE.md': '# Team brain — read me first\n\n- We are Harbor & Pine, a small design and AI studio.\n- Write in the client\'s language (Hebrew or English). Warm, clear, no jargon.\n- Facts come from this folder. If something is missing, ask — never guess prices or dates.\n- Prompts live in prompts/, skills in skills/, finished work in reports/ or clients/<name>/.\n- Never put passwords, API keys or private personal data in this repository.',
    'README.md': '# brain\nOur shared knowledge for people and for Claude.\nChange it with a pull request so someone reviews it.',
    'company/brand-voice.md': '# Brand voice\nWarm, precise, a little playful. Short sentences. No buzzwords.',
    'company/services-and-prices.md': '# Services (Nov 2026)\n- Brand kit: from ₪6,500\n- Landing page: from ₪4,000\n- AI assistant setup: from ₪7,500 + monthly care',
    'clients/acme/brief.md': '# Acme Bakery\nGoal: more WhatsApp orders. Contact: Dana (owner).',
    'clients/acme/notes.md': '# Notes this week\n- Sun: approved new menu photos\n- Tue: asked to add gluten-free day\n- Thu: wants a Passover campaign plan',
    'prompts/weekly-report.md': '# Weekly client report — template\n1. What we did\n2. Decisions and approvals\n3. Next steps (owner + date)\n4. Risks or questions for the client',
    'skills/proposal-writer/SKILL.md': '---\nname: proposal-writer\ndescription: Write a client proposal in the studio format. Use when asked for a proposal, quote or offer.\n---\n1. Read company/services-and-prices.md\n2. Use the structure: problem, solution, scope, price, timeline\n3. Ask before giving any discount',
    'reports/.keep': ''
  };
  function baseFS(scn) {
    const fs = {};
    const d = (p) => { fs[p] = { d: true }; };
    const f = (p, c) => { fs[p] = { c: c }; };
    d('/'); d('/home'); d(HOME); d(HOME + '/Documents'); d(HOME + '/Downloads');
    f(HOME + '/notes.txt', 'Shopping: flour, yeast, sesame\nCall the accountant on Sunday');
    f(HOME + '/Documents/plan.txt', 'Ideas for the bakery website:\n- menu\n- opening hours\n- WhatsApp button');
    if (scn !== 'basics' && scn !== 'brain') {
      const r = HOME + '/bakery-site'; d(r);
      f(r + '/index.html', SITE_HTML);
      f(r + '/style.css', 'body { font-family: sans-serif; margin: 2rem; }\nh1 { color: #8a4b08; }');
      f(r + '/README.md', '# Bakery Nur website\nA small site for a neighbourhood bakery.');
      if (scn === 'api' || scn === 'deploy' || scn === 'claude' || scn === 'design' || scn === 'qa') {
        f(r + '/.gitignore', 'node_modules/\n.env');
        f(r + '/.env', 'ANTHROPIC_API_KEY=sk-ant-REPLACE-ME');
      }
      if (scn === 'design') { d(r + '/src'); d(r + '/src/components'); }
    }
    return fs;
  }
  function initTerm(scn) {
    const st = { fs: baseFS(scn), cwd: (scn === 'basics' || scn === 'brain') ? HOME : HOME + '/bakery-site', env: { HOME: HOME, USER: 'you' }, ran: [], git: null, vercel: { login: false, linked: false, deployed: false, prod: false, env: {} }, api: { ok: 0, err: 0 }, claude: { ran: 0, mode: false, mcp: {}, compared: false }, npm: {}, hist: [], hi: -1 };
    if (scn === 'deploy' || scn === 'claude' || scn === 'api' || scn === 'design' || scn === 'qa') {
      st.git = gitNew(st, HOME + '/bakery-site');
      gitAddAll(st); gitCommit(st, 'First version of the bakery site');
      if (scn === 'deploy') { st.git.remote = 'https://github.com/you/bakery-site.git'; st.git.rb.main = st.git.br.main; }
    }
    return st;
  }
  const norm = (p) => { const out = []; p.split('/').forEach((s) => { if (!s || s === '.') return; if (s === '..') out.pop(); else out.push(s); }); return '/' + out.join('/'); };
  function abs(st, p) {
    if (!p || p === '~') return HOME;
    if (p.indexOf('~/') === 0) p = HOME + p.slice(1);
    return norm(p[0] === '/' ? p : st.cwd + '/' + p);
  }
  const parent = (p) => (p === '/' ? '/' : p.slice(0, p.lastIndexOf('/')) || '/');
  const base = (p) => p.slice(p.lastIndexOf('/') + 1);
  const short = (p) => (p === HOME ? '~' : p.indexOf(HOME + '/') === 0 ? '~' + p.slice(HOME.length) : p);
  const children = (st, dir) => Object.keys(st.fs).filter((p) => p !== dir && parent(p) === dir).sort();

  // shell-ish tokenizer: quotes and $VAR
  function tokenize(line, env) {
    const out = []; let cur = ''; let q = null; let has = false;
    const expand = (s) => s.replace(/\$([A-Z_][A-Z0-9_]*)/gi, (m, n) => (env[n] != null ? env[n] : ''));
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === q) { q = null; continue; }
        if (q === '"' && ch === '$') { const m = /^\$([A-Z_][A-Z0-9_]*)/i.exec(line.slice(i)); if (m) { cur += env[m[1]] != null ? env[m[1]] : ''; i += m[0].length - 1; continue; } }
        cur += ch; continue;
      }
      if (ch === '"' || ch === "'") { q = ch; has = true; continue; }
      if (ch === ' ' || ch === '\t') { if (cur || has) { out.push(cur); cur = ''; has = false; } continue; }
      if (ch === '$') { const m = /^\$([A-Z_][A-Z0-9_]*)/i.exec(line.slice(i)); if (m) { cur += env[m[1]] != null ? env[m[1]] : ''; i += m[0].length - 1; has = true; continue; } }
      cur += ch;
    }
    if (cur || has) out.push(cur);
    return out.map((x) => x);
  }

  /* ---- git model ---- */
  function gitNew(st, root) {
    st.fs[root + '/.git'] = { d: true };
    return { root, commits: [], br: { main: null }, head: 'main', idx: {}, remote: null, rb: {} };
  }
  const hex = () => Math.random().toString(16).slice(2, 9).padEnd(7, '0');
  function inRepo(st) { const g = st.git; return g && (st.cwd === g.root || st.cwd.indexOf(g.root + '/') === 0) ? g : null; }
  function ignored(st, rel) {
    const gi = st.fs[st.git.root + '/.gitignore']; if (!gi) return false;
    return gi.c.split('\n').map((x) => x.trim()).filter(Boolean).some((pat) => {
      if (pat.endsWith('/')) return rel.indexOf(pat) === 0;
      if (pat.indexOf('*.') === 0) return rel.endsWith(pat.slice(1));
      return rel === pat || base(rel) === pat;
    });
  }
  function workFiles(st) {
    const g = st.git; const out = {};
    Object.keys(st.fs).forEach((p) => {
      if (p.indexOf(g.root + '/') !== 0 || st.fs[p].d) return;
      const rel = p.slice(g.root.length + 1);
      if (rel.indexOf('.git/') === 0 || ignored(st, rel)) return;
      out[rel] = st.fs[p].c;
    });
    return out;
  }
  const headSnap = (g) => { const c = g.commits.find((x) => x.id === g.br[g.head]); return c ? c.snap : {}; };
  function gitAddAll(st) { const g = st.git; g.idx = Object.assign({}, workFiles(st)); }
  function gitCommit(st, msg) {
    const g = st.git; const prev = g.br[g.head];
    const c = { id: hex(), msg, branch: g.head, parents: prev ? [prev] : [], snap: Object.assign({}, g.idx), n: g.commits.length };
    g.commits.push(c); g.br[g.head] = c.id; return c;
  }
  function ancestors(g, id) { const seen = new Set(); const stack = [id]; while (stack.length) { const x = stack.pop(); if (!x || seen.has(x)) continue; seen.add(x); const c = g.commits.find((k) => k.id === x); if (c) stack.push.apply(stack, c.parents); } return seen; }
  function diffSets(a, b) { const out = []; new Set(Object.keys(a).concat(Object.keys(b))).forEach((k) => { if (a[k] !== b[k]) out.push({ f: k, kind: !(k in a) ? 'new file' : !(k in b) ? 'deleted' : 'modified' }); }); return out.sort((x, y) => x.f.localeCompare(y.f)); }

  const EXPL = {
    pwd: { en: 'pwd = "print working directory": the folder you are in now.', he: 'pwd = "איפה אני?": מציג את התיקייה שבה אתם נמצאים עכשיו.' },
    ls: { en: 'ls = "list": shows what is inside this folder. Names ending in / are folders.', he: 'ls = "מה יש כאן?": מציג מה יש בתיקייה. שם שנגמר ב-/ הוא תיקייה.' },
    cd: { en: 'cd = "change directory": you moved to another folder. "cd .." goes up one level.', he: 'cd = "עבור לתיקייה": זזתם לתיקייה אחרת. ‏"cd .." עולה רמה אחת למעלה.' },
    mkdir: { en: 'mkdir = "make directory": you created a new folder.', he: 'mkdir = "צור תיקייה": יצרתם תיקייה חדשה.' },
    touch: { en: 'touch creates an empty file (or updates its date if it exists).', he: 'touch יוצר קובץ ריק חדש.' },
    cat: { en: 'cat prints a file\'s contents on the screen.', he: 'cat מציג את תוכן הקובץ על המסך.' },
    echo: { en: 'echo prints text. With > it writes the text into a file (and >> adds to the end).', he: 'echo מדפיס טקסט. עם > הוא כותב אותו לתוך קובץ (ועם >> מוסיף בסוף).' },
    'git init': { en: 'Git now watches this folder. It became a repository ("repo").', he: 'מעכשיו Git עוקב אחרי התיקייה. היא הפכה למאגר (Repository).' },
    'git status': { en: 'status tells you what changed and what is ready to be saved.', he: 'status מראה מה השתנה ומה מוכן לשמירה.' },
    'git add': { en: 'add puts changes in the "box" (staging area) for the next save.', he: 'add מכניס שינויים ל"קופסה" (Staging) לקראת השמירה הבאה.' },
    'git commit': { en: 'commit saves a snapshot with a message. You can always go back to it.', he: 'commit שומר "תמונת מצב" עם הודעה. תמיד אפשר לחזור אליה.' },
    'git log': { en: 'log lists your saved snapshots, newest first.', he: 'log מציג את רשימת השמירות, מהחדשה לישנה.' },
    'git branch': { en: 'A branch is a safe copy of the timeline where you can try things.', he: 'ענף (Branch) הוא קו זמן נפרד שבו אפשר לנסות דברים בבטחה.' },
    'git switch': { en: 'You moved to another branch.', he: 'עברתם לענף אחר.' },
    'git checkout': { en: 'You moved to another branch.', he: 'עברתם לענף אחר.' },
    'git merge': { en: 'merge brings the work from another branch into this one.', he: 'merge מכניס את העבודה מענף אחר לענף הנוכחי.' },
    'git remote': { en: 'remote links your local repo to a copy online (like GitHub).', he: 'remote מחבר את המאגר המקומי לעותק באינטרנט (כמו GitHub).' },
    'git push': { en: 'push uploads your commits to GitHub so others (and Vercel) can see them.', he: 'push מעלה את השמירות ל-GitHub, כדי שאחרים (וגם Vercel) יראו אותן.' },
    'vercel login': { en: 'You connected the terminal to your Vercel account.', he: 'חיברתם את הטרמינל לחשבון ה-Vercel שלכם.' },
    vercel: { en: 'Vercel built your site and gave it a preview address on the internet.', he: 'Vercel בנה את האתר ונתן לו כתובת תצוגה מקדימה באינטרנט.' },
    'vercel --prod': { en: 'This is the real, public address your client will share.', he: 'זו הכתובת האמיתית והציבורית שהלקוח ישתף.' },
    'vercel env': { en: 'Secrets like API keys live in Vercel settings, not in your code.', he: 'סודות כמו מפתח API נשמרים בהגדרות של Vercel, לא בתוך הקוד.' },
    export: { en: 'export sets an environment variable for this terminal session.', he: 'export שומר "משתנה סביבה" לחלון הטרמינל הזה.' },
    curl: { en: 'curl sends a web request. Here it talked to the Claude API.', he: 'curl שולח בקשה לאינטרנט. כאן הוא דיבר עם ה-API של Claude.' },
    claude: { en: 'Claude Code read your files, made a plan, changed code, and told you what it did.', he: 'Claude Code קרא את הקבצים, תכנן, שינה קוד, וסיפר מה עשה.' },
    figma: { en: 'Claude used Figma’s MCP tools: it read the frame and the design variables, then wrote code that uses your tokens.', he: 'Claude השתמש בכלים של Figma דרך MCP: קרא את המסגרת ואת משתני העיצוב, וכתב קוד שמשתמש בטוקנים שלכם.' },
    compare: { en: 'Comparing a screenshot of the design with the result is how you check visual fidelity.', he: 'השוואה בין צילום של העיצוב לתוצאה — כך בודקים נאמנות לעיצוב.' },
    brain: { en: 'Claude followed the team’s automatic instructions (CLAUDE.md) and the shared template — the same result for anyone on the team.', he: 'Claude פעל לפי ההוראות האוטומטיות של הצוות (CLAUDE.md) ולפי התבנית המשותפת — אותה תוצאה לכל מי שבצוות.' },
    qa: { en: 'Claude used a real browser through MCP: it clicked and typed like a customer, and reported what broke.', he: 'Claude השתמש בדפדפן אמיתי דרך MCP: לחץ והקליד כמו לקוח, ודיווח מה נשבר.' },
    parallel: { en: 'Three helpers (subagents) tested at the same time, each with one focus. Parallel testing finds more, faster.', he: 'שלושה עוזרים (Subagents) בדקו בו-זמנית, כל אחד עם מיקוד אחד. בדיקה במקביל מוצאת יותר, מהר יותר.' }
  };

  function Terminal(el, cfg, ctx) {
    const scn = cfg.scenario || 'basics';
    let st = initTerm(scn);
    const out = $('.out', el), form = $('form', el), input = $('input', el), ps = $('.ps-live', el);
    const tasks = cfg.tasks || [];
    const lines = [];
    const push = (cls, text, rtl) => { lines.push({ cls, text, rtl }); if (lines.length > 400) lines.splice(0, lines.length - 400); };
    const explain = (key) => { const e = EXPL[key]; if (e) push('ln-dim', '↳ ' + (e[ctx.L] || e.en), ctx.L === 'he'); };
    function paint() {
      out.innerHTML = lines.map((l) => `<div class="${l.cls}"${l.rtl ? ' dir="rtl" style="text-align:right"' : ''}>${l.html || esc(l.text)}</div>`).join('');
      out.scrollTop = out.scrollHeight;
      ps.textContent = st.claude.mode ? '>' : short(st.cwd) + ' $';
      paintTasks();
      if (cfg.graph) paintGraph();
    }
    function checkOne(spec) {
      return spec.split('&').every((s) => {
        s = s.trim();
        const [k, v] = [s.slice(0, s.indexOf(':')), s.slice(s.indexOf(':') + 1)];
        const g = st.git;
        switch (k) {
          case 'ran': return st.ran.some((r) => r.indexOf(v) === 0);
          case 'exists': return !!st.fs[abs(st, v)];
          case 'isdir': return !!(st.fs[abs(st, v)] && st.fs[abs(st, v)].d);
          case 'contains': { const cut = v.indexOf('|'); const p = v.slice(0, cut), txt = v.slice(cut + 1); const f = st.fs[abs(st, p)]; return !!(f && !f.d && f.c.indexOf(txt) >= 0); }
          case 'cwd': return st.cwd === abs({ cwd: HOME }, v);
          case 'git': {
            if (v === 'init') return !!g;
            if (!g) return false;
            if (v === 'staged') return diffSets(headSnap(g), g.idx).length > 0 || g.commits.length > 1;
            if (v.indexOf('commits>=') === 0) return g.commits.length >= +v.split('>=')[1];
            if (v.indexOf('branch=') === 0) return v.split('=')[1] in g.br;
            if (v.indexOf('head=') === 0) return g.head === v.split('=')[1];
            if (v === 'merged') { const a = ancestors(g, g.br.main); return g.commits.some((c) => c.branch !== 'main' && a.has(c.id)); }
            if (v === 'remote') return !!g.remote;
            if (v === 'pushed') return Object.keys(g.rb).some((b) => g.rb[b] && g.rb[b] === g.br[b]) && g.commits.length > ((scn === 'deploy' || scn === 'brain') ? 1 : 0);
            return false;
          }
          case 'vercel': return v === 'env' ? Object.keys(st.vercel.env).length > 0 : !!st.vercel[v];
          case 'env': return !!st.env[v];
          case 'api': return v === 'ok' ? st.api.ok > 0 : st.api.err > 0;
          case 'claude': return v === 'ran' ? st.claude.ran > 0 : v === 'init' ? !!st.fs[HOME + '/bakery-site/CLAUDE.md'] : v === 'mcp' ? Object.keys(st.claude.mcp).length > 0 : v === 'compare' ? !!st.claude.compared : v === 'qa' ? !!st.claude.qa : v === 'parallel' ? !!st.claude.parallel : v.indexOf('mcp=') === 0 ? !!st.claude.mcp[v.slice(4)] : false;
          case 'npm': return !!st.npm[v];
          default: return false;
        }
      });
    }
    let celebrated = false;
    let latched = new Set(); // a mission step stays ticked once reached
    const isDone = (k) => { if (latched.has(k)) return true; if (checkOne(tasks[k].check)) { latched.add(k); return true; } return false; };
    function paintTasks() {
      const ul = $('.missions', el); if (!ul) return;
      let nowSet = false; let all = true;
      ul.innerHTML = tasks.map((tk, k) => {
        const ok = isDone(k);
        if (!ok) all = false;
        const now = !ok && !nowSet; if (now) nowSet = true;
        return `<li class="${ok ? 'done' : ''}${now ? ' now' : ''}"><span class="ck">${ok ? icon('check') : ''}</span><span>${md(ctx.tx(tk))}</span></li>`;
      }).join('');
      const cur = tasks.find((tk, k) => !isDone(k));
      const chips = $('.chips', el);
      const hints = cur ? [].concat(cur.hint || []) : [];
      chips.innerHTML = hints.map((h) => `<button type="button" data-cmd="${esc(h)}">${esc(h)}</button>`).join('');
      $$('button', chips).forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.cmd; input.focus(); }));
      const done = $('.term-done', el);
      if (done) done.hidden = !(tasks.length && all);
      if (tasks.length && all && !celebrated) { celebrated = true; }
    }
    function paintGraph() {
      const box = $('.gitgraph', el); const g = st.git;
      if (!g || !g.commits.length) { box.innerHTML = `<p class="w-note" style="margin:4px">${esc(ctx.L === 'he' ? 'עוד אין שמירות (commits). הגרף יופיע כאן.' : 'No commits yet. Your history graph will appear here.')}</p>`; return; }
      const laneOf = {}; let lanes = 0;
      const lane = (b) => { if (!(b in laneOf)) laneOf[b] = lanes++; return laneOf[b]; };
      lane('main');
      const rows = g.commits.slice().reverse();
      rows.forEach((c) => lane(c.branch));
      const H = 30, X0 = 14, DX = 20;
      const pos = {}; rows.forEach((c, i) => { pos[c.id] = { x: X0 + lane(c.branch) * DX, y: 16 + i * H }; });
      const colors = ['var(--l1)', 'var(--l2)', 'var(--l3)', 'var(--lx)'];
      const tx0 = X0 + lanes * DX + 6;
      let svg = '';
      rows.forEach((c) => c.parents.forEach((p) => { if (!pos[p]) return; const a = pos[c.id], b = pos[p]; svg += `<path d="M${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}" stroke="${colors[lane(c.branch) % 4]}" stroke-width="2.5" fill="none"/>`; }));
      rows.forEach((c) => {
        const p = pos[c.id]; const labels = Object.keys(g.br).filter((b) => g.br[b] === c.id);
        const tag = labels.map((b) => (b === g.head ? 'HEAD → ' + b : b) + (g.rb[b] === c.id ? ' · origin' : '')).join(', ');
        svg += `<circle cx="${p.x}" cy="${p.y}" r="6" fill="var(--surface)" stroke="${colors[lane(c.branch) % 4]}" stroke-width="3"/>`;
        svg += `<text x="${tx0}" y="${p.y + 4}"><tspan style="fill:var(--ink-3)">${c.id}</tspan> ${esc(c.msg.slice(0, 40))}${tag ? ` <tspan style="fill:var(--lx-ink);font-weight:600">(${esc(tag)})</tspan>` : ''}</text>`;
      });
      const W = Math.max(320, tx0 + 380);
      box.innerHTML = `<svg width="${W}" height="${rows.length * H + 8}" viewBox="0 0 ${W} ${rows.length * H + 8}" role="img" aria-label="git history graph">${svg}</svg>`;
    }

    /* --- commands --- */
    const say = (t) => push('', t);
    const ok = (t) => push('ln-ok', t);
    const err = (t) => push('ln-err', t);
    const dim = (t) => push('ln-dim', t);
    function writeFile(p, c, append) {
      const a = abs(st, p);
      if (!st.fs[parent(a)] || !st.fs[parent(a)].d) { err('No such directory: ' + short(parent(a))); return false; }
      if (st.fs[a] && st.fs[a].d) { err(p + ': Is a directory'); return false; }
      st.fs[a] = { c: append && st.fs[a] ? st.fs[a].c + '\n' + c : c }; return true;
    }
    const C = {};
    C.help = () => {
      say('Commands you can try in this simulator:');
      dim('  files:   pwd  ls [-a]  cd <dir>  mkdir <dir>  touch <file>  cat <file>  echo "text" > file  rm <file>');
      dim('  git:     git init | status | add <file|.> | commit -m "msg" | log --oneline | branch | switch -c <name> | merge <name> | remote add origin <url> | push');
      dim('  web:     npm create vite@latest my-app | npm install | npm run dev');
      dim('  deploy:  vercel login | vercel | vercel --prod | vercel env add <NAME>');
      dim('  ai:      claude | claude "your request" | claude -p "question" | claude mcp add ...');
      dim('  api:     export ANTHROPIC_API_KEY=... | curl https://api.anthropic.com/v1/messages ...');
      dim('  other:   clear  whoami  env  history');
    };
    C.clear = () => { lines.length = 0; };
    C.whoami = () => say('you');
    C.date = () => say(new Date().toString());
    C.history = () => st.hist.slice().reverse().forEach((h, i) => dim(String(i + 1).padStart(3) + '  ' + h));
    C.pwd = () => { say(st.cwd); explain('pwd'); };
    C.ls = (a) => {
      const all = a.indexOf('-a') >= 0 || a.indexOf('-la') >= 0 || a.indexOf('-al') >= 0;
      const target = abs(st, a.filter((x) => x[0] !== '-')[0] || '.');
      const node = st.fs[target];
      if (!node) return err('ls: ' + (a[0] || '') + ': No such file or directory');
      if (!node.d) return say(base(target));
      const items = children(st, target).filter((p) => all || base(p)[0] !== '.').map((p) => base(p) + (st.fs[p].d ? '/' : ''));
      say(items.length ? items.join('   ') : '');
      explain('ls');
    };
    C.cd = (a) => {
      const target = abs(st, a[0] || '~');
      if (!st.fs[target]) return err('cd: no such file or directory: ' + a[0]);
      if (!st.fs[target].d) return err('cd: not a directory: ' + a[0]);
      st.cwd = target; explain('cd');
    };
    C.mkdir = (a) => {
      const names = a.filter((x) => x[0] !== '-'); if (!names.length) return err('usage: mkdir <folder-name>');
      names.forEach((n) => { const p = abs(st, n); if (st.fs[p]) return err('mkdir: ' + n + ': File exists'); if (!st.fs[parent(p)]) return err('mkdir: ' + n + ': No such file or directory'); st.fs[p] = { d: true }; });
      explain('mkdir');
    };
    C.touch = (a) => { if (!a[0]) return err('usage: touch <file>'); a.forEach((n) => { const p = abs(st, n); if (!st.fs[p]) writeFile(n, ''); }); explain('touch'); };
    C.cat = (a) => {
      if (!a[0]) return err('usage: cat <file>');
      const p = abs(st, a[0]); const f = st.fs[p];
      if (!f) return err('cat: ' + a[0] + ': No such file or directory');
      if (f.d) return err('cat: ' + a[0] + ': Is a directory');
      say(f.c || ''); if (base(p) === '.env') push('ln-warn', ctx.L === 'he' ? '⚠ זה קובץ סודות. לעולם לא משתפים אותו ולא מעלים ל-Git.' : '⚠ This is a secrets file. Never share it or put it in Git.', ctx.L === 'he');
      explain('cat');
    };
    C.rm = (a) => {
      const names = a.filter((x) => x[0] !== '-'); const rec = a.some((x) => /^-r|^-rf|^-fr/.test(x));
      names.forEach((n) => {
        const p = abs(st, n); const f = st.fs[p];
        if (!f) return err('rm: ' + n + ': No such file or directory');
        if (f.d && !rec) return err('rm: ' + n + ': is a directory (use rm -r)');
        if (p === HOME || p === '/' || p === '/home') return err('rm: refusing to remove ' + n + ' in this simulator');
        Object.keys(st.fs).forEach((k) => { if (k === p || k.indexOf(p + '/') === 0) delete st.fs[k]; });
      });
    };
    C.echo = (a, raw) => {
      const gt = a.indexOf('>'), gg = a.indexOf('>>');
      if (gg >= 0) { if (writeFile(a[gg + 1], a.slice(0, gg).join(' '), true)) explain('echo'); return; }
      if (gt >= 0) { if (writeFile(a[gt + 1], a.slice(0, gt).join(' '))) explain('echo'); return; }
      say(a.join(' '));
    };
    C.export = (a) => {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(a.join(' '));
      if (!m) return err('usage: export NAME=value');
      st.env[m[1]] = m[2]; explain('export');
      if (/KEY|TOKEN|SECRET/i.test(m[1])) push('ln-warn', ctx.L === 'he' ? '🔒 המפתח שמור רק בחלון הזה. הוא לא נכנס לקוד.' : '🔒 The key lives only in this terminal session. It is not in your code.', ctx.L === 'he');
    };
    C.env = () => Object.keys(st.env).forEach((k) => say(k + '=' + (/KEY|TOKEN|SECRET/i.test(k) ? st.env[k].slice(0, 7) + '…' : st.env[k])));
    C.node = (a) => (a[0] === '-v' || a[0] === '--version' ? say('v22.12.0') : dim('(node is installed. In this simulator, try: node -v)'));
    C.npx = (a) => {
      if (a[0] === 'playwright' && a[1] === 'test') {
        if (!st.fs[st.cwd + '/tests/order-form.spec.ts']) return err('Error: No tests found. Ask Claude to write a test first.');
        say('Running 3 tests using 3 workers');
        ok('  ✓ order form: a valid order is accepted (1.2s)\n  ✓ order form: a negative quantity shows an error (0.8s)');
        err('  ✘ order form: an empty phone is rejected (0.9s)');
        say('\n  1 failed, 2 passed');
        push('ln-dim', '↳ ' + (ctx.L === 'he' ? 'הבדיקה נכשלת כי הבאג עוד קיים. מתקנים את הטופס ומריצים שוב — עכשיו היא שומרת שהבאג לא יחזור.' : 'The test fails because the bug is still there. Fix the form and run it again — from now on it guards against the bug returning.'), ctx.L === 'he');
        return;
      }
      dim('(In this simulator npx supports: npx playwright test)');
    };
    C.code = () => ok('Opening the folder in VS Code… (simulated)');
    C.open = () => ok('Opening… (simulated)');
    C.npm = (a) => {
      const sub = a[0];
      if (sub === '-v' || sub === '--version') return say('10.9.0');
      if (sub === 'create' || sub === 'init') {
        const name = a.find((x, i) => i > 1 && x[0] !== '-') || 'my-app';
        const r = abs(st, name);
        if (st.fs[r]) return err('Folder ' + name + ' already exists');
        st.fs[r] = { d: true }; st.fs[r + '/src'] = { d: true };
        st.fs[r + '/index.html'] = { c: '<!doctype html>\n<html>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.js"></script>\n  </body>\n</html>' };
        st.fs[r + '/src/main.js'] = { c: "document.querySelector('#app').innerHTML = '<h1>Hello!</h1>'" };
        st.fs[r + '/package.json'] = { c: '{\n  "name": "' + name + '",\n  "scripts": { "dev": "vite", "build": "vite build" }\n}' };
        st.fs[r + '/.gitignore'] = { c: 'node_modules/\ndist/\n.env' };
        ok('✔ Scaffolding project in ' + short(r) + '…');
        say('Done. Now run:\n  cd ' + name + '\n  npm install\n  npm run dev');
        st.npm.create = true; return;
      }
      if (sub === 'install' || sub === 'i') {
        if (!st.fs[st.cwd + '/package.json']) return err('npm error: could not find package.json here. Are you in the project folder?');
        st.fs[st.cwd + '/node_modules'] = { d: true }; st.npm.install = true;
        return ok('added 14 packages, and audited 15 packages in 2s\nfound 0 vulnerabilities');
      }
      if (sub === 'run' && a[1] === 'dev') {
        if (!st.fs[st.cwd + '/package.json']) return err('npm error: no package.json in this folder');
        if (!st.npm.install) return err('vite: command not found. Run npm install first.');
        st.npm.dev = true;
        return ok('  VITE v6.0.3  ready in 312 ms\n\n  ➜  Local:   http://localhost:5173/\n  (simulated: in real life, open that address in your browser)');
      }
      if (sub === 'run' && a[1] === 'build') { st.npm.build = true; return ok('vite v6.0.3 building for production...\n✓ 3 modules transformed.\ndist/index.html  0.46 kB\n✓ built in 410ms'); }
      if (sub === 'test') return ok('PASS  tests/menu.test.js\n  ✓ shows the menu (3 ms)\nTests: 1 passed, 1 total');
      err('Unknown npm command in this simulator. Try: npm install, npm run dev');
    };

    C.git = (a) => {
      const sub = a[0]; const g = inRepo(st);
      if (sub === '--version') return say('git version 2.47.1');
      if (sub === 'init') {
        if (st.git && inRepo(st)) return dim('Reinitialized existing Git repository in ' + st.git.root + '/.git/');
        st.git = gitNew(st, st.cwd); ok('Initialized empty Git repository in ' + st.cwd + '/.git/'); explain('git init'); return;
      }
      if (sub === 'clone') {
        const url = a[1]; if (!url) return err('usage: git clone <url>');
        const name = base(url).replace(/\.git$/, ''); const r = abs(st, name);
        if (st.fs[r]) return err("fatal: destination path '" + name + "' already exists");
        st.fs[r] = { d: true };
        if (name === 'brain') Object.keys(BRAIN).forEach((p) => { const full = r + '/' + p; const parts = p.split('/'); for (let i = 1; i < parts.length; i++) st.fs[r + '/' + parts.slice(0, i).join('/')] = { d: true }; st.fs[full] = { c: BRAIN[p] }; });
        else { st.fs[r + '/README.md'] = { c: '# ' + name }; st.fs[r + '/index.html'] = { c: SITE_HTML }; }
        const saveCwd = st.cwd; st.cwd = r; st.git = gitNew(st, r); gitAddAll(st); gitCommit(st, 'Initial commit'); st.git.remote = url; st.git.rb.main = st.git.br.main; st.cwd = saveCwd;
        return ok("Cloning into '" + name + "'...\nReceiving objects: 100% (12/12), done.");
      }
      if (!g) return err('fatal: not a git repository. Run "git init" first (or cd into your project folder).');
      if (sub === 'status') {
        const hs = headSnap(g); const wf = workFiles(st);
        say('On branch ' + g.head);
        const staged = diffSets(hs, g.idx);
        const unstaged = diffSets(g.idx, wf).filter((x) => x.f in g.idx || x.f in hs);
        const untracked = Object.keys(wf).filter((f) => !(f in g.idx) && !(f in hs));
        if (!g.commits.length) say('\nNo commits yet');
        if (staged.length) { say('\nChanges to be committed:'); staged.forEach((x) => ok('        ' + x.kind + ':   ' + x.f)); }
        if (unstaged.length) { say('\nChanges not staged for commit:'); unstaged.forEach((x) => err('        ' + x.kind + ':   ' + x.f)); }
        if (untracked.length) { say('\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)'); untracked.forEach((f) => err('        ' + f)); }
        if (!staged.length && !unstaged.length && !untracked.length) say('nothing to commit, working tree clean');
        explain('git status'); return;
      }
      if (sub === 'add') {
        const what = a.slice(1); if (!what.length) return err('Nothing specified, nothing added. Try: git add .');
        const wf = workFiles(st);
        if (what.indexOf('.') >= 0 || what.indexOf('-A') >= 0 || what.indexOf('--all') >= 0) { g.idx = Object.assign({}, wf); }
        else {
          for (const w of what) {
            const rel = abs(st, w).slice(g.root.length + 1);
            if (ignored(st, rel)) { push('ln-warn', 'The following paths are ignored by one of your .gitignore files:\n' + rel); continue; }
            if (rel in wf) g.idx[rel] = wf[rel]; else if (rel in g.idx) delete g.idx[rel]; else err("fatal: pathspec '" + w + "' did not match any files");
          }
        }
        explain('git add'); return;
      }
      if (sub === 'commit') {
        const mi = a.indexOf('-m'); const am = a.indexOf('-am');
        if (am >= 0) { g.idx = Object.assign({}, g.idx, workFiles(st)); }
        const msg = mi >= 0 ? a[mi + 1] : am >= 0 ? a[am + 1] : null;
        if (!msg) return err('Please add a message: git commit -m "what you changed"');
        const ch = diffSets(headSnap(g), g.idx);
        if (!ch.length) return say('On branch ' + g.head + '\nnothing to commit, working tree clean');
        const c = gitCommit(st, msg);
        ok('[' + g.head + (c.parents.length ? '' : ' (root-commit)') + ' ' + c.id + '] ' + msg);
        say(' ' + ch.length + ' file' + (ch.length > 1 ? 's' : '') + ' changed');
        if ('.env' in g.idx) push('ln-warn', ctx.L === 'he' ? '⚠ שימו לב: קובץ ‎.env‎ נכנס לשמירה. סודות בהיסטוריה של Git קשה מאוד למחוק!' : '⚠ Careful: .env was committed. Secrets in Git history are very hard to remove!', ctx.L === 'he');
        explain('git commit'); return;
      }
      if (sub === 'log') {
        let id = g.br[g.head]; if (!id) return err("fatal: your current branch '" + g.head + "' does not have any commits yet");
        const seen = new Set();
        while (id && !seen.has(id)) { seen.add(id); const c = g.commits.find((k) => k.id === id); const labels = Object.keys(g.br).filter((b) => g.br[b] === id); say(c.id + (labels.length ? ' (' + labels.map((b) => b === g.head ? 'HEAD -> ' + b : b).join(', ') + ')' : '') + ' ' + c.msg); id = c.parents[0]; }
        explain('git log'); return;
      }
      if (sub === 'branch') {
        const name = a[1];
        if (!name) { Object.keys(g.br).forEach((b) => (b === g.head ? ok('* ' + b) : say('  ' + b))); explain('git branch'); return; }
        if (name in g.br) return err("fatal: a branch named '" + name + "' already exists");
        if (!g.br[g.head]) return err('fatal: make your first commit before creating branches');
        g.br[name] = g.br[g.head]; explain('git branch'); return;
      }
      if (sub === 'switch' || sub === 'checkout') {
        const create = a[1] === '-c' || a[1] === '-b';
        const name = create ? a[2] : a[1];
        if (!name) return err('usage: git switch <branch>   or   git switch -c <new-branch>');
        if (create) { if (name in g.br) return err("fatal: a branch named '" + name + "' already exists"); g.br[name] = g.br[g.head]; }
        else if (!(name in g.br)) return err("error: pathspec '" + name + "' did not match any branch. Create it with: git switch -c " + name);
        const target = g.commits.find((c) => c.id === g.br[name]);
        g.head = name;
        if (target) { Object.keys(target.snap).forEach((rel) => { st.fs[g.root + '/' + rel] = { c: target.snap[rel] }; }); g.idx = Object.assign({}, target.snap); }
        ok((create ? "Switched to a new branch '" : "Switched to branch '") + name + "'");
        explain('git switch'); return;
      }
      if (sub === 'merge') {
        const name = a[1]; if (!name || !(name in g.br)) return err('merge: ' + (name || '') + ' - not something we can merge');
        if (name === g.head) return say('Already up to date.');
        const theirs = g.br[name], ours = g.br[g.head];
        const anc = ancestors(g, theirs);
        if (anc.has(ours) || !ours) {
          g.br[g.head] = theirs; const c = g.commits.find((k) => k.id === theirs);
          Object.keys(c.snap).forEach((rel) => { st.fs[g.root + '/' + rel] = { c: c.snap[rel] }; }); g.idx = Object.assign({}, c.snap);
          ok('Updating ' + (ours || '0000000') + '..' + theirs + '\nFast-forward'); explain('git merge'); return;
        }
        if (ancestors(g, ours).has(theirs)) return say('Already up to date.');
        const tc = g.commits.find((k) => k.id === theirs), oc = g.commits.find((k) => k.id === ours);
        const snap = Object.assign({}, oc.snap, tc.snap);
        const c = { id: hex(), msg: "Merge branch '" + name + "'", branch: g.head, parents: [ours, theirs], snap, n: g.commits.length };
        g.commits.push(c); g.br[g.head] = c.id; g.idx = Object.assign({}, snap);
        Object.keys(snap).forEach((rel) => { st.fs[g.root + '/' + rel] = { c: snap[rel] }; });
        ok("Merge made by the 'ort' strategy."); explain('git merge'); return;
      }
      if (sub === 'remote') {
        if (a[1] === '-v') { if (g.remote) { say('origin  ' + g.remote + ' (fetch)'); say('origin  ' + g.remote + ' (push)'); } return; }
        if (a[1] === 'add' && a[2] && a[3]) { if (g.remote) return err('error: remote origin already exists.'); g.remote = a[3]; explain('git remote'); return; }
        return err('usage: git remote add origin https://github.com/you/bakery-site.git');
      }
      if (sub === 'push') {
        if (!g.remote) return err("fatal: No configured push destination.\nAdd one with: git remote add origin https://github.com/you/bakery-site.git");
        const b = a.filter((x) => x[0] !== '-' && x !== 'push' && x !== 'origin')[0] || g.head;
        if (!g.br[b]) return err("error: src refspec " + b + " does not match any (make a commit first)");
        const isNew = !g.rb[b];
        if (g.rb[b] === g.br[b]) return say('Everything up-to-date');
        g.rb[b] = g.br[b];
        say('Enumerating objects: 5, done.\nWriting objects: 100% (5/5), done.\nTo ' + g.remote);
        ok(isNew ? ' * [new branch]      ' + b + ' -> ' + b : '   ' + hex() + '..' + g.br[b] + '  ' + b + ' -> ' + b);
        if (st.vercel.linked && b === 'main') push('ln-claude', '▲ Vercel: new commit on main detected → building and deploying to production…');
        explain('git push'); return;
      }
      if (sub === 'pull') return say('Already up to date.');
      if (sub === 'diff') {
        const wf = workFiles(st); const ch = diffSets(g.idx, wf).filter((x) => x.f in g.idx);
        if (!ch.length) return dim('(no unstaged changes)');
        ch.forEach((x) => {
          say('diff --git a/' + x.f + ' b/' + x.f);
          const o = (g.idx[x.f] || '').split('\n'), n = (wf[x.f] || '').split('\n');
          o.filter((l) => n.indexOf(l) < 0).forEach((l) => err('- ' + l));
          n.filter((l) => o.indexOf(l) < 0).forEach((l) => ok('+ ' + l));
        });
        return;
      }
      err("git: '" + sub + "' is not supported in this simulator. Try: git status");
    };

    C.vercel = (a) => {
      const v = st.vercel;
      if (a[0] === '--version' || a[0] === '-v') return say('Vercel CLI 39.2.0');
      if (a[0] === 'login') { v.login = true; say('? Log in to Vercel  Continue with GitHub'); ok('> Success! GitHub authentication complete for you@example.com'); explain('vercel login'); return; }
      if (!v.login) return err('Error: No existing credentials found. Please run `vercel login`.');
      if (a[0] === 'env') {
        if (a[1] === 'add' && a[2]) { v.env[a[2]] = true; say('? What\'s the value of ' + a[2] + '? ****************'); say('? Add ' + a[2] + ' to which Environments? Production, Preview, Development'); ok('✅ Added Environment Variable ' + a[2] + ' to Project bakery-site'); explain('vercel env'); return; }
        if (a[1] === 'ls') { const ks = Object.keys(v.env); if (!ks.length) return say('No Environment Variables found.'); ks.forEach((k) => say(' ' + k + '   Encrypted   Production, Preview')); return; }
        return err('usage: vercel env add <NAME>   |   vercel env ls');
      }
      if (!st.fs[st.cwd + '/index.html'] && !st.fs[st.cwd + '/package.json']) return err('Error: nothing to deploy here. cd into your project folder first.');
      const prod = a.indexOf('--prod') >= 0;
      if (!v.linked) { say('? Set up and deploy "' + short(st.cwd) + '"? yes'); say('? Which scope should contain your project? your-team'); say('? Link to existing project? no'); say("? What's your project's name? " + base(st.cwd)); ok('🔗  Linked to you/' + base(st.cwd)); v.linked = true; }
      say('🔍  Inspect: https://vercel.com/you/' + base(st.cwd) + '/' + hex());
      if (prod) { v.prod = true; v.deployed = true; ok('✅  Production: https://' + base(st.cwd) + '.vercel.app [4s]'); explain('vercel --prod'); }
      else { v.deployed = true; ok('✅  Preview: https://' + base(st.cwd) + '-' + hex().slice(0, 5) + '-you.vercel.app [3s]'); say('📝  To deploy to production, run `vercel --prod`'); explain('vercel'); }
    };

    C.curl = (a) => {
      const url = a.find((x) => /^https?:\/\//.test(x)) || '';
      if (url.indexOf('api.anthropic.com/v1/messages') < 0) return dim('(In this simulator, curl only talks to https://api.anthropic.com/v1/messages)');
      const headers = {}; a.forEach((x, i) => { if ((x === '-H' || x === '--header') && a[i + 1]) { const s = a[i + 1]; const k = s.slice(0, s.indexOf(':')).trim().toLowerCase(); headers[k] = s.slice(s.indexOf(':') + 1).trim(); } });
      const di = a.findIndex((x) => x === '-d' || x === '--data'); let body = null;
      const fail = (code, type, msg) => { st.api.err++; push('ln-err', JSON.stringify({ type: 'error', error: { type, message: msg } }, null, 2)); dim('HTTP ' + code); };
      if (!headers['x-api-key']) return fail(401, 'authentication_error', ctx.L === 'he' ? 'x-api-key header is required (המפתח ריק. הריצו קודם export)' : 'x-api-key header is required (your key is empty — run export first)');
      if (!/^sk-ant-/.test(headers['x-api-key'])) return fail(401, 'authentication_error', 'invalid x-api-key');
      if (!headers['anthropic-version']) return fail(400, 'invalid_request_error', 'anthropic-version: header is required');
      try { body = JSON.parse(di >= 0 ? a[di + 1] : '{}'); } catch (e) { return fail(400, 'invalid_request_error', 'There was an error parsing the body: it is not valid JSON'); }
      if (!body.model) return fail(400, 'invalid_request_error', 'model: Field required');
      if (!MODELS.some((m) => m.id === body.model)) return fail(404, 'not_found_error', 'model: ' + body.model);
      if (!body.max_tokens) return fail(400, 'invalid_request_error', 'max_tokens: Field required');
      if (!Array.isArray(body.messages) || !body.messages.length) return fail(400, 'invalid_request_error', 'messages: Field required');
      const q = String(body.messages[body.messages.length - 1].content || '');
      const reply = /hour|open|שעות|פתוח/i.test(q) ? 'Bakery Nur is open Sunday to Thursday 7:00-19:00 and Friday 7:00-14:00. We are closed on Saturday.' : 'Hello! I am Claude. How can I help you today?';
      const inT = Math.ceil(JSON.stringify(body.messages).length / 4) + (body.system ? Math.ceil(String(body.system).length / 4) : 0);
      const outT = Math.ceil(reply.length / 4);
      st.api.ok++;
      ok(JSON.stringify({ id: 'msg_01' + hex() + hex(), type: 'message', role: 'assistant', model: body.model, content: [{ type: 'text', text: reply }], stop_reason: 'end_turn', usage: { input_tokens: inT, output_tokens: outT } }, null, 2));
      explain('curl');
    };

    function claudeTurn(prompt, oneShot) {
      st.claude.ran++;
      const p = prompt.toLowerCase();
      const root = HOME + '/bakery-site';
      const files = children(st, st.cwd).filter((x) => !st.fs[x].d).map(base).filter((n) => n[0] !== '.');
      push('ln-claude', '> ' + prompt);
      if (p.trim() === '/init') {
        st.fs[st.cwd + '/CLAUDE.md'] = { c: '# Project: Bakery Nur website\n\n- Plain HTML + CSS, no build step\n- Keep the design simple and mobile friendly\n- Prices are in shekels (₪)\n- Never commit the .env file' };
        push('ln-claude', '⏺ I read the project and wrote CLAUDE.md with notes for future sessions:'); dim('   ⎿ project overview, coding style, and a rule about the .env file');
        return;
      }
      if (p.trim() === '/mcp') { const ks = Object.keys(st.claude.mcp); push('ln-claude', ks.length ? '⏺ Connected MCP servers: ' + ks.join(', ') : '⏺ No MCP servers yet. Add one with: claude mcp add ...'); return; }
      if (p.trim() === '/help') { dim('  /init   write a CLAUDE.md file with project notes\n  /mcp    show connected MCP servers\n  /exit   leave Claude Code'); return; }
      // Team brain: Claude reads CLAUDE.md and the template, then writes the report
      if (st.cwd.indexOf(HOME + '/brain') === 0 && /report|דוח/.test(p)) {
        const b = HOME + '/brain';
        push('ln-claude', '⏺ Read(CLAUDE.md)'); dim('   ⎿ team rules: client language, brand voice, facts only from this folder');
        push('ln-claude', '⏺ Read(prompts/weekly-report.md)'); dim('   ⎿ template with 4 sections');
        push('ln-claude', '⏺ Read(clients/acme/notes.md)'); dim('   ⎿ 3 notes from this week');
        st.fs[b + '/reports'] = { d: true };
        st.fs[b + '/reports/2026-11-acme-weekly.md'] = { c: '# Acme Bakery — weekly report\n\n1. What we did: new menu photos approved.\n2. Decisions: add a gluten-free day.\n3. Next steps: Passover campaign plan — Studio, by Thursday.\n4. Questions: which day for gluten-free?' };
        push('ln-claude', '⏺ Write(reports/2026-11-acme-weekly.md)'); ok('   ⎿ +7 lines, in the team template and brand voice');
        push('ln-claude', '⏺ Done. One open question for Dana is listed at the end. Review it, then commit and push so the team sees it.');
        explain('brain'); return;
      }
      // QA with a browser (Playwright MCP) and parallel testers
      if (/(localhost|https?:|website|אתר)/.test(p) && /(test|check|explore|בדוק|בדיקה)/.test(p)) {
        if (!st.claude.mcp.playwright) { push('ln-claude', '⏺ I need a browser for this. Type /exit and add Playwright’s MCP server:\n   claude mcp add playwright npx @playwright/mcp@latest'); return; }
        push('ln-claude', '⏺ playwright · browser_navigate http://localhost:5173/order');
        push('ln-claude', '⏺ playwright · browser_snapshot'); dim('   ⎿ form: name, phone, product, quantity, "Send order"');
        push('ln-claude', '⏺ playwright · browser_type name "Dana", quantity "2" (phone left empty)');
        push('ln-claude', '⏺ playwright · browser_click "Send order"');
        push('ln-warn', '   ⎿ BUG: the order was accepted with an empty phone number — staff cannot call back');
        push('ln-claude', '⏺ playwright · browser_type quantity "-3"'); ok('   ⎿ error message shown ✓');
        push('ln-claude', '⏺ playwright · browser_take_screenshot'); dim('   ⎿ saved empty-phone.png');
        push('ln-claude', '⏺ Found 1 high-severity bug, 2 checks passed. The bug report has steps, expected result, actual result and a screenshot.');
        st.claude.qa = true; explain('qa'); return;
      }
      if (/parallel|במקביל/.test(p)) {
        push('ln-claude', '⏺ Starting 3 testers in parallel (subagents): mobile · Hebrew · accessibility');
        dim('   ⎿ mobile (375px): the "Send order" button is hidden behind the cookie banner — medium');
        dim('   ⎿ Hebrew (RTL): price and ₪ sign appear in the wrong order in the cart — low');
        dim('   ⎿ accessibility: the phone field has no label; placeholder contrast 2.8:1 — medium');
        st.fs[st.cwd + '/qa'] = { d: true };
        st.fs[st.cwd + '/qa/bug-reports.md'] = { c: '# Bug reports\n1. HIGH — empty phone accepted\n2. MEDIUM — Send button hidden on mobile\n3. MEDIUM — phone field has no label\n4. LOW — RTL price order in cart' };
        push('ln-claude', '⏺ Write(qa/bug-reports.md)'); ok('   ⎿ 4 issues, sorted by severity');
        st.claude.parallel = true; explain('parallel'); return;
      }
      if (/(write|create|כתוב).*(test|בדיקה)/.test(p)) {
        st.fs[st.cwd + '/tests'] = { d: true };
        st.fs[st.cwd + '/tests/order-form.spec.ts'] = { c: "import { test, expect } from '@playwright/test';\n\ntest('empty phone is rejected', async ({ page }) => {\n  await page.goto('/order');\n  await page.getByLabel('Name').fill('Dana');\n  await page.getByRole('button', { name: 'Send order' }).click();\n  await expect(page.getByText('Please add a phone number')).toBeVisible();\n});" };
        push('ln-claude', '⏺ Write(tests/order-form.spec.ts)'); ok('   ⎿ 3 tests: valid order, negative quantity, empty phone');
        push('ln-claude', '⏺ The empty-phone test will fail until the bug is fixed. That is the point: it proves the bug, then guards against it coming back.');
        return;
      }
      // Design tools through MCP (Figma, Paper)
      if (/figma\.com/.test(p)) {
        if (!st.claude.mcp.figma) { push('ln-claude', '⏺ I can’t open Figma links yet. Connect Figma’s MCP server first: type /exit, then run\n   claude mcp add --transport http figma https://mcp.figma.com/mcp'); return; }
        const node = ((prompt.match(/node-id=([\w-]+)/) || [])[1] || '12-34').replace('-', ':');
        push('ln-claude', '⏺ figma · get_design_context (node ' + node + ')');
        dim('   ⎿ Frame "Menu card": photo, title, price, "Order" button. Uses variables color/brand, color/surface, radius/md, space/4');
        push('ln-claude', '⏺ figma · get_variable_defs');
        dim('   ⎿ color/brand #8A4B08 · color/surface #FFF8EE · radius/md 12 · space/4 16');
        st.fs[st.cwd + '/src'] = st.fs[st.cwd + '/src'] || { d: true };
        st.fs[st.cwd + '/src/components'] = st.fs[st.cwd + '/src/components'] || { d: true };
        st.fs[st.cwd + '/src/tokens.css'] = { c: ':root {\n  --color-brand: #8a4b08;\n  --color-surface: #fff8ee;\n  --radius-md: 12px;\n  --space-4: 16px;\n}' };
        st.fs[st.cwd + '/src/components/MenuCard.jsx'] = { c: 'export function MenuCard({ title, price, image }) {\n  return (\n    <article className="menu-card">\n      <img src={image} alt={title} />\n      <h3>{title}</h3>\n      <p className="price">₪{price}</p>\n      <button>Order</button>\n    </article>\n  );\n}\n/* styles use var(--color-brand), var(--radius-md), var(--space-4) */' };
        push('ln-claude', '⏺ Write(src/tokens.css)'); ok('   ⎿ +6 lines: CSS variables made from the Figma variables');
        push('ln-claude', '⏺ Write(src/components/MenuCard.jsx)'); ok('   ⎿ +11 lines, styled with your tokens — no hard-coded colours');
        push('ln-claude', '⏺ Done. Shall I compare it with a Figma screenshot to check the details?');
        explain('figma'); return;
      }
      if (/compare|screenshot|השוו|השווה|צילום/.test(p)) {
        if (!st.fs[st.cwd + '/src/components/MenuCard.jsx']) { push('ln-claude', '⏺ There is nothing to compare yet. First build the component from the Figma frame.'); return; }
        push('ln-claude', '⏺ figma · get_screenshot (node 12:34)'); dim('   ⎿ captured the design');
        push('ln-claude', '⏺ Comparing the design with the rendered component…');
        push('ln-warn', '   ⎿ 2 differences: button corners 8px (design 12px) · price weight 400 (design 700)');
        push('ln-claude', '⏺ Edit(src/components/MenuCard.jsx)'); ok('   ⎿ fixed both: corners use var(--radius-md), price is bold');
        push('ln-claude', '⏺ It now matches the frame.');
        st.claude.compared = true; explain('compare'); return;
      }
      if (/\bpaper\b/.test(p)) {
        if (!st.claude.mcp.paper) { push('ln-claude', '⏺ Paper is not connected. Open Paper Desktop (it runs Paper’s MCP server) and add it to Claude Code, following paper.design/docs/mcp.'); return; }
        push('ln-claude', '⏺ paper · get_screenshot'); dim('   ⎿ read the selected frame on the Paper canvas');
        push('ln-claude', '⏺ paper · write_html'); ok('   ⎿ a new frame "Landing v2" appeared on the canvas');
        push('ln-claude', '⏺ Done. I kept your brand colours and made the hero shorter. Check the canvas.');
        return;
      }
      push('ln-claude', '⏺ Let me look at the project first.');
      dim('   ⎿ Read ' + (files.slice(0, 3).join(', ') || 'files') + (st.fs[st.cwd + '/CLAUDE.md'] ? ', CLAUDE.md' : ''));
      const idx = st.fs[st.cwd + '/index.html'];
      if (/hour|open|שעות/.test(p) && idx) {
        idx.c = idx.c.replace('</body>', '  <section id="hours">\n    <h2>Opening hours</h2>\n    <p>Sun–Thu 7:00–19:00 · Fri 7:00–14:00 · Sat closed</p>\n  </section>\n</body>');
        push('ln-claude', '⏺ Edit(index.html)'); ok('   ⎿ +4 lines: new "Opening hours" section after the menu');
        push('ln-claude', '⏺ Done. I added the opening hours. Shall I also add them to the page footer?');
      } else if (/contact|form|whatsapp|טופס|צור קשר/.test(p) && idx) {
        idx.c = idx.c.replace('</body>', '  <section id="contact">\n    <h2>Contact</h2>\n    <a href="https://wa.me/972500000000">Order on WhatsApp</a>\n  </section>\n</body>');
        push('ln-claude', '⏺ Edit(index.html)'); ok('   ⎿ +4 lines: contact section with a WhatsApp link');
        push('ln-claude', '⏺ Done. Replace the example phone number with the real one before you publish.');
      } else if (/commit|save|שמור/.test(p) && st.git) {
        push('ln-claude', '⏺ Bash(git add . && git commit -m "Update site content")');
        push('ln-warn', '   ? Allow this command? → Yes (you approved it)');
        gitAddAll(st); const ch = diffSets(headSnap(st.git), st.git.idx);
        if (ch.length) { const c = gitCommit(st, 'Update site content'); ok('   ⎿ [' + st.git.head + ' ' + c.id + '] Update site content'); } else dim('   ⎿ nothing to commit, working tree clean');
        push('ln-claude', '⏺ Committed. Run git push when you want it online.');
      } else if (/test|בדיק/.test(p)) {
        push('ln-claude', '⏺ Bash(npm test)'); ok('   ⎿ 1 passed, 0 failed');
        push('ln-claude', '⏺ All tests pass.');
      } else if (/explain|what|how|הסבר|מה|איך/.test(p)) {
        push('ln-claude', '⏺ This is a small static website:');
        dim('   • index.html — the page content (menu, text)\n   • style.css — colours and fonts\n   • README.md — a short description\n   There is no server code, so it can be hosted for free on Vercel or GitHub Pages.');
      } else {
        push('ln-claude', '⏺ Here is my plan:'); dim('   1. Find where this belongs in the code\n   2. Make a small, careful change\n   3. Check the result and tell you what changed');
        push('ln-claude', '⏺ (Simulation) In real Claude Code I would now edit the files and show you each change for approval.');
      }
      if (oneShot) dim('(claude -p prints one answer and exits)');
      explain('claude');
      if (!st.fs[root]) return;
    }
    C.claude = (a, raw) => {
      if (a[0] === '--version' || a[0] === '-v') return say('2.1.0 (Claude Code) — simulated');
      if (a[0] === 'mcp') {
        if (a[1] === 'list') { const ks = Object.keys(st.claude.mcp); if (!ks.length) return say('No MCP servers configured.'); ks.forEach((k) => say(k + ': ' + st.claude.mcp[k] + ' - ✓ Connected')); return; }
        if (a[1] === 'add') {
          const rest = a.slice(2).filter((x, i, arr) => !(x === '--transport' || arr[i - 1] === '--transport' || x === '--scope' || arr[i - 1] === '--scope'));
          const name = rest[0]; const target = rest.slice(1).join(' ');
          if (!name || !target) return err('usage: claude mcp add --transport http <name> <url>');
          st.claude.mcp[name] = target; ok('Added MCP server ' + name + ' → ' + target);
          push('ln-dim', '↳ ' + (ctx.L === 'he' ? 'עכשיו ל-Claude יש כלים חדשים מהשרת הזה.' : 'Claude now has new tools from this server.'), ctx.L === 'he');
          return;
        }
        return err('usage: claude mcp add | claude mcp list');
      }
      if (a[0] === '-p' || a[0] === '--print') { if (!a[1]) return err('usage: claude -p "your question"'); claudeTurn(a.slice(1).join(' '), true); return; }
      push('ln-claude', '╭─────────────────────────────────────╮\n│ ✻ Welcome to Claude Code (simulated) │\n╰─────────────────────────────────────╯');
      dim('  ' + short(st.cwd) + '\n  Type a request, /init, /mcp, or /exit');
      st.claude.mode = true;
      if (a.length) claudeTurn(a.join(' '));
    };

    function exec(line) {
      line = line.trim(); if (!line) return;
      st.hist.unshift(line); st.hi = -1;
      if (st.claude.mode) {
        push('ln-cmd', '', false); lines[lines.length - 1].html = `<span class="ps">&gt;</span> ${esc(line)}`;
        if (line === '/exit' || line === 'exit' || line === 'quit') { st.claude.mode = false; dim('Bye! Back to the normal terminal.'); }
        else { st.ran.push('claude ' + line); claudeTurn(line); }
        paint(); return;
      }
      push('ln-cmd', ''); lines[lines.length - 1].html = `<span class="ps">${esc(short(st.cwd))} $</span> ${esc(line)}`;
      const a = tokenize(line, st.env);
      const cmd = a.shift();
      st.ran.push([cmd].concat(a).join(' '));
      const fn = C[cmd];
      if (fn) { try { fn(a, line); } catch (e) { err('simulator error: ' + e.message); } }
      else if (cmd === 'sudo') err('No need for sudo in this simulator 🙂');
      else err('command not found: ' + cmd + '   (type "help" to see what works here)');
      paint();
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; exec(v); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); st.hi = Math.min(st.hist.length - 1, st.hi + 1); if (st.hist[st.hi]) input.value = st.hist[st.hi]; }
      if (e.key === 'ArrowDown') { e.preventDefault(); st.hi = Math.max(-1, st.hi - 1); input.value = st.hi >= 0 ? st.hist[st.hi] : ''; }
    });
    $('[data-treset]', el).addEventListener('click', () => { st = initTerm(scn); lines.length = 0; celebrated = false; latched = new Set(); intro(); paint(); });
    function intro() {
      dim(ctx.L === 'he' ? '# ' + ws(ctx, 'safe') : '# ' + ws(ctx, 'safe'));
      dim('# Type "help" to see the commands this simulator understands.');
    }
    intro(); paint();
  }
  function terminalHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'terminal', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'terminal'), `<button type="button" class="btn small" data-treset>${icon('reset')}${esc(ws(ctx, 'reset'))}</button>`)}
      <div class="w-body">
        ${(cfg.tasks || []).length ? `<div><span class="eyebrow">${esc(ws(ctx, 'mission'))}</span><ul class="missions" style="margin-top:8px"></ul></div>` : ''}
        <div class="term"><div class="out" aria-live="polite"></div><form autocomplete="off"><span class="ps ps-live"></span><input type="text" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="${esc(ws(ctx, 'typeHere'))}" placeholder="${esc(ws(ctx, 'typeHere'))}" enterkeyhint="go"><button type="submit">${esc(ws(ctx, 'run'))}</button></form></div>
        <div class="chips" aria-label="${esc(ws(ctx, 'tapHint'))}"></div>
        <p class="w-note">${esc(ws(ctx, 'tapHint'))}</p>
        ${cfg.graph ? '<div class="gitgraph" aria-label="git graph"></div>' : ''}
        <div class="callout tip term-done" hidden>${icon('check')}<div class="ct"><b class="lbl">${esc(ws(ctx, 'missionDone'))}</b><div>${md(cfg.done ? ctx.tx(cfg.done) : '')}</div></div></div>
      </div></div>`;
  }

  /* ======================================================== NEXT WORD */
  function nextwordHTML(b, ctx) {
    return `<div class="widget">${head(ctx, 'dice', ws(ctx, 'nextword'))}<div class="w-body">
      <p class="sentence" dir="auto"><span class="nw-pre"></span> <span class="blank">___</span></p>
      <div class="probs"></div>
      <label class="field"><span class="spread"><span>${esc(ws(ctx, 'temp'))}</span><span class="tnum nw-tv"></span></span><input type="range" min="0.1" max="2" step="0.1" value="0.7" class="nw-t" aria-label="${esc(ws(ctx, 'temp'))}"><span class="spread w-note"><span>${esc(ws(ctx, 'predictable'))}</span><span>${esc(ws(ctx, 'creative'))}</span></span></label>
      <p class="nw-explain muted" style="font-size:.94rem"></p>
      <div class="row"><button type="button" class="btn primary nw-go">${icon('play')}${esc(ws(ctx, 'generate'))}</button><button type="button" class="btn nw-new">${esc(ws(ctx, 'another'))}</button></div>
      <p class="w-note nw-picks"></p></div></div>`;
  }
  function nextwordMount(el, b, ctx) {
    const sets = (b.cfg && b.cfg.sets) || [];
    let si = 0; let counts = {};
    const T = $('.nw-t', el);
    function dist() {
      const s = ctx.tx(sets[si]); const tv = +T.value;
      const logits = s.w.map((x) => Math.log(x[1]) / tv);
      const mx = Math.max.apply(null, logits); const ex = logits.map((l) => Math.exp(l - mx)); const sum = ex.reduce((a, x) => a + x, 0);
      return s.w.map((x, i) => ({ word: x[0], p: ex[i] / sum }));
    }
    function paint(picked) {
      const s = ctx.tx(sets[si]); const d = dist();
      $('.nw-pre', el).textContent = s.pre;
      $('.blank', el).textContent = picked || '___';
      $('.nw-tv', el).textContent = (+T.value).toFixed(1);
      $('.probs', el).innerHTML = d.map((x) => `<div class="prob${picked === x.word ? ' picked' : ''}"><b dir="auto">${esc(x.word)}</b><span class="bar"><i style="width:${(x.p * 100).toFixed(1)}%"></i></span><span class="tnum">${Math.round(x.p * 100)}%</span></div>`).join('');
      const tv = +T.value;
      $('.nw-explain', el).textContent = tv < 0.5 ? ws(ctx, 'tlow') : tv > 1.2 ? ws(ctx, 'thigh') : ws(ctx, 'tmid');
      const ks = Object.keys(counts);
      $('.nw-picks', el).textContent = ks.length ? ws(ctx, 'picks') + ': ' + ks.map((k) => k + ' ×' + counts[k]).join(' · ') : '';
    }
    T.addEventListener('input', () => paint());
    $('.nw-go', el).addEventListener('click', () => {
      const d = dist(); let r = Math.random(), w = d[d.length - 1].word;
      for (const x of d) { if (r < x.p) { w = x.word; break; } r -= x.p; }
      counts[w] = (counts[w] || 0) + 1; paint(w);
    });
    $('.nw-new', el).addEventListener('click', () => { si = (si + 1) % sets.length; counts = {}; paint(); });
    paint();
  }

  /* ======================================================== TOKENIZER */
  function tokenize4(text) {
    const parts = text.match(/\s*[\p{L}\p{M}\p{N}]+|\s*[^\s\p{L}\p{M}\p{N}]|\s+/gu) || [];
    const out = [];
    parts.forEach((p) => {
      const isLatin = /^[\s\x00-\x7F]*$/.test(p);
      const size = isLatin ? 4 : 2;
      const lead = (p.match(/^\s*/) || [''])[0]; const core = p.slice(lead.length);
      if (core.length <= size + 1) { out.push(p); return; }
      let first = true;
      for (let i = 0; i < core.length; i += size) { out.push((first ? lead : '') + core.slice(i, i + size)); first = false; }
    });
    return out;
  }
  function tokenizerHTML(b, ctx) {
    const sample = ctx.tx(b.cfg && b.cfg.sample) || '';
    return `<div class="widget">${head(ctx, 'layers', ws(ctx, 'tokenizer'))}<div class="w-body">
      <label class="field">${esc(ws(ctx, 'yourText'))}<textarea class="tk-in" dir="auto" style="min-height:80px">${esc(sample)}</textarea></label>
      <div class="toks tk-out" dir="auto"></div>
      <div class="grid2"><div><div class="result-num tnum tk-n"></div><span class="muted">${esc(ws(ctx, 'tokens'))}</span></div><div class="tnum muted tk-meta" style="align-self:end"></div></div>
      <div class="meter"><div class="bar"><i class="tk-bar"></i></div><span class="w-note tk-win"></span></div>
      <p class="w-note">${esc(ws(ctx, 'tokNote'))}</p></div></div>`;
  }
  function tokenizerMount(el, b, ctx) {
    const ta = $('.tk-in', el); const colors = ['var(--l1-soft)', 'var(--l2-soft)', 'var(--l3-soft)', 'var(--lx-soft)', 'var(--surface-2)'];
    function paint() {
      const toks = tokenize4(ta.value);
      $('.tk-out', el).innerHTML = toks.map((x, i) => `<span style="background:${colors[i % 5]}">${esc(x.replace(/ /g, '·'))}</span>`).join('');
      $('.tk-n', el).textContent = toks.length.toLocaleString();
      const words = (ta.value.match(/[\p{L}\p{N}]+/gu) || []).length;
      $('.tk-meta', el).textContent = ta.value.length + ' ' + ws(ctx, 'chars') + ' · ' + words + ' ' + ws(ctx, 'words');
      const pct = toks.length / 1000000 * 100;
      $('.tk-bar', el).style.width = Math.max(0.6, Math.min(100, pct * 2000)) + '%';
      $('.tk-win', el).textContent = (pct < 0.001 ? '<0.001' : pct.toFixed(3)) + '% ' + ws(ctx, 'ofWindow');
    }
    ta.addEventListener('input', paint); paint();
  }

  /* ======================================================== PROMPT BUILDER */
  const PART_COL = ['var(--l1-soft)', 'var(--l2-soft)', 'var(--l3-soft)', 'var(--lx-soft)', 'var(--good-soft)', 'var(--warn-soft)'];
  function promptbuilderHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'wand', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'promptbuilder'))}<div class="w-body">
      <span class="eyebrow">${esc(ws(ctx, 'ingredients'))}</span>
      <div class="toggles pb-t">${(cfg.parts || []).map((p, i) => `<button type="button" aria-pressed="false" data-i="${i}">${icon('plus')}${esc(ctx.tx(p.label))}</button>`).join('')}</div>
      <span class="eyebrow">${esc(ws(ctx, 'yourPrompt'))}</span>
      <div class="assembled pb-out" dir="auto"></div>
      <div class="meter"><div class="spread"><span>${esc(ws(ctx, 'quality'))}</span><b class="tnum pb-q"></b></div><div class="bar"><i class="pb-bar"></i></div><span class="w-note pb-miss"></span></div>
      <div class="row"><button type="button" class="btn small pb-copy">${icon('copy')}${esc(ws(ctx, 'copy'))}</button><a class="btn small pb-open" target="_blank" rel="noopener">${icon('external')}${esc(ws(ctx, 'openClaude'))}</a><button type="button" class="btn small primary pb-ask" hidden>${icon('chat')}${esc(ws(ctx, 'askHere'))}</button></div>
      <div class="pb-ans" hidden></div></div></div>`;
  }
  function promptbuilderMount(el, b, ctx) {
    const cfg = b.cfg || {}; const parts = cfg.parts || []; const on = new Set(cfg.start || []);
    const build = () => {
      const segs = [];
      parts.forEach((p, i) => { if (p.always || on.has(i)) segs.push({ i, text: ctx.tx(p.text) }); });
      return segs;
    };
    const text = () => build().map((s) => s.text).join('\n\n');
    function paint() {
      $$('.pb-t button', el).forEach((bt) => { const i = +bt.dataset.i; const p = on.has(i) || parts[i].always; bt.setAttribute('aria-pressed', String(p)); bt.innerHTML = icon(p ? 'check' : 'plus') + esc(ctx.tx(parts[i].label)); });
      $('.pb-out', el).innerHTML = build().map((s) => `<span class="seg" style="background:${PART_COL[s.i % 6]}">${esc(s.text)}</span>`).join('\n\n');
      const optional = parts.filter((p) => !p.always); const have = optional.filter((p, k) => on.has(parts.indexOf(p))).length;
      const q = Math.round(((parts.length - optional.length) + have) / parts.length * 100);
      $('.pb-q', el).textContent = q + '%'; $('.pb-bar', el).style.width = q + '%';
      $('.pb-bar', el).style.background = q >= 85 ? 'var(--good)' : q >= 50 ? 'var(--warn)' : 'var(--bad)';
      const miss = parts.filter((p, i) => !p.always && !on.has(i)).map((p) => ctx.tx(p.label));
      $('.pb-miss', el).textContent = miss.length ? ws(ctx, 'missing') + ': ' + miss.join(', ') : ws(ctx, 'allIn');
      $('.pb-open', el).href = 'https://claude.ai/new?q=' + encodeURIComponent(text());
    }
    $$('.pb-t button', el).forEach((bt) => bt.addEventListener('click', () => { const i = +bt.dataset.i; if (parts[i].always) return; if (on.has(i)) on.delete(i); else on.add(i); paint(); }));
    $('.pb-copy', el).addEventListener('click', async () => { const ok = await ctx.copyText(text()); ctx.toast(ok ? ctx.t('copied') : ctx.t('copyFailed')); });
    const ask = $('.pb-ask', el); const ans = $('.pb-ans', el);
    const showAsk = () => { ask.hidden = !ctx.Ext.sample; };
    showAsk(); setTimeout(showAsk, 1500); setTimeout(showAsk, 5000);
    ask.addEventListener('click', async () => {
      if (!ctx.Ext.sample) return;
      ans.hidden = false; ans.innerHTML = `<div class="msg a thinking">${esc(ws(ctx, 'thinking'))}</div>`;
      const bubble = $('.msg', ans);
      try {
        const r = await ctx.Ext.sample(text() + (ctx.L === 'he' ? '\n\n(ענה בעברית, בקצרה.)' : '\n\n(Keep the answer short.)'), { modelTier: 'quick', cache: false, onText: ({ text: tt }) => { bubble.classList.remove('thinking'); bubble.textContent = tt; } });
        bubble.classList.remove('thinking'); bubble.textContent = r.text;
      } catch (e) { bubble.classList.remove('thinking'); bubble.textContent = e && e.code === 'rate_limited' ? ws(ctx, 'errRate') : ws(ctx, 'errNo'); if (e && e.code === 'not_granted') { ask.hidden = true; } }
    });
    paint();
  }

  /* ======================================================== CHAT */
  function chatHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'chat', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'chat'), `<button type="button" class="btn small ch-clear">${esc(ws(ctx, 'clear'))}</button>`)}<div class="w-body">
      <p class="w-note ch-status"></p>
      <div class="chatlog" aria-live="polite"></div>
      <form class="chat-form"><label class="sr">${esc(ws(ctx, 'placeholder'))}</label><textarea class="ch-in" dir="auto" placeholder="${esc(ws(ctx, 'placeholder'))}" style="min-height:76px">${esc(ctx.tx(cfg.starter) || '')}</textarea>
      <div class="row"><button type="submit" class="btn primary">${icon('next', 'flip')}${esc(ws(ctx, 'send'))}</button><a class="btn ch-open" target="_blank" rel="noopener">${icon('external')}${esc(ws(ctx, 'openClaude'))}</a></div></form></div></div>`;
  }
  function chatMount(el, b, ctx) {
    const cfg = b.cfg || {}; const log = $('.chatlog', el); const ta = $('.ch-in', el); const msgs = [];
    const open = $('.ch-open', el);
    const upd = () => { open.href = 'https://claude.ai/new?q=' + encodeURIComponent(ta.value || ctx.tx(cfg.starter) || ''); $('.ch-status', el).textContent = ctx.Ext.sample ? ws(ctx, 'liveOn') : ws(ctx, 'liveOff'); };
    ta.addEventListener('input', upd); upd(); setTimeout(upd, 1500); setTimeout(upd, 5000);
    const add = (cls, text) => { const d = document.createElement('div'); d.className = 'msg ' + cls; d.setAttribute('dir', 'auto'); d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
    $('.ch-clear', el).addEventListener('click', () => { msgs.length = 0; log.innerHTML = ''; });
    $('form', el).addEventListener('submit', async (e) => {
      e.preventDefault(); const text = ta.value.trim(); if (!text) return;
      add('u', text); ta.value = ''; upd();
      const bubble = add('a thinking', ws(ctx, 'thinking'));
      if (!ctx.Ext.sample) {
        setTimeout(() => { bubble.classList.remove('thinking'); bubble.textContent = ctx.tx(cfg.demo) || '…'; add('sys', ws(ctx, 'liveOff')); }, 700);
        return;
      }
      const guide = ctx.tx(cfg.system) || '';
      msgs.push({ role: 'user', content: (msgs.length === 0 && guide ? guide + '\n\n---\n\n' : '') + text });
      try {
        const r = await ctx.Ext.sample(msgs.slice(-12), { modelTier: 'quick', cache: false, onText: ({ text: tt }) => { bubble.classList.remove('thinking'); bubble.textContent = tt; log.scrollTop = log.scrollHeight; } });
        bubble.classList.remove('thinking'); bubble.textContent = r.text; msgs.push({ role: 'assistant', content: r.text });
      } catch (err) {
        msgs.pop(); bubble.classList.remove('thinking');
        bubble.textContent = err && err.code === 'rate_limited' ? ws(ctx, 'errRate') : (ctx.tx(cfg.demo) || ws(ctx, 'errNo'));
        if (!err || err.code !== 'rate_limited') add('sys', ws(ctx, 'errNo'));
      }
    });
  }

  /* ======================================================== MCP */
  const MCP_SERVERS = [
    { k: 'filesystem', name: 'Filesystem', ic: 'folder', prim: 'tools + resources', what: { en: 'read and write files in one folder', he: 'קריאה וכתיבה של קבצים בתיקייה אחת' }, cfg: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/you/Documents/bakery'] } },
    { k: 'github', name: 'GitHub', ic: 'branch', prim: 'tools', what: { en: 'issues, pull requests, code', he: 'משימות, Pull Requests, קוד' }, cfg: { type: 'http', url: 'https://api.githubcopilot.com/mcp/' } },
    { k: 'postgres', name: 'Database', ic: 'server', prim: 'tools + resources', what: { en: 'look up orders in a database (read-only)', he: 'חיפוש הזמנות במסד נתונים (קריאה בלבד)' }, cfg: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://readonly@localhost/shop'] } },
    { k: 'fetch', name: 'Web fetch', ic: 'globe', prim: 'tools', what: { en: 'download a web page as text', he: 'הורדת דף אינטרנט כטקסט' }, cfg: { command: 'uvx', args: ['mcp-server-fetch'] } },
    { k: 'crm', name: 'Your CRM (custom)', ic: 'users', prim: 'tools + prompts', what: { en: 'a server you build for a client', he: 'שרת שאתם בונים בשביל לקוח' }, cfg: { type: 'http', url: 'https://mcp.example-client.com/mcp' } }
  ];
  function mcpSVG(ctx, sel) {
    const list = MCP_SERVERS.filter((s) => sel.has(s.k));
    const W = 340, rowH = 52, H = Math.max(200, 40 + list.length * rowH);
    const hostY = H / 2;
    const rtl = ctx.L === 'he';
    const tx = (x, y, s, o) => `<text x="${x}" y="${y}" text-anchor="${o && o.a || 'middle'}" font-size="${o && o.fs || 12}" font-weight="${o && o.fw || 600}" fill="${o && o.c || 'var(--ink)'}"${rtl ? ' direction="rtl"' : ''}>${esc(s)}</text>`;
    let g = `<rect x="6" y="${hostY - 46}" width="118" height="92" rx="14" fill="var(--l1-soft)" stroke="var(--l1)" stroke-width="2"/>` + tx(65, hostY - 20, 'Claude', { fs: 15, fw: 800 }) + tx(65, hostY - 3, ws(ctx, 'host').split('(')[0].trim(), { fs: 10.5, fw: 500, c: 'var(--ink-2)' }) + `<rect x="22" y="${hostY + 10}" width="86" height="24" rx="7" fill="var(--surface)" stroke="var(--l1)"/>` + tx(65, hostY + 26, ws(ctx, 'client'), { fs: 10, fw: 600, c: 'var(--l1-ink)' });
    list.forEach((s, i) => {
      const y = 22 + i * rowH + (H - 22 - list.length * rowH) / 2 + rowH / 2;
      g += `<path d="M108 ${hostY + 22} C 160 ${hostY + 22}, 160 ${y}, 196 ${y}" stroke="var(--l3)" stroke-width="2" fill="none" stroke-dasharray="5 4"/>`;
      g += `<rect x="196" y="${y - 20}" width="138" height="40" rx="10" fill="var(--surface)" stroke="var(--l3)" stroke-width="2"/>`;
      g += tx(265, y - 3, s.name, { fs: 12, fw: 700 }) + tx(265, y + 12, s.prim, { fs: 9.5, fw: 500, c: 'var(--ink-3)' });
    });
    if (!list.length) g += tx(265, hostY + 4, '—', { c: 'var(--ink-3)' });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="MCP architecture: Claude connects to ${list.map((s) => s.name).join(', ')}">${g}</svg>`;
  }
  function mcpHTML(b, ctx) {
    return `<div class="widget">${head(ctx, 'plug', ws(ctx, 'mcp'))}<div class="w-body">
      <span class="eyebrow">${esc(ws(ctx, 'pickServers'))}</span>
      <div class="toggles mc-t">${MCP_SERVERS.map((s) => `<button type="button" data-k="${s.k}" aria-pressed="false">${icon(s.ic)}${esc(s.name)}</button>`).join('')}</div>
      <ul class="mc-what" style="margin:0;padding-inline-start:1.2em;font-size:.94rem"></ul>
      <div class="mcp-diagram"></div>
      <div class="codebox" dir="ltr"><div class="cb-head"><span>.mcp.json — ${esc(ws(ctx, 'config'))}</span><button type="button" class="mc-copy">${esc(ws(ctx, 'copy'))}</button></div><pre><code class="mc-code"></code></pre></div>
      <p class="w-note">${esc(ws(ctx, 'mcpNote'))}</p></div></div>`;
  }
  function mcpMount(el, b, ctx) {
    const sel = new Set(['filesystem', 'github']);
    const json = () => { const o = { mcpServers: {} }; MCP_SERVERS.filter((s) => sel.has(s.k)).forEach((s) => { o.mcpServers[s.k] = s.cfg; }); return JSON.stringify(o, null, 2); };
    function paint() {
      $$('.mc-t button', el).forEach((bt) => bt.setAttribute('aria-pressed', String(sel.has(bt.dataset.k))));
      $('.mcp-diagram', el).innerHTML = mcpSVG(ctx, sel);
      $('.mc-code', el).textContent = json();
      $('.mc-what', el).innerHTML = MCP_SERVERS.filter((s) => sel.has(s.k)).map((s) => `<li><b>${esc(s.name)}</b> — ${esc(ctx.tx(s.what))}</li>`).join('');
    }
    $$('.mc-t button', el).forEach((bt) => bt.addEventListener('click', () => { const k = bt.dataset.k; if (sel.has(k)) sel.delete(k); else sel.add(k); paint(); }));
    $('.mc-copy', el).addEventListener('click', async () => { const ok = await ctx.copyText(json()); ctx.toast(ok ? ctx.t('copied') : ctx.t('copyFailed')); });
    paint();
  }

  /* ======================================================== AGENT LOOP */
  const PHASE = { think: 0, tool: 1, observe: 2, answer: 3 };
  function agentloopHTML(b, ctx) {
    const cfg = b.cfg || {};
    const ph = ctx.L === 'he' ? ['מבין ומתכנן', 'פועל (כלי)', 'בודק תוצאה', 'מסכם'] : ['Understand & plan', 'Act (tool)', 'Check result', 'Report'];
    return `<div class="widget">${head(ctx, 'loop', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'agentloop'))}<div class="w-body loopviz">
      ${cfg.task ? `<div class="msg u" dir="auto" style="justify-self:stretch;max-width:100%">${esc(ctx.tx(cfg.task))}</div>` : ''}
      <div class="ring4">${ph.map((p, i) => `<span data-ph="${i}">${esc(p)}</span>`).join('')}</div>
      <div class="loopsteps">${(cfg.steps || []).map((s, i) => `<div class="loopstep" data-i="${i}"><span class="kind">${esc(ph[PHASE[s.k] || 0])}</span><div dir="auto">${md(ctx.tx(s))}${s.code ? `<div><code dir="ltr">${esc(s.code)}</code></div>` : ''}</div></div>`).join('')}</div>
      <div class="row"><button type="button" class="btn primary al-next">${icon('next', 'flip')}${esc(ws(ctx, 'nextStep'))}</button><button type="button" class="btn al-reset">${esc(ws(ctx, 'restart'))}</button></div>
      <div class="callout tip al-done" hidden>${icon('check')}<div class="ct"><b class="lbl">${esc(ws(ctx, 'loopDone'))}</b></div></div></div></div>`;
  }
  function agentloopMount(el, b) {
    const steps = (b.cfg && b.cfg.steps) || []; let i = -1;
    function paint() {
      $$('.loopstep', el).forEach((s, k) => { s.classList.toggle('on', k <= i); s.classList.toggle('cur', k === i); s.hidden = k > i + 1; });
      $$('.ring4 span', el).forEach((s) => s.classList.toggle('on', i >= 0 && +s.dataset.ph === (PHASE[steps[i].k] || 0)));
      $('.al-next', el).disabled = i >= steps.length - 1;
      $('.al-done', el).hidden = i < steps.length - 1;
    }
    $('.al-next', el).addEventListener('click', () => { i = Math.min(steps.length - 1, i + 1); paint(); });
    $('.al-reset', el).addEventListener('click', () => { i = -1; paint(); });
    paint();
  }

  /* ======================================================== API BUILDER */
  function apibuilderHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'code', ws(ctx, 'apibuilder'))}<div class="w-body">
      <div class="grid2"><label class="field">${esc(ws(ctx, 'model'))}<select class="ap-model">${MODELS.map((m, i) => `<option value="${m.id}"${i === 0 ? ' selected' : ''}>${esc(m.name)} — ${esc(ctx.tx(m.tag))}</option>`).join('')}</select></label>
      <label class="field">${esc(ws(ctx, 'maxTokens'))}<input type="number" class="ap-max" value="400" min="1" max="128000" inputmode="numeric"></label></div>
      <label class="field">${esc(ws(ctx, 'system'))}<textarea class="ap-sys" dir="auto" style="min-height:70px">${esc(ctx.tx(cfg.system) || '')}</textarea></label>
      <label class="field">${esc(ws(ctx, 'message'))}<textarea class="ap-msg" dir="auto" style="min-height:60px">${esc(ctx.tx(cfg.message) || '')}</textarea></label>
      <div class="codebox" dir="ltr"><div class="cb-head"><span>request · curl</span><button type="button" class="ap-copy">${esc(ws(ctx, 'copy'))}</button></div><pre><code class="ap-code"></code></pre></div>
      <div class="row"><button type="button" class="btn primary ap-send">${icon('play')}${esc(ws(ctx, 'sendSim'))}</button></div>
      <div class="ap-res" hidden><span class="eyebrow">${esc(ws(ctx, 'response'))}</span><div class="codebox" dir="ltr" style="margin-top:6px"><pre><code class="ap-out"></code></pre></div><p class="ap-cost" style="margin-top:8px"></p></div>
      <p class="w-note">${esc(ws(ctx, 'apiNote'))}</p></div></div>`;
  }
  function apibuilderMount(el, b, ctx) {
    const cfg = b.cfg || {};
    const body = () => {
      const o = { model: $('.ap-model', el).value, max_tokens: +$('.ap-max', el).value || 400 };
      const sys = $('.ap-sys', el).value.trim(); if (sys) o.system = sys;
      o.messages = [{ role: 'user', content: $('.ap-msg', el).value.trim() }];
      return o;
    };
    const curl = () => 'curl https://api.anthropic.com/v1/messages \\\n  -H "x-api-key: $ANTHROPIC_API_KEY" \\\n  -H "anthropic-version: 2026-10-21" \\\n  -H "content-type: application/json" \\\n  -d \'' + JSON.stringify(body(), null, 2).replace(/'/g, "'\\''") + "'";
    const paint = () => { $('.ap-code', el).textContent = curl(); };
    $$('select,input,textarea', el).forEach((x) => x.addEventListener('input', paint));
    $('.ap-copy', el).addEventListener('click', async () => { const ok = await ctx.copyText(curl()); ctx.toast(ok ? ctx.t('copied') : ctx.t('copyFailed')); });
    $('.ap-send', el).addEventListener('click', () => {
      const o = body(); const m = MODELS.find((x) => x.id === o.model);
      const reply = ctx.tx(cfg.reply) || 'Hello!';
      const inT = Math.ceil(((o.system || '').length + o.messages[0].content.length) / 3.6) + 8;
      const outT = Math.min(o.max_tokens, Math.ceil(reply.length / 3.6));
      const cut = outT >= o.max_tokens && Math.ceil(reply.length / 3.6) > o.max_tokens;
      const res = { id: 'msg_01' + Math.random().toString(36).slice(2, 12), type: 'message', role: 'assistant', model: o.model, content: [{ type: 'text', text: cut ? reply.slice(0, o.max_tokens * 3) + '…' : reply }], stop_reason: cut ? 'max_tokens' : 'end_turn', usage: { input_tokens: inT, output_tokens: outT } };
      $('.ap-out', el).textContent = JSON.stringify(res, null, 2);
      const cost = inT / 1e6 * m.in + outT / 1e6 * m.out;
      $('.ap-cost', el).innerHTML = `<b>${esc(ws(ctx, 'cost'))}:</b> <span class="tnum">${money(cost)}</span> <span class="muted">(${inT} × $${m.in}/M + ${outT} × $${m.out}/M)</span>`;
      $('.ap-res', el).hidden = false;
    });
    paint();
  }

  /* ======================================================== COST CALC */
  function costcalcHTML(b, ctx) {
    const c = Object.assign({ convs: 40, turns: 6, inTok: 2500, outTok: 300, model: 'claude-haiku-5-5' }, b.cfg || {});
    const f = (k, v, lab) => `<label class="field">${esc(ws(ctx, lab))}<input type="number" min="0" class="cc-${k}" value="${v}" inputmode="numeric"></label>`;
    return `<div class="widget">${head(ctx, 'dollar', ws(ctx, 'costcalc'))}<div class="w-body">
      <div class="grid2">${f('convs', c.convs, 'convs')}${f('turns', c.turns, 'turns')}${f('in', c.inTok, 'inTok')}${f('out', c.outTok, 'outTok')}</div>
      <label class="field">${esc(ws(ctx, 'model'))}<select class="cc-model">${MODELS.map((m) => `<option value="${m.id}"${m.id === c.model ? ' selected' : ''}>${esc(m.name)} — $${m.in} / $${m.out}</option>`).join('')}</select></label>
      <div class="grid2"><div><div class="result-num tnum cc-month"></div><span class="muted">${esc(ws(ctx, 'perMonth'))}</span></div><div><div class="result-num tnum cc-conv" style="font-size:1.4rem"></div><span class="muted">${esc(ws(ctx, 'perConv'))}</span></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>${esc(ws(ctx, 'model'))}</th><th>${esc(ws(ctx, 'perMonth'))}</th></tr></thead><tbody class="cc-all"></tbody></table></div>
      <p class="w-note">${esc(ws(ctx, 'priceNote'))}</p></div></div>`;
  }
  function costcalcMount(el) {
    const v = (k) => Math.max(0, +$('.cc-' + k, el).value || 0);
    function calc(m) { const msgs = v('convs') * v('turns') * 30; return msgs * (v('in') / 1e6 * m.in + v('out') / 1e6 * m.out); }
    function paint() {
      const m = MODELS.find((x) => x.id === $('.cc-model', el).value);
      const month = calc(m); const convs = v('convs') * 30;
      $('.cc-month', el).textContent = money(month);
      $('.cc-conv', el).textContent = money(convs ? month / convs : 0);
      $('.cc-all', el).innerHTML = MODELS.map((x) => `<tr${x.id === m.id ? ' style="font-weight:700"' : ''}><td>${esc(x.name)}</td><td class="tnum">${money(calc(x))}</td></tr>`).join('');
    }
    $$('input,select', el).forEach((x) => x.addEventListener('input', paint)); paint();
  }

  /* ======================================================== SPOT CHECK */
  function spotcheckHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'eye', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'spot'))}<div class="w-body">
      ${cfg.task ? `<p><b>${md(ctx.tx(cfg.task))}</b></p>` : ''}
      <div><span class="eyebrow">${esc(ws(ctx, 'facts'))}</span><div class="spot-src" dir="auto" style="margin-top:6px">${md(ctx.tx(cfg.source))}</div></div>
      <div><span class="eyebrow">${esc(ws(ctx, 'answer'))}</span><div class="spot" dir="auto" style="margin-top:6px">${(cfg.sentences || []).map((s, i) => `<span class="sent" role="button" tabindex="0" aria-pressed="false" data-i="${i}">${esc(ctx.tx(s))}</span> `).join('')}</div></div>
      <div class="row"><button type="button" class="btn primary sc-check">${icon('check')}${esc(ws(ctx, 'checkIt'))}</button><button type="button" class="btn sc-reset" hidden>${esc(ws(ctx, 'again'))}</button></div>
      <div class="sc-res"></div></div></div>`;
  }
  function spotcheckMount(el, b, ctx) {
    const ss = (b.cfg && b.cfg.sentences) || []; let checked = false;
    const toggle = (s) => { if (checked) return; const on = s.getAttribute('aria-pressed') !== 'true'; s.setAttribute('aria-pressed', String(on)); s.classList.toggle('sel', on); };
    $$('.sent', el).forEach((s) => { s.addEventListener('click', () => toggle(s)); s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(s); } }); });
    $('.sc-check', el).addEventListener('click', () => {
      checked = true; let hit = 0, miss = 0, fa = 0; const notes = [];
      $$('.sent', el).forEach((s) => {
        const i = +s.dataset.i; const bad = !!ss[i].bad; const sel = s.getAttribute('aria-pressed') === 'true';
        s.classList.remove('sel');
        if (bad && sel) { hit++; s.classList.add('hit'); notes.push(['ok', ws(ctx, 'found'), ss[i]]); }
        else if (bad && !sel) { miss++; s.classList.add('miss'); notes.push(['no', ws(ctx, 'missed'), ss[i]]); }
        else if (!bad && sel) { fa++; notes.push(['no', ws(ctx, 'falseAlarm'), ss[i]]); }
      });
      const total = ss.filter((x) => x.bad).length;
      $('.sc-res', el).innerHTML = `<p class="scoreline">${esc(ws(ctx, 'score'))}: <span class="tnum">${hit}/${total}</span>${fa ? ` · <span class="muted">${esc(ws(ctx, 'falseAlarm'))}: ${fa}</span>` : ''}</p>` + notes.map(([k, lab, s]) => `<div class="feedback ${k}" style="margin-top:8px"><b>${esc(lab)}</b><div dir="auto"><i>"${esc(ctx.tx(s))}"</i><br>${md(ctx.tx(s.why) || '')}</div></div>`).join('');
      $('.sc-check', el).hidden = true; $('.sc-reset', el).hidden = false;
    });
    $('.sc-reset', el).addEventListener('click', () => {
      checked = false; $$('.sent', el).forEach((s) => { s.className = 'sent'; s.setAttribute('aria-pressed', 'false'); });
      $('.sc-res', el).innerHTML = ''; $('.sc-check', el).hidden = false; $('.sc-reset', el).hidden = true;
    });
  }

  /* ======================================================== SORTER */
  function sorterHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'sort', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'sorter'))}<div class="w-body">${cfg.intro ? `<p>${md(ctx.tx(cfg.intro))}</p>` : ''}<div class="so-box"></div></div></div>`;
  }
  function sorterMount(el, b, ctx) {
    const cfg = b.cfg || {}; const items = cfg.items || []; const bins = cfg.bins || [];
    let i = 0, score = 0, answered = false;
    const box = $('.so-box', el);
    function paint() {
      if (i >= items.length) {
        box.innerHTML = `<div class="donecard" style="--cs:var(--accent-soft)"><h3>${esc(ws(ctx, 'done', { s: score, of: items.length }))}</h3><button type="button" class="btn so-again">${icon('reset')}${esc(ws(ctx, 'again'))}</button></div>`;
        $('.so-again', box).addEventListener('click', () => { i = 0; score = 0; answered = false; paint(); });
        return;
      }
      const it = items[i];
      box.innerHTML = `<div class="sortcard"><span class="eyebrow tnum">${esc(ws(ctx, 'cardOf', { n: i + 1, of: items.length }))}</span><p class="q" dir="auto">${md(ctx.tx(it))}</p>
        <div class="bins">${bins.map((bn, k) => `<button type="button" data-k="${k}">${esc(ctx.tx(bn))}</button>`).join('')}</div><div class="so-fb"></div></div>`;
      $$('.bins button', box).forEach((bt) => bt.addEventListener('click', () => {
        if (answered) return; answered = true;
        const k = +bt.dataset.k; const ok = k === it.bin; if (ok) score++;
        $$('.bins button', box).forEach((x) => { const kk = +x.dataset.k; x.disabled = true; if (kk === it.bin) x.style.cssText = 'border-color:var(--good);background:var(--good-soft)'; else if (kk === k) x.style.cssText = 'border-color:var(--bad);background:var(--bad-soft)'; });
        $('.so-fb', box).innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><b>${esc(ok ? ws(ctx, 'right') : ws(ctx, 'wrong'))}</b><div>${md(ctx.tx(it.why) || '')}</div></div><div class="row" style="margin-top:10px"><button type="button" class="btn primary so-next">${esc(ws(ctx, 'next'))}${icon('next', 'flip')}</button></div>`;
        $('.so-next', box).addEventListener('click', () => { i++; answered = false; paint(); });
      }));
    }
    paint();
  }

  /* ======================================================== colour helpers */
  const hexToRgb = (h) => { h = String(h || '#000').replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const relLum = (rgb) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]); };
  const ratioOf = (a, b) => { const x = relLum(hexToRgb(a)), y = relLum(hexToRgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mixHex = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };

  /* ======================================================== CONTRAST */
  function contrastHTML(b, ctx) {
    const c = Object.assign({ fg: '#9aa0a6', bg: '#ffffff' }, b.cfg || {});
    const presets = [['pGrey', '#9aa0a6', '#ffffff'], ['pBrand', '#8a4b08', '#fff8ee'], ['pYellow', '#ffffff', '#f2c230'], ['pDark', '#13203a', '#f1f4f8']];
    return `<div class="widget">${head(ctx, 'eye', ws(ctx, 'contrast'))}<div class="w-body">
      <div class="swatch-row"><label>${esc(ws(ctx, 'textColor'))}<input type="color" class="ct-fg" value="${c.fg}"></label><label>${esc(ws(ctx, 'bgColor'))}<input type="color" class="ct-bg" value="${c.bg}"></label>
      <div><div class="result-num tnum ct-ratio"></div><span class="muted">${esc(ws(ctx, 'ratioL'))}</span></div></div>
      <div class="contrast-demo ct-demo" dir="auto"><b>${esc(ws(ctx, 'sample'))}</b><span style="font-size:.9rem">${esc(ws(ctx, 'sampleSmall'))}</span></div>
      <div class="passfail ct-pf"></div>
      <div class="row"><span class="muted" style="font-size:.88rem">${esc(ws(ctx, 'presets'))}</span>${presets.map(([k, fg, bg]) => `<button type="button" class="btn small" data-fg="${fg}" data-bg="${bg}"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${bg};box-shadow:inset 0 0 0 4px ${fg},0 0 0 1px var(--rule)"></span>${esc(ws(ctx, k))}</button>`).join('')}</div>
      <p class="w-note">${esc(ws(ctx, 'contrastNote'))}</p></div></div>`;
  }
  function contrastMount(el, b, ctx) {
    const fg = $('.ct-fg', el), bg = $('.ct-bg', el);
    function paint() {
      const r = ratioOf(fg.value, bg.value);
      $('.ct-ratio', el).textContent = r.toFixed(2) + ' : 1';
      const demo = $('.ct-demo', el); demo.style.color = fg.value; demo.style.background = bg.value;
      const chip = (okv, lab) => `<span class="${okv ? 'ok' : 'no'}">${okv ? '✓' : '✗'} ${esc(lab)}</span>`;
      $('.ct-pf', el).innerHTML = chip(r >= 4.5, ws(ctx, 'aaNormal')) + chip(r >= 3, ws(ctx, 'aaLarge')) + chip(r >= 7, ws(ctx, 'aaa'));
    }
    fg.addEventListener('input', paint); bg.addEventListener('input', paint);
    $$('[data-fg]', el).forEach((bt) => bt.addEventListener('click', () => { fg.value = bt.dataset.fg; bg.value = bt.dataset.bg; paint(); }));
    paint();
  }

  /* ======================================================== DESIGN TOKENS */
  const FONTS = { sans: '"IBM Plex Sans", "IBM Plex Sans Hebrew", system-ui, sans-serif', serif: 'Georgia, "Times New Roman", serif', round: '"Rubik", system-ui, sans-serif' };
  function tokensHTML(b, ctx) {
    return `<div class="widget">${head(ctx, 'layers', ws(ctx, 'tokens'))}<div class="w-body">
      <div class="swatch-row">
        <label>${esc(ws(ctx, 'brand'))}<input type="color" class="tk-brand" value="#8a4b08"></label>
        <label style="flex:1;min-width:150px">${esc(ws(ctx, 'radius'))} · <span class="tnum tk-rv"></span><input type="range" class="tk-radius" min="0" max="24" step="2" value="12"></label>
        <label>${esc(ws(ctx, 'spacing'))}<select class="tk-space"><option value="4">4px</option><option value="8">8px</option></select></label>
        <label>${esc(ws(ctx, 'font'))}<select class="tk-font"><option value="sans">${esc(ws(ctx, 'fSans'))}</option><option value="serif">${esc(ws(ctx, 'fSerif'))}</option><option value="round">${esc(ws(ctx, 'fRound'))}</option></select></label>
      </div>
      <div class="tok-preview" dir="auto"><span class="t-tag" style="justify-self:start">${esc(ws(ctx, 'prevTag'))}</span><h4>${esc(ws(ctx, 'prevTitle'))}</h4><p>${esc(ws(ctx, 'prevBody'))}</p><div class="t-row"><button type="button" class="t-btn">${esc(ws(ctx, 'prevBtn'))}</button><button type="button" class="t-btn sec">${esc(ws(ctx, 'prevBtn2'))}</button></div></div>
      <p class="tk-on muted" style="font-size:.88rem"></p>
      <div class="tabs" role="tablist"><button type="button" role="tab" data-tab="css" aria-selected="true">${esc(ws(ctx, 'cssTab'))}</button><button type="button" role="tab" data-tab="json" aria-selected="false">${esc(ws(ctx, 'jsonTab'))}</button></div>
      <div class="codebox" dir="ltr"><div class="cb-head"><span class="tk-fname">tokens.css</span><button type="button" class="tk-copy">${esc(ws(ctx, 'copy'))}</button></div><pre><code class="tk-code"></code></pre></div>
      <p class="w-note">${esc(ws(ctx, 'tokNote2'))}</p></div></div>`;
  }
  function tokensMount(el, b, ctx) {
    let tab = 'css';
    const get = () => {
      const brand = $('.tk-brand', el).value.toLowerCase();
      const r = +$('.tk-radius', el).value, sp = +$('.tk-space', el).value, font = $('.tk-font', el).value;
      const b700 = mixHex(brand, '#000000', 0.3), b100 = mixHex(brand, '#ffffff', 0.85), surface = mixHex(brand, '#ffffff', 0.95);
      const ink = ratioOf(brand, surface) >= 4.5 ? brand : b700;
      const on = ratioOf('#ffffff', brand) >= 4.5 ? '#ffffff' : '#1a1a1a';
      return { brand, b700, b100, surface, ink, on, r, sp, font };
    };
    const css = (v) => `:root {\n  /* primitive tokens: raw values */\n  --color-brand-100: ${v.b100};\n  --color-brand-500: ${v.brand};\n  --color-brand-700: ${v.b700};\n  --radius-md: ${v.r}px;\n  --space-1: ${v.sp}px;\n  --space-2: ${v.sp * 2}px;\n  --space-4: ${v.sp * 4}px;\n  --font-body: ${FONTS[v.font]};\n\n  /* semantic tokens: what each value is FOR */\n  --color-action-primary: var(--color-brand-500);\n  --color-on-action: ${v.on};\n  --color-text-accent: ${v.ink === v.brand ? 'var(--color-brand-500)' : 'var(--color-brand-700)'};\n  --color-surface-highlight: var(--color-brand-100);\n  --radius-control: var(--radius-md);\n}`;
    const comp = (hex) => hexToRgb(hex).map((x) => Math.round(x / 255 * 1000) / 1000);
    const col = (hex) => ({ $type: 'color', $value: { colorSpace: 'srgb', components: comp(hex), hex } });
    const dim = (n) => ({ $type: 'dimension', $value: { value: n, unit: 'px' } });
    const json = (v) => JSON.stringify({
      color: {
        brand: { 100: col(v.b100), 500: col(v.brand), 700: col(v.b700) },
        action: { primary: { $type: 'color', $value: '{color.brand.500}' } },
        surface: { highlight: { $type: 'color', $value: '{color.brand.100}' } }
      },
      radius: { md: dim(v.r), control: { $type: 'dimension', $value: '{radius.md}' } },
      space: { 1: dim(v.sp), 2: dim(v.sp * 2), 4: dim(v.sp * 4) },
      font: { body: { $type: 'fontFamily', $value: FONTS[v.font].split(',').map((s) => s.trim().replace(/"/g, '')) } }
    }, null, 2);
    function paint() {
      const v = get();
      const pv = $('.tok-preview', el);
      pv.style.setProperty('--t-brand', v.brand); pv.style.setProperty('--t-brand-ink', v.ink); pv.style.setProperty('--t-on-brand', v.on);
      pv.style.setProperty('--t-tint', v.b100); pv.style.setProperty('--t-surface', v.surface);
      pv.style.setProperty('--t-radius', v.r + 'px'); pv.style.setProperty('--t-space', v.sp + 'px'); pv.style.setProperty('--t-font', FONTS[v.font]);
      $('.tk-rv', el).textContent = v.r + 'px';
      $('.tk-on', el).textContent = (ctx.L === 'he' ? 'ניגודיות של ' : 'Contrast of ') + ws(ctx, 'onBrand') + ': ' + ratioOf(v.on, v.brand).toFixed(2) + ':1';
      $('.tk-code', el).textContent = tab === 'css' ? css(v) : json(v);
      $('.tk-fname', el).textContent = tab === 'css' ? 'tokens.css' : 'tokens.json';
      $$('[data-tab]', el).forEach((bt) => bt.setAttribute('aria-selected', String(bt.dataset.tab === tab)));
    }
    $$('input,select', el).forEach((x) => x.addEventListener('input', paint));
    $$('[data-tab]', el).forEach((bt) => bt.addEventListener('click', () => { tab = bt.dataset.tab; paint(); }));
    $('.tk-copy', el).addEventListener('click', async () => { const ok = await ctx.copyText($('.tk-code', el).textContent); ctx.toast(ok ? ctx.t('copied') : ctx.t('copyFailed')); });
    paint();
  }

  /* ======================================================== ELIMINATE */
  function elimHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'target', ws(ctx, 'eliminate'))}<div class="w-body">
      <p class="qtext" style="font-weight:600" dir="auto">${md(ctx.tx(cfg.q))}</p>
      <p class="w-note">${esc(ws(ctx, 'elimHint'))}</p>
      <div class="elim">${(cfg.opts || []).map((o, j) => `<div><button type="button" class="opt" data-j="${j}"><span class="box">${'ABCDEFG'[j]}</span><span dir="auto">${md(ctx.tx(o))}</span></button><p class="note" hidden></p></div>`).join('')}</div>
      <div class="callout tip el-done" hidden>${icon('check')}<div class="ct"><b class="lbl">${esc(ws(ctx, 'elimDone'))}</b><div class="el-why"></div></div></div>
      <div class="row"><button type="button" class="btn small el-reset">${icon('reset')}${esc(ws(ctx, 'elimReset'))}</button></div></div></div>`;
  }
  function elimMount(el, b, ctx) {
    const opts = (b.cfg && b.cfg.opts) || [];
    const check = () => {
      const left = $$('.opt', el).filter((x) => !x.classList.contains('out'));
      const done = left.length === 1 && opts[+left[0].dataset.j].ok;
      $('.el-done', el).hidden = !done;
      if (done) { left[0].classList.add('right'); $('.el-why', el).innerHTML = md(ctx.tx(opts[+left[0].dataset.j].why) || ''); }
    };
    $$('.opt', el).forEach((bt) => bt.addEventListener('click', () => {
      const o = opts[+bt.dataset.j]; const note = bt.parentNode.querySelector('.note');
      note.hidden = false;
      if (o.ok) { note.innerHTML = `<b style="color:var(--warn)">${esc(ws(ctx, 'elimCareful'))}</b>`; bt.classList.add('right'); return; }
      bt.classList.add('out'); bt.disabled = true;
      note.innerHTML = `<b style="color:var(--bad)">${esc(ws(ctx, 'elimOut'))}:</b> ${md(ctx.tx(o.why) || '')}`;
      check();
    }));
    $('.el-reset', el).addEventListener('click', () => {
      $$('.opt', el).forEach((x) => { x.classList.remove('out', 'right'); x.disabled = false; });
      $$('.note', el).forEach((n) => { n.hidden = true; n.innerHTML = ''; });
      $('.el-done', el).hidden = true;
    });
  }

  /* ======================================================== FOLDER EXPLORER */
  function filetreeHTML(b, ctx) {
    const cfg = b.cfg || {};
    return `<div class="widget">${head(ctx, 'folder', cfg.title ? ctx.tx(cfg.title) : ws(ctx, 'filetree'))}<div class="w-body">
      <p class="w-note">${esc(ws(ctx, 'ftHint'))}</p>
      <div class="ftree"><ul class="ft-list" aria-label="files"></ul><div class="ft-view" aria-live="polite"><div class="ft-path"></div><div class="ft-why" dir="auto"></div><pre class="ft-body"></pre></div></div></div></div>`;
  }
  function filetreeMount(el, b, ctx) {
    const items = ((b.cfg && b.cfg.items) || []).map((it) => Object.assign({}, it, { dir: !!it.dir || /\/$/.test(it.p), p: it.p.replace(/\/$/, '') }));
    const byPath = {}; items.forEach((it) => { byPath[it.p] = it; });
    items.forEach((it) => { const parts = it.p.split('/'); for (let i = 1; i < parts.length; i++) { const d = parts.slice(0, i).join('/'); if (!byPath[d]) byPath[d] = { p: d, dir: true }; } });
    const all = Object.values(byPath).sort((a, z) => a.p.localeCompare(z.p));
    let cur = (items.find((it) => !it.dir) || all[0]).p;
    function paint() {
      $('.ft-list', el).innerHTML = all.map((it) => {
        const depth = it.p.split('/').length - 1; const name = it.p.split('/').pop() + (it.dir ? '/' : '');
        return `<li><button type="button" class="${it.dir ? 'dir' : ''}" data-p="${esc(it.p)}" aria-current="${it.p === cur}" style="padding-left:${8 + depth * 16}px">${icon(it.dir ? 'folder' : 'note')}<span>${esc(name)}</span></button></li>`;
      }).join('');
      const it = byPath[cur];
      $('.ft-path', el).textContent = it.p + (it.dir ? '/' : '');
      $('.ft-why', el).innerHTML = md(ctx.tx(it.why) || '');
      $('.ft-why', el).hidden = !it.why;
      const body = ctx.tx(it.body) || '';
      $('.ft-body', el).textContent = body; $('.ft-body', el).hidden = !body;
      $$('[data-p]', el).forEach((bt) => bt.addEventListener('click', () => { cur = bt.dataset.p; paint(); }));
    }
    paint();
  }

  /* ======================================================== EXAM SIMULATION LAUNCHER */
  function examsimHTML(b, ctx) {
    const rules = ctx.tx((b.cfg || {}).rules) || [];
    return `<div class="widget">${head(ctx, 'exam', ws(ctx, 'examsim'))}<div class="w-body">
      ${rules.length ? `<span class="eyebrow">${esc(ws(ctx, 'simRules'))}</span><ul class="check-list">${rules.map((r) => `<li><label><input type="checkbox"><span>${md(r)}</span></label></li>`).join('')}</ul>` : ''}
      <div class="row"><button type="button" class="btn primary es-start">${icon('play')}<span class="es-lab">${esc(ws(ctx, 'simStart'))}</span></button><button type="button" class="btn es-quick">${esc(ws(ctx, 'simQuick'))}</button></div>
      <p class="w-note">${esc(ws(ctx, 'simTarget'))}</p>
      <div><span class="eyebrow">${esc(ws(ctx, 'simHistory'))}</span><div class="es-hist" style="margin-top:8px"></div></div></div></div>`;
  }
  function examsimMount(el, b, ctx) {
    const S = ctx.S();
    if (S.draft && S.draft.back === 'exam') $('.es-lab', el).textContent = ws(ctx, 'simResume');
    const hist = (S.exams || []).filter((e) => e.mode === 'full').slice(-5).reverse();
    $('.es-hist', el).innerHTML = hist.length ? hist.map((h) => `<div class="spread" style="border-bottom:1px dashed var(--rule);padding-block:6px"><span class="muted">${esc(ctx.fmtDate(h.at))}</span><b class="tnum" style="color:${h.pct >= 80 ? 'var(--good)' : h.pct >= 65 ? 'var(--warn)' : 'var(--bad)'}">${h.pct}%</b></div>`).join('') : `<p class="w-note">${esc(ws(ctx, 'simNone'))}</p>`;
    $('.es-start', el).addEventListener('click', () => ctx.startExam('full'));
    $('.es-quick', el).addEventListener('click', () => ctx.startExam('quick'));
  }

  /* ======================================================== registry */
  const REG = {
    terminal: [terminalHTML, (el, b, ctx) => Terminal(el, b.cfg || {}, ctx)],
    nextword: [nextwordHTML, nextwordMount],
    tokenizer: [tokenizerHTML, tokenizerMount],
    promptbuilder: [promptbuilderHTML, promptbuilderMount],
    chat: [chatHTML, chatMount],
    mcpbuilder: [mcpHTML, mcpMount],
    agentloop: [agentloopHTML, agentloopMount],
    apibuilder: [apibuilderHTML, apibuilderMount],
    costcalc: [costcalcHTML, costcalcMount],
    spotcheck: [spotcheckHTML, spotcheckMount],
    sorter: [sorterHTML, sorterMount],
    contrast: [contrastHTML, contrastMount],
    tokens: [tokensHTML, tokensMount],
    eliminate: [elimHTML, elimMount],
    examsim: [examsimHTML, examsimMount],
    filetree: [filetreeHTML, filetreeMount]
  };
  window.W = {
    html(b, ctx) { const r = REG[b.name]; return r ? r[0](b, ctx) : `<div class="card muted">Unknown widget: ${esc(b.name)}</div>`; },
    mount(el, b, ctx) { const r = REG[b.name]; if (r && r[1]) r[1](el, b, ctx); },
    MODELS
  };
})();
