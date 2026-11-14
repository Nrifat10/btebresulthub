"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import CurriculumSelect from "@/components/CurriculumSelect";
import { ReferredList } from "@/components/ResultCard";
import { Alert, Spinner, StatTile } from "@/components/ui";
import { curriculumName } from "@/lib/curricula";
import { formatDate, ordinal, pct } from "@/lib/grade";
import type { ApiResponse, InstituteDoc, InstituteResultRow } from "@/lib/types";

type Pub = {
  fileName: string;
  fileHash: string;
  date: string;
  semester: number;
  regulation: number | null;
  curriculumId: string;
  stats: { total: number; passed: number; referred: number };
  rows: InstituteResultRow[];
};
type Data = { institute: InstituteDoc | null; publications: Pub[] };

export default function InstituteClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("instituteCode") ?? "");
  const [suggest, setSuggest] = useState<InstituteDoc[]>([]);
  const [curriculum, setCurriculum] = useState(params.get("curriculumId") ?? "any");
  const [semester, setSemester] = useState(params.get("semester") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  // Suggestions only make sense while typing a name (not a numeric code).
  const canSuggest = !/^\d{4,6}$/.test(q) && q.trim().length >= 2;
  const visibleSuggest = canSuggest ? suggest : [];

  useEffect(() => {
    if (!canSuggest) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/institutes?q=${encodeURIComponent(q.trim())}`);
      const json = (await res.json()) as ApiResponse<InstituteDoc[]>;
      setSuggest(json.success ? json.data : []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, canSuggest]);

  const run = async (code: string, c: string, s: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/institute-results?instituteCode=${code}&curriculumId=${encodeURIComponent(c)}${s ? `&semester=${s}` : ""}`;
      const res = await fetch(url);
      const json = (await res.json()) as ApiResponse<Data>;
      if (!json.success) {
        setError(json.error);
        setData(null);
      } else {
        setData(json.data);
        setOpen(json.data.publications[0]?.fileHash ?? null);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = params.get("instituteCode");
    if (!code) return;
    const t = setTimeout(() => void run(code, params.get("curriculumId") ?? "any", params.get("semester") ?? ""), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = q.trim();
    if (!/^\d{4,6}$/.test(code)) return setError("Enter a numeric institute code, or pick one from the suggestions.");
    router.replace(`/institute-results?instituteCode=${code}&curriculumId=${curriculum}${semester ? `&semester=${semester}` : ""}`, { scroll: false });
    void run(code, curriculum, semester);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <form onSubmit={onSubmit} className="card grid gap-4 p-6 sm:grid-cols-2">
        <div className="relative sm:col-span-2">
          <label htmlFor="inst" className="label">
            Institute code or name <span className="text-rose-600">*</span>
          </label>
          <input id="inst" className="input" placeholder="e.g. 99901 or Demo Polytechnic" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" required />
          {visibleSuggest.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {visibleSuggest.map((i) => (
                <li key={i.code}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setQ(String(i.code));
                      setSuggest([]);
                    }}
                  >
                    <span>
                      {i.name}
                      {i.district ? `, ${i.district}` : ""}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{i.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <CurriculumSelect value={curriculum} onChange={setCurriculum} />
        <div>
          <label htmlFor="sem" className="label">
            Semester
          </label>
          <select id="sem" className="input" value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">All semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                {ordinal(s)} Semester
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary sm:col-span-2" disabled={loading}>
          {loading ? <Spinner /> : <Building2 className="h-4 w-4" />} View Institute Results
        </button>
      </form>

      {error && <Alert tone="error">{error}</Alert>}

      {data && (
        <div className="space-y-4">
          {data.institute && (
            <div className="card p-5">
              <div className="text-lg font-semibold text-slate-900">
                {data.institute.name}
                {data.institute.district ? `, ${data.institute.district}` : ""}
              </div>
              <div className="text-sm text-slate-500">Institute code {data.institute.code}</div>
            </div>
          )}
          {data.publications.length === 0 && <Alert tone="warn">No publications match these filters.</Alert>}
          {data.publications.map((p) => (
            <section key={p.fileHash} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === p.fileHash ? null : p.fileHash)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-5 py-4 text-left hover:bg-slate-50"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {ordinal(p.semester)} Semester · {curriculumName(p.curriculumId)}
                    {p.regulation ? ` (${p.regulation})` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    Published {formatDate(p.date)} · {p.fileName}
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-emerald-700">{p.stats.passed}</span> passed / <span className="font-semibold text-rose-700">{p.stats.referred}</span>{" "}
                  referred · {p.stats.total} total
                </div>
              </button>
              {open === p.fileHash && (
                <div className="border-t border-slate-100 p-5">
                  <div className="grid grid-cols-3 gap-3">
                    <StatTile label="Passed" value={p.stats.passed} sub={pct(p.stats.passed, p.stats.total)} tone="green" />
                    <StatTile label="Referred" value={p.stats.referred} sub={pct(p.stats.referred, p.stats.total)} tone="red" />
                    <StatTile label="Total" value={p.stats.total} tone="slate" />
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Roll</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">GPA / Referred subjects</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {p.rows.map((r) => (
                          <tr key={r.roll}>
                            <td className="px-3 py-2 font-mono">
                              <Link href={`/results?roll=${r.roll}&curriculumId=${p.curriculumId}`} className="text-brand-700 hover:underline">
                                {r.roll}
                              </Link>
                            </td>
                            <td className="px-3 py-2">
                              {r.status === "passed" ? <span className="badge bg-emerald-50 text-emerald-700">Passed</span> : <span className="badge bg-rose-50 text-rose-700">Referred</span>}
                            </td>
                            <td className="px-3 py-2">
                              {r.cgpa != null ? `CGPA ${r.cgpa.toFixed(2)}` : r.gpa != null ? r.gpa.toFixed(2) : <ReferredList subjects={r.referred} />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
