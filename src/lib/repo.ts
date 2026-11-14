/**
 * Data access layer.
 *
 * Every page and API route talks to these functions only. Underneath there
 * are two sources:
 *   - MongoDB (when MONGODB_URI is set)           -> production
 *   - In-memory sample data (no env var needed)   -> demo / local dev
 *
 * The shape returned to the frontend is the same either way.
 */
import { getDb, hasDatabase } from "./db";
import { SAMPLE_INSTITUTES, SAMPLE_PUBLICATIONS, SAMPLE_RESULTS } from "./sample-data";
import type {
  InstituteDoc,
  InstituteResultRow,
  PublicationDoc,
  PublicationGroup,
  ReferredSubject,
  ResultDoc,
  SemesterResultItem,
  StudentResult,
} from "./types";

type ResultFilter = {
  roll?: number;
  rolls?: number[];
  curriculumId?: string;
  instituteCode?: number;
  semester?: number;
  date?: string;
  fileHash?: string;
};

// ---------- low-level source ----------

async function findResults(f: ResultFilter): Promise<ResultDoc[]> {
  const db = await getDb();
  if (db) {
    const q: Record<string, unknown> = {};
    if (f.roll != null) q.roll = f.roll;
    if (f.rolls) q.roll = { $in: f.rolls };
    if (f.curriculumId) q.curriculumId = f.curriculumId;
    if (f.instituteCode != null) q.instituteCode = f.instituteCode;
    if (f.semester != null) q.semester = f.semester;
    if (f.date) q.date = f.date;
    if (f.fileHash) q.fileHash = f.fileHash;
    return db.collection<ResultDoc>("results").find(q, { projection: { _id: 0 } }).limit(20000).toArray();
  }
  return SAMPLE_RESULTS.filter(
    (r) =>
      (f.roll == null || r.roll === f.roll) &&
      (!f.rolls || f.rolls.includes(r.roll)) &&
      (!f.curriculumId || r.curriculumId === f.curriculumId) &&
      (f.instituteCode == null || r.instituteCode === f.instituteCode) &&
      (f.semester == null || r.semester === f.semester) &&
      (!f.date || r.date === f.date) &&
      (!f.fileHash || r.fileHash === f.fileHash),
  );
}

async function findPublications(f: { date?: string } = {}): Promise<PublicationDoc[]> {
  const db = await getDb();
  if (db) {
    const q: Record<string, unknown> = {};
    if (f.date) q.date = f.date;
    return db
      .collection<PublicationDoc>("publications")
      .find(q, { projection: { _id: 0 } })
      .sort({ date: -1, fileName: 1 })
      .toArray();
  }
  return [...SAMPLE_PUBLICATIONS]
    .filter((p) => !f.date || p.date === f.date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.fileName.localeCompare(b.fileName)));
}

