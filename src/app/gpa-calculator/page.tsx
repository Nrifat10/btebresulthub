import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import GpaClient from "./GpaClient";

export const metadata: Metadata = {
  title: "BTEB GPA Calculator",
  description: "Calculate your semester GPA from subject marks and credits using the BTEB grading scale.",
};

export default function GpaPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "GPA Calculator" }]} title="BTEB GPA Calculator" subtitle="Add your subjects with credits and marks (%) to estimate your semester GPA" />
      <div className="container-x mt-8">
        <GpaClient />
      </div>
      <div className="container-x mt-16 grid gap-5 md:grid-cols-2">
        <Section title="Grading scale">
          <p>80–100 A+ (4.00) · 75–79 A (3.75) · 70–74 A- (3.50) · 65–69 B+ (3.25) · 60–64 B (3.00) · 55–59 B- (2.75) · 50–54 C+ (2.50) · 45–49 C (2.25) · 40–44 D (2.00) · below 40 F (0.00)</p>
        </Section>
        <Section title="Formula">
          <p>GPA = Σ(grade point × credit) ÷ Σ(credit). Failing any subject (F) means you are referred for that semester and no GPA is published until it is cleared.</p>
        </Section>
      </div>
    </>
  );
}
