import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // TODO: Check if user already has a CareerDNA entry in db.
  // If yes, redirect to dashboard.

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
      <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
      
      <div className="w-full max-w-3xl space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CareerPilot X</span>
          </h2>
          <p className="mt-3 text-base text-white/60 font-medium">
            Let&apos;s build your AI Career DNA to hyper-personalize your journey.
          </p>
        </div>
        
        <OnboardingForm userId={user.id} />
      </div>
    </div>
  );
}
