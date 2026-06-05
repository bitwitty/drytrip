import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cookie = req.cookies.get("dt_admin");
  if (cookie?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("waitlist")
    .select("voted_city");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalSignups = data?.length ?? 0;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.voted_city) {
      counts[row.voted_city] = (counts[row.voted_city] || 0) + 1;
    }
  }

  const results = Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  const totalVotes = results.reduce((sum, r) => sum + r.count, 0);

  return NextResponse.json({ results, totalVotes, totalSignups });
}
