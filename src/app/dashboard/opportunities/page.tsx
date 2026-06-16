import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OpportunitiesClient from "./OpportunitiesClient";

export default async function OpportunitiesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) redirect("/onboarding");

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Opportunity Radar</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          AI-curated internships, jobs, and hackathons matched specifically to your Career DNA.
        </p>
      </div>

      <OpportunitiesClient userId={dbUser.id} />
    </div>
  );
}
