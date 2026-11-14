import { fail, handleError, ok } from "@/lib/api";
import { getGroupResults } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/group-results?rolls=700001,700002&curriculumId=diploma_in_engineering */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rolls = [...new Set((searchParams.get("rolls") ?? "").split(/[,\s]+/).filter(Boolean))];
    if (rolls.length === 0) return fail("Provide at least one roll number.");
    if (rolls.length > 50) return fail("Maximum 50 roll numbers per request.");
    if (rolls.some((r) => !/^\d{6}$|^\d{10}$/.test(r))) return fail("Every roll must be 6 or 10 digits.");
    const curriculumId = searchParams.get("curriculumId");
    const data = await getGroupResults(rolls.map(Number), curriculumId === "any" ? null : curriculumId);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}
