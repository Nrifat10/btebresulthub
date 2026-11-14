import { fail, handleError, ok, parseIntParam } from "@/lib/api";
import { getInstituteResults } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/institute-results?instituteCode=99901&curriculumId=diploma_in_engineering&semester=4&date=2026-11-10 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteCode = parseIntParam(searchParams.get("instituteCode"));
    if (instituteCode == null) return fail("instituteCode is required.");
    const semester = parseIntParam(searchParams.get("semester"));
    const date = searchParams.get("date");
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("date must be YYYY-MM-DD.");
    const curriculumId = searchParams.get("curriculumId");
    const data = await getInstituteResults({
      instituteCode,
      curriculumId: curriculumId === "any" ? null : curriculumId,
      semester,
      date,
    });
    if (!data.institute && data.publications.length === 0) return fail("No results found for this institute.", 404);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}
