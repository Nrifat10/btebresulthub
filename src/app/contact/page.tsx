import type { Metadata } from "next";
import { Globe, Mail, Send } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const items = [
    { icon: Mail, label: "Email", value: SITE.email || "Set NEXT_PUBLIC_CONTACT_EMAIL", href: SITE.email ? `mailto:${SITE.email}` : undefined },
    { icon: Globe, label: "Facebook page", value: SITE.facebook || "Set NEXT_PUBLIC_FACEBOOK_URL", href: SITE.facebook || undefined },
    { icon: Send, label: "Telegram", value: SITE.telegram || "Set NEXT_PUBLIC_TELEGRAM_URL", href: SITE.telegram || undefined },
  ];
  return (
    <>
      <PageHeader crumbs={[{ label: "Contact" }]} title="Contact Us" subtitle="Found a wrong result or want to report a missing publication? Reach out." />
      <div className="container-x mt-8 grid gap-5 md:grid-cols-3">
        {items.map((i) => (
          <a key={i.label} href={i.href} className="card p-6 transition hover:shadow-md" target={i.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <i.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900">{i.label}</h2>
            <p className="mt-1 break-all text-sm text-slate-600">{i.value}</p>
          </a>
        ))}
      </div>
    </>
  );
}
