"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

import { locations, universitiesByLocation } from "@/lib/universities";

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States to track if "Other" is selected
  const [isOtherLocation, setIsOtherLocation] = useState(false);
  const [isOtherCollege, setIsOtherCollege] = useState(false);

  const [formData, setFormData] = useState({
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    location: "",
    careerGoal: "",
    experienceLevel: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (val: string | null) => {
    const value = val || "";
    if (value === "Other") {
      setIsOtherLocation(true);
      updateForm("location", "");
      // Reset college when location changes
      setIsOtherCollege(false);
      updateForm("college", "");
    } else {
      setIsOtherLocation(false);
      updateForm("location", value);
      setIsOtherCollege(false);
      updateForm("college", "");
    }
  };

  const handleCollegeChange = (val: string | null) => {
    const value = val || "";
    if (value === "Other") {
      setIsOtherCollege(true);
      updateForm("college", "");
    } else {
      setIsOtherCollege(false);
      updateForm("college", value);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/onboarding', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }) 
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Failed to submit onboarding", error);
      setIsSubmitting(false);
    }
  };

  const slideVariants: any = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
  };

  // Get available colleges based on currently selected location (or "Other" if none matches)
  const availableColleges = (!isOtherLocation && formData.location && universitiesByLocation[formData.location]) 
    ? universitiesByLocation[formData.location] 
    : (universitiesByLocation["Other"] || []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="w-full bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <CardHeader className="relative z-10 border-b border-white/5 pb-6">
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2 px-1">
              <span>Step {step} of {totalSteps}</span>
              <span className="text-indigo-400">{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {step === 1 && <><Sparkles className="w-6 h-6 text-indigo-400" /> Personal Information</>}
            {step === 2 && <><Sparkles className="w-6 h-6 text-purple-400" /> Career Goals</>}
            {step === 3 && <><Sparkles className="w-6 h-6 text-pink-400" /> Professional Profiles</>}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 pt-6 min-h-[380px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-white/80">Location</Label>
                    <Select 
                      value={isOtherLocation ? "Other" : formData.location} 
                      onValueChange={handleLocationChange}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 focus:ring-indigo-500 h-11 text-base">
                        <SelectValue placeholder="Select Country/Region" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl !w-max max-w-[90vw]">
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOtherLocation && (
                      <Input 
                        placeholder="Type your location..." 
                        className="bg-white/5 border-white/10 focus-visible:ring-indigo-500 h-11 mt-2" 
                        value={formData.location} 
                        onChange={(e) => updateForm("location", e.target.value)} 
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/80">College / University</Label>
                    <Select 
                      value={isOtherCollege ? "Other" : formData.college} 
                      onValueChange={handleCollegeChange}
                      disabled={!formData.location && !isOtherLocation}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 focus:ring-indigo-500 h-11 text-base">
                        <SelectValue placeholder={formData.location || isOtherLocation ? "Select college" : "Select location first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl !w-max max-w-[90vw]">
                        {availableColleges.map((col) => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOtherCollege && (
                      <Input 
                        placeholder="Type your college name..." 
                        className="bg-white/5 border-white/10 focus-visible:ring-indigo-500 h-11 mt-2" 
                        value={formData.college} 
                        onChange={(e) => updateForm("college", e.target.value)} 
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-white/80">Degree</Label>
                    <Select value={formData.degree} onValueChange={(val) => updateForm("degree", val || "")}>
                      <SelectTrigger className="bg-white/5 border-white/10 focus:ring-indigo-500 h-11 text-base">
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl !w-max max-w-[90vw]">
                        <SelectItem value="B.Tech">B.Tech (Bachelor of Technology)</SelectItem>
                        <SelectItem value="B.E.">B.E. (Bachelor of Engineering)</SelectItem>
                        <SelectItem value="B.S.">B.S. (Bachelor of Science)</SelectItem>
                        <SelectItem value="B.A.">B.A. (Bachelor of Arts)</SelectItem>
                        <SelectItem value="BCA">BCA (Bachelor of Computer Applications)</SelectItem>
                        <SelectItem value="BBA">BBA (Bachelor of Business Administration)</SelectItem>
                        <SelectItem value="B.Com">B.Com (Bachelor of Commerce)</SelectItem>
                        <SelectItem value="M.Tech">M.Tech (Master of Technology)</SelectItem>
                        <SelectItem value="M.S.">M.S. (Master of Science)</SelectItem>
                        <SelectItem value="MCA">MCA (Master of Computer Applications)</SelectItem>
                        <SelectItem value="M.A.">M.A. (Master of Arts)</SelectItem>
                        <SelectItem value="MBA">MBA (Master of Business Administration)</SelectItem>
                        <SelectItem value="Ph.D.">Ph.D. (Doctorate)</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Associate">Associate Degree</SelectItem>
                        <SelectItem value="High School">High School Diploma</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="branch" className="text-white/80">Major / Branch</Label>
                    <Input id="branch" placeholder="e.g., Computer Science" className="bg-white/5 border-white/10 focus-visible:ring-indigo-500 h-11" value={formData.branch} onChange={(e) => updateForm("branch", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-white/80">Graduation Year</Label>
                    <Select value={formData.graduationYear} onValueChange={(val) => updateForm("graduationYear", val || "")}>
                      <SelectTrigger className="bg-white/5 border-white/10 focus:ring-indigo-500 h-11 text-base">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl !w-max max-w-[90vw]">
                        {[...Array(10)].map((_, i) => {
                          const year = (new Date().getFullYear() + 4 - i).toString();
                          return <SelectItem key={year} value={year}>{year}</SelectItem>
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="cgpa" className="text-white/80">CGPA</Label>
                    <Input id="cgpa" placeholder="e.g., 3.8" className="bg-white/5 border-white/10 focus-visible:ring-indigo-500 h-11" value={formData.cgpa} onChange={(e) => updateForm("cgpa", e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-white/80 text-base">What is your primary career goal?</Label>
                  <Select value={formData.careerGoal} onValueChange={(val) => updateForm("careerGoal", val || "")}>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:ring-purple-500 h-12 text-base">
                      <SelectValue placeholder="Select your target role" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl !w-max max-w-[90vw]">
                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                      <SelectItem value="AI Engineer">AI Engineer</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                      <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                      <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-white/80 text-base">What is your current experience level?</Label>
                  <Select value={formData.experienceLevel} onValueChange={(val) => updateForm("experienceLevel", val || "")}>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:ring-purple-500 h-12 text-base">
                      <SelectValue placeholder="Select your current level" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl !w-max max-w-[90vw]">
                      <SelectItem value="Beginner">Beginner (Student / No Experience)</SelectItem>
                      <SelectItem value="Intermediate">Intermediate (1-3 years / Internships)</SelectItem>
                      <SelectItem value="Advanced">Advanced (3+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="linkedin" className="text-white/80">LinkedIn URL</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/in/username" className="bg-white/5 border-white/10 focus-visible:ring-pink-500 h-11" value={formData.linkedin} onChange={(e) => updateForm("linkedin", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="github" className="text-white/80">GitHub URL</Label>
                  <Input id="github" placeholder="https://github.com/username" className="bg-white/5 border-white/10 focus-visible:ring-pink-500 h-11" value={formData.github} onChange={(e) => updateForm("github", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="portfolio" className="text-white/80">Portfolio / Personal Site URL (Optional)</Label>
                  <Input id="portfolio" placeholder="https://yourwebsite.com" className="bg-white/5 border-white/10 focus-visible:ring-pink-500 h-11" value={formData.portfolio} onChange={(e) => updateForm("portfolio", e.target.value)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="relative z-10 flex justify-between border-t border-white/5 pt-6 pb-6 bg-black/20">
          <Button variant="ghost" className="hover:bg-white/10 hover:text-white" onClick={prevStep} disabled={step === 1 || isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={nextStep} className="bg-white text-black hover:bg-white/90 font-medium px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submitForm} disabled={isSubmitting} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium px-8 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
              {isSubmitting ? "Generating AI Profile..." : "Complete Profile"} <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
