/** BTEB letter grade for a GPA / CGPA value. */
export function letterGrade(gpa: number): string {
  if (gpa >= 4) return "A+";
  if (gpa >= 3.75) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3.25) return "B+";
  if (gpa >= 3) return "B";
  if (gpa >= 2.75) return "B-";
  if (gpa >= 2.5) return "C+";
  if (gpa >= 2.25) return "C";
  if (gpa >= 2) return "D";
  return "F";
}

/** Marks (%) to grade point on the BTEB scale. */
export function marksToPoint(marks: number): { point: number; grade: string } {
  if (marks >= 80) return { point: 4.0, grade: "A+" };
  if (marks >= 75) return { point: 3.75, grade: "A" };
  if (marks >= 70) return { point: 3.5, grade: "A-" };
  if (marks >= 65) return { point: 3.25, grade: "B+" };
  if (marks >= 60) return { point: 3.0, grade: "B" };
  if (marks >= 55) return { point: 2.75, grade: "B-" };
  if (marks >= 50) return { point: 2.5, grade: "C+" };
  if (marks >= 45) return { point: 2.25, grade: "C" };
  if (marks >= 40) return { point: 2.0, grade: "D" };
  return { point: 0, grade: "F" };
}

/** Semester weights (%) BTEB uses to compute the diploma CGPA. */
export const CGPA_WEIGHTS: Record<string, number[]> = {
  "2022": [5, 5, 5, 10, 15, 20, 25, 15],
  "2016": [5, 5, 5, 10, 15, 20, 25, 15],
  "2010": [5, 5, 5, 10, 15, 20, 25, 15],
};

export function computeCgpa(gpas: (number | null)[], regulation = "2022"): number | null {
  const w = CGPA_WEIGHTS[regulation] ?? CGPA_WEIGHTS["2022"];
  let total = 0;
  let weight = 0;
  gpas.forEach((g, i) => {
    if (g == null || Number.isNaN(g)) return;
    total += g * w[i];
    weight += w[i];
  });
  if (weight === 0) return null;
  return Math.round((total / weight) * 100) / 100;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDate(iso: string) {
  const d = new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** 2026-11-10 -> 10-11-2026 (used in URLs) */
export function dateToSlug(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
}

/** 10-11-2026 -> 2026-11-10 */
export function slugToDate(slug: string) {
  const m = slug.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function pct(part: number, total: number) {
  if (!total) return "0.00%";
  return ((part / total) * 100).toFixed(2) + "%";
}
