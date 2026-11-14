import { handleError, ok } from "@/lib/api";
import { searchInstitutes } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/institutes?q=dhaka */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim().slice(0, 60);
    return ok(await searchInstitutes(q, 20));
  } catch (e) {
    return handleError(e);
  }
}
