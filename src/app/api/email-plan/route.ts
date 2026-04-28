import { Resend } from "resend";
import { NextRequest } from "next/server";
import { buildPlanEmailHtml } from "@/lib/email-template";
import { getPostHogClient } from "@/lib/posthog-server";

// Lazy-init to avoid crashing when RESEND_API_KEY isn't set yet
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Rate limiter: 5 emails per IP per day
const emailRateLimits = new Map<string, number[]>();

function checkEmailRateLimit(ip: string): boolean {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const timestamps = emailRateLimits.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < dayMs);

  if (recent.length >= 5) return false;

  recent.push(now);
  emailRateLimits.set(ip, recent);
  return true;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Block cross-origin requests (CSRF protection)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prefer x-real-ip (set by Vercel's infrastructure, not spoofable by clients)
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (!checkEmailRateLimit(ip)) {
    return Response.json(
      { error: "Too many emails today. Try again tomorrow." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { email, messages } = body as {
    email?: string;
    messages?: Array<{ role: string; content: string }>;
  };

  // Validate email
  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json({ error: "Invalid email address." }, { status: 400 });
  }

  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages to send." }, { status: 400 });
  }

  if (messages.length > 40) {
    return Response.json({ error: "Conversation too long." }, { status: 400 });
  }

  const hasAssistant = messages.some((m) => m.role === "assistant");
  if (!hasAssistant) {
    return Response.json({ error: "No plan to send yet." }, { status: 400 });
  }

  // Build HTML and send
  const html = buildPlanEmailHtml(
    messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
  );

  const resend = getResend();
  if (!resend) {
    return Response.json(
      { error: "Email service not configured." },
      { status: 503 }
    );
  }

  try {
    const { error } = await resend.emails.send({
      from: "Dry Trip <updates@drytrip.co>",
      to: email,
      subject: "Your Dry Trip Plan",
      html,
    });

    const posthog = getPostHogClient();

    if (error) {
      console.error("Resend error:", error);
      posthog.capture({
        distinctId: email,
        event: "plan_email_failed",
        properties: { reason: "resend_error", message: error.message },
      });
      return Response.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    posthog.capture({
      distinctId: email,
      event: "plan_email_sent",
      properties: { message_count: messages.length },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: "plan_email_failed",
      properties: {
        reason: "exception",
        message: err instanceof Error ? err.message : String(err),
      },
    });
    posthog.captureException(
      err instanceof Error ? err : new Error(String(err)),
      email
    );
    return Response.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
