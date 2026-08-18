import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AIInsightService } from "@/lib/services/analytics/ai-insight-service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const question: string = body.question;
    const messages: {role: "user"|"assistant", content: string}[] = body.messages || [];

    if (!question && messages.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const chatMessages = messages.length > 0 ? messages : [{ role: "user" as const, content: question }];

    const responseText = await AIInsightService.askProgressQuestion(user.id, chatMessages);

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to chat" }, { status: 500 });
  }
}
