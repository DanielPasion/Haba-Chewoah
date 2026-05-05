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
});

// Web Push: payload is a JSON-encoded { title, body, url } we send from
// src/server/notifications.ts. If decoding fails (browser triggered the
// event without our payload), we still surface a generic notification so
// the user knows *something* happened.
self.addEventListener("push", (event) => {
  let payload = { title: "Haba-Chewoah", body: "you've got activity", url: "/notifications" };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.png",
      badge: "/icon.png",
      tag: payload.url,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      // If a tab is already open on this origin, focus it and route there
      // instead of stacking a new tab on every push.
      for (const w of wins) {
        if ("focus" in w) {
          w.focus();
          if ("navigate" in w) w.navigate(target);
          return;
        }
      }
      if (self.clients.openWindow) self.clients.openWindow(target);
    }),
  );
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
