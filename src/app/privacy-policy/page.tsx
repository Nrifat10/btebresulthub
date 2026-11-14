import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Privacy Policy" }]} title="Privacy Policy" subtitle={`Last updated: ${new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`} />
      <div className="container-x mt-8 grid gap-5 md:grid-cols-2">
        <Section title="What we collect">
          <p>{SITE.name} does not require an account. Searches are processed on our servers and may appear in standard, anonymised access logs used for rate limiting and debugging.</p>
        </Section>
        <Section title="Result data">
          <p>Result data is public information published by BTEB. We store only what appears in the official result books: roll numbers, institute codes, GPA and referred subject codes.</p>
        </Section>
        <Section title="Cookies & analytics">
          <p>We use only essential cookies. If analytics or advertising is enabled in the future, this page will be updated and consent requested where required.</p>
        </Section>
        <Section title="Contact">
          <p>Questions about privacy or removal requests can be sent via the contact page.</p>
        </Section>
      </div>
    </>
  );
}
