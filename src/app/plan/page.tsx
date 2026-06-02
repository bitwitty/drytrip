"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useEffect, useRef, useMemo } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import {
  Send,
  Droplets,
  Shield,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2,
  ArrowRight,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const FREE_MESSAGES = 2; // AI responses before email gate
const STORAGE_KEY = "drytrip_email";

const suggestedPrompts = [
  "Plan a 3-day trip to London with great nightlife",
  "Best alcohol-free bars in Soho",
  "Date night in Mayfair, no alcohol",
  "Zero-proof cocktails in Shoreditch",
];

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function PlanPage() {
  // Thread PostHog distinct + session IDs from client to /api/chat so
  // server-side events correlate with the same person/session.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => {
          const headers: Record<string, string> = {};
          try {
            const distinctId = posthog.get_distinct_id();
            const sessionId = posthog.get_session_id();
            if (distinctId) headers["X-PostHog-Distinct-Id"] = distinctId;
            if (sessionId) headers["X-PostHog-Session-Id"] = sessionId;
          } catch {
            // PostHog not ready yet — fall back to IP on the server.
          }
          return headers;
        },
      }),
    []
  );

  const { messages, sendMessage, regenerate, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});
  const conversationStarted = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "error">("idle");
  const [emailPlanStatus, setEmailPlanStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailPromptInput, setEmailPromptInput] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Restore email from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUserEmail(saved);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";
  const assistantMessages = messages.filter((m) => m.role === "assistant").length;
  const needsEmail = !userEmail && assistantMessages >= FREE_MESSAGES && !isLoading;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    setEmailStatus("loading");

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email, variant: "plan" }]);

    if (error && error.code !== "23505") {
      setEmailStatus("error");
      return;
    }

    localStorage.setItem(STORAGE_KEY, email);
    setUserEmail(email);
    setEmailStatus("idle");
    posthog?.identify(email, { email });
    posthog?.capture("email_gate_completed", { source: "plan" });
  }

  async function sendPlanEmail(email: string, hp = honeypot) {
    setEmailPlanStatus("loading");
    try {
      const res = await fetch("/api/email-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          honeypot: hp,
          messages: messages.map((m) => ({
            role: m.role,
            content: getTextContent(m),
          })),
        }),
      });
      if (res.ok) {
        setEmailPlanStatus("sent");
        posthog?.capture("plan_emailed");
        setTimeout(() => setEmailPlanStatus("idle"), 3000);
      } else {
        setEmailPlanStatus("error");
        setTimeout(() => setEmailPlanStatus("idle"), 3000);
      }
    } catch {
      setEmailPlanStatus("error");
      setTimeout(() => setEmailPlanStatus("idle"), 3000);
    }
  }

  async function handleEmailPlan() {
    if (userEmail) {
      await sendPlanEmail(userEmail);
    } else {
      setShowEmailPrompt(true);
      posthog?.capture("plan_email_prompt_shown");
    }
  }

  async function handleEmailPromptSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = emailPromptInput.trim().toLowerCase();
    if (!email) return;

    // Save email (same as gate flow)
    await supabase.from("waitlist").insert([{ email, variant: "plan" }]);
    localStorage.setItem(STORAGE_KEY, email);
    setUserEmail(email);
    setShowEmailPrompt(false);
    posthog?.identify(email, { email });
    posthog?.capture("email_gate_completed", { source: "plan_email_prompt" });

    // Send the plan — pass the current honeypot value
    await sendPlanEmail(email, honeypot);
  }

  function handleCopyPlan() {
    const text = messages
      .map((m) => {
        const content = getTextContent(m);
        return m.role === "user" ? `You: ${content}` : content;
      })
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      posthog?.capture("plan_copied");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Track conversation depth milestones
  useEffect(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant").length;
    if (assistantMessages === 1 && !conversationStarted.current) {
      conversationStarted.current = true;
      posthog?.capture("ai_conversation_started");
    }
    if (assistantMessages === 3) {
      posthog?.capture("ai_conversation_depth_3");
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  }

  async function handleSuggestionClick(prompt: string) {
    setInput("");
    posthog?.capture("ai_suggestion_used", { prompt });
    await sendMessage({ text: prompt });
  }

  function handleFeedback(messageId: string, type: "up" | "down") {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: type }));
    posthog?.capture("ai_feedback", { type, message_id: messageId });
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <Nav />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-4 md:px-12">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center pb-32 text-center">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-forest md:text-5xl">
              Where to next?
            </h1>
            <p className="mt-3 max-w-md text-base text-forest/60">
              Tell me where you&rsquo;re going. I&rsquo;ll find the best places
              that don&rsquo;t revolve around drinking.
            </p>

            {/* Suggested prompts */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="rounded-full border border-sandstone/50 bg-white px-4 py-2 text-sm text-forest/70 transition-all hover:border-forest/30 hover:bg-white hover:text-forest"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-forest/60 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Droplets className="size-3.5" />
                50 individually audited venues
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                Grounded in verified data
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                London — more cities coming soon
              </span>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 space-y-6 py-8">
            {messages.map((message) => {
              const text = getTextContent(message);
              if (!text) return null;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === "user"
                        ? "rounded-2xl rounded-br-md bg-forest px-5 py-3 text-linen"
                        : ""
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-4">
                        <div className="prose-sm prose prose-forest max-w-none text-forest/80 [&_strong]:text-forest [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif">
                          <MessageContent content={text} />
                        </div>

                        {/* Feedback buttons */}
                        {!isLoading && (
                          <div className="flex items-center gap-2 pt-1">
                            {feedbackGiven[message.id] ? (
                              <span className="text-xs text-forest/30">
                                Thanks for the feedback
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handleFeedback(message.id, "up")
                                  }
                                  className="rounded-lg p-1.5 text-forest/30 transition-colors hover:bg-sandstone/20 hover:text-forest/60"
                                  aria-label="Helpful"
                                >
                                  <ThumbsUp className="size-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleFeedback(message.id, "down")
                                  }
                                  className="rounded-lg p-1.5 text-forest/30 transition-colors hover:bg-sandstone/20 hover:text-forest/60"
                                  aria-label="Not helpful"
                                >
                                  <ThumbsDown className="size-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 px-1 py-2">
                  <span className="size-2 animate-bounce rounded-full bg-sandstone [animation-delay:0ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-sandstone [animation-delay:150ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-sandstone [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-2xl border border-clay/20 bg-clay/5 px-4 py-3">
                  <p className="text-sm text-clay">
                    Something went wrong — try again
                  </p>
                  <button
                    onClick={() => {
                      posthog?.capture("ai_chat_retried");
                      regenerate();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-clay/10 px-3 py-1.5 text-xs font-medium text-clay transition-colors hover:bg-clay/20"
                  >
                    <RefreshCw className="size-3" />
                    Retry
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat input or email gate */}
        <div className="sticky bottom-0 bg-linen pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
          {/* Action bar: email plan + copy */}
          {!isEmpty && assistantMessages > 0 && !isLoading && !needsEmail && (
            <div className="mb-2 flex items-center gap-2">
              {showEmailPrompt ? (
                <form
                  onSubmit={handleEmailPromptSubmit}
                  className="flex flex-1 items-center gap-2 rounded-xl border border-sandstone/50 bg-white px-3 py-2"
                >
                  {/* Honeypot: hidden from real users, bots fill it automatically */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ display: "none" }}
                  />
                  <Mail className="size-3.5 shrink-0 text-forest/60" />
                  <input
                    type="email"
                    required
                    value={emailPromptInput}
                    onChange={(e) => setEmailPromptInput(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-xs text-forest placeholder:text-forest/30 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-xs font-medium text-forest hover:text-forest/70"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailPrompt(false)}
                    className="text-xs text-forest/30 hover:text-forest/60"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <button
                    onClick={handleEmailPlan}
                    disabled={emailPlanStatus === "loading"}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-forest/60 transition-colors hover:bg-sandstone/20 hover:text-forest/60 disabled:opacity-50"
                  >
                    {emailPlanStatus === "loading" ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : emailPlanStatus === "sent" ? (
                      <Check className="size-3 text-sage" />
                    ) : (
                      <Mail className="size-3" />
                    )}
                    {emailPlanStatus === "sent"
                      ? "Sent! Check your inbox"
                      : emailPlanStatus === "error"
                        ? "Failed — try again"
                        : "Email me this plan"}
                  </button>
                  <button
                    onClick={handleCopyPlan}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-forest/60 transition-colors hover:bg-sandstone/20 hover:text-forest/60"
                  >
                    {copied ? (
                      <Check className="size-3 text-sage" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied ? "Copied!" : "Copy plan"}
                  </button>
                </>
              )}
            </div>
          )}

          {needsEmail ? (
            <div className="rounded-2xl border border-sandstone/50 bg-white px-5 py-5 shadow-sm">
              <h3 className="font-serif text-lg font-semibold text-forest">
                Your itinerary is taking shape.
              </h3>
              <p className="mt-1 text-sm text-forest/60">
                Drop your email to keep planning — and get weekly intel on the
                best alcohol-free travel finds.
              </p>
              <form onSubmit={handleEmailSubmit} className="mt-4 flex gap-3">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-sandstone/50 bg-linen px-4 py-3 text-sm text-forest placeholder:text-forest/30 focus:border-forest/30 focus:outline-none focus:ring-1 focus:ring-forest/20"
                />
                <button
                  type="submit"
                  disabled={emailStatus === "loading"}
                  className="flex items-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-medium text-linen transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {emailStatus === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Continue Planning
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
              {emailStatus === "error" && (
                <p className="mt-2 text-xs text-clay">
                  Something went wrong. Please try again.
                </p>
              )}
              <p className="mt-3 text-[11px] text-forest/30">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 rounded-2xl border border-sandstone/50 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:border-forest/30 focus-within:shadow-md"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 bg-transparent text-sm text-forest placeholder:text-forest/30 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-forest text-linen transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <Send className="size-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message Content — renders markdown-like text with venue links      */
/* ------------------------------------------------------------------ */

function MessageContent({ content }: { content: string }) {
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <>
      {paragraphs.map((p, i) => {
        if (p.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-4 font-serif text-lg font-semibold text-forest">
              <InlineText text={p.replace("### ", "")} />
            </h3>
          );
        }
        if (p.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-4 font-serif text-xl font-semibold text-forest">
              <InlineText text={p.replace("## ", "")} />
            </h2>
          );
        }
        if (p.startsWith("# ")) {
          return (
            <h1 key={i} className="mt-4 font-serif text-2xl font-semibold text-forest">
              <InlineText text={p.replace("# ", "")} />
            </h1>
          );
        }

        if (p.includes("\n- ") || p.startsWith("- ")) {
          const items = p.split("\n").filter((line) => line.startsWith("- "));
          return (
            <ul key={i} className="ml-4 list-disc space-y-1">
              {items.map((item, j) => (
                <li key={j} className="text-sm text-forest/70">
                  <InlineText text={item.replace("- ", "")} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-forest/80">
            <InlineText text={p.replace(/\n/g, " ")} />
          </p>
        );
      })}
    </>
  );
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-forest">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          return (
            <Link
              key={i}
              href={linkMatch[2]}
              className="font-medium text-forest underline underline-offset-2 transition-colors hover:text-forest/70"
            >
              {linkMatch[1]}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
