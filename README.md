# Claude Trainer — Zero to FDE

A step-by-step course that takes someone with **no AI experience** to the point where they can pass the
*Claude Certified Associate – Foundations* exam and build and deploy simple AI solutions for small businesses.

- **Live artifact (share this):** https://claude.ai/artifact/AYd37GNtmYY9t7m9sRAdhF
- **Languages:** English and Hebrew (switch any time at the top). The Hebrew text is written simpler and shorter on purpose,
  with a "small dictionary" of English terms in every lesson, because the exam and the tools are in English.
- **Works on phones first:** bottom tab bar, large touch targets, no sideways scrolling.

> Independent study course. Not made by, affiliated with, or endorsed by Anthropic.

## The journey

The course is drawn as a transit map: each **line** is a module, each **station** is a lesson.

| Line | Title | Lessons |
|---|---|---|
| 1 | How AI like Claude works | What an LLM is · Tokens and the context window · How Claude was made · Apps, plans and models · Your first conversation · Prompting basics · Checking and improving answers · Using AI responsibly |
| 2 | Power user | Projects · Artifacts · Advanced prompting and fixing prompts · Tools, connectors and Skills · MCP · Claude Code and agents · The right tool for each job · Workshop: an assistant for a small business |
| 3 | FDE basics | What an FDE does · The terminal · Git and GitHub · How web apps work · The Claude API · Deploying · AI solutions clients can trust · Capstone |
| 4 | Design with Claude | Design basics (contrast, accessibility, RTL) · Design systems and tokens · Claude Design · Figma and MCP · Paper, Orca and agent-native tools · Reviewing AI-made designs · Workshop: brand kit and landing page |
| 5 | Exam simulation | Know your exam · How to answer scenario questions · Domain review, one page each (+ 14-day plan) · The full exam simulation |
| Final stop | Exam tab | Full simulation (60 questions weighted by the 7 domains, 120-minute timer, flags, review screen), quick 20, practice by domain, retry-my-mistakes |

Every lesson has: a short summary, goals, key-idea cards, diagrams, an interactive exercise, a quick check, and a notes box.

### Interactive parts

- **Terminal simulator** with missions: files (`pwd`, `ls`, `cd`…), **Git** with a live history graph, `npm`/Vite,
  **Vercel** deploys, **Claude Code** (`claude`, `/init`, `claude mcp add`) and **curl calls to the Claude API**
  (with realistic error messages). Tap-to-insert command chips so it works on a phone.
- Next-word predictor with a randomness slider, token counter, prompt builder, MCP config builder with a diagram,
  agent-loop walkthrough, API request builder with cost, monthly cost calculator, "spot the hallucination" checker,
  and card-sorting games.
- Design tools: a WCAG **contrast checker**, a **design-token playground** that outputs CSS variables and
  DTCG-format JSON, a **Figma-to-code mission** in simulated Claude Code (Figma MCP: design context, variables,
  screenshot comparison), and a design-review spot-check.
- Exam tools: an **answer-elimination drill**, and an **exam simulation** with a 2-hour timer, flags and an
  exam-style review screen before you submit.
