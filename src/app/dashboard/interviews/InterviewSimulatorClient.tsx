"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Play, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 20); // ms per character
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
}

export default function InterviewSimulatorClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState("");
  const [type, setType] = useState("TECHNICAL");
  const [interviewerRole, setInterviewerRole] = useState("TECH_LEAD");
  
  const [result, setResult] = useState<any>(null);

  const startInterview = (selectedType: string, role: string) => {
    setType(selectedType);
    setInterviewerRole(role);
    setIsActive(true);
    setResult(null);
    setResponse("");
  };

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, interviewerRole, userResponse: response })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setIsActive(false);
        router.refresh(); // Refresh to update history list on parent page
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestion = () => {
    if (type === "TECHNICAL") return "Explain how you would optimize a slow-performing database query in a production environment.";
    if (type === "SYSTEM_DESIGN") return "Design a scalable URL shortener service like bit.ly. Walk me through your architecture.";
    return "Tell me about a time you had a conflict with a team member and how you resolved it.";
  };

  const parseJsonSafe = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  return (
    <div className="space-y-6">
      {!isActive && !result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black/40 border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => startInterview("TECHNICAL", "TECH_LEAD")}>
            <CardHeader>
              <CardTitle className="text-lg text-white">Technical Deep Dive</CardTitle>
              <CardDescription className="text-white/60">Practice coding concepts & algorithms with the Tech Lead.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                <Play className="w-4 h-4 mr-2" /> Start Technical
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => startInterview("SYSTEM_DESIGN", "ARCHITECT")}>
            <CardHeader>
              <CardTitle className="text-lg text-white">System Design</CardTitle>
              <CardDescription className="text-white/60">Architect scalable systems with the Principal Engineer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                <Play className="w-4 h-4 mr-2" /> Start System Design
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 hover:border-pink-500/50 transition-colors cursor-pointer" onClick={() => startInterview("HR", "HR_MANAGER")}>
            <CardHeader>
              <CardTitle className="text-lg text-white">Behavioral / HR</CardTitle>
              <CardDescription className="text-white/60">Perfect your cultural fit and soft skills with HR.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full bg-pink-500/20 text-pink-300 hover:bg-pink-500/30">
                <Play className="w-4 h-4 mr-2" /> Start Behavioral
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {isActive && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/60 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">{interviewerRole} / {type}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setIsActive(false)} className="text-white/50 hover:text-white">Cancel</Button>
              </div>
              <CardTitle className="text-2xl text-white mt-4 leading-relaxed">
                "{getQuestion()}"
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Textarea 
                  placeholder="Type your response here or simulate speech..." 
                  className="min-h-[150px] bg-white/5 border-white/10 text-white resize-none p-4"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button size="icon" variant="ghost" className="absolute bottom-2 right-2 text-white/40 hover:text-white hover:bg-white/10" disabled={isSubmitting}>
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting || !response.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4 mr-2" /> Submit Answer</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <Card className="bg-black/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Feedback Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Overall</p>
                  <p className={`text-5xl font-black ${result.overallScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{result.overallScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Technical</p>
                  <p className="text-3xl font-bold text-white">{result.technicalScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Comm.</p>
                  <p className="text-3xl font-bold text-white">{result.communicationScore}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-white/80 min-h-[100px]">
                <TypewriterText text={result.feedback} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="flex items-center text-green-400 font-medium mb-3"><CheckCircle2 className="w-4 h-4 mr-2" /> Strengths</h4>
                  <ul className="space-y-2 text-sm text-white/70">
                    {parseJsonSafe(result.strengths).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h4 className="flex items-center text-red-400 font-medium mb-3"><AlertCircle className="w-4 h-4 mr-2" /> Areas to Improve</h4>
                  <ul className="space-y-2 text-sm text-white/70">
                    {parseJsonSafe(result.weaknesses).map((w: string, i: number) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setResult(null)} className="border-white/20 text-white hover:bg-white/10">
                  Practice Another Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
