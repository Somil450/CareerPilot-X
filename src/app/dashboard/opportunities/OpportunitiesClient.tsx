"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, BookmarkPlus, CheckCircle2, BookmarkCheck, Briefcase, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OpportunitiesClient({ userId }: { userId: string }) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, [userId]);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`/api/opportunities?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, status: newStatus } : opp));
      
      await fetch("/api/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: id, status: newStatus })
      });
    } catch (error) {
      console.error(error);
      // Revert on error (not implemented here for brevity)
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
        <p>Scanning global networks for matches...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnimatePresence>
        {opportunities.map((opp, index) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-all flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="pb-2 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`
                    ${opp.type === 'JOB' ? 'border-blue-500/30 text-blue-300' : ''}
                    ${opp.type === 'INTERNSHIP' ? 'border-green-500/30 text-green-300' : ''}
                    ${opp.type === 'HACKATHON' ? 'border-purple-500/30 text-purple-300' : ''}
                  `}>
                    {opp.type}
                  </Badge>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-green-400">{opp.matchScore}%</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Match</span>
                  </div>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-indigo-300 transition-colors">
                  {opp.title}
                </CardTitle>
                <div className="flex items-center text-white/60 mt-2 text-sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  {opp.company}
                </div>
              </CardHeader>
              
              <CardFooter className="pt-4 border-t border-white/5 flex gap-2">
                {opp.status === "SAVED" ? (
                  <Button 
                    variant="secondary" 
                    className="flex-1 bg-white/10 text-white hover:bg-white/5"
                    onClick={() => updateStatus(opp.id, "DISCOVERED")}
                  >
                    <BookmarkCheck className="w-4 h-4 mr-2 text-indigo-400" /> Saved
                  </Button>
                ) : opp.status === "APPLIED" ? (
                  <Button 
                    variant="secondary" 
                    className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                    disabled
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Applied
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="flex-1 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    onClick={() => updateStatus(opp.id, "SAVED")}
                  >
                    <BookmarkPlus className="w-4 h-4 mr-2" /> Save
                  </Button>
                )}
                
                <Button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    updateStatus(opp.id, "APPLIED");
                    window.open(opp.url, "_blank");
                  }}
                  disabled={opp.status === "APPLIED"}
                >
                  <Briefcase className="w-4 h-4 mr-2" /> Apply
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
