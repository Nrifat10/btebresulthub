/**
 * Import one BTEB result PDF into MongoDB.
 *
 *   npm run import -- ./pdfs/RESULT_5th_2022_Regulation.pdf \
 *       --date 2026-11-10 --semester 5 --regulation 2022 \
 *       --curriculum diploma_in_engineering [--cgpa] [--source <url>] [--dry-run]
 *
 * --dry-run  parse and print statistics only, nothing is written (no DB needed)
 * --cgpa     the numbers in this book are final CGPA (8th semester books), not GPA
 *
 * Semester, regulation and curriculum are guessed from the file name when omitted.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
// Import the inner module: the package entry runs a debug self-test when loaded outside CommonJS.
// @ts-expect-error no type declarations for the inner path
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { CURRICULUM_MAP } from "../src/lib/curricula";
import { guessMetaFromFileName, parseResultText } from "../src/lib/parser";
import type { PublicationDoc, ResultDoc } from "../src/lib/types";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) process.loadEnvFile(f);
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const file = process.argv[2];
  if (!file || file.startsWith("--")) {
    console.error("Usage: npm run import -- <file.pdf|file.txt> --date YYYY-MM-DD [--semester N] [--regulation YYYY] [--curriculum id] [--cgpa] [--source url] [--dry-run]");
    process.exit(1);
  }
  const fileName = path.basename(file);
  const buf = readFileSync(file);
  const fileHash = createHash("sha256").update(buf).digest("base64");

  // 1. PDF -> text  (a .txt file is accepted too, handy for testing the parser)
  const text = fileName.toLowerCase().endsWith(".txt") ? buf.toString("utf8") : ((await pdfParse(buf)).text as string);

  // 2. text -> structured rows
  const book = parseResultText(text);

  const guess = guessMetaFromFileName(fileName);
  const semester = Number(arg("semester") ?? guess.semester);
  const regulation = arg("regulation") ? Number(arg("regulation")) : guess.regulation;
  const curriculumId = arg("curriculum") ?? guess.curriculumId;
  const date = arg("date");
  const isCgpa = flag("cgpa");

  console.log(`File        : ${fileName}`);
  console.log(`Curriculum  : ${curriculumId}`);
  console.log(`Semester    : ${semester}   Regulation: ${regulation ?? "-"}   Date: ${date ?? "-"}`);
  console.log(`Institutes  : ${book.institutes.length}`);
  console.log(`Students    : ${book.stats.total}  (passed ${book.stats.passed}, referred ${book.stats.referred})`);
  console.log("First rows  :", JSON.stringify(book.entries.slice(0, 3)));

  if (book.stats.total === 0) {
    console.error("\nNo result entries found. The PDF may be a scanned image (needs OCR) or use a layout this parser does not know.");
    process.exit(2);
  }
  if (flag("dry-run")) return console.log("\nDry run: nothing written.");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("--date YYYY-MM-DD is required");
  if (!Number.isInteger(semester) || semester < 1) throw new Error("--semester is required (could not guess it from the file name)");
  if (!curriculumId || !CURRICULUM_MAP.has(curriculumId)) throw new Error(`--curriculum is required. Valid ids: ${[...CURRICULUM_MAP.keys()].join(", ")}`);
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (put it in .env.local)");

  // 3. rows -> MongoDB
  const client = await new MongoClient(uri).connect();
  try {
    const db = client.db(process.env.MONGODB_DB || "btebresult");

    const docs: ResultDoc[] = book.entries.map((e) => ({
      roll: e.roll,
      curriculumId,
      regulation,
      semester,
      instituteCode: e.instituteCode,
      status: e.status,
      gpa: isCgpa ? null : e.gpa,
      cgpa: isCgpa ? e.gpa : null,
      referred: e.referred,
      date,
      fileName,
      fileHash,
    }));

    // upsert so importing the same PDF twice never creates duplicates
    for (let i = 0; i < docs.length; i += 1000) {
      await db.collection("results").bulkWrite(
        docs.slice(i, i + 1000).map((d) => ({ updateOne: { filter: { fileHash: d.fileHash, roll: d.roll }, update: { $set: d }, upsert: true } })),
        { ordered: false },
      );
      process.stdout.write(`\rresults: ${Math.min(i + 1000, docs.length)}/${docs.length}`);
    }
    console.log();

    if (book.institutes.length) {
      await db.collection("institutes").bulkWrite(
        book.institutes.map((i) => ({ updateOne: { filter: { code: i.code }, update: { $set: i }, upsert: true } })),
        { ordered: false },
      );
    }

    const pub: PublicationDoc = {
      fileName,
      fileHash,
      date,
      curriculumId,
      regulation,
      semester,
      stats: book.stats,
      instituteCount: book.institutes.length,
      ...(arg("source") ? { sourceUrl: arg("source") } : {}),
    };
    await db.collection("publications").updateOne({ fileHash }, { $set: pub }, { upsert: true });
    console.log("Import complete.");
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error("\nImport failed:", e.message);
  process.exit(1);
});
