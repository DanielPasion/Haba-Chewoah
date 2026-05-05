import { Avatar } from "~/components/avatar";

type ProfileAvatarProps = {
  imageUrl: string | null | undefined;
  /** Used to seed initials/colour when no image is available. */
  name?: string;
  fallbackName?: string;
  alt: string;
  /** Outer diameter in px. */
  size: number;
  /** Optional ring border (used by the desktop banner overlap). */
  ringWidth?: number;
};

/**
 * Profile-page avatar wrapper. Delegates to the shared `Avatar` component;
 * exists as a thin shim so legacy call sites that haven't migrated to
 * passing `name` directly still render correctly.
 */
export function ProfileAvatar({
  imageUrl,
  name,
  fallbackName,
  alt,
  size,
  ringWidth = 0,
}: ProfileAvatarProps) {
  return (
    <Avatar
      imageUrl={imageUrl}
      name={name ?? alt}
      fallbackName={fallbackName}
      size={size}
      ringWidth={ringWidth}
      alt={alt}
    />
  );
}
