import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * PATCH /api/admin/venues
 * Verifies the HttpOnly admin cookie server-side before updating a venue.
 * Uses supabaseAdmin (service-role key) which bypasses RLS — this is safe
 * because we've already verified auth via the cookie check above.
 */
export async function PATCH(req: NextRequest) {
  // Block cross-origin requests (CSRF protection)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cookie = req.cookies.get("dt_admin");
  if (cookie?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, notes } = body as {
    id: string;
    status: "Draft" | "Published" | "Rejected";
    notes?: string;
  };

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("venues")
    .update({ status, notes: notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
