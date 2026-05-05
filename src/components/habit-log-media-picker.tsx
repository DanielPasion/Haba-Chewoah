"use client";

import { useEffect, useRef, useState } from "react";

import type { HabitLogMediaUploadGrant } from "~/server/r2";

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm";
const PHOTO_MAX_BYTES = 8 * 1024 * 1024;
const VIDEO_MAX_BYTES = 30 * 1024 * 1024;
const VIDEO_MAX_DURATION_MS = 15_000;

type Status =
  | { state: "idle" }
  | { state: "uploading"; progress: number }
  | {
      state: "ready";
      previewUrl: string;
      publicUrl: string;
      objectKey: string;
      kind: "photo" | "video";
      durationMs: number | null;
    }
  | { state: "error"; message: string };

export type GetHabitLogMediaUploadUrl = (input: {
  contentType: string;
  habitId: string;
}) => Promise<
  | { ok: true; grant: HabitLogMediaUploadGrant }
  | { ok: false; message: string }
>;

type HabitLogMediaPickerProps = {
  getUploadUrlAction: GetHabitLogMediaUploadUrl;
  /** Habit being logged — gates the presign on ownership + active state. */
  habitId: string;
  /** Hidden input names — server action reads these from the form. */
  objectKeyInputName?: string;
  typeInputName?: string;
  durationInputName?: string;
};

export function HabitLogMediaPicker({
  getUploadUrlAction,
  habitId,
  objectKeyInputName = "mediaObjectKey",
  typeInputName = "mediaType",
  durationInputName = "mediaDurationMs",
}: HabitLogMediaPickerProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  // Preview blob URLs are not reused across picks — release them so the
  // browser doesn't hold onto large videos in memory.
  useEffect(() => {
    if (status.state !== "ready") return;
    const url = status.previewUrl;
    return () => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [status]);

  async function pickPhoto(file: File) {
    if (!PHOTO_ACCEPT.includes(file.type)) {
      setStatus({ state: "error", message: "unsupported photo format" });
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setStatus({ state: "error", message: "photo is over 8 MB" });
      return;
    }
    await upload(file, "photo", null);
  }

  async function pickVideo(file: File) {
    if (!VIDEO_ACCEPT.includes(file.type)) {
      setStatus({ state: "error", message: "unsupported video format" });
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      setStatus({ state: "error", message: "video is over 30 MB" });
      return;
    }
    let durationMs: number;
    try {
      durationMs = await readVideoDuration(file);
    } catch {
      setStatus({ state: "error", message: "couldn't read video metadata" });
      return;
    }
    if (durationMs > VIDEO_MAX_DURATION_MS) {
      setStatus({ state: "error", message: "video must be 15 seconds or less" });
      return;
    }
    await upload(file, "video", durationMs);
  }

  async function upload(
    file: File,
    kind: "photo" | "video",
    durationMs: number | null,
  ) {
    setStatus({ state: "uploading", progress: 0 });
    const grantResult = await getUploadUrlAction({
      contentType: file.type,
      habitId,
    });
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

    setStatus({
      state: "ready",
      previewUrl: URL.createObjectURL(file),
      publicUrl,
      objectKey,
      kind,
      durationMs,
    });
  }

  function clear() {
    setStatus({ state: "idle" });
  }

  const ready = status.state === "ready" ? status : null;

  return (
    <div className="flex flex-col gap-2.5">
      <input
        type="hidden"
        name={objectKeyInputName}
        value={ready?.objectKey ?? ""}
      />
      <input type="hidden" name={typeInputName} value={ready?.kind ?? ""} />
      <input
        type="hidden"
        name={durationInputName}
        value={ready?.durationMs?.toString() ?? ""}
      />

      {ready ? (
        <div className="relative overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-ink">
          {ready.kind === "photo" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ready.previewUrl}
              alt="preview"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <video
              src={ready.previewUrl}
              className="aspect-[4/5] w-full object-cover"
              controls
              playsInline
              muted
            />
          )}
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-hc-line bg-hc-bg/90 text-hc-ink shadow-hc-soft hover:bg-hc-bg"
            aria-label="remove media"
          >
            ×
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-hc-ink/80 px-2.5 py-1 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-bg backdrop-blur">
            {ready.kind === "video" ? (
              <>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                {formatDuration(ready.durationMs ?? 0)}
              </>
            ) : (
              "photo"
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <PickButton
            label="add photo"
            hint="≤ 8 MB"
            onClick={() => photoInputRef.current?.click()}
            disabled={status.state === "uploading"}
          />
          <PickButton
            label="add video"
            hint="≤ 15 sec · 30 MB"
            onClick={() => videoInputRef.current?.click()}
            disabled={status.state === "uploading"}
          />
        </div>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pickPhoto(f);
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pickVideo(f);
          e.target.value = "";
        }}
      />

      <StatusLine status={status} />
    </div>
  );
}

function PickButton({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-start gap-0.5 rounded-hc-2 border border-dashed border-hc-line-strong bg-hc-surface px-3 py-3 text-left transition-colors hover:bg-hc-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="font-sans text-hc-button font-bold text-hc-ink">
        {label}
      </span>
      <span className="font-mono text-hc-tiny font-medium text-hc-muted">
        {hint}
      </span>
    </button>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.state === "uploading") {
    return (
      <span className="font-mono text-hc-eyebrow uppercase tracking-hc-eyebrow text-hc-muted">
        uploading… {status.progress}%
      </span>
    );
  }
  if (status.state === "error") {
    return (
      <span className="font-mono text-hc-eyebrow uppercase tracking-hc-eyebrow text-hc-accent">
        {status.message}
      </span>
    );
  }
  if (status.state === "ready") {
    return (
      <span className="font-mono text-hc-eyebrow uppercase tracking-hc-eyebrow text-hc-muted">
        ready to post
      </span>
    );
  }
  return null;
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Read duration without playing the file — load metadata only.
function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;
    const cleanup = () => URL.revokeObjectURL(url);
    video.onloadedmetadata = () => {
      const ms = Math.round(video.duration * 1000);
      cleanup();
      if (!Number.isFinite(ms) || ms <= 0) reject(new Error("bad duration"));
      else resolve(ms);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("couldn't load video"));
    };
  });
}

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
