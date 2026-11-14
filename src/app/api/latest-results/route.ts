import { handleError, ok, parseIntParam } from "@/lib/api";
import { getLatestPublications } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/latest-results?page=1 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseIntParam(searchParams.get("page")) ?? 1;
    const data = await getLatestPublications(page, 20);
    return ok(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    return handleError(e);
  }
}
