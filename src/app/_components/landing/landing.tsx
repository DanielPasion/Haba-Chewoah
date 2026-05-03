import { DesktopLanding } from "./desktop";
import { MobileLanding } from "./mobile";
import { StandaloneRedirect } from "./standalone-redirect";

export function Landing({ signedIn }: { signedIn: boolean }) {
  return (
    <StandaloneRedirect signedIn={signedIn}>
      <main className="h-dvh w-full overflow-hidden bg-hc-bg">
        <div className="h-full md:hidden">
          <MobileLanding signedIn={signedIn} />
        </div>
        <div className="hidden h-full md:block">
          <DesktopLanding signedIn={signedIn} />
        </div>
      </main>
    </StandaloneRedirect>
  );
}
