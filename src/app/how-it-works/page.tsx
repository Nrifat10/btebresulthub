import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How this BTEB result site gets its data: BTEB result PDFs are parsed into a database and served through an API.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "How It Works" }]} title="How It Works" subtitle="Where the data comes from and how a roll-number search is answered" />
      <div className="container-x mt-8 grid gap-5 lg:grid-cols-2">
        <Section title="1. BTEB publishes PDFs, not an API">
          <p>
            BTEB does not offer a public API for diploma results. Every result is released as a PDF &quot;result book&quot; on bteb.gov.bd (usually via Google Drive folders). The
            official search portal at result.bteb.gov.bd needs a registration number plus a CAPTCHA, so it cannot power a roll-only lookup.
          </p>
        </Section>
        <Section title="2. The PDF is parsed into rows">
          <p>
            Inside a result book, each institute starts with a header such as <code className="font-mono">50117 - Dhaka Polytechnic Institute, Dhaka</code>, followed by entries like{" "}
            <code className="font-mono">784731 ( 3.12 )</code> for a pass and <code className="font-mono">784730 {"{"} 25913(T,P), 25921(T) {"}"}</code> for a referred student. Our
            parser turns each entry into one database row with the roll, institute, GPA or referred subjects, semester and publication date.
          </p>
        </Section>
        <Section title="3. Rows are stored in MongoDB">
          <p>
            Three collections: <code className="font-mono">results</code> (one row per roll per PDF), <code className="font-mono">publications</code> (one row per PDF with
            statistics) and <code className="font-mono">institutes</code>. Indexes on roll, institute code and date keep lookups instant even with millions of rows.
          </p>
        </Section>
        <Section title="4. The site queries the database">
          <p>
            A search calls <code className="font-mono">/api/student-results?roll=…&amp;curriculumId=…</code>. The API groups the rows by semester, picks the newest publication
            for each semester and returns JSON that the result card renders. Latest-results statistics are computed when a PDF is imported, so pages stay fast.
          </p>
        </Section>
        <Section title="5. Adding a new result">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Download the new PDF from bteb.gov.bd.</li>
            <li>
              Run <code className="font-mono">npm run import -- file.pdf --date 2026-11-10 --semester 5 --regulation 2022 --curriculum diploma_in_engineering</code>.
            </li>
            <li>The script extracts the text, parses it, upserts the rows and publication stats, and the site shows them immediately.</li>
          </ol>
        </Section>
        <Section title="6. Run it yourself">
          <p>
            The full setup (MongoDB Atlas, Vercel, environment variables) is in the project README. If no database is configured the site runs on built-in sample data so you can
            explore every page. <Link href="/results" className="text-brand-700 underline">Try a search</Link>.
          </p>
        </Section>
      </div>
    </>
  );
}
