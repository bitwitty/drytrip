"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { supabase } from "@/lib/supabase";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

const SUBSTACK_URL = "https://drydispatch.substack.com";

function subscribeToSubstack(email: string) {
  try {
    const frameName = "substack-signup-frame";
    let frame = document.querySelector<HTMLIFrameElement>(`iframe[name="${frameName}"]`);
    if (!frame) {
      frame = document.createElement("iframe");
      frame.name = frameName;
      frame.title = "Newsletter sign-up";
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.style.display = "none";
      document.body.appendChild(frame);
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${SUBSTACK_URL}/api/v1/free?nojs=true`;
    form.target = frameName;
    form.style.display = "none";
    const fields: Record<string, string> = {
      email,
      first_url: window.location.href,
      first_referrer: document.referrer,
      current_url: window.location.href,
      current_referrer: document.referrer,
      referral_code: "",
      source: "embed",
    };
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    form.remove();
    posthog?.capture("substack_signup_submitted");
  } catch {
    posthog?.capture("substack_forward_failed", { status: "browser" });
  }
}

interface WaitlistFormProps {
  buttonText: string;
  successMessage: string;
  votedCity?: string | null;
}

export default function WaitlistForm({
  buttonText,
  successMessage,
  votedCity,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const row: Record<string, string> = {
      email: email.trim().toLowerCase(),
      variant: "A",
    };
    if (votedCity) row.voted_city = votedCity;

    const { error } = await supabase.from("waitlist").insert([row]);

    const normalizedEmail = email.trim().toLowerCase();

    // Also subscribe them to Dry Dispatch (Substack). Substack blocks
    // server-side sign-ups, so the visitor's browser submits the same form
    // Substack's own embed uses, into a hidden iframe (no page change).
    // The Supabase row above is the backup if this doesn't go through.
    if (!error || error.code === "23505") {
      subscribeToSubstack(normalizedEmail);
    }

    if (error) {
      if (error.code === "23505") {
        setStatus("success");
        posthog?.identify(normalizedEmail, { email: normalizedEmail });
        posthog?.capture("newsletter_subscribed", { voted_city: votedCity ?? null });
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    } else {
      setStatus("success");
      posthog?.identify(normalizedEmail, { email: normalizedEmail });
      posthog?.capture("newsletter_subscribed", { voted_city: votedCity ?? null });
    }
  }

  if (status === "success") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-forest">
          <CheckCircle className="size-5 shrink-0" />
          <p className="font-serif text-lg italic">
            {successMessage}
            {votedCity && ` Your vote for ${votedCity} is in.`}
          </p>
        </div>
        <a
          href="https://www.instagram.com/drytrip.co"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-forest/50 transition-colors hover:text-forest"
        >
          Follow us on Instagram &rarr;
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      {votedCity && (
        <p className="text-center text-sm text-forest/60">
          Voting for <span className="font-medium text-forest">{votedCity}</span>
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
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
          <p className="mt-1.5 text-sm text-clay">{errorMessage}</p>
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
            {buttonText}
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
      </div>
    </form>
  );
}
