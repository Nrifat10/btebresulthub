import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "BTEB Booklists",
  description: "Department-wise booklists for polytechnic diploma courses under the 2022 and 2016 probidhans.",
};

const DEPARTMENTS = [
  "Civil", "Computer Science & Technology", "Electrical", "Electronics", "Mechanical", "Power", "Architecture", "Automobile",
  "Chemical", "Food", "Environmental", "Refrigeration & Air Conditioning", "Telecommunication", "Mechatronics", "Textile", "Garments Design & Pattern Making",
];

export default function BooklistsPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Booklists" }]} title="Department Booklists" subtitle="Booklists for all polytechnic departments and curricula" />
      <div className="container-x mt-8">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Official curriculum & booklists</h2>
            <a href="https://bteb.gov.bd/site/page/curriculum" target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 text-xs">
              bteb.gov.bd curriculum <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {DEPARTMENTS.map((d) => (
              <div key={d} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container-x mt-10">
        <Section title="Hosting booklists on this site">
          <p>
            Put each department&apos;s booklist PDF under <code className="font-mono">public/booklists/&lt;department&gt;.pdf</code> and turn the cards above into links. Keeping the PDFs in
            the repo makes them deploy with the site on Vercel.
          </p>
        </Section>
      </div>
    </>
  );
}
