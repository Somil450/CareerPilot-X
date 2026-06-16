import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, interviewerRole, userResponse } = body;

    if (!userId || !type || !userResponse) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { careerDNA: true }
    });

    if (!dbUser || !dbUser.careerDNA) {
      return NextResponse.json({ success: false, error: "User or Career DNA not found" }, { status: 404 });
    }

    let technicalScore = 50;
    let communicationScore = 50;
    let overallScore = 50;
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let feedback = "";
    
    // REAL AI INTEGRATION ONLY
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "AI Core Offline: GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert ${interviewerRole} conducting a ${type} interview for a candidate aiming to be a ${dbUser.careerDNA.careerGoal}. 
      Evaluate this response: "${userResponse}"
      Return a JSON object ONLY with the following exact keys:
      - technicalScore (number 0-100)
      - communicationScore (number 0-100)
      - feedback (string, a paragraph of constructive feedback)
      - strengths (array of strings, up to 3)
      - weaknesses (array of strings, up to 3)
      Do not use markdown formatting around the JSON.`;

      const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = aiResponse.text || "{}";
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      technicalScore = parsed.technicalScore || 50;
      communicationScore = parsed.communicationScore || 50;
      feedback = parsed.feedback || "Good attempt.";
      strengths = parsed.strengths || ["Attempted the question"];
      weaknesses = parsed.weaknesses || ["Needs deeper insight"];
      overallScore = Math.round((technicalScore + communicationScore) / 2);

    } catch (err) {
      console.error("Gemini API Error:", err);
      return NextResponse.json({ success: false, error: "AI Processing Failed. Ensure your GEMINI_API_KEY is valid." }, { status: 500 });
    }

    const interviewRecord = await prisma.interviewHistory.create({
      data: {
        userId,
        type,
        interviewerRole: interviewerRole || "TECH_LEAD",
        technicalScore,
        communicationScore,
        overallScore,
        feedback,
        strengths: JSON.stringify(strengths.length > 0 ? strengths : ["Clear pronunciation"]),
        weaknesses: JSON.stringify(weaknesses.length > 0 ? weaknesses : ["Could be more concise"])
      }
    });

    // Update readiness score slightly if they do well
    if (overallScore > 70) {
      await prisma.careerDNA.update({
        where: { id: dbUser.careerDNA.id },
        data: { readinessScore: Math.min(100, dbUser.careerDNA.readinessScore + 2) }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: interviewRecord
    });
  } catch (error: any) {
    console.error("Interview API error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
