import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import CgpaClient from "./CgpaClient";

export const metadata: Metadata = {
  title: "BTEB CGPA Calculator",
  description: "Calculate your diploma CGPA using the official BTEB semester weights (5%, 5%, 5%, 10%, 15%, 20%, 25%, 15%).",
};

export default function CgpaPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "CGPA Calculator" }]} eyebrow="Most Popular" title="BTEB CGPA Calculator" subtitle="Enter your semester GPAs to get your CGPA with the official BTEB weights" />
      <div className="container-x mt-8">
        <CgpaClient />
      </div>
      <div className="container-x mt-16 grid gap-5 md:grid-cols-2">
        <Section title="How BTEB calculates CGPA">
          <p>Each semester GPA is weighted: 1st 5%, 2nd 5%, 3rd 5%, 4th 10%, 5th 15%, 6th 20%, 7th 25%, 8th 15%. CGPA = Σ(GPA × weight) ÷ Σ(weights of the semesters you entered).</p>
        </Section>
        <Section title="Target planning">
          <p>Leave future semesters empty to see your current weighted average, then try values to see what you need for a target CGPA.</p>
        </Section>
      </div>
    </>
  );
}
