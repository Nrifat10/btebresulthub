import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Terms of Service" }]} title="Terms of Service" />
      <div className="container-x mt-8 grid gap-5 md:grid-cols-2">
        <Section title="Use of the service">
          <p>{SITE.name} is provided free of charge for personal, non-commercial use. Automated scraping that degrades the service for others is not permitted.</p>
        </Section>
        <Section title="Accuracy">
          <p>Results are extracted automatically from official PDFs and may contain errors. The official publication from BTEB always prevails.</p>
        </Section>
        <Section title="Liability">
          <p>{SITE.name} is not liable for any loss or damage arising from the use of information on this site.</p>
        </Section>
        <Section title="Changes">
          <p>These terms may change at any time. Continued use of the site means you accept the current terms.</p>
        </Section>
      </div>
    </>
  );
}
