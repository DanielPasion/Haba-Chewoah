"use client";

import { useState } from "react";

import { DownloadIcon } from "~/components/icons";
import { Button } from "~/components/ui";

import { InstallSheet } from "./install-sheet";
import { detectPlatform, useInstallPrompt } from "./use-install-prompt";

export function InstallButton() {
  const { canInstall, install } = useInstallPrompt();
  const [sheetOpen, setSheetOpen] = useState(false);

  const onClick = () => {
    if (canInstall) {
      void install();
      return;
    }
    setSheetOpen(true);
  };

  return (
    <>
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={onClick}
        className="justify-between"
      >
        <span className="flex items-center gap-2.5">
          <DownloadIcon size={20} strokeWidth={2.2} />
          install the app
        </span>
        <span className="font-mono text-hc-meta font-semibold opacity-55">
          ~2mb
        </span>
      </Button>
      <InstallSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        platform={detectPlatform()}
      />
    </>
  );
}
