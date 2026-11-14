import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Building2, Calculator, CalendarDays, CheckCircle2, Search, ShieldCheck, Users, Zap } from "lucide-react";
import { getSiteStats } from "@/lib/repo";
import { SITE } from "@/lib/site";
import SampleNotice from "@/components/SampleNotice";

export const dynamic = "force-dynamic";

const FEATURES = [
  { href: "/results", icon: Search, title: "Instant Result Search", text: "Find your BTEB results instantly by roll number. Fast, accurate and always up to date.", badge: "Most Popular" },
  { href: "/latest-results", icon: BarChart3, title: "Latest Results & Analytics", text: "Stay updated with the newest BTEB publications and pass/fail statistics per file." },
  { href: "/institute-results", icon: Building2, title: "Institute-wise Results", text: "View complete results for any institute, semester and publication date." },
  { href: "/group-results", icon: Users, title: "Group Results", text: "Check many roll numbers together and share the list with friends." },
  { href: "/cgpa-calculator", icon: Calculator, title: "CGPA Calculator", text: "Calculate your diploma CGPA with the official BTEB semester weights." },
  { href: "/booklists", icon: BookOpen, title: "Department Booklists", text: "Booklists for all polytechnic departments and probidhans." },
  { href: "/exam-routines", icon: CalendarDays, title: "Exam Routines", text: "Latest exam routines and schedules for all diploma departments." },
];

export default async function HomePage() {
  const stats = await getSiteStats();
  return (
    <>
      <SampleNotice />
      <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="badge bg-amber-50 text-amber-700">✨ Free for every BTEB student</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            BTEB Results at Your <span className="text-brand-600">Fingertips</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Get your BTEB exam results quickly and easily. Check diploma and polytechnic results, explore exam routines, booklists and calculate your GPA or CGPA, all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/results" className="btn-primary px-6 py-3 text-base">
              <Search className="h-4 w-4" /> Check Your Results
            </Link>
            <Link href="/latest-results" className="btn-outline px-6 py-3 text-base">
              View Latest Results <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% Secure
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-600" /> Lightning Fast
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-violet-600" /> Always Free
            </li>
          </ul>
        </div>
        <div className="card relative overflow-hidden p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100" />
          <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-violet-100" />
          <div className="relative grid grid-cols-2 gap-4">
            <Stat value={stats.results.toLocaleString()} label="Result rows indexed" />
            <Stat value={stats.publications.toLocaleString()} label="Result files parsed" />
            <Stat value={stats.institutes.toLocaleString()} label="Institutes" />
            <Stat value="Free" label="Always & forever" />
          </div>
          <p className="relative mt-6 text-center text-xs text-slate-500">
            Data source: {stats.source === "mongodb" ? "live database" : "built-in sample data"}
          </p>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything You Need for BTEB Results</h2>
          <p className="mt-3 text-slate-600">Powerful features designed to make accessing and managing your BTEB results easier than ever.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="card group relative p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              {f.badge && <span className="badge absolute right-4 top-4 bg-amber-50 text-amber-700">{f.badge}</span>}
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x py-12">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold">Ready to Check Your BTEB Results?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Join the students who use {SITE.name} for fast, accurate and reliable access to their exam results.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/results" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
              Start Checking Results
            </Link>
            <Link href="/how-it-works" className="btn border border-white/40 px-6 py-3 text-base text-white hover:bg-white/10">
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 text-center">
      <div className="text-3xl font-extrabold text-brand-700">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
