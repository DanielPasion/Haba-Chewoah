"use client";

import { DownloadIcon } from "~/components/icons";
import { Button } from "~/components/ui";

import { useInstallPrompt } from "./use-install-prompt";

export function InstallButton() {
  const { canInstall, install } = useInstallPrompt();
  return (
    <Button
      variant="primary"
      size="md"
      fullWidth
      onClick={canInstall ? () => void install() : undefined}
      disabled={!canInstall}
      title={
        canInstall
          ? undefined
          : "Already installed, or your browser doesn't support direct install — try Share → Add to Home Screen on iOS."
      }
      className="justify-between disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-center gap-2.5">
        <DownloadIcon size={20} strokeWidth={2.2} />
        install the app
      </span>
      <span className="font-mono text-[11px] font-semibold opacity-55">
        ~2mb
      </span>
    </Button>
  );
}
