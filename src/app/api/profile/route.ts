import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/route-utils";
import { profileSchema, passwordSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      display_name: parsed.data.displayName,
      avatar_url: parsed.data.avatarUrl,
    },
  });

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ message: "Profile updated successfully." });
}

export async function PATCH(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (error || !user) return error;

  const parsed = passwordSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ message: "Password updated successfully." });
}
