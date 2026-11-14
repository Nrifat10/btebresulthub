import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function PageHeader({ crumbs, eyebrow, title, subtitle }: { crumbs: { href?: string; label: string }[]; eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="container-x pt-6">
      <nav className="no-print flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700" aria-label="Home">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {c.href ? (
              <Link href={c.href} className="hover:text-brand-700">
                {c.label}
              </Link>
            ) : (
              <span className="text-slate-700">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="mx-auto mt-8 max-w-3xl text-center">
        {eyebrow && <span className="badge bg-brand-50 text-brand-700">{eyebrow}</span>}
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-base text-slate-600 sm:text-lg">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatTile({ label, value, sub, tone = "slate" }: { label: string; value: string | number; sub?: string; tone?: "green" | "red" | "slate" | "blue" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    blue: "bg-brand-50 text-brand-700 border-brand-100",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {sub && <div className="text-xs opacity-80">{sub}</div>}
    </div>
  );
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error" | "warn" | "success"; children: React.ReactNode }) {
  const map = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  } as const;
  return <div className={`rounded-xl border px-4 py-3 text-sm ${map[tone]}`}>{children}</div>;
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />;
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose-custom space-y-4 text-[15px] leading-7 text-slate-700">{children}</div>;
}

export function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="card p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}
