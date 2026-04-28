interface EmailMessage {
  role: "user" | "assistant";
  content: string;
}

function markdownToHtml(text: string): string {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((p) => {
      // Headings
      if (p.startsWith("### "))
        return `<h3 style="margin:16px 0 8px;font-family:Georgia,'Cormorant Garamond',serif;font-size:16px;font-weight:600;color:#1B3022;">${inlineToHtml(p.slice(4))}</h3>`;
      if (p.startsWith("## "))
        return `<h2 style="margin:16px 0 8px;font-family:Georgia,'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:#1B3022;">${inlineToHtml(p.slice(3))}</h2>`;
      if (p.startsWith("# "))
        return `<h1 style="margin:16px 0 8px;font-family:Georgia,'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#1B3022;">${inlineToHtml(p.slice(2))}</h1>`;

      // Bullet lists
      if (p.includes("\n- ") || p.startsWith("- ")) {
        const items = p
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((item) => `<li style="margin:4px 0;color:#1B3022cc;">${inlineToHtml(item.slice(2))}</li>`)
          .join("");
        return `<ul style="margin:8px 0;padding-left:20px;">${items}</ul>`;
      }

      // Paragraph
      return `<p style="margin:8px 0;line-height:1.6;color:#1B3022cc;">${inlineToHtml(p.replace(/\n/g, " "))}</p>`;
    })
    .join("");
}

function inlineToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#1B3022;font-weight:600;">$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#1B3022;text-decoration:underline;">$1</a>'
    );
}

export function buildPlanEmailHtml(messages: EmailMessage[]): string {
  const messagesHtml = messages
    .map((m) => {
      if (m.role === "user") {
        return `
          <div style="margin:16px 0;text-align:right;">
            <div style="display:inline-block;max-width:80%;background:#1B3022;color:#F9F7F2;padding:12px 18px;border-radius:16px 16px 4px 16px;font-size:14px;line-height:1.5;text-align:left;">
              ${inlineToHtml(m.content)}
            </div>
          </div>`;
      }
      return `
        <div style="margin:16px 0;">
          <div style="font-size:14px;line-height:1.6;">
            ${markdownToHtml(m.content)}
          </div>
        </div>`;
    })
    .join('<hr style="border:none;border-top:1px solid #E8E4DD;margin:8px 0;" />');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F9F7F2;font-family:Arial,'Montserrat',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #E8E4DD;">
      <h1 style="margin:0;font-family:Georgia,'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:#1B3022;letter-spacing:-0.5px;">
        Dry Trip
      </h1>
      <p style="margin:8px 0 0;font-size:13px;color:#1B3022aa;">Your trip plan</p>
    </div>

    <!-- Conversation -->
    <div style="padding:16px 0;">
      ${messagesHtml}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #E8E4DD;">
      <p style="margin:0;font-size:12px;color:#1B302266;">
        Planned with <a href="https://drytrip.co/plan" style="color:#1B3022;text-decoration:underline;">Dry Trip</a> — clear-headed luxury travel.
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#1B302244;">
        100+ verified venues across 7 cities. Every recommendation backed by real data.
      </p>
    </div>

  </div>
</body>
</html>`;
}
