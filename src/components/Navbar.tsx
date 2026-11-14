"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Calculator, CalendarDays, ChevronDown, GraduationCap, Menu, MoreHorizontal, Search, X } from "lucide-react";
import { SITE } from "@/lib/site";

type Item = { href: string; label: string; badge?: string };
type Group = { label: string; icon: React.ReactNode; items?: Item[]; href?: string };

const NAV: Group[] = [
  { label: "Individual Results", icon: <Search className="h-4 w-4" />, href: "/results" },
  {
    label: "Other Results",
    icon: <GraduationCap className="h-4 w-4" />,
    items: [
      { href: "/group-results", label: "Group Results" },
      { href: "/institute-results", label: "Institute Results" },
      { href: "/latest-results", label: "Latest Results", badge: "New" },
    ],
  },
  {
    label: "Calculators",
    icon: <Calculator className="h-4 w-4" />,
    items: [
      { href: "/cgpa-calculator", label: "CGPA Calculator", badge: "Popular" },
      { href: "/gpa-calculator", label: "GPA Calculator" },
    ],
  },
  { label: "Exam Routines", icon: <CalendarDays className="h-4 w-4" />, href: "/exam-routines" },
  {
    label: "More",
    icon: <MoreHorizontal className="h-4 w-4" />,
    items: [
      { href: "/booklists", label: "Booklists" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

/** Keyed by pathname so the menus reset (close) on every navigation. */
export default function Navbar() {
  const pathname = usePathname();
  return <NavbarInner key={pathname} pathname={pathname} />;
}

function NavbarInner({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDd(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between" ref={ref}>
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-700">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((g) =>
            g.href ? (
              <Link
                key={g.label}
                href={g.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(g.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {g.icon}
                {g.label}
              </Link>
            ) : (
              <div key={g.label} className="relative">
                <button
                  type="button"
                  onClick={() => setDd(dd === g.label ? null : g.label)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    g.items?.some((i) => isActive(i.href)) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  aria-expanded={dd === g.label}
                >
                  {g.icon}
                  {g.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition ${dd === g.label ? "rotate-180" : ""}`} />
                </button>
                {dd === g.label && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {g.items!.map((i) => (
                      <Link
                        key={i.href}
                        href={i.href}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {i.label}
                        {i.badge && <span className="badge bg-brand-50 text-brand-700">{i.badge}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </nav>

        <button type="button" className="btn-ghost lg:hidden" onClick={() => setOpen(!open)} aria-label="Open menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-x space-y-1 py-3">
            {NAV.map((g) =>
              g.href ? (
                <Link key={g.label} href={g.href} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {g.icon}
                  {g.label}
                </Link>
              ) : (
                <div key={g.label}>
                  <div className="flex items-center gap-2 px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {g.icon}
                    {g.label}
                  </div>
                  {g.items!.map((i) => (
                    <Link key={i.href} href={i.href} className="flex items-center justify-between rounded-lg px-3 py-2.5 pl-9 text-sm text-slate-700 hover:bg-slate-100">
                      {i.label}
                      {i.badge && <span className="badge bg-brand-50 text-brand-700">{i.badge}</span>}
                    </Link>
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </header>
  );
}
