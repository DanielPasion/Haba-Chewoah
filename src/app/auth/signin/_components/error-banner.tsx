const ERROR_COPY: Record<string, string> = {
  OAuthSignin: "Couldn't kick off Discord sign-in. Try again?",
  OAuthCallback: "Discord sent us back something we couldn't read.",
  OAuthAccountNotLinked: "That Discord account isn't linked to this user yet.",
  AccessDenied: "Discord said no. (You denied access.)",
  Default: "Something went sideways. One more shot?",
};

export function ErrorBanner({ code }: { code: string }) {
  const message = ERROR_COPY[code] ?? ERROR_COPY.Default!;
  return (
    <div
      className="w-full rounded-hc-2 bg-hc-accent px-4 py-3 text-sm font-medium text-hc-accent-ink"
      role="alert"
    >
      {message}
    </div>
  );
}
