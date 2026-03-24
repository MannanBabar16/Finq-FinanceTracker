import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function DELETE() {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  await supabase.from("ai_chat_messages").delete().in(
    "session_id",
    (await supabase.from("ai_chat_sessions").select("id").eq("user_id", user.id)).data?.map((item) => item.id) || [],
  );
  await supabase.from("ai_chat_sessions").delete().eq("user_id", user.id);
  await supabase.from("income").delete().eq("user_id", user.id);
  await supabase.from("expenses").delete().eq("user_id", user.id);
  await supabase.from("goals").delete().eq("user_id", user.id);
  await supabase.from("wishlist_items").delete().eq("user_id", user.id);
  await supabase.from("investments").delete().eq("user_id", user.id);

  return NextResponse.json({ message: "All stored Finq data has been deleted." });
}
