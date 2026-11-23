// api/ask.js: answer questions using only the docs. Prompt caching makes repeat questions cheaper.
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const docs = fs.readdirSync("docs")
  .filter((f) => f.endsWith(".md"))
  .map((f) => `<doc path="${f}">\n${fs.readFileSync(path.join("docs", f), "utf8")}\n</doc>`)
  .join("\n");

export default async function handler(req, res) {
  const question = String(req.body?.question || "").slice(0, 1000);
  if (!question) return res.status(400).json({ error: "Please ask a question." });

  const response = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "low" },
    system: [{
      type: "text",
      text:
        "Answer only from the documents below. Name the doc path you used. " +
        "If the documents do not cover the question, say you do not know and suggest who to ask.\n\n" + docs,
      cache_control: { type: "ephemeral" }, // the docs are cached; each question pays only for itself
    }],
    messages: [{ role: "user", content: question }],
  });
  const answer = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  res.status(200).json({ answer });
}
