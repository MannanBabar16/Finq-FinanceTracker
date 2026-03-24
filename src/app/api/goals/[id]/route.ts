import { NextResponse } from "next/server";
import { goalSchema, goalStatusSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/route-utils";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const body = await request.json();
  const parsed = body.title ? goalSchema.partial().safeParse(body) : goalStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updateData: Record<string, unknown> = { ...parsed.data };
  if ("deadline" in parsed.data) updateData.deadline = parsed.data.deadline || null;
  if ("target_amount" in parsed.data || "saved_amount" in parsed.data) {
    const target = Number((parsed.data as { target_amount?: number }).target_amount ?? 0);
    const saved = Number((parsed.data as { saved_amount?: number }).saved_amount ?? 0);
    if (!updateData.status) {
      updateData.status = target > 0 && saved >= target ? "completed" : "active";
    }
  }

  const { data, error: updateError } = await supabase
    .from("goals")
    .update(updateData)
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

  const { error: deleteError } = await supabase.from("goals").delete().eq("id", params.id).eq("user_id", user.id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}