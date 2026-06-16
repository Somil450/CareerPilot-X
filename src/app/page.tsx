import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingHero from "@/components/landing/LandingHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is already logged in, send them straight to the dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden text-white">
      {/* Navigation */}
      <nav className="w-full border-b border-white/5 bg-black/50 backdrop-blur-md z-50 fixed top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">
              X
            </div>
            <span className="font-bold text-xl tracking-tight">CareerPilot</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-white text-black hover:bg-white/90 font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <LandingHero />
    </div>
  );
}
