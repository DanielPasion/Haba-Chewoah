import { Landing } from "~/app/_components/landing";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();
  return <Landing signedIn={!!session?.user} />;
}
