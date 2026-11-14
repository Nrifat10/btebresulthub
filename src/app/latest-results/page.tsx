import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHeader, StatTile } from "@/components/ui";
import { getLatestPublications } from "@/lib/repo";
import { curriculumName } from "@/lib/curricula";
import { dateToSlug, formatDate, ordinal, pct } from "@/lib/grade";
import SampleNotice from "@/components/SampleNotice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BTEB Latest Results And Statistics",
  description: "Browse the latest BTEB result publications by date with pass and fail statistics for every result file.",
};

export default async function LatestResultsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const { groups, pages, total } = await getLatestPublications(page, 20);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Latest Results" }]}
        eyebrow="Latest Updates"
        title="Latest Results And Statistics"
        subtitle="Stay up to date with the newest exam results from BTEB. Browse by publish date to see statistics, exams and semesters."
      />
      <SampleNotice />
      <div className="container-x mt-8">
        <p className="text-center text-xs text-slate-500">
          Page {page} of {pages} · {total} publish date(s)
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g.date} className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{formatDate(g.date)}</h2>
                <span className="badge bg-slate-100 text-slate-600">
                  <FileText className="h-3.5 w-3.5" /> {g.files.length} file(s)
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <StatTile label="Passed" value={g.stats.passed} sub={pct(g.stats.passed, g.stats.total)} tone="green" />
                <StatTile label="Referred" value={g.stats.referred} sub={pct(g.stats.referred, g.stats.total)} tone="red" />
                <StatTile label="Total" value={g.stats.total} sub="Found in list" tone="slate" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.curricula.map((c) => (
                  <span key={c} className="badge bg-brand-50 text-brand-700">
                    {curriculumName(c)}
                  </span>
                ))}
                {g.semesters.map((s) => (
                  <span key={s} className="badge bg-slate-100 text-slate-600">
                    {ordinal(s)}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Pass rate</span>
                  <span className="font-semibold text-brand-700">{pct(g.stats.passed, g.stats.total)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: pct(g.stats.passed, g.stats.total) }} />
                </div>
              </div>
              <Link href={`/latest-results/${dateToSlug(g.date)}`} className="btn-outline mt-4 w-full">
                View Result Files <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          ))}
        </div>
        {pages > 1 && (
          <nav className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`/latest-results?page=${p}`} className={p === page ? "btn-primary !px-3.5" : "btn-outline !px-3.5"}>
                {p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
