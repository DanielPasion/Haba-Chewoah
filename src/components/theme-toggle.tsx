"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "hc-theme";

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  // iOS Safari throws SecurityError on localStorage access when storage is
  // blocked (Private Browsing, "Block all cookies", strict Tracking Prevention).
  // An uncaught throw here escapes the root layout and produces the generic
  // "Application error: a client-side exception has occurred" page.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme(): {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
} {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const t = readTheme();
    setThemeState(t);
    applyTheme(t);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}

export function ThemeBootScript() {
  // Inlined into <head> before paint to avoid a flash. Reads STORAGE_KEY
  // directly because the script runs before any module imports resolve.
  const code = `(()=>{try{const s=localStorage.getItem('${STORAGE_KEY}');const t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
