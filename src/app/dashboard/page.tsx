import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Target, Activity } from "lucide-react";
import TaskListClient from "@/components/dashboard/TaskListClient";
import GenerateTasksClient from "@/components/dashboard/GenerateTasksClient";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch real data from the database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      careerDNA: true,
      autopilotTasks: {
        where: { status: "TODO" },
        orderBy: { date: 'asc' },
        take: 3
      }
    }
  });

  if (!dbUser || !dbUser.careerDNA) {
    redirect("/onboarding");
  }

  const dna = dbUser.careerDNA;
  const tasks = dbUser.autopilotTasks;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            God Mode, {user.firstName || "User"} ⚡
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">All AI systems nominal. Ready to accelerate.</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase">AI Core Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Score Card */}
        <Card className="col-span-1 md:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white/80">
              <Target className="w-5 h-5 text-indigo-400" />
              <span>Career Readiness Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4 mb-4">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500 tracking-tighter">
                <AnimatedNumber value={dna.readinessScore} />%
              </span>
              <span className="text-sm text-indigo-400 font-medium mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1 animate-pulse" />
                {dna.careerGoal} profile syncing...
              </span>
            </div>
            <Progress value={dna.readinessScore} className="h-3 rounded-full bg-white/10 [&>div]:bg-indigo-500" />
          </CardContent>
        </Card>

        {/* Level/Gamification Card */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white/80">Current Level</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/30 mb-4 shadow-[0_0_30px_rgba(99,102,241,0.2)] transform hover:scale-105 transition-transform">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Lvl 1</span>
            </div>
            <h3 className="font-bold text-lg text-white/90">{dna.experienceLevel}</h3>
            <p className="text-xs text-white/40 mt-1">Complete tasks to level up</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Autopilot Tasks */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <Activity className="w-6 h-6 mr-2 text-indigo-400" /> Action Matrix
          </h2>
          <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/30 px-3 py-1 uppercase tracking-widest text-[10px]">Autopilot Engaged</Badge>
        </div>
        
        {tasks.length === 0 ? (
          <GenerateTasksClient />
        ) : (
          <TaskListClient initialTasks={tasks} />
        )}
      </div>
    </div>
  );
}
