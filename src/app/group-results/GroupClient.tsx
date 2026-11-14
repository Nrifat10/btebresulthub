"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import CurriculumSelect from "@/components/CurriculumSelect";
import { ReferredList } from "@/components/ResultCard";
import { Alert, Spinner } from "@/components/ui";
import { formatDate, letterGrade, ordinal } from "@/lib/grade";
import type { ApiResponse, StudentResult } from "@/lib/types";

type Row = { roll: number; found: boolean; result: StudentResult | null };

export default function GroupClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [rolls, setRolls] = useState(params.get("rolls")?.split(",").join("\n") ?? "");
  const [curriculum, setCurriculum] = useState(params.get("curriculumId") ?? "diploma_in_engineering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);

  const run = async (list: string[], c: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/group-results?rolls=${list.join(",")}&curriculumId=${encodeURIComponent(c)}`);
      const json = (await res.json()) as ApiResponse<Row[]>;
      if (!json.success) {
        setError(json.error);
        setRows(null);
      } else setRows(json.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const r = params.get("rolls");
    if (!r) return;
    const t = setTimeout(() => void run(r.split(",").filter(Boolean), params.get("curriculumId") ?? "any"), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...new Set(rolls.split(/[^\d]+/).filter(Boolean))];
    if (list.length === 0) return setError("Enter at least one roll number.");
    if (list.length > 50) return setError("Maximum 50 roll numbers at a time.");
    router.replace(`/group-results?rolls=${list.join(",")}&curriculumId=${curriculum}`, { scroll: false });
    void run(list, curriculum);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <CurriculumSelect value={curriculum} onChange={setCurriculum} />
        <div>
          <label htmlFor="rolls" className="label">
            Roll Numbers <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="rolls"
            className="input min-h-32 font-mono"
            placeholder={"700001, 700002, 700003\nor one per line"}
            value={rolls}
            onChange={(e) => setRolls(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Spinner /> : <Users className="h-4 w-4" />} View Group Results
        </button>
      </form>

      {error && <Alert tone="error">{error}</Alert>}

      {rows && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Roll</th>
                <th className="px-4 py-3">Latest semester</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const latest = r.result?.latestResults[0];
                const sem = r.result?.semesterResults[0];
                return (
                  <tr key={r.roll} className="align-top">
                    <td className="px-4 py-3 font-mono font-semibold">
                      <Link href={`/results?roll=${r.roll}&curriculumId=${r.result?.curriculumId ?? curriculum}`} className="text-brand-700 hover:underline">
                        {r.roll}
                      </Link>
                    </td>
                    {!r.found || !latest || !sem ? (
                      <td colSpan={3} className="px-4 py-3 text-slate-400">
                        Not found
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">{ordinal(sem.semester)}</td>
                        <td className="px-4 py-3">
                          {latest.cgpa != null ? (
                            <span className="font-semibold text-brand-700">
                              CGPA {latest.cgpa.toFixed(2)} ({letterGrade(latest.cgpa)})
                            </span>
                          ) : latest.gpa != null ? (
                            <span className="font-semibold text-emerald-700">
                              GPA {latest.gpa.toFixed(2)} ({letterGrade(latest.gpa)})
                            </span>
                          ) : (
                            <ReferredList subjects={latest.referred} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(latest.date)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
