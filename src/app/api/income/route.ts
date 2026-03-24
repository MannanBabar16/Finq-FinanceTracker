import { NextResponse } from "next/server";
import { incomeSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function POST(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = incomeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = { ...parsed.data, note: parsed.data.note || null, user_id: user.id };
  const { data, error: insertError } = await supabase.from("income").insert(payload).select().single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ record: data });
}
