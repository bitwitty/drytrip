import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const source = request.nextUrl.searchParams.get("source") || "unknown";

  // Fetch venue
  const { data: venue } = await supabaseAdmin
    .from("venues")
    .select("booking_url, website_url, name")
    .eq("id", id)
    .single();

  if (!venue) {
    return NextResponse.redirect(new URL("/directory", request.url));
  }

  // Determine redirect URL: booking_url > website_url > Google Maps
  const redirectUrl =
    venue.booking_url ||
    venue.website_url ||
    `https://www.google.com/maps/search/${encodeURIComponent(venue.name + " London")}`;

  const sessionId = request.cookies.get("dt_session")?.value || null;

  // Log the click
  await supabaseAdmin.from("venue_clicks").insert({
    venue_id: id,
    source,
    session_id: sessionId,
  });

  // Track outbound click in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: sessionId || id,
    event: "venue_outbound_clicked",
    properties: { venue_id: id, venue_name: venue.name, source },
  });

  return NextResponse.redirect(redirectUrl);
}
