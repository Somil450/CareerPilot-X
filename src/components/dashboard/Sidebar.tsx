"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { LayoutDashboard, Compass, Briefcase, Video, Target, Award, Sparkles, BrainCircuit, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Memory", href: "/dashboard/memory", icon: BrainCircuit },
  { name: "Career DNA", href: "/dashboard/dna", icon: Target },
  { name: "Resume Copilot", href: "/dashboard/resume", icon: Sparkles },
  { name: "Opportunities", href: "/dashboard/opportunities", icon: Compass },
  { name: "Mock Interviews", href: "/dashboard/interviews", icon: Video },
  { name: "Achievements", href: "/dashboard/achievements", icon: Award },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl hidden md:flex flex-col relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="p-6 flex items-center space-x-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">CareerPilot</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-white")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-white/5 p-4 relative z-10 bg-black/20 flex flex-col space-y-2">
        <div className="flex items-center space-x-3 p-2 rounded-xl border border-transparent hover:border-white/10 transition-colors">
          <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border border-white/20" } }} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white/90">My Account</span>
            <span className="text-xs text-white/50">Manage settings</span>
          </div>
        </div>
        
        <SignOutButton>
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
