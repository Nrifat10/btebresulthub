"use client";

import { useState } from "react";
import { Building2, CalendarDays, CheckCircle2, Copy, GraduationCap, Printer, Share2, XCircle } from "lucide-react";
import { curriculumName } from "@/lib/curricula";
import { formatDate, letterGrade, ordinal, timeAgo } from "@/lib/grade";
import type { ReferredSubject, StudentResult } from "@/lib/types";
import { SITE } from "@/lib/site";

const TYPE_LABEL: Record<string, string> = { T: "Theory", P: "Practical", "T,P": "Theory & Practical", C: "Continuous" };

export function ReferredList({ subjects }: { subjects: ReferredSubject[] }) {
  if (subjects.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {subjects.map((s, i) => (
        <li key={i} className="badge border border-rose-200 bg-rose-50 text-rose-700" title={TYPE_LABEL[s.type] ?? s.type}>
          {s.code} <span className="opacity-70">({s.type})</span>
        </li>
      ))}
    </ul>
  );
}

function PointTile({ label, value }: { label: string; value: number }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${label === "CGPA" ? "border-brand-200 bg-brand-50" : "border-emerald-200 bg-emerald-50"}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-2xl font-bold ${label === "CGPA" ? "text-brand-700" : "text-emerald-700"}`}>{value.toFixed(2)}</span>
      <span className="text-sm font-semibold text-slate-500">{letterGrade(value)}</span>
    </div>
  );
}

export function resultToText(r: StudentResult) {
  const lines = [
    `Roll: ${r.roll}`,
    `${curriculumName(r.curriculumId)}${r.regulation ? ` (Regulation ${r.regulation})` : ""}`,
    r.institute ? `${r.institute.name}${r.institute.district ? ", " + r.institute.district : ""}` : "",
    "",
  ];
  for (const s of r.semesterResults) {
    const latest = s.results[0];
    const val = latest.cgpa != null ? `CGPA ${latest.cgpa.toFixed(2)}` : latest.gpa != null ? `GPA ${latest.gpa.toFixed(2)}` : `Referred: ${latest.referred.map((x) => `${x.code}(${x.type})`).join(", ")}`;
    lines.push(`${ordinal(s.semester)} Semester - ${val} (${formatDate(latest.date)})`);
  }
  lines.push("", `Source: ${SITE.name} (${SITE.domain})`);
  return lines.filter((l) => l !== undefined).join("\n");
}

export default function ResultCard({ result }: { result: StudentResult }) {
  const [copied, setCopied] = useState(false);
  const latest = result.latestResults[0];
  const headline = latest?.cgpa ?? (latest?.status === "passed" ? latest.gpa : null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resultToText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const share = async () => {
    const url = `${location.origin}/results?roll=${result.roll}&curriculumId=${result.curriculumId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Result of ${result.roll}`, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <article className="card overflow-hidden">
      <header className="border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white px-5 py-5 text-center">
        <div className="text-2xl font-bold tracking-tight text-slate-900"># {result.roll}</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-4 w-4" /> {curriculumName(result.curriculumId)}
          </span>
          {result.regulation && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> Regulation {result.regulation}
            </span>
          )}
        </div>
        {result.institute && (
          <div className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
            <Building2 className="h-4 w-4" /> {result.institute.name}
            {result.institute.district ? `, ${result.institute.district}` : ""} <span className="text-slate-400">({result.institute.code})</span>
          </div>
        )}
        <div className="no-print mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-outline !py-1.5 text-xs" onClick={copy}>
            <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" className="btn-outline !py-1.5 text-xs" onClick={share}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button type="button" className="btn-outline !py-1.5 text-xs" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
        </div>
      </header>

      <div className="space-y-4 p-5">
        {headline != null && <PointTile label={latest?.cgpa != null ? "CGPA" : "GPA"} value={headline} />}

        {result.currentFailedSubjects.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
            <div className="text-sm font-semibold text-rose-800">Subjects yet to pass</div>
            <ReferredList subjects={result.currentFailedSubjects} />
          </div>
        )}

        {result.semesterResults.map((s) => (
          <section key={s.semester} className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="font-semibold text-slate-900">{ordinal(s.semester)} Semester</h3>
              {s.status === "passed" ? (
                <span className="badge bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                </span>
              ) : (
                <span className="badge bg-rose-50 text-rose-700">
                  <XCircle className="h-3.5 w-3.5" /> Referred
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {s.results.map((r, i) => (
                <div key={r.fileHash + i} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Published: <span className="font-medium text-brand-700">{formatDate(r.date)}</span>
                    </span>
                    <span>{timeAgo(r.date)}</span>
                  </div>
                  {r.cgpa != null && (
                    <div className="mt-2">
                      <PointTile label="CGPA" value={r.cgpa} />
                    </div>
                  )}
                  {r.gpa != null && (
                    <div className="mt-2">
                      <PointTile label="GPA" value={r.gpa} />
                    </div>
                  )}
                  {r.status === "referred" && (
                    <div className="mt-2 text-sm text-rose-700">
                      Referred subjects
                      <ReferredList subjects={r.referred} />
                    </div>
                  )}
                  <div className="mt-2 truncate text-[11px] text-slate-400" title={r.fileName}>
                    Source file: {r.fileName}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer className="border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500">
        This result sheet is generated by {SITE.name} from result books published by BTEB (bteb.gov.bd). Verify independently for official purposes. {SITE.name} is not
        liable for any errors.
      </footer>
    </article>
  );
}
