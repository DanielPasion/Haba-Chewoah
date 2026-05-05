import { NextResponse } from "next/server";

import { env } from "~/env";
import { runNotificationsCron } from "~/server/cron/run-notifications";

// Force the route to always run on demand — caching this would silently
// suppress notifications for the cache TTL.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Cron entry-point for system notifications. Hit this every 15 minutes
 * (Netlify scheduled function or external cron).
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>`. If `CRON_SECRET` isn't set
 * (local dev), authorization is skipped so you can poke the endpoint from
 * curl. Don't deploy to prod without a secret.
 */
async function handler(req: Request) {
  if (env.CRON_SECRET) {
    const expected = `Bearer ${env.CRON_SECRET}`;
    if (req.headers.get("authorization") !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runNotificationsCron();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[cron/notifications] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "cron failed" },
      { status: 500 },
    );
  }
}

export { handler as GET, handler as POST };
