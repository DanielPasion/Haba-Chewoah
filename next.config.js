/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/**
 * Baseline security headers applied to every route. CSP intentionally omitted
 * here — it needs per-page tuning (NextAuth, OAuth flows, inline scripts) that
 * we'll add when the threat model is clearer.
 *
 * @type {Array<{key: string, value: string}>}
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * Allowlist hosts for `next/image`. We parse R2_PUBLIC_URL outside the env
 * validator because next.config runs without it; a missing/invalid value
 * should warn-and-skip rather than crash the build.
 *
 * @type {Array<import("next").NextConfig extends { images?: { remotePatterns?: infer R } } ? (R extends Array<infer P> ? P : never) : never>}
 */
const remotePatterns = [
  { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/avatars/**" },
];

if (process.env.R2_PUBLIC_URL) {
  try {
    const u = new URL(process.env.R2_PUBLIC_URL);
    if (u.protocol === "https:" || u.protocol === "http:") {
      remotePatterns.push({
        protocol: /** @type {"http" | "https"} */ (u.protocol.slice(0, -1)),
        hostname: u.hostname,
        pathname: "/**",
      });
    }
  } catch {
    console.warn("[next.config] R2_PUBLIC_URL is not a valid URL; skipping image allowlist entry");
  }
}

/** @type {import("next").NextConfig} */
const config = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
  images: { remotePatterns },
};

export default config;
