import Link from "next/link";
import { Alert } from "./ui";
import { getSiteStats } from "@/lib/repo";
import { SAMPLE_ROLL } from "@/lib/sample-data";

/** Shown while the site runs on bundled sample data (no MONGODB_URI). */
export default async function SampleNotice() {
  const stats = await getSiteStats();
  if (stats.source !== "sample") return null;
  return (
    <div className="container-x no-print mt-6">
      <Alert tone="warn">
        <strong>Demo mode:</strong> no database is connected, so this site is serving built-in sample data (try roll <code className="font-mono">{SAMPLE_ROLL}</code>, Diploma in
        Engineering). Set <code className="font-mono">MONGODB_URI</code> and import real BTEB PDFs to go live. See <Link href="/how-it-works" className="underline">How It Works</Link>.
      </Alert>
    </div>
  );
}
