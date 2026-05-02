import { Landing } from "~/app/_components/landing";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();
  return (
    <HydrateClient>
      <Landing signedIn={!!session?.user} />
    </HydrateClient>
  );
}
