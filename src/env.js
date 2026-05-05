import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),
    R2_PUBLIC_URL: z.string().url(),

    // Web Push (VAPID). Generate once via `npx web-push generate-vapid-keys`
    // and reuse forever — rotating invalidates every active subscription.
    // Public key is also exposed to the client; private key stays server-side.
    // Marked optional in the type, but the superRefine below makes them
    // required when NODE_ENV === "production". A prod deploy missing these
    // would silently disable push delivery.
    VAPID_PUBLIC_KEY: z.string().min(1).optional(),
    VAPID_PRIVATE_KEY: z.string().min(1).optional(),
    VAPID_SUBJECT: z.string().min(1).optional(),

    // Shared secret for cron endpoints (Netlify scheduled functions hit
    // these). Send as `Authorization: Bearer <secret>`. Required in prod
    // (see superRefine) — when missing, the route fails-open and accepts
    // anonymous calls, which would let any internet caller spam pushes.
    CRON_SECRET: z.string().min(1).optional(),
  },

  client: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  },

  // process.env can't be destructured in edge runtimes — must list keys manually.
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,

  // Production-only requirements: VAPID + CRON_SECRET. Marking them
  // `.optional()` above lets local dev run without configuring push or a
  // cron secret; this onValidationError-like guard makes prod fail loudly
  // if either is missing instead of failing open (cron route exposed) or
  // failing silent (push delivery disabled).
  onValidationError: (issues) => {
    console.error("[env] invalid environment variables", issues);
    throw new Error("invalid env vars — see logs");
  },
});

if (
  process.env.NODE_ENV === "production" &&
  !process.env.SKIP_ENV_VALIDATION
) {
  const required = ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "CRON_SECRET", "NEXT_PUBLIC_VAPID_PUBLIC_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `missing required production env vars: ${missing.join(", ")}`,
    );
  }
}
