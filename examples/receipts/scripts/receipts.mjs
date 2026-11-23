// scripts/receipts.mjs: turn a folder of PDF receipts into one CSV.
// Run: node scripts/receipts.mjs receipts/2026-11
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic();
const Receipt = z.object({
  date: z.string(), // YYYY-MM-DD
  supplier: z.string(),
  total: z.number(),
  vat: z.number(),
  currency: z.string(),
  category: z.enum(["materials", "software", "travel", "food", "other"]),
  confidence: z.enum(["high", "medium", "low"]),
});

const dir = process.argv[2];
const rows = [["file", "date", "supplier", "total", "vat", "currency", "category", "check"]];

for (const file of fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".pdf"))) {
  const data = fs.readFileSync(path.join(dir, file)).toString("base64");
  const res = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    messages: [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
        { type: "text", text: "Extract this receipt. Dates as YYYY-MM-DD. If a value is unclear, give your best reading and set confidence to low." },
      ],
    }],
    output_config: { effort: "low", format: zodOutputFormat(Receipt) },
  });
  const r = res.parsed_output;
  if (!r) { rows.push([file, "", "", "", "", "", "", "CHECK BY HAND"]); continue; }
  rows.push([file, r.date, r.supplier, r.total, r.vat, r.currency, r.category, r.confidence === "high" ? "" : "CHECK"]);
}

const csv = rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
fs.writeFileSync(path.join(dir, "receipts.csv"), csv);
console.log(`Saved ${rows.length - 1} receipts to ${dir}/receipts.csv`);
