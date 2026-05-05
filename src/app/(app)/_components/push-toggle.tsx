"use client";

import { useEffect, useState } from "react";

import {
  deletePushSubscriptionAction,
  savePushSubscriptionAction,
} from "../_actions";

type State =
  | { phase: "loading" }
  | { phase: "unsupported" }
  | { phase: "denied" }
  | { phase: "off" }
  | { phase: "on"; endpoint: string }
  | { phase: "missing-vapid" };

/**
 * Toggle that owns the entire web-push subscribe lifecycle:
 *
 *   Browser support? → Notification.permission state → existing SW subscription? → toggle.
 *
 * The flow is intentionally idempotent — on every mount we reconcile the
 * server's view with the browser's view, so a user who revoked permission
 * via OS settings doesn't see a phantom "on" state.
 */
export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string | null }) {
  const [state, setState] = useState<State>({ phase: "loading" });
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function reconcile() {
      if (!vapidPublicKey) {
        if (!cancelled) setState({ phase: "missing-vapid" });
        return;
      }
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setState({ phase: "unsupported" });
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState({ phase: "denied" });
        return;
      }

      // The SW registers from `sw-register.tsx` but only in production. If
      // the registration hasn't landed yet (first load, dev mode), fall
      // back to "off" — the user can still tap the button to trigger it.
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        if (!cancelled) setState({ phase: "off" });
        return;
      }
      const sub = await reg.pushManager.getSubscription();
      if (!cancelled) {
        setState(sub ? { phase: "on", endpoint: sub.endpoint } : { phase: "off" });
      }
    }
    void reconcile();
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function turnOn() {
    if (!vapidPublicKey) return;
    setError(null);
    setWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState({ phase: permission === "denied" ? "denied" : "off" });
        return;
      }

      // The SW must be controlling this page before we can subscribe — in
      // dev mode it isn't registered (sw-register.tsx is prod-only), so
      // we register it ourselves on demand. In prod this is a no-op since
      // the same scope is already controlled.
      const reg =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/sw.js"));
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToBuffer(vapidPublicKey),
        }));

      const json = sub.toJSON();
      const result = await savePushSubscriptionAction({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
        userAgent: navigator.userAgent || null,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setState({ phase: "on", endpoint: sub.endpoint });
    } catch (err) {
      setError(err instanceof Error ? err.message : "couldn't enable");
    } finally {
      setWorking(false);
    }
  }

  async function turnOff() {
    setError(null);
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await deletePushSubscriptionAction({ endpoint: sub.endpoint });
      }
      setState({ phase: "off" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "couldn't disable");
    } finally {
      setWorking(false);
    }
  }

  if (state.phase === "loading") {
    return <Skeleton />;
  }
  if (state.phase === "unsupported") {
    return (
      <Banner
        title="push notifications · not on this browser"
        body="add the app to your home screen on iOS, or open this on a desktop browser to enable."
      />
    );
  }
  if (state.phase === "missing-vapid") {
    return (
      <Banner
        title="push notifications · not configured"
        body="set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT (and NEXT_PUBLIC_VAPID_PUBLIC_KEY) in env to enable."
      />
    );
  }
  if (state.phase === "denied") {
    return (
      <Banner
        title="push notifications · blocked"
        body="you blocked notifications for this site. flip them back on in your browser's site settings."
      />
    );
  }

  const isOn = state.phase === "on";
  return (
    <div className="flex items-start gap-3 rounded-hc-3 border-hc border-hc-line bg-hc-surface p-3.5">
      <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-hc-line-strong bg-hc-bg text-hc-ink">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-extrabold text-hc-ink" style={{ letterSpacing: "-0.02em" }}>
          push notifications
        </p>
        <p className="font-mono text-hc-eyebrow font-semibold text-hc-muted">
          {isOn
            ? "on — likes, comments, follows, mentions, chew-outs, reminders"
            : "off — turn on to get pinged when activity happens"}
        </p>
        {error && (
          <p className="mt-1 font-mono text-hc-eyebrow font-semibold text-hc-accent">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={isOn ? turnOff : turnOn}
        disabled={working}
        className={`shrink-0 rounded-full border border-hc-line px-3 py-1.5 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow transition-colors disabled:opacity-60 ${
          isOn
            ? "bg-hc-ink text-hc-brand hover:bg-hc-ink/90"
            : "bg-hc-accent text-hc-accent-ink hover:bg-hc-accent/90"
        }`}
      >
        {working ? "…" : isOn ? "turn off" : "turn on"}
      </button>
    </div>
  );
}

function Banner({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt p-3.5">
      <p className="font-display text-sm font-extrabold text-hc-ink" style={{ letterSpacing: "-0.02em" }}>
        {title}
      </p>
      <p className="font-mono text-hc-eyebrow font-semibold text-hc-muted">{body}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-[68px] animate-pulse rounded-hc-3 border border-hc-line bg-hc-surface" />
  );
}

// Browsers want the VAPID public key as an ArrayBuffer; the env var is a
// base64url string. Standard reference impl from the web-push docs. We
// return an ArrayBuffer (not a Uint8Array view) so the BufferSource type
// narrows to ArrayBuffer — the lib.dom.d.ts BufferSource union excludes
// SharedArrayBuffer-backed views in TS 5.6+.
function urlBase64ToBuffer(b64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i += 1) view[i] = raw.charCodeAt(i);
  return buf;
}
