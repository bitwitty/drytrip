"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface VoteResult {
  city: string;
  count: number;
}

interface VoteData {
  results: VoteResult[];
  totalVotes: number;
  totalSignups: number;
}

export default function AdminVotesPage() {
  const [data, setData] = useState<VoteData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/votes")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load vote data. Are you logged in?"));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-clay">{error}</p>
        <Link href="/admin/login" className="mt-4 inline-block text-sm text-forest underline">
          Go to login
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-forest/50">
        Loading...
      </div>
    );
  }

  const maxCount = data.results[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl text-forest">City Votes</h1>
        <Link href="/admin/review" className="text-sm text-forest/50 hover:text-forest">
          Back to review
        </Link>
      </div>

      <div className="mb-8 flex gap-8 text-sm text-forest/60">
        <p>
          <span className="text-2xl font-semibold text-forest">{data.totalVotes}</span>{" "}
          votes
        </p>
        <p>
          <span className="text-2xl font-semibold text-forest">{data.totalSignups}</span>{" "}
          total signups
        </p>
      </div>

      {data.results.length === 0 ? (
        <p className="text-forest/50">No votes yet.</p>
      ) : (
        <div className="space-y-4">
          {data.results.map(({ city, count }, i) => (
            <div key={city}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-medium text-forest">
                  {i + 1}. {city}
                </span>
                <span className="text-sm text-forest/60">{count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-sandstone/30">
                <div
                  className="h-full rounded-full bg-forest transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
