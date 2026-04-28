"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/review");
    } else {
      setError("Wrong password. Try again.");
    }
    setLoading(false);
  }

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
        <label htmlFor="admin-password" className="sr-only">
          Admin password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Enter admin password"
          className="mt-6 w-full rounded-lg border border-sandstone bg-linen px-4 py-3 text-forest placeholder:text-forest/30 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
        />
        {error && <p className="mt-2 text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-forest px-6 py-3 font-medium text-linen transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
