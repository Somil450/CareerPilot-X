"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertCircle, FileText, UploadCloud, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeFeedback {
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  generalFeedback: string;
}

interface ResumeData {
  atsScore: number | null;
  feedback: ResumeFeedback | null;
  createdAt: string;
}

export default function ResumeClient({ userId, latestResume }: { userId: string, latestResume: ResumeData | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<ResumeData | null>(latestResume);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("file", selectedFile);

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        let errorMessage = "Server error occurred.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch(e) {
          errorMessage = "Server returned an invalid response (possibly crashed). Please check terminal logs.";
        }
        alert("Failed to analyze: " + errorMessage);
        return;
      }

      const result = await res.json();
      if (result.success) {
        setData(result.data);
        router.refresh(); 
      } else {
        alert("Failed to analyze: " + result.error);
      }
    } catch (error: any) {
      console.error("Analysis failed", error);
      alert("A critical error occurred: " + error?.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Determine color based on ATS Score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Input */}
      <div className="space-y-4">
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Upload Resume (PDF)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />

            {!selectedFile ? (
              <div 
                className={`min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-white/90">Drag & Drop your resume</h3>
                <p className="text-white/50 mt-2 text-center max-w-sm">Supports .PDF files up to 5MB. We'll automatically extract the text and analyze it.</p>
                <Button variant="secondary" className="mt-6 bg-white/10 text-white hover:bg-white/20">
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="min-h-[400px] border border-white/10 rounded-xl bg-white/5 flex flex-col items-center justify-center p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-50" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                    <FileText className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white truncate max-w-xs">{selectedFile.name}</h3>
                  <p className="text-white/60 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  <Button 
                    variant="ghost" 
                    className="mt-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4 mr-2" /> Remove File
                  </Button>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedFile}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Parsing PDF & Analyzing...
                </>
              ) : (
                "Analyze with AI"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Feedback / Results */}
      <div>
        <AnimatePresence mode="wait">
          {!data && !isAnalyzing && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5"
            >
              <Sparkles className="w-12 h-12 text-white/20 mb-4" />
              <h3 className="text-xl font-medium text-white/60">Awaiting Resume</h3>
              <p className="text-white/40 mt-2">Paste your resume on the left to unlock deep AI insights.</p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/20"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin animation-delay-150" />
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium text-indigo-300">AI Copilot is thinking...</h3>
              <p className="text-indigo-400/60 mt-2">Extracting skills, computing ATS score, and generating personalized tasks.</p>
            </motion.div>
          )}

          {data && !isAnalyzing && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* ATS Score Card */}
              <Card className="bg-black/60 border-white/10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <span className={`text-9xl font-black ${getScoreColor(data.atsScore || 0)}`}>
                    {data.atsScore}
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-white/80">AI Readiness Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-6xl font-extrabold tracking-tighter ${getScoreColor(data.atsScore || 0)}`}>
                      {data.atsScore}
                    </span>
                    <span className="text-2xl text-white/40">/ 100</span>
                  </div>
                  <p className="text-white/60 mt-4 leading-relaxed">
                    {data.feedback?.generalFeedback}
                  </p>
                </CardContent>
              </Card>

              {/* Feedback Metrics */}
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center text-green-400">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.feedback?.strengths.map((str, idx) => (
                        <li key={idx} className="text-sm text-white/80 flex items-start">
                          <span className="mr-2 text-green-500/50">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center text-red-400">
                      <XCircle className="w-4 h-4 mr-2" /> Critical Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.feedback?.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-sm text-white/80 flex items-start">
                          <span className="mr-2 text-red-500/50">•</span> {weak}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center text-yellow-400">
                      <AlertCircle className="w-4 h-4 mr-2" /> Missing Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.feedback?.missingKeywords.map((kw, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
