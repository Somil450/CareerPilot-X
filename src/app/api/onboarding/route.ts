import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      college, degree, branch, graduationYear, cgpa, location, 
      careerGoal, experienceLevel, linkedin, github, portfolio 
    } = body;

    // Ensure the User exists in our DB
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: body.email || "user@example.com", // You'd typically get this from a webhook or clerk client
      }
    });

    // Create the Career DNA
    const careerDNA = await prisma.careerDNA.upsert({
      where: { userId: user.id },
      update: {
        careerGoal,
        experienceLevel,
        readinessScore: 30, // Initial default score
      },
      create: {
        userId: user.id,
        careerGoal,
        experienceLevel,
        readinessScore: 30,
        skills: JSON.stringify([{ name: "Problem Solving", score: 50 }]),
        strengths: JSON.stringify(["Willingness to learn"]),
        weaknesses: JSON.stringify(["Needs more practical experience"]),
        growthAreas: JSON.stringify(["System Architecture"]),
      }
    });

    // Generate some initial Autopilot Tasks based on their goal
    await prisma.autopilotTask.createMany({
      data: [
        {
          userId: user.id,
          title: `Analyze your ${careerGoal} Resume`,
          type: "IMPROVE",
          priority: "HIGH",
          estimatedMinutes: 15,
        },
        {
          userId: user.id,
          title: `Set up your GitHub Profile`,
          type: "APPLY",
          priority: "MEDIUM",
          estimatedMinutes: 30,
        }
      ]
    });

    return NextResponse.json(careerDNA);
  } catch (error) {
    console.error("[ONBOARDING_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
