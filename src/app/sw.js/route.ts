import { readFileSync } from "node:fs";
import { join } from "node:path";

import { NextResponse } from "next/server";

// Read the Next.js BUILD_ID once per process. In dev there is no BUILD_ID
// file — the SW caches under "dev" and a hard-reload busts it on next visit.
let cachedBuildId: string | null = null;
function getBuildId(): string {
  if (cachedBuildId !== null) return cachedBuildId;
  try {
    cachedBuildId = readFileSync(
      join(process.cwd(), ".next/BUILD_ID"),
      "utf8",
    ).trim();
  } catch {
    cachedBuildId = "dev";
  }
  return cachedBuildId;
}

const SW_BODY = (version: string) => `// Haba-Chewoah · service worker — generated per deploy
// CACHE name embeds Next.js BUILD_ID so a new build invalidates the prior cache.
// Only hashed static assets under /_next/static are cached; HTML and API
// responses are always fetched fresh (auth state varies per user).
/* eslint-disable */

const CACHE = "haba-chewoah-${version}";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Never cache HTML navigations — auth state must always be fresh.
  if (req.mode === "navigate" || req.destination === "document") return;

  // Cache hashed Next.js static assets aggressively. New builds get new
  // hashes, so the cache is content-addressed and safe forever.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Other same-origin GETs: pass through to network without caching.
});
`;

export function GET() {
  return new NextResponse(SW_BODY(getBuildId()), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
