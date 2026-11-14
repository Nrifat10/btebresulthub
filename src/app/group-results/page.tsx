import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Section } from "@/components/ui";
import GroupClient from "./GroupClient";

export const metadata: Metadata = {
  title: "BTEB Group Results",
  description: "Check BTEB results for many roll numbers at once. Paste a list of roll numbers and see everyone's latest GPA, CGPA or referred subjects.",
};

export default function GroupResultsPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Group Results" }]} title="BTEB Group Results" subtitle="Check up to 50 roll numbers together and share the list with your classmates" />
      <div className="container-x mt-8">
        <Suspense fallback={null}>
          <GroupClient />
        </Suspense>
      </div>
      <div className="container-x mt-16 grid gap-5 md:grid-cols-2">
        <Section title="How to use">
          <p>Paste roll numbers separated by commas, spaces or new lines. Choose the curriculum to avoid mixing up students from different exams.</p>
        </Section>
        <Section title="Sharing">
          <p>The URL updates with your roll list, so you can copy the address bar link and send it to your group chat.</p>
        </Section>
      </div>
    </>
  );
}
