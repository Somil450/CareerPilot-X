"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Zap, X, BrainCircuit, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function TaskListClient({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  
  const router = useRouter();

  const handleExecute = async () => {
    if (!selectedTask) return;
    setIsExecuting(true);
    setExecutionResult(null);
    const toastId = toast.loading("AI Core is executing task...");

    try {
      const res = await fetch("/api/tasks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: selectedTask.id })
      });

      const data = await res.json();

      if (res.ok && data.content) {
        setExecutionResult(data.content);
        toast.success("Execution complete!", { id: toastId });
      } else {
        throw new Error(data.error || "Failed to execute");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: toastId });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId);
    
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      });

      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success("Task Completed!", {
          description: "You've earned +50 XP.",
        });
        setSelectedTask(null);
        setExecutionResult(null);
        router.refresh();
      } else {
        toast.error("Failed to complete task");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCompletingId(null);
    }
  };

  if (tasks.length === 0) {
    return <p className="text-white/40">You have completed all your tasks for today!</p>;
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedTask) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedTask]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 relative z-0">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-black/40 border-white/10 backdrop-blur-xl hover:border-indigo-500/50 transition-colors cursor-pointer group relative overflow-hidden"
                onClick={() => { setSelectedTask(task); setExecutionResult(null); }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
                      <Play className="w-4 h-4 text-white/40 group-hover:text-indigo-400 transition-colors ml-1" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-white/90 group-hover:text-white transition-colors">{task.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-[10px] border-white/10 text-white/60">{task.type}</Badge>
                      </div>
                    </div>
                  </div>
                  {task.priority === "HIGH" && (
                    <Badge className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20">
                      High Impact
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/5">
                <div>
                  <Badge variant="outline" className="mb-2 text-indigo-400 border-indigo-500/30 bg-indigo-500/10">{selectedTask.type}</Badge>
                  <h2 className="text-2xl font-bold text-white">{selectedTask.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 relative">
                {!executionResult && !isExecuting && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 relative">
                      <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                      <BrainCircuit className="w-10 h-10 text-indigo-400 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Execute</h3>
                    <p className="text-white/50 max-w-md mb-8">
                      Engage the AI Core to automatically perform this task, generate required materials, or provide a tailored execution strategy based on your Career DNA.
                    </p>
                    <Button 
                      onClick={handleExecute}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] transition-all hover:scale-105"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Engage AI to Execute
                    </Button>
                  </div>
                )}

                {isExecuting && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-indigo-400 font-medium animate-pulse">AI Core is processing and executing task...</p>
                  </div>
                )}

                {executionResult && (
                  <div className="prose prose-invert prose-indigo max-w-none pb-8 text-white/80 marker:text-indigo-400 prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                    <ReactMarkdown>{executionResult}</ReactMarkdown>
                  </div>
                )}
              </div>

              {executionResult && (
                <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end backdrop-blur-md">
                  <Button 
                    onClick={() => handleComplete(selectedTask.id)}
                    disabled={completingId === selectedTask.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_25px_rgba(5,150,105,0.5)] transition-all"
                  >
                    {completingId === selectedTask.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Complete
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
