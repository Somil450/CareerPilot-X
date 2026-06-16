import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Trophy, Target, TrendingUp } from "lucide-react";

export default async function CareerDNAPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { careerDNA: true }
  });

  if (!dbUser || !dbUser.careerDNA) {
    redirect("/onboarding");
  }

  const dnaData = dbUser.careerDNA;
  
  // Safe JSON parsing for SQLite String fields
  const safeParse = (str: string | null, fallback: any) => {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch { return fallback; }
  };

  const skills = safeParse(dnaData.skills, []) as {name: string, score: number}[];
  const strengths = safeParse(dnaData.strengths, []) as string[];
  const growthAreas = safeParse(dnaData.growthAreas, []) as string[];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Career DNA</h1>
        <p className="text-muted-foreground mt-2">A deep-dive into your skills, strengths, and growth areas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="col-span-1 md:col-span-3 bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{dnaData.careerGoal}</h2>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="outline">{dnaData.experienceLevel}</Badge>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    {dnaData.readinessScore}% Ready
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Matrix */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Skill Matrix</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {skills.length === 0 ? (
              <p className="text-muted-foreground">No skills evaluated yet.</p>
            ) : (
              skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{skill.name}</span>
                    <span>{skill.score}%</span>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-500">
                <Trophy className="w-5 h-5" />
                <span>Top Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {strengths.length === 0 ? (
                <p className="text-muted-foreground text-sm">Evaluating...</p>
              ) : (
                strengths.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-green-500/10 text-green-500 border-none">
                    {s}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-500">
                <TrendingUp className="w-5 h-5" />
                <span>Growth Areas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {growthAreas.length === 0 ? (
                <p className="text-muted-foreground text-sm">Evaluating...</p>
              ) : (
                growthAreas.map((w) => (
                  <Badge key={w} variant="secondary" className="bg-orange-500/10 text-orange-500 border-none">
                    {w}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
