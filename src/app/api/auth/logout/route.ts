import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function POST() {
  const { supabase } = await getAuthenticatedUser();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
