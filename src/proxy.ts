import { NextResponse, type NextRequest } from "next/server";

/**
 * US-only geo gate for production.
 * Enforced only on Vercel (VERCEL=1) or when EM_GEO_GATE=on. Local dev and the tailnet preview
 * (a plain `next start` on the box/Mac mini) never set either, so they bypass it. EM_GEO_GATE=off forces it off.
 * Country comes from Vercel's x-vercel-ip-country header. A missing header fails open.
 */
const enforce = process.env.EM_GEO_GATE === "on" || (process.env.VERCEL === "1" && process.env.EM_GEO_GATE !== "off");
const ALLOWED = new Set(["US"]);

export function proxy(req: NextRequest) {
  if (!enforce) return NextResponse.next();
  const country = req.headers.get("x-vercel-ip-country");
  if (!country || ALLOWED.has(country.toUpperCase())) return NextResponse.next();
  return NextResponse.rewrite(new URL("/us-only", req.url));
}

export const config = {
  // Everything except static assets and the gate page itself.
  matcher: ["/((?!_next/|favicon.ico|us-only).*)"],
};
