import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";
import { investmentSchema } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = investmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error: updateError } = await supabase
    .from("investments")
    .update({
      ...parsed.data,
      current_price: parsed.data.current_price,
      platform: parsed.data.platform || null,
      note: parsed.data.note || null,
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ record: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const { error: deleteError } = await supabase.from("investments").delete().eq("id", params.id).eq("user_id", user.id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}