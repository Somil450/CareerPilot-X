import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        careerDNA: true,
        opportunities: {
          orderBy: { matchScore: "desc" }
        }
      }
    });

    if (!dbUser || !dbUser.careerDNA) {
      return NextResponse.json({ success: false, error: "User or Career DNA not found" }, { status: 404 });
    }

    // If we have opportunities, return them
    if (dbUser.opportunities.length > 0) {
      return NextResponse.json({ success: true, data: dbUser.opportunities });
    }

    // Otherwise, generate REAL opportunities from Arbeitnow API
    try {
      const response = await fetch("https://www.arbeitnow.com/api/job-board-api");
      if (!response.ok) {
        throw new Error("Failed to fetch real jobs");
      }
      
      const data = await response.json();
      const realJobs = data.data.slice(0, 5); // Take top 5 latest jobs
      const baseScore = dbUser.careerDNA.readinessScore;

      const realOpportunities = realJobs.map((job: any) => ({
        userId,
        title: job.title.substring(0, 255), // DB constraint
        company: job.company_name.substring(0, 255),
        type: "JOB", // Arbeitnow is mostly remote jobs
        url: job.url,
        // Calculate a realistic but fake match score based on base readiness
        matchScore: Math.min(99, Math.max(30, baseScore + Math.floor(Math.random() * 20))),
        status: "DISCOVERED"
      }));

      await prisma.opportunity.createMany({ data: realOpportunities });

    } catch (apiError) {
      console.error("External Job API Error:", apiError);
      return NextResponse.json({ success: false, error: "Failed to fetch real opportunities. Please try again later." }, { status: 500 });
    }

    const newOpportunities = await prisma.opportunity.findMany({
      where: { userId },
      orderBy: { matchScore: "desc" }
    });

    return NextResponse.json({ success: true, data: newOpportunities });
  } catch (error: any) {
    console.error("Opportunities API error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { opportunityId, status } = body;

    if (!opportunityId || !status) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
