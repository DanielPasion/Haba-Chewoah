import { DesktopLanding } from "./desktop";
import { MobileLanding } from "./mobile";

export function Landing({ signedIn }: { signedIn: boolean }) {
  return (
    <main className="h-dvh w-full overflow-hidden bg-hc-bg">
      <div className="h-full md:hidden">
        <MobileLanding signedIn={signedIn} />
      </div>
      <div className="hidden h-full md:block">
        <DesktopLanding signedIn={signedIn} />
      </div>
    </main>
  );
}
