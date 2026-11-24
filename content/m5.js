/* Line 5 — Exam simulation: know the exam, answer scenario questions, review every domain,
   and sit a full 60-question, 120-minute simulation with a review screen. */
CT.modules.push({
  id: 'm5', n: 7,
  title: { en: 'Exam simulation', he: 'סימולציית מבחן' },
  subtitle: { en: 'Strategy, domain review and a full timed simulation', he: 'אסטרטגיה, חזרה על הנושאים וסימולציה מלאה בזמן' },
  intro: {
    en: 'The last line gets you ready for the Claude Certified Associate – Foundations exam: what to expect, how to read scenario questions, a one-page review of every domain, and a full simulation under real conditions.',
    he: 'הקו האחרון מכין אתכם למבחן Claude Certified Associate – Foundations: למה לצפות, איך קוראים שאלות תרחיש, חזרה של עמוד אחד על כל נושא, וסימולציה מלאה בתנאים אמיתיים.'
  },
  outcomes: {
    en: ['Know the format, rules and logistics of the exam', 'Use a repeatable method to answer scenario questions', 'Review all seven domains on one page each', 'Sit a full 120-minute simulation and use the results to plan your last study days'],
    he: ['להכיר את המבנה, הכללים והלוגיסטיקה של המבחן', 'להשתמש בשיטה קבועה לשאלות תרחיש', 'לחזור על כל שבעת הנושאים, עמוד לכל אחד', 'לעשות סימולציה מלאה של 120 דקות ולתכנן לפי התוצאות את ימי הלימוד האחרונים']
  },
  lessons: [
    /* ---------------------------------------------------------------- 5.1 */
    {
      id: 'm5-l1', minutes: 8, domains: [],
      title: { en: 'Know your exam', he: 'מכירים את המבחן' },
      tldr: {
        en: 'Study guides describe 60 multiple-choice and multiple-response questions in 120 minutes, across seven weighted domains, taken online with a proctor and in English. Check the official page for the current rules, price and booking steps.',
        he: 'לפי מדריכי הלימוד: 60 שאלות אמריקאיות (חלקן עם כמה תשובות) ב-120 דקות, משבעה נושאים במשקלים שונים, אונליין עם משגיח ובאנגלית. את הכללים, המחיר ושלבי ההרשמה העדכניים בודקים בעמוד הרשמי.'
      },
      goals: {
        en: ['Know the format and the seven domains', 'Prepare your room and computer for an online proctored exam', 'Plan your time per question'],
        he: ['להכיר את המבנה ואת שבעת הנושאים', 'להכין את החדר והמחשב למבחן אונליין עם משגיח', 'לתכנן זמן לכל שאלה']
      },
      terms: [['Proctor', 'משגיח: אדם או מערכת שמשגיחים על המבחן מרחוק.'], ['Multiple choice', 'שאלה עם תשובה נכונה אחת.'], ['Multiple response', 'שאלה עם כמה תשובות נכונות ("בחרו 2").'], ['Scenario question', 'שאלת תרחיש: סיפור קצר מהעבודה ושאלה עליו.'], ['Credential / Badge', 'תעודה דיגיטלית שמקבלים אחרי שעוברים.']],
      blocks: [
        { t: 'table', en: { head: ['', 'What study guides report (verify officially)'], rows: [['**Exam**', 'Claude Certified Associate – Foundations'], ['**Questions**', '60, multiple choice and multiple response'], ['**Time**', '120 minutes — about 2 minutes per question'], ['**Delivery**', 'Online with a proctor (guides report Pearson VUE delivery and Credly badges since mid-2026)'], ['**Language**', 'English'], ['**Focus**', 'Practical, everyday use of Claude at work']] }, he: { head: ['', 'מה מדריכי הלימוד מדווחים (לבדוק ברשמי)'], rows: [['**מבחן**', 'Claude Certified Associate – Foundations'], ['**שאלות**', '60, עם תשובה אחת או כמה תשובות'], ['**זמן**', '120 דקות — בערך 2 דקות לשאלה'], ['**איך**', 'אונליין עם משגיח (המדריכים מדווחים על Pearson VUE ותגי Credly מאמצע 2026)'], ['**שפה**', 'אנגלית'], ['**מוקד**', 'שימוש מעשי ויומיומי ב-Claude בעבודה']] } },
        { t: 'h', en: 'The seven domains', he: 'שבעת הנושאים' },
        { t: 'stack', en: { title: 'Share of the exam by domain', items: [{ label: 'Output Evaluation and Validation · 21%', v: 21, c: 'l1' }, { label: 'Workflow Integration and Solution Design · 16%', v: 16, c: 'l2' }, { label: 'Governance, Risk, and Responsible Use · 15%', v: 15, c: 'l3' }, { label: 'Prompting and Task Execution · 14%', v: 14, c: 'l4' }, { label: 'Product and Model Selection · 12%', v: 12, c: 'lx' }, { label: 'Configuration and Knowledge Management · 12%', v: 12, c: 'ink-3' }, { label: 'Troubleshooting and Optimization · 10%', v: 10, c: 'rule' }], note: 'Weights from public 2026 study guides. The official exam guide is the final word.' }, he: { title: 'החלק של כל נושא במבחן', items: [{ label: 'הערכה ובדיקה של תוצרים · 21%', v: 21, c: 'l1' }, { label: 'שילוב בתהליכים ותכנון פתרונות · 16%', v: 16, c: 'l2' }, { label: 'ממשל, סיכונים ושימוש אחראי · 15%', v: 15, c: 'l3' }, { label: 'ניסוח פרומפטים וביצוע משימות · 14%', v: 14, c: 'l4' }, { label: 'בחירת מוצר ומודל · 12%', v: 12, c: 'lx' }, { label: 'הגדרות וניהול ידע · 12%', v: 12, c: 'ink-3' }, { label: 'פתרון תקלות ושיפור · 10%', v: 10, c: 'rule' }], note: 'המשקלים לפי מדריכי לימוד פומביים מ-2026. מדריך המבחן הרשמי קובע.' } },
        { t: 'callout', kind: 'exam', en: 'Evaluation is the biggest domain. If you only have one evening left, spend it on lessons [[m1-l7]], [[m2-l8]] and [[m3-l7]].', he: 'הערכת תוצרים הוא הנושא הכי גדול. אם נשאר לכם רק ערב אחד — השקיעו אותו בשיעורים [[m1-l7]], ‏[[m2-l8]] ו-[[m3-l7]].' },
        { t: 'h', en: 'Getting ready for an online proctored exam', he: 'מתכוננים למבחן אונליין עם משגיח' },
        { t: 'checklist', id: 'm5-l1-room', title: { en: 'Exam-day checklist (typical rules — confirm the official ones)', he: 'רשימה ליום המבחן (כללים מקובלים — לוודא את הרשמיים)' }, en: ['Booked through the official certification page', 'Ran the system test on the same computer and network', 'Valid photo ID ready, name exactly as registered', 'Quiet private room, clear desk, door closed', 'Phone, notes, second screen and smartwatch out of reach', 'Laptop plugged in, notifications and other apps closed', 'Water nearby; bathroom before you start'], he: ['נרשמתי דרך עמוד ההסמכה הרשמי', 'הרצתי את בדיקת המערכת על אותו מחשב ואותה רשת', 'תעודה מזהה בתוקף מוכנה, והשם בדיוק כמו בהרשמה', 'חדר שקט ופרטי, שולחן נקי, דלת סגורה', 'טלפון, דפים, מסך שני ושעון חכם — רחוק', 'מחשב בטעינה, התראות ואפליקציות אחרות סגורות', 'מים ליד; שירותים לפני שמתחילים'] },
        { t: 'callout', kind: 'note', en: 'Exam rules, price, eligibility and delivery can change. This course is independent — always confirm on Anthropic’s official certification pages before you book.', he: 'כללים, מחיר, זכאות ואופן המבחן יכולים להשתנות. הקורס הזה עצמאי — תמיד מוודאים בעמודי ההסמכה הרשמיים של Anthropic לפני שנרשמים.' },
        { t: 'key', en: { title: 'Two minutes per question', body: '120 minutes for 60 questions is about two minutes each. Answer what you know, flag what you doubt, and come back. Leave time at the end for the review screen.' }, he: { title: 'שתי דקות לשאלה', body: '120 דקות ל-60 שאלות זה בערך שתי דקות לכל אחת. עונים על מה שיודעים, מסמנים מה שלא בטוחים, וחוזרים. משאירים זמן בסוף למסך הסקירה.' } }
      ],
      check: [
        { id: 'm5-l1-c1', d: 'd1', a: [2], en: { q: 'A question says “Choose 2.” You are sure of one answer and unsure between two others. What is the best approach?', o: ['Pick only the one you are sure of', 'Pick three to be safe', 'Pick the sure one plus your best judgement of the second, then flag it to revisit', 'Skip the question'], why: 'Multiple-response questions need exactly the requested number. Commit to your best choice and flag it for review.' }, he: { q: 'בשאלה כתוב "בחרו 2". אתם בטוחים בתשובה אחת ומתלבטים בין שתיים אחרות. מה הכי נכון?', o: ['לבחור רק את זו שבטוחים בה', 'לבחור שלוש ליתר ביטחון', 'לבחור את הבטוחה ועוד את הכי סבירה בעיניכם, ולסמן לחזרה', 'לדלג על השאלה'], why: 'בשאלות עם כמה תשובות בוחרים בדיוק את המספר שמבקשים. מתחייבים לבחירה הכי טובה ומסמנים לחזרה.' } },
        { id: 'm5-l1-c2', d: 'd2', a: [0], en: { q: 'Which domain carries the most weight according to the study guides?', o: ['Output Evaluation and Validation', 'Troubleshooting and Optimization', 'Product and Model Selection', 'Configuration and Knowledge Management'], why: 'Output Evaluation and Validation is about 21% — the largest domain.' }, he: { q: 'לפי מדריכי הלימוד, לאיזה נושא המשקל הכי גדול?', o: ['הערכה ובדיקה של תוצרים', 'פתרון תקלות ושיפור', 'בחירת מוצר ומודל', 'הגדרות וניהול ידע'], why: 'הערכה ובדיקה של תוצרים — כ-21%, הנושא הכי גדול.' } }
      ]
    },
    /* ---------------------------------------------------------------- 5.2 */
    {
      id: 'm5-l2', minutes: 11, domains: ['d1', 'd2', 'd3', 'd6'],
      title: { en: 'How to answer scenario questions', he: 'איך עונים על שאלות תרחיש' },
      tldr: {
        en: 'Read what is asked first (best, first, most likely, choose 2). Find the details that matter: stakes, scale, data, who reviews. Predict an answer, then eliminate extremes. The right answer is usually safe, simple, grounded, tested, and keeps a human in charge when stakes are high.',
        he: 'קודם קוראים מה שואלים (הכי טוב, קודם, הכי סביר, בחרו 2). מוצאים את הפרטים שחשובים: סיכון, היקף, מידע, מי בודק. מנחשים תשובה, ואז פוסלים קיצוניות. התשובה הנכונה בדרך כלל בטוחה, פשוטה, מבוססת, נבדקת, ומשאירה אדם אחראי כשהסיכון גבוה.'
      },
      goals: {
        en: ['Use a five-step method for every question', 'Recognise red-flag and green-flag answers', 'Practise eliminating wrong options'],
        he: ['להשתמש בשיטה של חמישה צעדים לכל שאלה', 'לזהות תשובות "דגל אדום" ו"דגל ירוק"', 'להתאמן בפסילת תשובות שגויות']
      },
      terms: [['Distractor', 'מסיח: תשובה שגויה שנראית נכונה.'], ['Keyword', 'מילת מפתח: BEST, FIRST, MOST LIKELY.'], ['Eliminate', 'לפסול תשובה.']],
      blocks: [
        { t: 'steps', en: ['**Read the last line first.** What exactly is asked: the BEST option, the FIRST step, the MOST LIKELY cause, or “choose 2”?', '**Mark the details that matter.** Stakes (money, health, people), scale (one email or 50,000), data (private or public), who reviews.', '**Name the domain.** Is this about prompting, evaluation, design, models, configuration, risk or troubleshooting?', '**Predict before you look.** What would you do at work? Then read the options.', '**Eliminate, then choose.** Cross out extremes and vague answers. Pick the one that best fits the details.'], he: ['**קוראים קודם את השורה האחרונה.** מה בדיוק שואלים: האפשרות הכי טובה (BEST), הצעד הראשון (FIRST), הסיבה הכי סבירה (MOST LIKELY), או "בחרו 2"?', '**מסמנים את הפרטים החשובים.** סיכון (כסף, בריאות, אנשים), היקף (מייל אחד או 50,000), מידע (פרטי או ציבורי), מי בודק.', '**מזהים את הנושא.** פרומפטים, הערכה, תכנון, מודלים, הגדרות, סיכון או תקלות?', '**מנחשים לפני שמסתכלים.** מה הייתם עושים בעבודה? ואז קוראים את האפשרויות.', '**פוסלים, ואז בוחרים.** מוחקים קיצוניות ותשובות מעורפלות. בוחרים את מה שהכי מתאים לפרטים.'] },
        { t: 'compare', en: { badT: 'Red flags (usually wrong)', bad: ['“Always” / “never” / “fully automatic” for high-stakes work', '“Use the biggest model for everything”', '“Trust it because it sounds confident”', '“Skip testing to save time”', 'Sharing passwords or keys, or pasting sensitive data into unapproved tools', 'Vague fixes: “try harder”, “be better”'], goodT: 'Green flags (usually right)', good: ['Give context, sources and examples', 'Test on representative examples; compare with an evaluation set', 'Human review where stakes are high', 'Least privilege; follow policy', 'Start simple; pick the smallest tool and model that meet the bar', 'Fix the root cause (knowledge, prompt, configuration)'] }, he: { badT: 'דגלים אדומים (בדרך כלל שגוי)', bad: ['"תמיד" / "אף פעם" / "אוטומטי לגמרי" בעבודה עם סיכון גבוה', '"המודל הכי גדול לכל דבר"', '"לסמוך כי זה נשמע בטוח"', '"לדלג על בדיקות כדי לחסוך זמן"', 'לשתף סיסמאות או מפתחות, או להדביק מידע רגיש בכלים לא מאושרים', 'תיקונים מעורפלים: "תתאמץ", "תשתפר"'], goodT: 'דגלים ירוקים (בדרך כלל נכון)', good: ['לתת הקשר, מקורות ודוגמאות', 'לבדוק על דוגמאות מייצגות; להשוות לסט בדיקות', 'בדיקה של אדם כשהסיכון גבוה', 'מינימום הרשאות; לפי המדיניות', 'להתחיל פשוט; הכלי והמודל הקטנים שעומדים ברף', 'לתקן בשורש (ידע, פרומפט, הגדרות)'] } },
        { t: 'widget', name: 'eliminate', cfg: {
          q: { en: 'A small online shop wants Claude to help answer customer emails about orders. Emails sometimes include home addresses and phone numbers. What is the **BEST first step**?', he: 'חנות אונליין קטנה רוצה ש-Claude יעזור לענות למיילים של לקוחות על הזמנות. במיילים יש לפעמים כתובות מגורים וטלפונים. מה **הצעד הראשון הכי טוב**?' },
          opts: [
            { en: 'Connect Claude to the inbox and let it reply to every email automatically.', he: 'לחבר את Claude לתיבת הדואר ולתת לו לענות לכל מייל אוטומטית.', ok: false, why: { en: '“Fully automatic” with customer data and no review is a red flag, especially as a first step.', he: '"אוטומטי לגמרי" עם מידע של לקוחות ובלי בדיקה — דגל אדום, במיוחד כצעד ראשון.' } },
            { en: 'Run a pilot: Claude drafts replies from the order policy, a person reviews before sending, and only the customer data needed is shared, in an approved tool.', he: 'פיילוט: Claude מנסח תשובות לפי מדיניות ההזמנות, אדם בודק לפני שליחה, ומשתפים רק את המידע הנחוץ, בכלי מאושר.', ok: true, why: { en: 'Simple, grounded in policy, human-reviewed, and minimises personal data — every green flag at once.', he: 'פשוט, מבוסס על המדיניות, עם בדיקה של אדם ומזעור מידע אישי — כל הדגלים הירוקים ביחד.' } },
            { en: 'Use the largest model available so mistakes become impossible.', he: 'להשתמש במודל הכי גדול כדי שלא יהיו טעויות.', ok: false, why: { en: 'No model makes mistakes impossible. “Biggest for everything” is a red flag.', he: 'אין מודל שמונע טעויות לגמרי. "הכי גדול לכל דבר" — דגל אדום.' } },
            { en: 'Wait until AI is perfect before using it for customers.', he: 'לחכות שה-AI יהיה מושלם לפני שמשתמשים בו מול לקוחות.', ok: false, why: { en: 'This avoids the task instead of designing a safe solution.', he: 'זה מתחמק מהמשימה במקום לתכנן פתרון בטוח.' } }
          ] } },
        { t: 'widget', name: 'eliminate', cfg: {
          q: { en: 'Claude’s summaries of meeting notes sometimes miss action items. What should you try **FIRST**?', he: 'הסיכומים של Claude לפרוטוקולים מפספסים לפעמים משימות לביצוע. מה מנסים **קודם**?' },
          opts: [
            { en: 'Switch to a different AI provider.', he: 'לעבור לספק AI אחר.', ok: false, why: { en: 'A drastic change is not a first step. Fix the prompt before changing everything.', he: 'שינוי דרסטי הוא לא צעד ראשון. קודם מתקנים את הפרומפט.' } },
            { en: 'Ask Claude to “try harder next time”.', he: 'לבקש מ-Claude "להתאמץ יותר בפעם הבאה".', ok: false, why: { en: 'Vague feedback gives nothing to act on.', he: 'משוב מעורפל לא נותן על מה לעבוד.' } },
            { en: 'Stop summarising meetings with AI.', he: 'להפסיק לסכם פגישות עם AI.', ok: false, why: { en: 'Gives up the value instead of fixing a specific gap.', he: 'מוותר על הערך במקום לתקן פער מסוים.' } },
            { en: 'Add an explicit instruction to list every action item with owner and due date, with an example of the format.', he: 'להוסיף הוראה מפורשת לרשום כל משימה עם אחראי ותאריך יעד, ודוגמה לפורמט.', ok: true, why: { en: 'A specific instruction plus an example targets the exact gap — the cheapest, fastest fix to try first.', he: 'הוראה מדויקת ודוגמה מכוונות בדיוק לפער — התיקון הכי זול ומהיר לנסות קודם.' } }
          ] } },
        { t: 'h', en: 'Timing tactics', he: 'טקטיקות זמן' },
        { t: 'list', en: ['**First pass:** answer every question you can in under two minutes. Flag the rest and move on.', '**Second pass:** return to flagged questions with fresh eyes.', '**Never leave blanks:** an unanswered question cannot score. Make your best choice.', '**Do not change answers on a hunch.** Change only when you find a clear reason.', '**Save five minutes** for the review screen at the end.'], he: ['**סבב ראשון:** עונים על כל מה שאפשר בפחות משתי דקות. את השאר מסמנים וממשיכים.', '**סבב שני:** חוזרים לשאלות המסומנות עם ראש נקי.', '**לא משאירים ריק:** שאלה בלי תשובה לא יכולה לקבל נקודות. בוחרים את הכי טוב.', '**לא משנים תשובה בגלל תחושה.** משנים רק כשמוצאים סיבה ברורה.', '**שומרים חמש דקות** למסך הסקירה בסוף.'] },
        { t: 'callout', kind: 'simple', he: 'קוראים מה שואלים → מסמנים פרטים חשובים → מנחשים → פוסלים קיצוניות → בוחרים את הבטוח, הפשוט והנבדק.' }
      ],
      check: [
        { id: 'm5-l2-c1', d: 'd6', a: [3], en: { q: 'An option reads “Let the AI make final hiring decisions automatically to remove human bias.” How should you treat it?', o: ['As the best answer — it removes bias', 'As correct only for small companies', 'As correct if the model is large', 'As a red flag: high-stakes decisions about people need human oversight'], why: 'Fully automatic, high-stakes decisions about people are a classic wrong answer.' }, he: { q: 'אפשרות אומרת: "לתת ל-AI לקבל החלטות גיוס סופיות לבד כדי להוריד הטיה אנושית." איך מתייחסים אליה?', o: ['כתשובה הכי טובה — היא מורידה הטיה', 'נכונה רק לחברות קטנות', 'נכונה אם המודל גדול', 'דגל אדום: החלטות רציניות על אנשים צריכות פיקוח אנושי'], why: 'החלטות אוטומטיות לגמרי, עם סיכון גבוה, על אנשים — תשובה שגויה קלאסית.' } },
        { id: 'm5-l2-c2', d: 'd1', a: [1], en: { q: 'A question asks for the FIRST thing to try when Claude’s answers are too long. Which option fits “first”?', o: ['Rebuild the whole system with a new model', 'Add a clear length limit to the prompt', 'Hire an editor', 'Switch off the feature'], why: '“First” usually means the simplest, cheapest effective step.' }, he: { q: 'שאלה מבקשת את הדבר הראשון לנסות כשהתשובות של Claude ארוכות מדי. איזו אפשרות מתאימה ל"ראשון"?', o: ['לבנות מחדש את כל המערכת עם מודל חדש', 'להוסיף לפרומפט מגבלת אורך ברורה', 'לגייס עורך', 'לכבות את הפיצ׳ר'], why: '"ראשון" אומר בדרך כלל הצעד הכי פשוט וזול שעובד.' } }
      ]
    },
    /* ---------------------------------------------------------------- 5.3 */
    {
      id: 'm5-l3', minutes: 12, domains: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'],
      title: { en: 'Domain review: one page each', he: 'חזרה לפי נושא: עמוד לכל אחד' },
      tldr: {
        en: 'Seven cards, one per exam domain, with the rules of thumb that answer most questions and links back to the lessons. Then a 14-day plan to finish strong.',
        he: 'שבעה כרטיסים, אחד לכל נושא במבחן, עם כללי האצבע שעונים על רוב השאלות וקישורים חזרה לשיעורים. ואז תוכנית של 14 יום לסיום חזק.'
      },
      goals: {
        en: ['Review every domain quickly', 'Find your weakest domain', 'Follow a 14-day study plan'],
        he: ['לעבור על כל הנושאים מהר', 'למצוא את הנושא הכי חלש', 'ללכת לפי תוכנית של 14 יום']
      },
      terms: [['Rule of thumb', 'כלל אצבע: כלל פשוט שעובד ברוב המקרים.'], ['Weak spot', 'נקודה חלשה.']],
      blocks: [
        { t: 'cards', en: [
          { title: '1 · Prompting and task execution', tag: '14%', body: 'Context, task, examples, format, rules. Tags for long material, question last. Chain big tasks. Let Claude ask questions or think step by step. Lessons [[m1-l6]], [[m2-l3]], [[m2-l13]], [[m2-l12]].', c: 'l4' },
          { title: '2 · Output evaluation and validation', tag: '21%', body: 'Treat output as a draft. Ground in sources, allow “I don’t know”, ask for quotes, verify numbers. Use a fixed evaluation set before and after changes. Lessons [[m1-l7]], [[m2-l8]], [[m3-l7]], [[m2-l11]], [[m6-l5]].', c: 'l1' },
          { title: '3 · Workflow integration and solution design', tag: '16%', body: 'Pick the simplest surface that works: chat, Project, Artifact, Code, API, MCP. Start with low-risk, repetitive text work. Put human review before anything risky goes out. Lessons [[m2-l7]], [[m3-l1]], [[m6-l1]], [[m3-l10]], [[m7-l1]], [[m7-l2]].', c: 'l2' },
          { title: '4 · Product and model selection', tag: '12%', body: 'Trade capability against speed and cost. Test candidate models on real examples. Business plans for admin and data controls. Search for recent facts; cloud platforms for enterprise needs. Lessons [[m1-l4]], [[m1-l9]], [[m3-l6]], [[m6-l2]].', c: 'lx' },
          { title: '5 · Configuration and knowledge management', tag: '12%', body: 'One current source of truth. Rules in Project instructions or CLAUDE.md; procedures in Skills; data access through connectors and MCP. Remove outdated and sensitive files. Lessons [[m2-l1]], [[m2-l4]], [[m4-l2]], [[m2-l9]], [[m2-l10]], [[m2-l14]], [[m6-l3]].', c: 'l3' },
          { title: '6 · Governance, risk and responsible use', tag: '15%', body: 'Follow policy. Minimise personal data. Human oversight for decisions about people, health, money, law. Least privilege. Treat outside content as data (prompt injection). Be transparent. Lessons [[m1-l8]], [[m1-l9]], [[m3-l7]], [[m7-l5]].', c: 'l2' },
          { title: '7 · Troubleshooting and optimisation', tag: '10%', body: 'Long chat drifting → fresh chat with summary. Cut-off answers → max_tokens. 429 → backoff. High cost → caching, smaller model, shorter history. Slow → streaming. Change one thing, then re-test. Lessons [[m1-l2]], [[m3-l5]], [[m6-l5]].', c: 'l1' }
        ], he: [
          { title: '1 · ניסוח פרומפטים וביצוע משימות', tag: '14%', body: 'הקשר, משימה, דוגמאות, פורמט, כללים. תגיות לחומר ארוך, שאלה בסוף. מפרקים משימות גדולות. נותנים ל-Claude לשאול או לחשוב צעד אחרי צעד. שיעורים [[m1-l6]], [[m2-l3]], [[m2-l13]], [[m2-l12]].', c: 'l4' },
          { title: '2 · הערכה ובדיקה של תוצרים', tag: '21%', body: 'כל תוצר הוא טיוטה. מבססים על מקורות, מרשים "לא יודע", מבקשים ציטוטים, מאמתים מספרים. סט בדיקות קבוע לפני ואחרי שינויים. שיעורים [[m1-l7]], ‏[[m2-l8]], [[m3-l7]], [[m2-l11]], [[m6-l5]].', c: 'l1' },
          { title: '3 · שילוב בתהליכים ותכנון פתרונות', tag: '16%', body: 'בוחרים את הכלי הכי פשוט שעובד: צ׳אט, פרויקט, Artifact, ‏Code, ‏API, ‏MCP. מתחילים בעבודת טקסט חוזרת עם סיכון נמוך. בדיקה של אדם לפני שמשהו מסוכן יוצא. שיעורים [[m2-l7]], [[m3-l1]], [[m6-l1]], [[m3-l10]], [[m7-l1]], [[m7-l2]].', c: 'l2' },
          { title: '4 · בחירת מוצר ומודל', tag: '12%', body: 'איזון בין יכולת למהירות ומחיר. בודקים מודלים על דוגמאות אמיתיות. תוכניות עסקיות לניהול ובקרת מידע. חיפוש למידע עדכני; פלטפורמות ענן לצרכים של ארגונים. שיעורים [[m1-l4]], [[m1-l9]], [[m3-l6]], [[m6-l2]].', c: 'lx' },
          { title: '5 · הגדרות וניהול ידע', tag: '12%', body: 'מקור אמת עדכני אחד. כללים בהוראות פרויקט או CLAUDE.md; נהלים ב-Skills; גישה למידע דרך חיבורים ו-MCP. מוחקים קבצים ישנים ורגישים. שיעורים [[m2-l1]], ‏[[m2-l4]], ‏[[m4-l2]], [[m2-l9]], [[m2-l10]], [[m2-l14]], [[m6-l3]].', c: 'l3' },
          { title: '6 · ממשל, סיכונים ושימוש אחראי', tag: '15%', body: 'לפי המדיניות. מזעור מידע אישי. פיקוח אנושי בהחלטות על אנשים, בריאות, כסף, חוק. מינימום הרשאות. תוכן מבחוץ = מידע (Prompt injection). שקיפות. שיעורים [[m1-l8]], [[m1-l9]], [[m3-l7]], [[m7-l5]].', c: 'l2' },
          { title: '7 · פתרון תקלות ושיפור', tag: '10%', body: 'שיחה ארוכה שסוטה → שיחה חדשה עם סיכום. תשובה נחתכת → max_tokens. ‏429 → המתנה הדרגתית. עלות גבוהה → Caching, מודל קטן, היסטוריה קצרה. איטי → Streaming. משנים דבר אחד ובודקים שוב. שיעורים [[m1-l2]], [[m3-l5]], [[m6-l5]].', c: 'l1' }
        ] },
        { t: 'callout', kind: 'tip', en: 'Find your weakest domain: on the Practice exam page, tap a domain to practise only those questions. Start with the lowest score, not the topic you enjoy most.', he: 'מוצאים את הנושא הכי חלש: בעמוד מבחן התרגול לוחצים על נושא כדי לתרגל רק אותו. מתחילים מהציון הכי נמוך, לא מהנושא שהכי כיף לכם.' },
        { t: 'checklist', id: 'm5-l3-plan', title: { en: 'Your 14-day plan', he: 'תוכנית 14 הימים שלכם' }, en: ['Days 1–2: Quick 20 on the Practice exam page, note your two weakest domains', 'Days 3–5: Re-read the lessons for weak domain #1; practise that domain', 'Days 6–8: Same for weak domain #2', 'Day 9: Full simulation #1 (120 minutes, real conditions)', 'Days 10–11: Review every wrong answer; “Retry my mistakes”', 'Day 12: Light review of all seven domain cards', 'Day 13: Full simulation #2 — aim for 80%+', 'Day 14: Rest, check the exam-day list, book or sit the exam'], he: ['ימים 1–2: ‏20 שאלות מהירות בעמוד מבחן התרגול, רושמים את שני הנושאים החלשים', 'ימים 3–5: קוראים שוב את השיעורים של נושא חלש 1; מתרגלים אותו', 'ימים 6–8: אותו דבר לנושא חלש 2', 'יום 9: סימולציה מלאה 1 (120 דקות, תנאים אמיתיים)', 'ימים 10–11: עוברים על כל תשובה שגויה; "לתרגל את הטעויות שלי"', 'יום 12: חזרה קלה על שבעת כרטיסי הנושאים', 'יום 13: סימולציה מלאה 2 — מכוונים ל-80% ומעלה', 'יום 14: מנוחה, רשימת יום המבחן, נרשמים או ניגשים'] }
      ],
      check: [
        { id: 'm5-l3-c1', d: 'd5', a: [1], en: { q: 'Where should a stable rule like “always run tests before saying a coding task is done” live for Claude Code?', o: ['In each chat message', 'In the project’s CLAUDE.md', 'In a Figma comment', 'In the API key name'], why: 'CLAUDE.md is the lasting project memory Claude Code reads each session.' }, he: { q: 'איפה צריך להיות כלל קבוע כמו "תמיד להריץ בדיקות לפני שאומרים שמשימת קוד הסתיימה" בשביל Claude Code?', o: ['בכל הודעה בצ׳אט', 'ב-CLAUDE.md של הפרויקט', 'בהערה ב-Figma', 'בשם של מפתח ה-API'], why: 'CLAUDE.md הוא הזיכרון הקבוע של הפרויקט ש-Claude Code קורא בכל עבודה.' } },
        { id: 'm5-l3-c2', d: 'd7', a: [2], en: { q: 'Your practice scores are 85% in prompting but 55% in evaluation. What should you study next?', o: ['More prompting — it is your strength', 'Nothing — the average is fine', 'Evaluation lessons and domain practice, because it is weak and carries the most weight', 'Only the glossary'], why: 'Fix the weakest, heaviest domain first: it moves your total score the most.' }, he: { q: 'בתרגול יש לכם 85% בפרומפטים אבל 55% בהערכת תוצרים. מה לומדים עכשיו?', o: ['עוד פרומפטים — זה החוזק שלכם', 'כלום — הממוצע בסדר', 'שיעורי ההערכה ותרגול בנושא, כי הוא חלש והכי כבד במבחן', 'רק את המילון'], why: 'מתקנים קודם את הנושא החלש והכבד: הוא מזיז הכי הרבה את הציון הכולל.' } }
      ]
    },
    /* ---------------------------------------------------------------- 5.4 */
    {
      id: 'm5-l4', minutes: 125, domains: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'],
      title: { en: 'The full exam simulation', he: 'סימולציית המבחן המלאה' },
      tldr: {
        en: 'Sixty questions, 120 minutes, mixed across all seven domains by weight, with flags and a review screen before you submit — like the real exam. Then read your domain scores and plan your last study days.',
        he: 'שישים שאלות, 120 דקות, מכל שבעת הנושאים לפי משקל, עם סימונים ומסך סקירה לפני ההגשה — כמו המבחן האמיתי. אחר כך קוראים את הציון לפי נושא ומתכננים את ימי הלימוד האחרונים.'
      },
      goals: {
        en: ['Sit a full simulation under real conditions', 'Use the review screen like in the real exam', 'Turn your results into a study plan'],
        he: ['לעשות סימולציה מלאה בתנאים אמיתיים', 'להשתמש במסך הסקירה כמו במבחן האמיתי', 'להפוך את התוצאות לתוכנית לימוד']
      },
      terms: [['Simulation', 'סימולציה: חזרה גנרלית בתנאים של הדבר האמיתי.'], ['Review screen', 'מסך סקירה: רשימת כל השאלות לפני ההגשה.'], ['Flag', 'סימון שאלה כדי לחזור אליה.']],
      blocks: [
        { t: 'p', en: 'This is the final station. Treat it like exam day: the same time limit, no notes, no help, no pauses. The questions are mixed across the seven domains in the same proportions as the real exam, and you will not see answers until you submit.', he: 'זו התחנה האחרונה. מתייחסים אליה כמו ליום המבחן: אותה מגבלת זמן, בלי דפים, בלי עזרה, בלי הפסקות. השאלות מעורבות משבעת הנושאים באותם יחסים כמו במבחן האמיתי, ואת התשובות רואים רק אחרי ההגשה.' },
        { t: 'widget', name: 'examsim', cfg: { rules: {
          en: ['I have 2 hours without interruptions', 'Phone away, notifications off', 'No notes, no other tabs, no AI help', 'I will answer every question, flag doubts, and use the review screen', 'I will not pause the timer'],
          he: ['יש לי שעתיים בלי הפרעות', 'טלפון רחוק, התראות כבויות', 'בלי דפים, בלי לשוניות אחרות, בלי עזרה מ-AI', 'אענה על כל שאלה, אסמן ספקות ואשתמש במסך הסקירה', 'לא אעצור את השעון']
        } } },
        { t: 'h', en: 'After the simulation', he: 'אחרי הסימולציה' },
        { t: 'steps', en: ['Look at the **score by domain**. Red and yellow bars are your plan.', 'Open every wrong answer and read the explanation. Write the rule you missed in your notebook.', 'Use **Retry my mistakes** on the Practice exam page a day later.', 'Re-read the linked lessons for your weakest domain.', 'Take another full simulation on a different day. Two results of 80% or more is a good sign you are ready to book.'], he: ['מסתכלים על **הציון לפי נושא**. הפסים האדומים והצהובים הם התוכנית שלכם.', 'פותחים כל תשובה שגויה וקוראים את ההסבר. כותבים במחברת את הכלל שפספסתם.', 'יום אחרי — **לתרגל את הטעויות שלי** בעמוד מבחן התרגול.', 'קוראים שוב את השיעורים של הנושא הכי חלש.', 'עוד סימולציה מלאה ביום אחר. שתי תוצאות של 80% ומעלה — סימן טוב שאתם מוכנים להירשם.'] },
        { t: 'callout', kind: 'exam', en: 'The real exam reports its own score scale and passing mark. This simulation shows a simple percentage; use it to compare your attempts and find weak domains, not to predict an exact official score.', he: 'המבחן האמיתי מדווח ציון בסולם משלו ועם ציון עובר משלו. הסימולציה מציגה אחוז פשוט — משתמשים בו כדי להשוות ניסיונות ולמצוא נושאים חלשים, לא כדי לחזות ציון רשמי מדויק.' },
        { t: 'key', en: { title: 'Practise the process, not just the questions', body: 'The simulation trains pacing, flagging and reviewing as much as knowledge. Those habits are what keep you calm and accurate on the real day.' }, he: { title: 'מתאמנים על התהליך, לא רק על השאלות', body: 'הסימולציה מאמנת קצב, סימון וסקירה לא פחות מידע. ההרגלים האלה שומרים עליכם רגועים ומדויקים ביום האמיתי.' } }
      ],
      check: [
        { id: 'm5-l4-c1', d: 'd2', a: [0], en: { q: 'After a simulation you scored 78%, with Evaluation at 50% and every other domain above 80%. What is the best next step?', o: ['Study the evaluation lessons, practise that domain, then take another simulation on a different day', 'Book the exam immediately', 'Repeat the same simulation right away until you remember the answers', 'Study the strongest domain again'], why: 'Target the weak, heavy domain, then confirm with a fresh simulation.' }, he: { q: 'בסימולציה קיבלתם 78%, עם 50% בהערכת תוצרים ומעל 80% בכל השאר. מה הצעד הבא הכי טוב?', o: ['ללמוד את שיעורי ההערכה, לתרגל את הנושא, ולעשות סימולציה נוספת ביום אחר', 'להירשם למבחן מיד', 'לחזור מיד על אותה סימולציה עד שזוכרים את התשובות', 'ללמוד שוב את הנושא הכי חזק'], why: 'מכוונים לנושא החלש והכבד, ואז מאשרים עם סימולציה חדשה.' } }
      ]
    }
  ]
});
