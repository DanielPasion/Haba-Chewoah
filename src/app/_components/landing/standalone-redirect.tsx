"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isStandalone() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (navigator as NavigatorWithStandalone).standalone === true;
}

export function StandaloneRedirect({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(() => isStandalone());

  useEffect(() => {
    if (isStandalone()) {
      setRedirecting(true);
      router.replace(signedIn ? "/feed" : "/auth/signin");
    }
  }, [router, signedIn]);

  if (redirecting) return null;
  return <>{children}</>;
}
