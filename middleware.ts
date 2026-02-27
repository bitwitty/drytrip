import { NextRequest, NextResponse } from "next/server";

/**
 * Site-wide password gate.
 * Set SITE_PASSWORD in your environment variables.
 * Remove this file (or set SITE_PASSWORD to empty) to open the site to the public.
 */

const PASSWORD = process.env.SITE_PASSWORD;
const COOKIE_NAME = "dt_site_auth";

export function middleware(request: NextRequest) {
  // If no password is configured, let everything through
  if (!PASSWORD) return NextResponse.next();

  // Skip password gate for API routes, static files, and the auth endpoint
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/site-auth"
  ) {
    return NextResponse.next();
  }

  // Check for valid auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // Show the password page
  return new NextResponse(buildPasswordPage(request.url), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};

function buildPasswordPage(currentUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dry Trip — Preview Access</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Montserrat', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0a;
      color: #e5e5e5;
    }
    .container {
      text-align: center;
      max-width: 360px;
      padding: 2rem;
    }
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #fff;
    }
    p {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 2rem;
      font-weight: 300;
    }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    input {
      padding: 0.75rem 1rem;
      border: 1px solid #333;
      border-radius: 8px;
      background: #141414;
      color: #fff;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #555; }
    button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      background: #fff;
      color: #0a0a0a;
      font-size: 0.85rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.85; }
    .error {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: none;
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet" />
</head>
<body>
  <div class="container">
    <h1>Dry Trip</h1>
    <p>This site is in preview. Enter the password to continue.</p>
    <form id="authForm">
      <input type="password" id="pwd" placeholder="Password" autocomplete="off" autofocus />
      <button type="submit">Enter</button>
      <div class="error" id="err">Incorrect password</div>
    </form>
  </div>
  <script>
    document.getElementById('authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = document.getElementById('pwd').value;
      const res = await fetch('/site-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        document.getElementById('err').style.display = 'block';
        document.getElementById('pwd').value = '';
      }
    });
  </script>
</body>
</html>`;
}
