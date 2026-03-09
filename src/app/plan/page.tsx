"use client";

import { useChat } from "@ai-sdk/react";
import { type UIMessage } from "ai";
import { useState, useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import {
  Send,
  Droplets,
  Shield,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const suggestedPrompts = [
  "Plan a 3-day trip to London with great nightlife",
  "Best alcohol-free bars in Berlin",
  "Date night in Melbourne, no alcohol",
  "Zero-proof cocktails in Los Angeles",
];

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function PlanPage() {
  const posthog = usePostHog();
  const { messages, sendMessage, regenerate, status, error } = useChat();
  const [input, setInput] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});
  const conversationStarted = useRef(false);

  const isLoading = status === "streaming" || status === "submitted";

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
  }, [messages, posthog]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  }

  async function handleSuggestionClick(prompt: string) {
    setInput("");
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-forest/40 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Droplets className="size-3.5" />
                107 verified venues
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                Grounded in verified data
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                7 cities worldwide
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
                    onClick={() => regenerate()}
                    className="flex items-center gap-1.5 rounded-lg bg-clay/10 px-3 py-1.5 text-xs font-medium text-clay transition-colors hover:bg-clay/20"
                  >
                    <RefreshCw className="size-3" />
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat input */}
        <div className="sticky bottom-0 bg-linen pb-6 pt-2">
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
