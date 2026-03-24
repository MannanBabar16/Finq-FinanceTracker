import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";
import { wishlistSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = wishlistSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error: insertError } = await supabase
    .from("wishlist_items")
    .insert({ ...parsed.data, note: parsed.data.note || null, user_id: user.id })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  return NextResponse.json({ record: data });
}
