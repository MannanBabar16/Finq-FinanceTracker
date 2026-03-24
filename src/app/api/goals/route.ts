import { NextResponse } from "next/server";
import { goalSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function POST(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = goalSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    deadline: parsed.data.deadline || null,
    user_id: user.id,
    status: Number(parsed.data.saved_amount) >= Number(parsed.data.target_amount) ? "completed" : "active",
  };
  const { data, error: insertError } = await supabase.from("goals").insert(payload).select().single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ record: data });
}
