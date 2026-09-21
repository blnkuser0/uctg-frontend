import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = "1";
const enableSwInDev = process.env.NEXT_PUBLIC_ENABLE_SW_DEV === "true";
const isProduction = process.env.NODE_ENV === "production";

// The browser is only allowed to talk to this app and to the API/socket server it is
// configured for (the same NEXT_PUBLIC_* values the client code uses).
function originOf(value: string | undefined, fallback: string): string {
  try {
    return new URL(value || fallback).origin;
  } catch {
    return new URL(fallback).origin;
  }
}

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_URL, "http://localhost:5000");
const socketOrigin = originOf(process.env.NEXT_PUBLIC_SOCKET_URL, "http://localhost:5000");
const websocketOf = (origin: string) => origin.replace(/^http/, "ws");
const servedOverHttps = apiOrigin.startsWith("https:");

// Static pages can't carry a per-request nonce, so inline scripts/styles that Next.js itself
// emits need 'unsafe-inline'. Everything else is locked down: no foreign scripts, frames,
// plugins or form targets, and no other host may receive requests from the page.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${[...new Set([apiOrigin, socketOrigin, websocketOf(socketOrigin), websocketOf(apiOrigin)])].join(" ")}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Only when the API itself is https — a local http API would otherwise be upgraded and fail.
  ...(servedOverHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // `next dev` needs eval for its error overlay, so the CSP is only enforced in production builds.
  ...(isProduction ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
];

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development" && !enableSwInDev,
})(nextConfig);
