/**
 * Deterministic synthetic sample data.
 *
 * It is generated in memory (no JSON files) so the site works out of the box
 * without a database. None of these roll numbers, institutes or results are
 * real. Run `npm run import -- <pdf>` with a real BTEB PDF to replace it.
 */
import type { InstituteDoc, PublicationDoc, ResultDoc } from "./types";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SAMPLE_INSTITUTES: InstituteDoc[] = [
  { code: 99901, name: "Demo Polytechnic Institute", district: "Dhaka" },
  { code: 99902, name: "Model Polytechnic Institute", district: "Chattogram" },
  { code: 99903, name: "Sample Technical School & College", district: "Khulna" },
];

const SUBJECTS: Record<number, number[]> = {
  1: [25711, 25712, 25911, 25912, 26711],
  2: [25721, 25722, 25921, 25922, 26721],
  3: [25731, 25732, 25931, 26731, 66731],
  4: [25741, 25742, 25941, 26741, 66741],
  5: [25751, 25752, 25951, 66751, 67751],
};

type Pub = { date: string; semester: number; fileName: string; passRate: number };

const ENGG_PUBS: Pub[] = [
  { date: "2025-03-10", semester: 1, fileName: "RESULT_1st_2022_Regulation.pdf", passRate: 0.55 },
  { date: "2025-09-02", semester: 2, fileName: "RESULT_2nd_2022_Regulation.pdf", passRate: 0.6 },
  { date: "2026-04-28", semester: 3, fileName: "RESULT_3rd_2022_Regulation.pdf", passRate: 0.62 },
  { date: "2026-11-10", semester: 4, fileName: "RESULT_4th_2022_Regulation.pdf", passRate: 0.66 },
];

const BMT_PUBS: Pub[] = [{ date: "2026-11-04", semester: 1, fileName: "RESULT_HSC_BMT_1st_Year.pdf", passRate: 0.7 }];

function hashOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "sample-" + (h >>> 0).toString(16).padStart(8, "0");
}

function build() {
  const results: ResultDoc[] = [];
  const publications: PublicationDoc[] = [];

  const make = (
    curriculumId: string,
    regulation: number,
    pubs: Pub[],
    rolls: { instituteCode: number; from: number; to: number }[],
  ) => {
    // Track students who already failed (referred) so later semesters keep a realistic carry-over.
    const failedBefore = new Set<number>();
    for (const pub of pubs) {
      const rnd = mulberry32(pub.semester * 7919 + regulation);
      const fileHash = hashOf(`${curriculumId}/${pub.fileName}/${pub.date}`);
      let total = 0;
      let passed = 0;
      const instCodes = new Set<number>();
      for (const range of rolls) {
        instCodes.add(range.instituteCode);
        for (let roll = range.from; roll <= range.to; roll++) {
          // ~8% of students drop out after a failed semester
          if (failedBefore.has(roll) && rnd() < 0.08) continue;
          total++;
          const pass = rnd() < pub.passRate;
          if (pass) {
            passed++;
            const gpa = Math.round((2.3 + rnd() * 1.7) * 100) / 100;
            results.push({
              roll,
              curriculumId,
              regulation,
              semester: pub.semester,
              instituteCode: range.instituteCode,
              status: "passed",
              gpa: Math.min(gpa, 4),
              cgpa: null,
              referred: [],
              date: pub.date,
              fileName: pub.fileName,
              fileHash,
            });
          } else {
            failedBefore.add(roll);
            const pool = SUBJECTS[pub.semester] ?? SUBJECTS[1];
            const n = 1 + Math.floor(rnd() * 3);
            const picked = [...pool].sort(() => rnd() - 0.5).slice(0, n);
            const types = ["T", "P", "T,P", "T", "T"];
            results.push({
              roll,
              curriculumId,
              regulation,
              semester: pub.semester,
              instituteCode: range.instituteCode,
              status: "referred",
              gpa: null,
              cgpa: null,
              referred: picked.map((code) => ({ code, type: types[Math.floor(rnd() * types.length)] })),
              date: pub.date,
              fileName: pub.fileName,
              fileHash,
            });
          }
        }
      }
      publications.push({
        fileName: pub.fileName,
        fileHash,
        date: pub.date,
        curriculumId,
        regulation,
        semester: pub.semester,
        stats: { total, passed, referred: total - passed },
        instituteCount: instCodes.size,
      });
    }
  };

  make("diploma_in_engineering", 2022, ENGG_PUBS, [
    { instituteCode: 99901, from: 700001, to: 700060 },
    { instituteCode: 99902, from: 700061, to: 700100 },
  ]);
  make("hsc_bmt", 2021, BMT_PUBS, [{ instituteCode: 99903, from: 500001, to: 500030 }]);

  return { results, publications };
}

const built = build();
export const SAMPLE_RESULTS: ResultDoc[] = built.results;
export const SAMPLE_PUBLICATIONS: PublicationDoc[] = built.publications;

/** A roll number that exists in the sample data, used as the placeholder in forms. */
export const SAMPLE_ROLL = 700001;
