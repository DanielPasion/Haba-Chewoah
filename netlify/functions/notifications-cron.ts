// Netlify scheduled function — fires every 15 minutes (schedule lives in
// `netlify.toml`). All this does is forward to the in-app API route so the
// notification logic stays inside the Next.js server (which has Prisma +
// our env wiring set up). Direct DB access from Netlify Functions would
// duplicate the connection-pooling + adapter setup in `src/server/db.ts`.

const url = process.env.URL ?? process.env.DEPLOY_URL ?? "";
const cronSecret = process.env.CRON_SECRET ?? "";

export default async () => {
  if (!url) {
    return new Response(
      JSON.stringify({ ok: false, error: "no deploy URL available" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
  const target = `${url.replace(/\/$/, "")}/api/cron/notifications`;
  const res = await fetch(target, {
    method: "POST",
    headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : {},
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
};
