import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About Us", description: `About ${SITE.name}, a free BTEB result checker for diploma and polytechnic students.` };

export default function AboutPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "About Us" }]} title={`About ${SITE.name}`} subtitle="Built by students, for students" />
      <div className="container-x mt-8 grid gap-5 md:grid-cols-2">
        <Section title="Our mission">
          <p>
            Checking a BTEB result should take seconds, not scrolling through a 400-page PDF on a phone. {SITE.name} indexes every published result book so you can search by roll
            number, compare with classmates and track your CGPA.
          </p>
        </Section>
        <Section title="Data source">
          <p>All results are sourced from official result books published by the Bangladesh Technical Education Board at bteb.gov.bd. We do not alter or generate results.</p>
        </Section>
        <Section title="Disclaimer">
          <p>
            {SITE.name} is an independent project and is not affiliated with BTEB. PDF parsing can contain errors; always confirm important results with your institute or the official
            publication.
          </p>
        </Section>
        <Section title="Free forever">
          <p>The site is free to use and open source. Sponsorships and ads, if any, keep the servers running.</p>
        </Section>
      </div>
    </>
  );
}
