import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Section } from "@/components/ui";
import ResultsClient from "./ResultsClient";
import { CURRICULA } from "@/lib/curricula";
import SampleNotice from "@/components/SampleNotice";

export const metadata: Metadata = {
  title: "BTEB Individual Results",
  description: "Check your BTEB diploma and polytechnic results instantly by roll number. All semesters, GPA, CGPA and referred subjects in one place.",
};

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Individual Results" }]}
        title="BTEB Individual Results"
        subtitle="Check your diploma and polytechnic results instantly by roll number"
      />
      <SampleNotice />
      <div className="container-x mt-8">
        <Suspense fallback={<div className="card mx-auto max-w-xl p-6 text-center text-sm text-slate-500">Loading…</div>}>
          <ResultsClient />
        </Suspense>
      </div>

      <div className="container-x mt-16 grid gap-5 md:grid-cols-2">
        <Section title="What are individual results?">
          <p>
            Individual results are every semester examination result of one student published by the Bangladesh Technical Education Board (BTEB). You see your full
            academic history across semesters, including older publications.
          </p>
        </Section>
        <Section title="Roll number">
          <p>Your roll number is the 6-digit (diploma) or 10-digit (SSC / HSC vocational) number printed on your admit card or registration card.</p>
        </Section>
        <Section title="Referred subjects">
          <p>
            Referred subjects are listed with their subject code and the failed part in brackets: (T) theory, (P) practical, (T,P) both, (C) continuous assessment. You
            must clear every referred subject to receive the GPA for that semester.
          </p>
        </Section>
        <Section title="Supported curricula">
          <ul className="grid list-disc gap-x-6 pl-5 sm:grid-cols-2">
            {CURRICULA.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
