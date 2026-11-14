import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Section } from "@/components/ui";
import InstituteClient from "./InstituteClient";

export const metadata: Metadata = {
  title: "BTEB Institute Results",
  description: "View complete BTEB results for any polytechnic or technical institute by institute code, semester and publication date.",
};

export default function InstituteResultsPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Institute Results" }]} title="BTEB Institute Results" subtitle="Complete results of an institute for any semester and publication date" />
      <div className="container-x mt-8">
        <Suspense fallback={null}>
          <InstituteClient />
        </Suspense>
      </div>
      <div className="container-x mt-16 grid gap-5 md:grid-cols-2">
        <Section title="Institute code">
          <p>Every BTEB institute has a 5-digit code (for example 50117 is Dhaka Polytechnic Institute). Type the code or part of the institute name to search.</p>
        </Section>
        <Section title="Multiple publications">
          <p>A semester can be published more than once (regular, supplementary, corrections). Each file is listed separately with its own date and statistics.</p>
        </Section>
      </div>
    </>
  );
}
