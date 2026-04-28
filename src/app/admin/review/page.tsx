"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Droplets, Wine, MapPin, Check, X, Lock } from "lucide-react";
import type { Venue } from "@/lib/types";

type StatusFilter = "Draft" | "Published" | "Rejected";

export default function AdminReviewPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Draft");

  // Check for existing auth cookie on mount
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("dt_admin="));
    if (cookie?.split("=")[1] === "1") {
      setAuthenticated(true);
    }
  }, []);

  // Fetch venues when authenticated
  useEffect(() => {
    if (!authenticated) return;
    fetchVenues();
  }, [authenticated, statusFilter]);

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Simple password check — sent to an API route to compare against env var
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      document.cookie = "dt_admin=1; path=/; max-age=86400"; // 1 day
      setAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Wrong password. Try again.");
    }
  }

  async function updateVenueStatus(id: string, status: StatusFilter, notes?: string) {
    await supabase
      .from("venues")
      .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
      .eq("id", id);

    // Remove from current list
    setVenues((prev) => prev.filter((v) => v.id !== id));
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-sandstone/30 bg-white p-8 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-forest/40" />
            <h1 className="font-serif text-xl font-semibold text-forest">
              Admin Access
            </h1>
          </div>
          <label htmlFor="admin-password" className="sr-only">Admin password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
            placeholder="Enter admin password"
            className="mt-6 w-full rounded-lg border border-sandstone bg-linen px-4 py-3 text-forest placeholder:text-forest/30 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          />
          {loginError && (
            <p className="mt-2 text-sm text-clay">{loginError}</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-forest px-6 py-3 font-medium text-linen transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    );
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

          {/* Pipeline description */}
          {venue.description && (
            <p className="mt-3 text-sm leading-relaxed text-forest/60">
              {venue.description}
            </p>
          )}

          {/* Short description */}
          {venue.short_description && (
            <p className="mt-2 text-sm font-medium text-forest/80">
              &ldquo;{venue.short_description}&rdquo;
            </p>
          )}

          {/* Top NA Drink */}
          {venue.top_na_drink && (
            <div className="mt-2 flex items-center gap-2 text-sm text-forest/50">
              <Wine className="size-3.5" />
              {venue.top_na_drink}
            </div>
          )}

          {/* Vibe tags */}
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

      {/* Notes textarea */}
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
