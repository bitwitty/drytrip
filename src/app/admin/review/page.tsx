"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Droplets, Wine, MapPin, Check, X } from "lucide-react";
import type { Venue } from "@/lib/types";

type StatusFilter = "Draft" | "Published" | "Rejected";

// Auth is enforced by src/middleware.ts — only requests with a valid HttpOnly
// dt_admin cookie (set server-side by /api/admin/auth) reach this page.

export default function AdminReviewPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Draft");

  useEffect(() => {
    fetchVenues();
  }, [statusFilter]);

  async function fetchVenues() {
    setLoading(true);
    const { data } = await supabase
      .from("venues")
      .select("*")
      .eq("status", statusFilter)
      .order("created_at", { ascending: false });

    setVenues((data as Venue[]) || []);
    setLoading(false);
  }

  async function updateVenueStatus(id: string, status: StatusFilter, notes?: string) {
    // Goes through the server-side API route which re-verifies the HttpOnly
    // cookie and uses supabaseAdmin (service-role key) for the write.
    const res = await fetch("/api/admin/venues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes }),
    });

    if (!res.ok) {
      console.error("Failed to update venue status");
      return;
    }

    setVenues((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="min-h-screen bg-linen">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold text-forest">
            Venue Review
          </h1>
          <span className="text-sm text-forest/40">
            {venues.length} {statusFilter.toLowerCase()} venues
          </span>
        </div>

        {/* Status tabs */}
        <div className="mt-6 flex gap-2">
          {(["Draft", "Published", "Rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                statusFilter === s
                  ? "bg-forest text-linen shadow-sm"
                  : "bg-sandstone/20 text-forest/60 hover:bg-sandstone/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Venues list */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="py-12 text-center text-forest/40">Loading...</p>
          ) : venues.length === 0 ? (
            <p className="py-12 text-center text-forest/40">
              No {statusFilter.toLowerCase()} venues
            </p>
          ) : (
            venues.map((venue) => (
              <AdminVenueCard
                key={venue.id}
                venue={venue}
                onPublish={() => updateVenueStatus(venue.id, "Published")}
                onReject={(notes) => updateVenueStatus(venue.id, "Rejected", notes)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminVenueCard({
  venue,
  onPublish,
  onReject,
}: {
  venue: Venue;
  onPublish: () => void;
  onReject: (notes?: string) => void;
}) {
  const [notes, setNotes] = useState(venue.notes || "");
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="rounded-2xl border border-sandstone/30 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl font-bold text-forest">
              {venue.name}
            </h3>
            <span className="rounded-full bg-sandstone/20 px-2.5 py-0.5 text-xs font-medium text-forest/60">
              {venue.category}
            </span>
            <div className="flex items-center gap-1">
              <Droplets className="size-3.5 text-forest/40" />
              <span className="text-sm font-semibold text-forest">
                {venue.dry_score}
              </span>
              <span className="text-xs text-forest/40">/5</span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-forest/40">
            <MapPin className="size-3" />
            {venue.neighborhood || venue.city} · {venue.slug}
          </div>

          {venue.description && (
            <p className="mt-3 text-sm leading-relaxed text-forest/60">
              {venue.description}
            </p>
          )}

          {venue.short_description && (
            <p className="mt-2 text-sm font-medium text-forest/80">
              &ldquo;{venue.short_description}&rdquo;
            </p>
          )}

          {venue.top_na_drink && (
            <div className="mt-2 flex items-center gap-2 text-sm text-forest/50">
              <Wine className="size-3.5" />
              {venue.top_na_drink}
            </div>
          )}

          {venue.vibe_tags && venue.vibe_tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {venue.vibe_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-linen px-2 py-0.5 text-[10px] text-forest/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 rounded-lg bg-sage/20 px-4 py-2 text-sm font-medium text-sage transition-colors hover:bg-sage/30"
          >
            <Check className="size-4" />
            Publish
          </button>
          <button
            onClick={() => {
              if (showNotes) {
                onReject(notes);
              } else {
                setShowNotes(true);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg bg-clay/10 px-4 py-2 text-sm font-medium text-clay transition-colors hover:bg-clay/20"
          >
            <X className="size-4" />
            Reject
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-4 border-t border-sandstone/20 pt-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Rejection notes..."
            rows={2}
            className="w-full rounded-lg border border-sandstone/30 bg-linen px-3 py-2 text-sm text-forest placeholder:text-forest/30 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <button
            onClick={() => onReject(notes)}
            className="mt-2 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Confirm Reject
          </button>
        </div>
      )}
    </div>
  );
}
