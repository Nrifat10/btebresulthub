import { fail, handleError, ok, parseRoll } from "@/lib/api";
import { getStudentResults } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/student-results?roll=700001&curriculumId=diploma_in_engineering */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roll = parseRoll(searchParams.get("roll"));
    if (roll == null) return fail("Roll number must be 6 or 10 digits.");
    const curriculumId = searchParams.get("curriculumId");
    const data = await getStudentResults(roll, curriculumId === "any" ? null : curriculumId);
    if (data.length === 0) return fail("No result found for this roll number.", 404);
    return ok(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    return handleError(e);
  }
}
