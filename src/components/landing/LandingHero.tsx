"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, BrainCircuit, Target, Video, Network, Cpu, Code, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const FloatingIcon = ({ Icon, className, delay, duration }: any) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{ 
      y: [-20, 20, -20],
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: duration || 5, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay || 0
    }}
    className={`absolute hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl ${className}`}
  >
    <Icon className="w-8 h-8 text-white/50" />
  </motion.div>
);

export default function LandingHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, filter: "blur(15px)", scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <div ref={containerRef} className="relative min-h-[120vh] flex flex-col items-center pt-32 overflow-hidden w-full perspective-1000">
      
      {/* INSANE BACKGROUND MULTI-LAYER BLOBS */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[150px] mix-blend-screen animate-pulse" />
        <motion.div animate={{ rotate: 360, scale: [1, 1.5, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[150px] mix-blend-screen" />
        <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] -right-[10%] w-[800px] h-[800px] bg-pink-600/20 rounded-full blur-[150px] mix-blend-screen" />
      </motion.div>

      {/* Extreme Cyberpunk Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-[size:60px_60px] z-0 opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black_40%,transparent_100%)]" />

      {/* Floating Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none max-w-7xl mx-auto w-full">
        <FloatingIcon Icon={Code} className="top-40 left-10" delay={0} duration={6} />
        <FloatingIcon Icon={Cpu} className="top-80 right-20" delay={1} duration={7} />
        <FloatingIcon Icon={BrainCircuit} className="top-[30rem] left-32" delay={2} duration={5} />
        <FloatingIcon Icon={Rocket} className="top-[25rem] right-32" delay={1.5} duration={8} />
      </div>

      {/* HERO CONTENT */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex flex-col items-center justify-center px-6 text-center max-w-6xl mx-auto w-full pt-10"
      >
        {/* Title has been moved up since the badge is removed */}

        <motion.h1
          variants={itemVariants}
          className="text-7xl md:text-[8rem] font-black tracking-tighter max-w-5xl mx-auto leading-[0.9] mb-8 relative"
        >
          <span className="block text-white/90 drop-shadow-2xl">Skip the line.</span>
          <span className="block mt-2 relative">
            <span className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-30 animate-pulse" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Get Hired.
            </span>
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-2xl md:text-3xl text-white/50 max-w-3xl mx-auto font-light leading-relaxed mb-16 drop-shadow-lg">
          The only <strong className="text-white">AI-native</strong> career operating system designed to hack the hiring process and put you in the top 1%.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8 w-full sm:w-auto z-30">
          <Link href="/sign-up" className="w-full sm:w-auto scale-100 hover:scale-105 transition-transform duration-300">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <Button size="lg" className="relative w-full sm:w-auto h-20 px-12 rounded-2xl bg-black text-white text-xl font-black border-2 border-white/10 hover:bg-black/80 hover:border-white/30 transition-all overflow-hidden flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <span className="relative z-10 flex items-center tracking-wide uppercase">
                  Engage AutoPilot
                  <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-3 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1s_infinite]" />
              </Button>
            </div>
          </Link>
        </motion.div>

        {/* 3D Feature Grid */}
        <motion.div 
          variants={containerVariants}
          className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full text-left"
        >
          {[
            { icon: Network, title: "Neural DB", desc: "Your skills map evolves in real-time.", color: "text-indigo-400", border: "hover:border-indigo-500" },
            { icon: Video, title: "Deep-Fake Panel", desc: "Stress test against merciless AI interviewers.", color: "text-purple-400", border: "hover:border-purple-500" },
            { icon: Target, title: "Ruthless execution", desc: "Automated tasks push you forward daily.", color: "text-pink-400", border: "hover:border-pink-500" },
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -15, scale: 1.05, rotateX: 10, rotateY: -10 }}
              className={`p-10 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl transition-all duration-300 ${feature.border} group relative overflow-hidden shadow-2xl`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-current rounded-bl-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${feature.color}`} />
              <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 transform translate-z-10`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-white drop-shadow-md tracking-tight transform translate-z-10">{feature.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed font-medium transform translate-z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.main>
    </div>
  );
}
