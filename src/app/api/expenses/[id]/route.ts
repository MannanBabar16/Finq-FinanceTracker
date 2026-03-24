import { NextResponse } from "next/server";
import { expenseSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = expenseSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error: updateError } = await supabase
    .from("expenses")
    .update({ ...parsed.data, note: parsed.data.note || null })
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

  const { error: deleteError } = await supabase.from("expenses").delete().eq("id", params.id).eq("user_id", user.id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}