import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SITE } from "@/lib/site";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Results",
    links: [
      { href: "/results", label: "Individual Results" },
      { href: "/group-results", label: "Group Results" },
      { href: "/institute-results", label: "Institute Results" },
      { href: "/latest-results", label: "Latest Results" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/cgpa-calculator", label: "CGPA Calculator" },
      { href: "/gpa-calculator", label: "GPA Calculator" },
      { href: "/exam-routines", label: "Exam Routines" },
      { href: "/booklists", label: "Booklists" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/about", label: "About Us" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-slate-200 bg-white">
      <div className="container-x grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-brand-700">{SITE.name}</span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Fast, free access to Bangladesh Technical Education Board results. Data is sourced from the result books published on bteb.gov.bd.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-500 hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100">
        <div className="container-x flex flex-col items-start justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name} ({SITE.domain}). All rights reserved.
          </p>
          <p>Not affiliated with BTEB. Always verify critical results with your institute.</p>
        </div>
      </div>
    </footer>
  );
}