- **Practice with real Claude:** inside claude.ai the chat and prompt-builder widgets send prompts to Claude
  (on the viewer's own account, after they allow it). Everywhere else they show a sample answer and an "Open in Claude" button.

### Study tools

- Progress tracker (rings and filled stations), **Continue where you stopped**, and **bookmarks** that mark an exact spot.
- **Select any text** in a lesson to highlight it, add a note, save it, copy it, or (inside claude.ai) send a comment to you, the author.
- **Notebook** with highlights, lesson notes, saved key ideas, bookmarks and free pages. Search it, copy everything as Markdown,
  or save it as a file.
- Listen button (read-aloud) where the viewer's Claude app supports it. Text size setting.
- Backup code to move progress to another device.

## Where learners' progress is saved

- Always in the learner's browser (localStorage).
- Inside claude.ai, for signed-in people who can use the page (Contributor or higher), it is also synced to their own
  **private** space in the artifact's database (`data/users/<their id>/state`). Nobody else, including you, can read it.
- People who only have view access (for example someone outside your organization opening a public link) keep progress in
  their browser. The Settings page tells each learner which mode they are in and offers a backup code.

## Sharing

The artifact starts **private**. To share it, open it on claude.ai and use the **Share** menu. Choose who can open it
(people in your organization, specific people, or a public link). To let learners sync progress to their account,
give them at least Contributor access.

## Project layout

```
index.html          Page shell: design tokens, all CSS, and the script tags (published as the artifact page)
js/core.js          Helpers: escaping, inline markdown, icons
js/app.js           Engine: routing, language switch, progress, highlights, notebook, quizzes, exam, saving
js/widgets.js       Interactive widgets and the terminal simulator
content/ui.js       Interface text (EN + HE) and the exam domains with weights
content/m1.js       Line 1 lessons
content/m2.js       Line 2 lessons
content/m3.js       Line 3 lessons
content/m4.js       Line 4 lessons (design)
content/m5.js       Line 5 lessons (exam simulation)
content/exam.js     88-question bank (questions marked mock: false are design extras, kept out of mock exams)
content/glossary.js Glossary
scripts/validate.mjs  Checks every lesson and question has both languages and valid answers
scripts/build.mjs     Builds dist/ for static hosting (Vercel, Netlify, GitHub Pages)
vercel.json         Vercel settings (build command and output folder)
```

## Editing the course

All words live in `content/`. You can ask Claude (in Claude Code or on claude.ai with this repository) to make changes,
for example: *"In lesson 2.4 add a paragraph about the Notion connector, in English and simple Hebrew."*

A lesson looks like this:

```js
{
  id: 'm1-l2', minutes: 8, domains: ['d4', 'd7'],
  title: { en: 'Tokens and the context window', he: 'טוקנים וחלון ההקשר' },
  tldr:  { en: '…', he: '…' },
  goals: { en: ['…'], he: ['…'] },
  terms: [['Token', 'טוקן: …']],          // shown only in Hebrew
  blocks: [ /* see below */ ],
  check: [ /* quick-check questions */ ]
}
```

Block types you can use in `blocks`:

| Type | Fields | Shows as |
|---|---|---|
| `p`, `h`, `h3`, `quote` | `en`, `he` (text) | paragraph, heading, sub-heading, pull quote |
| `list`, `steps` | `en`, `he` (arrays) | bullets, numbered steps |
| `callout` | `kind` = analogy, tip, warn, exam, simple, try, note | coloured box |
| `key` | `{title, body}` | key-idea card with a Save button |
| `table` | `{head: [...], rows: [[...]]}` | table |
| `compare` | `{badT, bad: [...], goodT, good: [...]}` | weaker vs stronger |
| `flow` | `{title, steps: [{t, d, ic}], loop}`; add `h: true` for horizontal on wide screens | step diagram |
| `stack` | `{title, items: [{label, v, c}], note}` | stacked bar |
| `cards` | `[{title, tag, body, c}]` | card grid |
| `code` | `lang`, `file`, `code` | code box with Copy |
| `prompt` | `en`, `he` (prompt text), optional `label` | prompt box with Copy and "Try in Claude" |
| `checklist` | `id`, `title`, `en`, `he` | ticks that are saved |
| `quiz` | `q` (a question object) | inline question |
| `widget` | `name`, `cfg` | interactive widget |

Text supports `**bold**`, `*italic*`, `` `code` `` and `[links](https://…)`.
A block with only `he` appears only in Hebrew (extra help). Questions use `a` for the index (or indexes) of the right options.

After editing, run:

```bash
node scripts/validate.mjs
```

## Updating the live artifact

The artifact is published from this repository. In a Claude session that has this repo, ask:
*"Republish the Claude Trainer artifact at https://claude.ai/artifact/AYd37GNtmYY9t7m9sRAdhF from index.html with all the js/ and content/ files."*
If you add a new content file, also add its `<script>` tag at the bottom of `index.html` and its name in `scripts/validate.mjs`.
The link stays the same, and learners' saved progress is kept.

## Deploying elsewhere (optional)

The same files run as a normal website, saving progress in the browser.

- **Vercel:** import this repository on vercel.com. `vercel.json` already sets the build (`node scripts/build.mjs`) and output (`dist`).
- **Any static host / GitHub Pages:** run `node scripts/build.mjs` and publish the `dist/` folder.
- **Locally:** `node scripts/build.mjs`, then open `dist/index.html` through a local server, for example `cd dist && python3 -m http.server`.

## Accuracy notes

Model names, prices and product features were checked in November 2026. The exam domains and weights come from public
2026 study guides (Prompting 14%, Output Evaluation 21%, Solution Design 16%, Model Selection 12%, Configuration 12%,
Responsible Use 15%, Troubleshooting 10%). Check Anthropic's official certification page and docs
(platform.claude.com/docs) before relying on them.

Design tools (Line 4) move fastest. Facts used: Claude Design launched April 2026 (Anthropic Labs research preview,
team design systems, export to PDF/URL/PPTX/Canva); Figma's official MCP server (remote and desktop; tools such as
`get_design_context`, `get_variable_defs`, `get_screenshot`, Code Connect); Paper (paper.design, HTML/CSS canvas with an
MCP server via Paper Desktop); Orca (onorca.dev, desktop app for parallel coding agents in Git worktrees); DTCG design
tokens format 2025.10. Re-check these before teaching a client.
