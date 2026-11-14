/**
 * BTEB result-book parser.
 *
 * BTEB publishes every result as a PDF "result book". Once the PDF text is
 * extracted (pdf-parse / pypdf), the body looks like this:
 *
 *   46080 - Fisheries Training and Extension Centre ,Faridpur      <- institute header
 *   100339 ( 4.00 ) 100340 ( 3.97 ) 100341 ( 4.00 )                 <- passed: roll ( GPA )
 *   700117 {  6851(T) }  784730 { 25913 (T,P), 25921 (T) }         <- referred: roll { subject(T/P/C), ... }
 *   921514 { 3.93 }                                                 <- some books put the GPA in braces
 *
 * T = theory, P = practical, T,P = both, C = continuous assessment.
 * This module is pure (no I/O) so it can be unit-tested and reused by the
 * CLI scripts and by server code.
 */
import type { InstituteDoc, ReferredSubject, ResultStatus } from "./types";

export type ParsedEntry = {
  roll: number;
  instituteCode: number | null;
  status: ResultStatus;
  gpa: number | null;
  referred: ReferredSubject[];
};

export type ParsedBook = {
  institutes: InstituteDoc[];
  entries: ParsedEntry[];
  stats: { total: number; passed: number; referred: number };
};

const INST_RE = /^\s*(\d{4,6})\s*[-:]\s*([^\n]+?)\s*$/;
// roll followed by either ( GPA ) or { anything up to the closing brace }
const ENTRY_RE = /(\d{6}|\d{10})\s*(?:\(\s*(\d(?:\.\d{1,2})?)\s*\)|\{([^}]*)\})/g;
const GPA_RE = /^\d(?:\.\d{1,2})?$/;
const SUBJ_RE = /(\d{4,6})\s*\(\s*([TPC](?:\s*,\s*[TPC])*)\s*\)/g;

export function parseInstituteHeader(line: string): InstituteDoc | null {
  const m = line.match(INST_RE);
  if (!m) return null;
  if (/[({]\s*\d/.test(line)) return null; // this is a result line, not a header
  let name = m[2].replace(/\s*,\s*/g, ", ").trim();
  if (!/[A-Za-z]{3,}/.test(name)) return null;
  let district: string | null = null;
  const parts = name.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    district = parts[parts.length - 1];
    name = parts.slice(0, -1).join(", ");
  }
  return { code: Number(m[1]), name, district };
}

export function parseResultText(text: string): ParsedBook {
  const lines = text.split(/\r?\n/);
  const entries: ParsedEntry[] = [];
  const institutes = new Map<number, InstituteDoc>();
  let current: InstituteDoc | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const inst = parseInstituteHeader(line);
    if (inst) {
      current = inst;
      institutes.set(inst.code, inst);
      continue;
    }

    ENTRY_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ENTRY_RE.exec(line))) {
      const roll = Number(m[1]);
      const body = (m[2] ?? m[3] ?? "").trim();
      if (GPA_RE.test(body)) {
        entries.push({ roll, instituteCode: current?.code ?? null, status: "passed", gpa: Number(body), referred: [] });
        continue;
      }
      const referred: ReferredSubject[] = [];
      SUBJ_RE.lastIndex = 0;
      let s: RegExpExecArray | null;
      while ((s = SUBJ_RE.exec(body))) referred.push({ code: Number(s[1]), type: s[2].replace(/\s/g, "") });
      if (referred.length === 0) {
        const codes = body.match(/\d{4,6}/g);
        if (!codes) continue; // not a result entry at all
        for (const c of codes) referred.push({ code: Number(c), type: "T" });
      }
      entries.push({ roll, instituteCode: current?.code ?? null, status: "referred", gpa: null, referred });
    }
  }

  // de-duplicate: the same roll can appear twice when a page break splits a line
  const seen = new Map<number, ParsedEntry>();
  for (const e of entries) seen.set(e.roll, e);
  const unique = [...seen.values()];
  const passed = unique.filter((e) => e.status === "passed").length;
  return {
    institutes: [...institutes.values()],
    entries: unique,
    stats: { total: unique.length, passed, referred: unique.length - passed },
  };
}

/** Guess semester / regulation / curriculum from a BTEB file name such as "RESULT_5th_2022_Regulation.pdf". */
export function guessMetaFromFileName(fileName: string) {
  const sem = fileName.match(/(\d)(?:st|nd|rd|th)/i);
  const reg = fileName.match(/(20(?:10|16|22))/);
  const f = fileName.toLowerCase();
  let curriculumId: string | null = null;
  if (/marine/.test(f)) curriculumId = "certificate_in_marine_trade";
  else if (/tourism/.test(f)) curriculumId = "diploma_in_tourism_and_hospitality";
  else if (/textile/.test(f)) curriculumId = "diploma_in_textile_engineering";
  else if (/agri/.test(f)) curriculumId = "diploma_in_agriculture";
  else if (/fish/.test(f)) curriculumId = "diploma_in_fisheries";
  else if (/forest/.test(f)) curriculumId = "diploma_in_forestry";
  else if (/livestock/.test(f)) curriculumId = "diploma_in_livestock";
  else if (/naval/.test(f)) curriculumId = "diploma_in_engineering_naval";
  else if (/army/.test(f)) curriculumId = "diploma_in_engineering_army";
  else if (/bmt/.test(f)) curriculumId = "hsc_bmt";
  else if (/hsc/.test(f)) curriculumId = "hsc_vocational";
  else if (/dakhil/.test(f)) curriculumId = "dakhil_vocational";
  else if (/ssc/.test(f)) curriculumId = "ssc_vocational";
  else if (/regulation|allied|irr|engg|engineering/.test(f)) curriculumId = "diploma_in_engineering";
  return {
    semester: sem ? Number(sem[1]) : null,
    regulation: reg ? Number(reg[1]) : null,
    curriculumId,
  };
}
