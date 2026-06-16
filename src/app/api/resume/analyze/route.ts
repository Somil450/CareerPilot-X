import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
const pdfParse = require("pdf-parse");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const file = formData.get("file") as File;

    if (!userId || !file) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { careerDNA: true }
    });

    if (!dbUser || !dbUser.careerDNA) {
      return NextResponse.json({ success: false, error: "Career DNA not found" }, { status: 404 });
    }

    const { careerGoal, experienceLevel } = dbUser.careerDNA;
    const textLower = text.toLowerCase();

    let atsScore = 50;
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let missingKeywords: string[] = [];
    let generalFeedback = "";

    // REAL AI INTEGRATION ONLY
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "AI Core Offline: GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert ATS (Applicant Tracking System) for a candidate aiming to be a ${careerGoal}.
      Analyze this resume text: "${text.substring(0, 3000)}"
      Return a JSON object ONLY with the following exact keys:
      - atsScore (number 0-100)
      - strengths (array of strings, up to 3)
      - weaknesses (array of strings, up to 3)
      - missingKeywords (array of strings, up to 3)
      - generalFeedback (string, a paragraph of overall feedback)
      Do not use markdown formatting around the JSON.`;

      const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const aiText = aiResponse.text || "{}";
      const cleanedText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      atsScore = parsed.atsScore || 50;
      strengths = parsed.strengths || ["Attempted parsing"];
      weaknesses = parsed.weaknesses || ["Could not fully parse"];
      missingKeywords = parsed.missingKeywords || ["Specific skills"];
      generalFeedback = parsed.generalFeedback || "Resume analyzed.";
    } catch (err) {
      console.error("Gemini API Error:", err);
      return NextResponse.json({ success: false, error: "AI Processing Failed. Ensure your GEMINI_API_KEY is valid." }, { status: 500 });
    }

    const feedback = {
      generalFeedback,
      strengths: strengths.length > 0 ? strengths : ["Good formatting structure."],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Could use more quantifiable metrics."],
      missingKeywords: missingKeywords.length > 0 ? missingKeywords : ["System Design"]
    };

    // 2. Save the Resume Version
    const resume = await prisma.resumeVersion.create({
      data: {
        userId,
        fileUrl: "pasted_text_placeholder",
        atsScore,
        feedback: JSON.stringify(feedback)
      }
    });

    // 3. Update the CareerDNA Readiness Score
    await prisma.careerDNA.update({
      where: { id: dbUser.careerDNA.id },
      data: { readinessScore: atsScore }
    });

    // 4. Generate dynamic Autopilot Tasks based on missing keywords
    await prisma.autopilotTask.deleteMany({
      where: { userId, status: "TODO" }
    });

    const tasksToCreate = [
      {
        userId,
        title: `Add Quantifiable Metrics to Resume`,
        description: `Rewrite 3 bullet points to include percentages or absolute numbers.`,
        type: "IMPROVE",
        priority: "HIGH",
        estimatedMinutes: 30
      },
      {
        userId,
        title: `Learn Basics of ${feedback.missingKeywords[0] || 'System Design'}`,
        description: `Your resume is missing this key skill for ${careerGoal}. Spend 45 minutes reading introductory docs.`,
        type: "LEARN",
        priority: "HIGH",
        estimatedMinutes: 45
      },
      {
        userId,
        title: `Update LinkedIn Profile`,
        description: `Ensure your LinkedIn matches your updated resume keywords.`,
        type: "APPLY",
        priority: "MEDIUM",
        estimatedMinutes: 20
      }
    ];

    await prisma.autopilotTask.createMany({ data: tasksToCreate });

    // 5. Add Memory Record
    await prisma.aIMemory.create({
      data: {
        userId,
        category: "SKILL_PROGRESS",
        content: `Resume uploaded. Missing core skills: ${feedback.missingKeywords.join(", ")}. Generated learning tasks.`,
        importance: 4
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        atsScore: resume.atsScore,
        feedback,
        createdAt: resume.createdAt
      } 
    });
  } catch (error: any) {
    console.error("Resume API error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
