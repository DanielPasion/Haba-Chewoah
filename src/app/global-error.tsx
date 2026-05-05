"use client";

import { useEffect } from "react";

// global-error catches throws in the root layout subtree (siblings of
// {children}) — app/error.tsx only catches errors inside the page tree, so
// without this fallback, a throw from ThemeToggle / ServiceWorkerRegister
// would surface as the framework's bare "Application error" page.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#F6F3EB",
          color: "#1F1B2E",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              margin: 0,
            }}
          >
            something blew up.
          </h1>
          <p style={{ margin: 0, color: "#7A7388", fontSize: 14 }}>
            Try again — if it keeps happening, reload the tab.
          </p>
          {error.digest && (
            <p
              style={{
                margin: 0,
                fontFamily: "ui-monospace, SF Mono, monospace",
                fontSize: 11,
                color: "#7A7388",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              ref · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              appearance: "none",
              border: "1.5px solid #1F1B2E",
              background: "#1F1B2E",
              color: "#F5D76E",
              padding: "0.75rem 1.25rem",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            try again
          </button>
        </div>
      </body>
    </html>
  );
}
