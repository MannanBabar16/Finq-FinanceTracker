import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getUserOrRedirect() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return user;
}
