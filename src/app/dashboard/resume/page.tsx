import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResumeClient from "./ResumeClient";

export default async function ResumePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      careerDNA: true,
      resumeVersions: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!dbUser || !dbUser.careerDNA) redirect("/onboarding");

  const latestResume = dbUser.resumeVersions.length > 0 ? dbUser.resumeVersions[0] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Resume Copilot</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Paste your resume text to get an instant AI evaluation against your goal of becoming a <span className="text-indigo-400 font-semibold">{dbUser.careerDNA.careerGoal}</span>.
        </p>
      </div>

      <ResumeClient 
        userId={dbUser.id} 
        latestResume={latestResume ? {
          atsScore: latestResume.atsScore,
          feedback: latestResume.feedback ? JSON.parse(latestResume.feedback) : null,
          createdAt: latestResume.createdAt.toISOString()
        } : null} 
      />
    </div>
  );
}
