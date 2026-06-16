import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Shield, Zap, Medal, Target, CheckCircle2 } from "lucide-react";

export default async function AchievementsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      careerDNA: true,
      autopilotTasks: true,
      resumeVersions: true,
      interviewHistory: true,
    }
  });

  if (!dbUser || !dbUser.careerDNA) {
    redirect("/onboarding");
  }

  const dna = dbUser.careerDNA;
  const tasks = dbUser.autopilotTasks;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const resumeCount = dbUser.resumeVersions.length;
  const interviewCount = dbUser.interviewHistory.length;

  // Calculate some fake XP based on activities
  const taskXp = completedTasks * 50;
  const resumeXp = resumeCount * 100;
  const interviewXp = interviewCount * 150;
  const readinessXp = dna.readinessScore * 10;
  
  const totalXp = taskXp + resumeXp + interviewXp + readinessXp;
  
  // Calculate level (every 1000 XP is a level)
  const currentLevel = Math.floor(totalXp / 1000) + 1;
  const currentLevelXp = totalXp % 1000;
  const xpForNextLevel = 1000;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXp / xpForNextLevel) * 100));

  // Determine badges
  const badges = [
    {
      id: "first_steps",
      title: "First Steps",
      description: "Completed your Career DNA profile",
      icon: <Target className="w-8 h-8 text-blue-400" />,
      earned: true,
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    },
    {
      id: "resume_rookie",
      title: "Resume Rookie",
      description: "Analyzed your first resume",
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      earned: resumeCount > 0,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    },
    {
      id: "task_master",
      title: "Task Master",
      description: "Completed 5 AI Autopilot Tasks",
      icon: <CheckCircle2 className="w-8 h-8 text-green-400" />,
      earned: completedTasks >= 5,
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    },
    {
      id: "interview_ready",
      title: "Interview Ready",
      description: "Completed your first Mock Interview",
      icon: <Medal className="w-8 h-8 text-yellow-400" />,
      earned: interviewCount > 0,
      color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    },
    {
      id: "ats_champion",
      title: "ATS Champion",
      description: "Achieved an ATS score of 80+",
      icon: <Trophy className="w-8 h-8 text-red-400" />,
      earned: dbUser.resumeVersions.some(r => (r.atsScore || 0) >= 80),
      color: "from-red-500/20 to-rose-500/20 border-red-500/30",
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements & XP</h1>
        <p className="text-muted-foreground mt-2">Track your levels, badges, and career milestones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level Card */}
        <Card className="col-span-1 md:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white/80">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Current Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-end space-x-4">
                <span className="text-5xl font-extrabold text-white">Lvl {currentLevel}</span>
                <span className="text-sm text-indigo-400 font-medium mb-1">
                  {dna.experienceLevel}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white/90">{totalXp.toLocaleString()} <span className="text-sm font-normal text-white/50">Total XP</span></p>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>{currentLevelXp} XP</span>
                <span>{xpForNextLevel} XP to Lvl {currentLevel + 1}</span>
              </div>
              <Progress value={progressPercent} className="h-3 rounded-full bg-white/10 [&>div]:bg-indigo-500" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white/80">Activity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Tasks Completed</span>
              <span className="font-bold text-white">{completedTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Resumes Analyzed</span>
              <span className="font-bold text-white">{resumeCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Interviews Done</span>
              <span className="font-bold text-white">{interviewCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Readiness Score</span>
              <span className="font-bold text-white">{dna.readinessScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Your Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <Card 
              key={badge.id} 
              className={`relative overflow-hidden transition-all duration-300 ${
                badge.earned 
                  ? `bg-gradient-to-br ${badge.color} border shadow-lg` 
                  : 'bg-white/5 border-white/5 grayscale opacity-50'
              }`}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${badge.earned ? 'bg-black/20 backdrop-blur-md' : 'bg-black/40'}`}>
                  {badge.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{badge.title}</h3>
                <p className="text-xs text-white/60">{badge.description}</p>
                
                {badge.earned && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
