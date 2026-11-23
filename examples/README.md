# Examples for the Extras section

Runnable code from the course's **Extras: Real-world builds** section. Each folder is meant to be copied into
its own project (its own Git repository), not run from here.

| Folder | Recipe | What it is |
|---|---|---|
| `lead-form/` | Website lead form → Claude → Slack | A Vercel function that sorts a contact-form enquiry, drafts a reply and posts it to Slack |
| `receipts/` | Receipts and invoices → one spreadsheet | A Node script that reads PDF receipts and writes one CSV with a "check" column |
| `page-watch/` | Watch pages and propose updates by pull request | A weekly GitHub Actions workflow plus a script that asks Claude what changed and opens a pull request |
| `help-site/` | Docs → a searchable help site with Q&A | A Vercel function that answers only from your `docs/` folder, with prompt caching |

The team-tracker and inbox-triage recipes need no code: their prompts are in the lessons.

## Before you run them

- Install the packages: `npm install @anthropic-ai/sdk zod` (the help site and page watch need only `@anthropic-ai/sdk`).
- Put keys in environment variables or repository secrets (`ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`), never in the code.
- `page-watch/.github/workflows/watch.yml` only runs when it sits at the root of its own repository.
- Keep private files (receipts, customer data) out of Git with `.gitignore`.
- The examples use `claude-opus-5-5`. For high volume, test a cheaper model on real samples before switching.

## Changing a recipe

The lesson text and these files are linked: after editing an example, run `node scripts/build-extras.mjs` from the
repository root to rebuild `content/m8.js`, then `node scripts/validate.mjs`.
