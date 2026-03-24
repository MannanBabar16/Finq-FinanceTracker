import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";
import { investmentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = investmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error: insertError } = await supabase
    .from("investments")
    .insert({
      ...parsed.data,
      current_price: parsed.data.current_price,
      platform: parsed.data.platform || null,
      note: parsed.data.note || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  return NextResponse.json({ record: data });
}
