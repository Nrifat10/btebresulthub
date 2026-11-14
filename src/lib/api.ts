import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/** A roll is 6 digits (diploma) or 10 digits (SSC/HSC vocational). */
export function parseRoll(raw: string | null): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!/^\d{6}$|^\d{10}$/.test(s)) return null;
  return Number(s);
}

export function parseIntParam(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export function handleError(e: unknown) {
  console.error(e);
  return fail("Internal server error", 500);
}
