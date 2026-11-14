import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "BTEB Exam Routines",
  description: "Latest BTEB exam routines and schedules for diploma, SSC and HSC vocational examinations.",
};

const ROUTINES: { title: string; href: string; note: string }[] = [
  { title: "Diploma in Engineering exam routines", href: "https://bteb.gov.bd/site/view/notices", note: "Official notices, Examination Control Department" },
  { title: "Diploma in Textile / Agriculture routines", href: "https://bteb.gov.bd/site/view/notices", note: "Official notices" },
  { title: "SSC / HSC (Vocational) routines", href: "https://bteb.gov.bd/site/view/notices", note: "Official notices" },
];

export default function ExamRoutinesPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Exam Routines" }]} title="BTEB Exam Routines" subtitle="Latest exam routines and schedules for all diploma departments" />
      <div className="container-x mt-8 grid gap-5 md:grid-cols-3">
        {ROUTINES.map((r) => (
          <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className="card group p-6 transition hover:shadow-md">
            <h2 className="font-semibold text-slate-900 group-hover:text-brand-700">{r.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{r.note}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              Open <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </a>
        ))}
      </div>
      <div className="container-x mt-10">
        <Section title="Add your own routines">
          <p>
            Routines are published as PDF notices by BTEB. To host them on this site, upload the PDF to <code className="font-mono">public/routines/</code> and add an entry to the
            list in <code className="font-mono">src/app/exam-routines/page.tsx</code>, or store the links in your database and render them here.
          </p>
        </Section>
      </div>
    </>
  );
}
