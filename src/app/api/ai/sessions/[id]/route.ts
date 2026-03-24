import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const { data: session } = await supabase.from("ai_chat_sessions").select("id").eq("id", params.id).eq("user_id", user.id).single();
  if (!session) return NextResponse.json({ messages: [] });

  const { data: messages } = await supabase.from("ai_chat_messages").select("*").eq("session_id", params.id).order("created_at", { ascending: true });
  return NextResponse.json({ messages: messages || [] });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const { data: session } = await supabase.from("ai_chat_sessions").select("id").eq("id", params.id).eq("user_id", user.id).single();
  if (!session) return NextResponse.json({ ok: true });

  await supabase.from("ai_chat_messages").delete().eq("session_id", params.id);
  await supabase.from("ai_chat_sessions").delete().eq("id", params.id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}