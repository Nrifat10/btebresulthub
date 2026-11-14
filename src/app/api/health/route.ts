import { handleError, ok } from "@/lib/api";
import { getSiteStats } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/health -> which data source is active and how much data it holds. */
export async function GET() {
  try {
    return ok(await getSiteStats());
  } catch (e) {
    return handleError(e);
  }
}
