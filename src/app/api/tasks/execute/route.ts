import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI Core Offline: GEMINI_API_KEY is missing." }, { status: 500 });
    }

    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { 
        careerDNA: true,
        autopilotTasks: {
          where: { id: taskId }
        }
      }
    });

    if (!dbUser || !dbUser.careerDNA || dbUser.autopilotTasks.length === 0) {
      return NextResponse.json({ error: "Task or Career DNA not found" }, { status: 404 });
    }

    const task = dbUser.autopilotTasks[0];
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
You are CareerPilot, an elite AI career strategist and assistant.
The user wants you to EXECUTE the following task for them right now.

Task Title: "${task.title}"
Task Type: "${task.type}"
Task Priority: "${task.priority}"

User's Career DNA Context:
- Target Role: ${dna.careerGoal}
- Experience Level: ${dna.experienceLevel}
- Current Skills: ${skillsString}

Your job is to actually DO the work or provide the specific material needed to complete this task.
- If the task is to "write" something (like a LinkedIn summary or cold email), write the actual text they can copy-paste.
- If the task is to "learn" something, provide a highly condensed, practical 3-minute tutorial.
- If the task is to "practice" something, give them a practical exercise and the solution.
- If the task is to "apply", provide a strategy or template.

Format your response in beautiful Markdown. Use headings, bullet points, and code blocks where appropriate. Do not output JSON. Just output the raw markdown content.
Make it actionable, elite, and highly personalized.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ 
      success: true, 
      content: response.text || "Failed to generate execution content."
    });

  } catch (error) {
    console.error("[TASKS_EXECUTE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
