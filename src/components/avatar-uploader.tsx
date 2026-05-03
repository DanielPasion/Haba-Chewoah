"use client";

import { useRef, useState } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_BYTES = 4 * 1024 * 1024;

type Status =
  | { state: "idle" }
  | { state: "uploading"; progress: number }
  | { state: "ready"; previewUrl: string; objectKey: string }
  | { state: "error"; message: string };

export type AvatarUploadGrant = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
};

export type GetAvatarUploadUrl = (input: {
  contentType: string;
}) => Promise<
  { ok: true; grant: AvatarUploadGrant } | { ok: false; message: string }
>;

type AvatarUploaderProps = {
  /** Server action returning a presigned PUT URL for this user's avatar. */
  getUploadUrlAction: GetAvatarUploadUrl;
  /** Existing avatar URL — shown as preview until the user picks a new file. */
  initialUrl?: string | null;
  /** Hidden form input name. Defaults to "avatarObjectKey". */
  inputName?: string;
};

/**
 * Reusable avatar uploader. Used by both /create-account and /profile/edit.
 *
 * - Renders the TwoFaceMascot or `initialUrl` as the preview.
 * - On pick: grabs a presigned URL, PUTs to R2 with progress, and writes the
 *   object key into a hidden form field so the surrounding form action can
 *   persist it.
 * - When `initialUrl` is set and the user hasn't picked a new file, the hidden
 *   field stays empty — the server action treats that as "keep existing avatar".
 */
export function AvatarUploader({
  getUploadUrlAction,
  initialUrl,
  inputName = "avatarObjectKey",
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(
    initialUrl
      ? { state: "ready", previewUrl: initialUrl, objectKey: "" }
      : { state: "idle" },
  );

  async function onPick(file: File) {
    if (file.size > MAX_BYTES) {
      setStatus({ state: "error", message: "file is over 4 MB" });
      return;
    }

    setStatus({ state: "uploading", progress: 0 });
    const grantResult = await getUploadUrlAction({ contentType: file.type });
    if (!grantResult.ok) {
      setStatus({ state: "error", message: grantResult.message });
      return;
    }
    const { uploadUrl, objectKey, publicUrl } = grantResult.grant;

    try {
      await putWithProgress(uploadUrl, file, (p) =>
        setStatus({ state: "uploading", progress: p }),
      );
    } catch (err) {
      setStatus({
        state: "error",
        message: err instanceof Error ? err.message : "upload failed",
      });
      return;
    }

    setStatus({ state: "ready", previewUrl: publicUrl, objectKey });
  }

  const previewUrl = status.state === "ready" ? status.previewUrl : null;
  const objectKey = status.state === "ready" ? status.objectKey : "";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="upload avatar"
        className="grid size-28 place-items-center overflow-hidden rounded-full border-[1.5px] border-hc-ink bg-hc-ink shadow-hc transition-transform hover:scale-[1.02]"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="your avatar"
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={104} bg="#1B1726" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
          e.target.value = "";
        }}
      />

      <input type="hidden" name={inputName} value={objectKey} />

      <div className="flex flex-col items-center gap-1 text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-hc-ink underline-offset-4 hover:underline"
        >
          {previewUrl ? "change photo" : "upload photo"}
        </button>
        <StatusLine status={status} />
      </div>
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.state === "idle") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-muted">
        png · jpg · webp · gif · max 4 MB
      </span>
    );
  }
  if (status.state === "uploading") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-muted">
        uploading… {status.progress}%
      </span>
    );
  }
  if (status.state === "ready") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-brand-strong">
        {status.objectKey ? "✓ uploaded" : "current photo"}
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-accent">
      {status.message}
    </span>
  );
}

/**
 * `fetch` doesn't expose upload progress. XHR does — and we want the
 * percentage so the user sees the bar move during a 3 MB JPEG.
 */
function putWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("network error during upload"));
    xhr.send(file);
  });
}
