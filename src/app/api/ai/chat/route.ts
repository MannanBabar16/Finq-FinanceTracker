import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getFinancialContextSummary } from "@/lib/data";
import { getAuthenticatedUser } from "@/lib/route-utils";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const { sessionId, message } = await request.json();
  const trimmed = String(message || "").trim();
  if (!trimmed) return NextResponse.json({ error: "Message is required." }, { status: 400 });
  if (!genAI) return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 });

  const title = trimmed.slice(0, 40);
  let activeSessionId = sessionId as string | null;

  if (!activeSessionId) {
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 400 });
    activeSessionId = session.id;
  }

  const { data: ownedSession } = await supabase
    .from("ai_chat_sessions")
    .select("id, title")
    .eq("id", activeSessionId)
    .eq("user_id", user.id)
    .single();

  if (!ownedSession) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  const { error: userInsertError } = await supabase
    .from("ai_chat_messages")
    .insert({ session_id: activeSessionId, role: "user", content: trimmed });
  if (userInsertError) return NextResponse.json({ error: userInsertError.message }, { status: 400 });

  try {
    const financialContext = await getFinancialContextSummary(user.id);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `You are a personal finance assistant. Here is the user's financial data: ${JSON.stringify(financialContext)}. Answer questions, give insights, suggest savings, and help the user reach their goals.\n\nUser question: ${trimmed}`;
    const stream = await model.generateContentStream(prompt);

    let fullText = "";
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            fullText += text;
            controller.enqueue(encoder.encode(text));
          }

          if (fullText.trim()) {
            await supabase.from("ai_chat_messages").insert({
              session_id: activeSessionId,
              role: "assistant",
              content: fullText,
            });
          }

          controller.close();
        } catch {
          controller.enqueue(encoder.encode("Unable to generate a response right now."));
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "x-session-id": activeSessionId ?? "",
        "x-session-title": ownedSession.title || title,
      },
    });
  } catch (chatError) {
    const message = chatError instanceof Error ? chatError.message : "Unable to contact Gemini.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
