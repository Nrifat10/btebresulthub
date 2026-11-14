"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import CurriculumSelect from "@/components/CurriculumSelect";
import ResultCard from "@/components/ResultCard";
import { Alert, Spinner } from "@/components/ui";
import type { ApiResponse, StudentResult } from "@/lib/types";

export default function ResultsClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [roll, setRoll] = useState(params.get("roll") ?? "");
  const [curriculum, setCurriculum] = useState(params.get("curriculumId") ?? "diploma_in_engineering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentResult[] | null>(null);

  const search = useCallback(async (r: string, c: string) => {
    const clean = r.replace(/\D/g, "");
    if (!/^\d{6}$|^\d{10}$/.test(clean)) {
      setError("Roll number must be 6 or 10 digits.");
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student-results?roll=${clean}&curriculumId=${encodeURIComponent(c)}`);
      const json = (await res.json()) as ApiResponse<StudentResult[]>;
      if (!json.success) {
        setError(json.error);
        setData(null);
      } else {
        setData(json.data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Deep link: /results?roll=...&curriculumId=...
  useEffect(() => {
    const r = params.get("roll");
    if (!r) return;
    const t = setTimeout(() => void search(r, params.get("curriculumId") ?? "any"), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roll.replace(/\D/g, "");
    router.replace(`/results?roll=${clean}&curriculumId=${curriculum}`, { scroll: false });
    void search(clean, curriculum);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <CurriculumSelect value={curriculum} onChange={setCurriculum} />
        <div>
          <label htmlFor="roll" className="label">
            Roll Number <span className="text-rose-600">*</span>
          </label>
          <input
            id="roll"
            className="input font-mono tracking-wider"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter roll number (e.g. 700001)"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Spinner /> : <Search className="h-4 w-4" />} View Result
        </button>
      </form>

      {error && <Alert tone="error">{error}</Alert>}
      {data && data.map((r) => <ResultCard key={r.curriculumId + r.roll} result={r} />)}
    </div>
  );
}
