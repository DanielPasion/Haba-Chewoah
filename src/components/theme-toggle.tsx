"use client";

import { useEffect, useState } from "react";

import { MoonIcon, SunIcon } from "~/components/icons";

type Theme = "light" | "dark";

const STORAGE_KEY = "hc-theme";

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = readTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed right-4 bottom-4 z-50 grid h-12 w-12 place-items-center rounded-full border-hc border-current bg-hc-bg text-hc-ink transition-transform duration-150 hover:scale-110 hover:-rotate-6"
      style={{ boxShadow: "0 6px 18px rgb(0 0 0 / 0.18), 2px 2px 0 currentColor" }}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function ThemeBootScript() {
  // Inlined into <head> before paint to avoid a flash. Reads STORAGE_KEY
  // directly because the script runs before any module imports resolve.
  const code = `(()=>{try{const s=localStorage.getItem('${STORAGE_KEY}');const t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
