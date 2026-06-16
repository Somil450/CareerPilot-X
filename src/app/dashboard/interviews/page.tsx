import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InterviewSimulatorClient from "./InterviewSimulatorClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function InterviewsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      interviewHistory: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!dbUser) redirect("/onboarding");

  const history = dbUser.interviewHistory;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">AI Interview Panel</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Practice technical, system design, and behavioral interviews with specialized AI agents.
        </p>
      </div>

      <InterviewSimulatorClient userId={dbUser.id} />

      <div className="pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Interview History</h2>
        {history.length === 0 ? (
          <div className="h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5">
            <p className="text-white/40">No mock interviews completed yet. Start one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((record) => (
              <Card key={record.id} className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-white/90">{record.interviewerRole} Interview</CardTitle>
                      <p className="text-xs text-white/40 mt-1">{formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-2xl font-bold ${record.overallScore! > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {record.overallScore}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-3">
                    <Badge variant="outline" className="border-white/10 text-white/60 text-xs">{record.type}</Badge>
                    <Badge variant="outline" className="border-white/10 text-white/60 text-xs">Tech: {record.technicalScore}</Badge>
                    <Badge variant="outline" className="border-white/10 text-white/60 text-xs">Comm: {record.communicationScore}</Badge>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">{record.feedback}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
