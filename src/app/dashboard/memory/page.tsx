import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Cpu, Database, Network } from "lucide-react";
import MemoryTimelineClient from "./MemoryTimelineClient";

export default async function MemoryPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { aiMemory: { orderBy: { createdAt: "desc" } } }
  });

  if (!dbUser) redirect("/onboarding");



  const memories = dbUser.aiMemory;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Background Matrix Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/40 via-purple-500/10 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            Neural Memory Matrix
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            A visualization of how CareerPilot's AI understands your professional trajectory.
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
          <Network className="w-4 h-4 text-purple-400 animate-spin-slow" />
          <span className="text-xs font-bold text-purple-300 tracking-widest uppercase">Deep Learning Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 uppercase tracking-wider">Total Data Points</p>
              <p className="text-2xl font-bold text-white">{memories.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 uppercase tracking-wider">Analysis Confidence</p>
              <p className="text-2xl font-bold text-white">94%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
              <BrainCircuit className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 uppercase tracking-wider">Next Sync</p>
              <p className="text-xl font-bold text-white">Real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10 pt-8">
        <MemoryTimelineClient memories={memories} />
      </div>
    </div>
  );
}
