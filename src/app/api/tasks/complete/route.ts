import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Missing taskId" }, { status: 400 });
    }

    const task = await prisma.autopilotTask.update({
      where: { id: taskId },
      data: { status: "DONE" }
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error("Task API error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
