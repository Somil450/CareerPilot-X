"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { BrainCircuit, Star, Target, Zap } from "lucide-react";

export default function MemoryTimelineClient({ memories }: { memories: any[] }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SKILL_PROGRESS": return <Star className="w-5 h-5 text-yellow-400" />;
      case "INTERVIEW_FEEDBACK": return <BrainCircuit className="w-5 h-5 text-pink-400" />;
      case "GENERAL_OBSERVATION": return <Target className="w-5 h-5 text-indigo-400" />;
      default: return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SKILL_PROGRESS": return "border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]";
      case "INTERVIEW_FEEDBACK": return "border-pink-500/30 bg-pink-500/10 shadow-[0_0_15px_rgba(244,114,182,0.2)]";
      case "GENERAL_OBSERVATION": return "border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
      default: return "border-blue-500/30 bg-blue-500/10";
    }
  };

  return (
    <div className="relative border-l-2 border-white/10 ml-6 pl-8 space-y-12 pb-12">
      {memories.length === 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <p className="text-white/60 font-light text-lg">
            No memories yet. Upload a resume or complete an interview to start generating AI insights.
          </p>
        </div>
      )}
      {memories.map((memory, idx) => (
        <motion.div 
          key={memory.id}
          initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
          className="relative"
        >
          {/* Glowing node on the timeline */}
          <div className={`absolute -left-[45px] w-10 h-10 rounded-full border-2 flex items-center justify-center ${getCategoryColor(memory.category)} z-10`}>
            {getCategoryIcon(memory.category)}
          </div>
          
          {/* Connecting line glow */}
          {idx !== memories.length - 1 && (
            <div className="absolute -left-[26px] top-10 w-[2px] h-[calc(100%+3rem)] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          )}

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-white/30 transition-colors">
            {/* Cyberpunk grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold tracking-widest uppercase text-white/50 bg-white/5 px-3 py-1 rounded-full">
                  {memory.category.replace("_", " ")}
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-lg text-white/90 leading-relaxed font-light">
                "{memory.content}"
              </p>
              
              <div className="mt-4 flex items-center">
                <span className="text-xs text-white/40 mr-2 uppercase tracking-widest">Importance Weight:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-1 rounded-full ${i < memory.importance ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
