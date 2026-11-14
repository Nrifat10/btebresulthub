import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { PageHeader, StatTile } from "@/components/ui";
import { getPublicationsByDate } from "@/lib/repo";
import { curriculumName } from "@/lib/curricula";
import { formatDate, ordinal, pct, slugToDate } from "@/lib/grade";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const iso = slugToDate(date);
  return { title: iso ? `BTEB Results of ${formatDate(iso)}` : "Results" };
}

export default async function DatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const iso = slugToDate(date);
  if (!iso) notFound();
  const group = await getPublicationsByDate(iso);
  if (!group) notFound();

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/latest-results", label: "Latest Results" }, { label: formatDate(iso) }]}
        eyebrow="Results Archive"
        title={`Results of ${formatDate(iso)}`}
        subtitle="Bangladesh Technical Education Board (BTEB)"
      />
      <div className="container-x mt-8 space-y-5">
        <p className="text-center">
          <span className="badge bg-emerald-50 text-emerald-700">{group.files.length} result file(s) available</span>
        </p>
        {group.files.map((f) => (
          <section key={f.fileHash} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <FileText className="h-5 w-5 text-brand-600" /> {f.fileName}
                </h2>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="badge bg-brand-50 text-brand-700">{curriculumName(f.curriculumId)}</span>
                  {f.regulation && <span className="badge bg-slate-100 text-slate-600">{f.regulation} Regulation</span>}
                  <span className="badge bg-slate-100 text-slate-600">{ordinal(f.semester)} Semester</span>
                  <span className="badge bg-slate-100 text-slate-600">{f.instituteCount} institute(s)</span>
                </div>
              </div>
              {f.sourceUrl && (
                <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 text-xs">
                  Original PDF
                </a>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatTile label="Passed" value={f.stats.passed} sub={pct(f.stats.passed, f.stats.total)} tone="green" />
              <StatTile label="Referred" value={f.stats.referred} sub={pct(f.stats.referred, f.stats.total)} tone="red" />
              <StatTile label="Total" value={f.stats.total} sub="Found in list" tone="slate" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Success rate</span>
                <span className="font-semibold text-brand-700">{pct(f.stats.passed, f.stats.total)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: pct(f.stats.passed, f.stats.total) }} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/institute-results?curriculumId=${f.curriculumId}&semester=${f.semester}`} className="btn-outline !py-1.5 text-xs">
                Browse by institute
              </Link>
              <Link href={`/results?curriculumId=${f.curriculumId}`} className="btn-primary !py-1.5 text-xs">
                Check a roll number
              </Link>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
