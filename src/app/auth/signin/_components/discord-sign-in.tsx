import { DiscordIcon } from "~/components/icons";
import { buttonClass } from "~/components/ui";
import { safeCallbackUrl } from "~/lib/safe-redirect";
import { signIn } from "~/server/auth";

export function DiscordSignIn({ callbackUrl }: { callbackUrl: string }) {
  // Defense-in-depth: re-validate even though the page already sanitised.
  const safeUrl = safeCallbackUrl(callbackUrl);
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirectTo: safeUrl });
      }}
      className="w-full"
    >
      <button
        type="submit"
        className={`${buttonClass({ variant: "primary", size: "lg", fullWidth: true })} gap-3`}
      >
        <DiscordIcon size={22} />
        continue with discord
      </button>
    </form>
  );
}