async function findInstitutes(f: { codes?: number[]; q?: string; limit?: number } = {}): Promise<InstituteDoc[]> {
  const db = await getDb();
  const limit = f.limit ?? 20;
  if (db) {
    const q: Record<string, unknown> = {};
    if (f.codes) q.code = { $in: f.codes };
    if (f.q) {
      const n = Number(f.q);
      q.$or = [{ name: { $regex: escapeRegex(f.q), $options: "i" } }, { district: { $regex: escapeRegex(f.q), $options: "i" } }];
      if (Number.isInteger(n)) (q.$or as unknown[]).push({ code: n });
    }
    return db.collection<InstituteDoc>("institutes").find(q, { projection: { _id: 0 } }).limit(limit).toArray();
  }
  const needle = (f.q ?? "").toLowerCase();
  return SAMPLE_INSTITUTES.filter(
    (i) =>
      (!f.codes || f.codes.includes(i.code)) &&
      (!needle || i.name.toLowerCase().includes(needle) || (i.district ?? "").toLowerCase().includes(needle) || String(i.code).includes(needle)),
  ).slice(0, limit);
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- shaping helpers ----------

function toItem(r: ResultDoc): SemesterResultItem {
  return {
    date: r.date,
    fileName: r.fileName,
    fileHash: r.fileHash,
    semester: r.semester,
    instituteCode: r.instituteCode,
    gpa: r.gpa,
    cgpa: r.cgpa,
    referred: r.referred ?? [],
    status: r.status,
  };
}

/** Group one student's rows into the per-semester structure the UI renders. */
function shapeStudent(rows: ResultDoc[], institutes: Map<number, InstituteDoc>): StudentResult {
  const bySem = new Map<number, ResultDoc[]>();
  for (const r of rows) bySem.set(r.semester, [...(bySem.get(r.semester) ?? []), r]);

  const semesterResults = [...bySem.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([semester, list]) => {
      const sorted = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
      return { semester, status: sorted[0].status, results: sorted.map(toItem) };
    });

  const currentFailedSubjects: ReferredSubject[] = [];
  for (const s of semesterResults) {
    if (s.status === "referred") currentFailedSubjects.push(...s.results[0].referred);
  }

  const latestDate = rows.reduce((m, r) => (r.date > m ? r.date : m), "");
  const latestResults = rows.filter((r) => r.date === latestDate).map(toItem);
  const latest = rows.find((r) => r.date === latestDate) ?? rows[0];
  const instCode = latest.instituteCode;

  return {
    roll: latest.roll,
    curriculumId: latest.curriculumId,
    regulation: latest.regulation,
    institute: instCode != null ? (institutes.get(instCode) ?? { code: instCode, name: `Institute ${instCode}`, district: null }) : null,
    currentFailedSubjects,
    semesterResults,
    latestResults,
  };
}

async function instituteMap(codes: (number | null)[]) {
  const unique = [...new Set(codes.filter((c): c is number => c != null))];
  if (unique.length === 0) return new Map<number, InstituteDoc>();
  const list = await findInstitutes({ codes: unique, limit: unique.length });
  return new Map(list.map((i) => [i.code, i]));
}

// ---------- public API used by routes/pages ----------

export async function getStudentResults(roll: number, curriculumId?: string | null): Promise<StudentResult[]> {
  const rows = await findResults({ roll, curriculumId: curriculumId || undefined });
  if (rows.length === 0) return [];
  // A roll can exist in more than one curriculum (e.g. SSC voc + diploma). Return one block per curriculum.
  const byCur = new Map<string, ResultDoc[]>();
  for (const r of rows) byCur.set(r.curriculumId, [...(byCur.get(r.curriculumId) ?? []), r]);
  const insts = await instituteMap(rows.map((r) => r.instituteCode));
  return [...byCur.values()].map((list) => shapeStudent(list, insts));
}

export async function getGroupResults(rolls: number[], curriculumId?: string | null) {
  const rows = await findResults({ rolls, curriculumId: curriculumId || undefined });
  const insts = await instituteMap(rows.map((r) => r.instituteCode));
  const byRoll = new Map<number, ResultDoc[]>();
  for (const r of rows) byRoll.set(r.roll, [...(byRoll.get(r.roll) ?? []), r]);
  return rolls.map((roll) => {
    const list = byRoll.get(roll);
    return { roll, found: Boolean(list), result: list ? shapeStudent(list, insts) : null };
  });
}

export async function getInstituteResults(params: { instituteCode: number; curriculumId?: string | null; semester?: number | null; date?: string | null }) {
  const [inst] = await findInstitutes({ codes: [params.instituteCode], limit: 1 });
  const rows = await findResults({
    instituteCode: params.instituteCode,
    curriculumId: params.curriculumId || undefined,
    semester: params.semester ?? undefined,
    date: params.date ?? undefined,
  });
  const byFile = new Map<string, ResultDoc[]>();
  for (const r of rows) byFile.set(r.fileHash, [...(byFile.get(r.fileHash) ?? []), r]);
  const publications = [...byFile.values()]
    .map((list) => {
      const first = list[0];
      const rowsOut: InstituteResultRow[] = list
        .sort((a, b) => a.roll - b.roll)
        .map((r) => ({ roll: r.roll, status: r.status, gpa: r.gpa, cgpa: r.cgpa, referred: r.referred ?? [] }));
      const passed = rowsOut.filter((r) => r.status === "passed").length;
      return {
        fileName: first.fileName,
        fileHash: first.fileHash,
        date: first.date,
        semester: first.semester,
        regulation: first.regulation,
        curriculumId: first.curriculumId,
        stats: { total: rowsOut.length, passed, referred: rowsOut.length - passed },
        rows: rowsOut,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.semester - a.semester));
  return { institute: inst ?? null, publications };
}

function groupPublications(pubs: PublicationDoc[]): PublicationGroup[] {
  const byDate = new Map<string, PublicationDoc[]>();
  for (const p of pubs) byDate.set(p.date, [...(byDate.get(p.date) ?? []), p]);
  return [...byDate.entries()].map(([date, files]) => {
    const stats = files.reduce(
      (acc, f) => ({ total: acc.total + f.stats.total, passed: acc.passed + f.stats.passed, referred: acc.referred + f.stats.referred }),
      { total: 0, passed: 0, referred: 0 },
    );
    return {
      date,
      files,
      stats,
      curricula: [...new Set(files.map((f) => f.curriculumId))],
      semesters: [...new Set(files.map((f) => f.semester))].sort((a, b) => a - b),
    };
  });
}

export async function getLatestPublications(page = 1, perPage = 20) {
  const groups = groupPublications(await findPublications());
  const pages = Math.max(1, Math.ceil(groups.length / perPage));
  const p = Math.min(Math.max(1, page), pages);
  return { groups: groups.slice((p - 1) * perPage, p * perPage), total: groups.length, page: p, pages };
}

export async function getPublicationsByDate(date: string): Promise<PublicationGroup | null> {
  const groups = groupPublications(await findPublications({ date }));
  return groups[0] ?? null;
}

export async function getPublicationResults(fileHash: string) {
  const rows = await findResults({ fileHash });
  const insts = await instituteMap(rows.map((r) => r.instituteCode));
  const byInst = new Map<number | null, ResultDoc[]>();
  for (const r of rows) byInst.set(r.instituteCode, [...(byInst.get(r.instituteCode) ?? []), r]);
  return [...byInst.entries()].map(([code, list]) => ({
    institute: code != null ? (insts.get(code) ?? { code, name: `Institute ${code}`, district: null }) : null,
    rows: list.sort((a, b) => a.roll - b.roll).map((r) => ({ roll: r.roll, status: r.status, gpa: r.gpa, cgpa: r.cgpa, referred: r.referred ?? [] })),
  }));
}

export async function searchInstitutes(q: string, limit = 20) {
  return findInstitutes({ q, limit });
}

export async function getSiteStats() {
  const db = await getDb();
  if (db) {
    const [results, institutes, publications] = await Promise.all([
      db.collection("results").estimatedDocumentCount(),
      db.collection("institutes").estimatedDocumentCount(),
      db.collection("publications").estimatedDocumentCount(),
    ]);
    return { results, institutes, publications, source: "mongodb" as const };
  }
  return {
    results: SAMPLE_RESULTS.length,
    institutes: SAMPLE_INSTITUTES.length,
    publications: SAMPLE_PUBLICATIONS.length,
    source: "sample" as const,
  };
}

export { hasDatabase };
