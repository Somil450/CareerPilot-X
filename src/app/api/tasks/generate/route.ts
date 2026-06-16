import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI Core Offline: GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { careerDNA: true }
    });

    if (!dbUser || !dbUser.careerDNA) {
      return NextResponse.json({ error: "Career DNA not found. Please complete onboarding." }, { status: 400 });
    }

    const dna = dbUser.careerDNA;
    let skillsString = "None";
    try {
      if (dna.skills) {
        const parsed = JSON.parse(dna.skills);
        skillsString = Array.isArray(parsed) ? parsed.join(", ") : dna.skills;
      }
    } catch(e) {
      skillsString = dna.skills || "None";
    }

    const prompt = `
You are CareerPilot, an elite AI career strategist. 
The user has the following Career DNA:
- Target Role: ${dna.careerGoal}
- Experience Level: ${dna.experienceLevel}
- Current Skills: ${skillsString}

Your task is to generate 3 highly specific, actionable tasks for the user to complete today to advance their career. 
The tasks should be practical and focused.

Respond ONLY with a JSON object in this exact format:
{
  "tasks": [
    {
      "title": "Specific, actionable task description",
      "type": "LEARN",
      "priority": "HIGH"
    }
  ]
}
Type MUST be one of: "LEARN", "PRACTICE", "APPLY", "IMPROVE".
Priority MUST be one of: "HIGH", "MEDIUM", "LOW".
Make the tasks sound like they are coming from an elite mentor (sharp, precise, high-impact).
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiText = response.text || "";
    // Extract JSON from potential markdown blocks
    const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiText;
    
    let generatedTasks: { title: string, type: string, priority: string }[];
    try {
      const parsed = JSON.parse(jsonString);
      generatedTasks = parsed.tasks || [];
    } catch (e) {
      console.error("Failed to parse AI task response:", jsonString);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Save tasks to the database
    const taskPromises = generatedTasks.slice(0, 3).map(task => {
      return prisma.autopilotTask.create({
        data: {
          userId: dbUser.id,
          title: task.title,
          type: task.type || "IMPROVE",
          priority: task.priority || "MEDIUM",
          status: "TODO"
        }
      });
    });

    await Promise.all(taskPromises);

    return NextResponse.json({ success: true, count: generatedTasks.length });

  } catch (error) {
    console.error("[TASKS_GENERATE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
