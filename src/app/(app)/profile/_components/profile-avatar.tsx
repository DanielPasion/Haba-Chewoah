import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

type ProfileAvatarProps = {
  imageUrl: string | null | undefined;
  alt: string;
  /** Outer diameter in px. */
  size: number;
  /** Optional ring border (used by the desktop banner overlap). */
  ringWidth?: number;
};

/**
 * Round avatar tile. Renders the user's uploaded image when present, falls
 * back to the brand mascot on a dark inked surface. Reused at multiple sizes
 * across mobile, desktop, and the edit form.
 */
export function ProfileAvatar({
  imageUrl,
  alt,
  size,
  ringWidth = 0,
}: ProfileAvatarProps) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-hc-ink shadow-hc"
      style={{
        width: size,
        height: size,
        border: ringWidth ? `${ringWidth}px solid var(--color-hc-bg)` : undefined,
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <TwoFaceMascot size={Math.round(size * 0.92)} bg="#1B1726" />
      )}
    </div>
  );
}
