"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email: email.trim().toLowerCase() }]);

    if (error) {
      if (error.code === "23505") {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(`${error.message} (code: ${error.code})`);
      }
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 text-forest">
        <CheckCircle className="size-5 shrink-0" />
        <p className="font-serif text-lg italic">
          You&apos;re on the list. Sharp mornings await.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-sandstone bg-white px-4 py-3 text-forest placeholder:text-sandstone focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition-colors"
        />
        {status === "error" && (
          <p className="mt-1.5 text-sm text-red-700">{errorMessage}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-6 py-3 font-medium text-linen transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Join the Waitlist
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
