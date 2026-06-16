"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GenerateTasksClient() {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    const toastId = toast.loading("Engaging AI Core to generate action matrix...");
    
    try {
      const res = await fetch("/api/tasks/generate", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }
      
      toast.success("Action Matrix generated successfully!", { id: toastId });
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: toastId });
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-white/10 border-dashed rounded-2xl bg-white/5 backdrop-blur-sm text-center">
      <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
        <Zap className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Active Tasks</h3>
      <p className="text-white/50 mb-6 max-w-md">
        Your action matrix is currently empty. Engage the AI Core to generate a personalized, hyper-accelerated task list based on your Career DNA.
      </p>
      
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Matrix...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate AI Action Plan
          </>
        )}
      </Button>
    </div>
  );
}
