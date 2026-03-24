import { subDays } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";
import { getUserOrRedirect } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatSession, ExpenseRecord, GoalRecord, IncomeRecord, InvestmentRecord, ProfileData, WishlistRecord } from "@/lib/types";

export async function getProfileData(): Promise<ProfileData> {
  const user = await getUserOrRedirect();

  return {
    email: user.email ?? "",
    displayName: (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "User",
    avatarUrl: (user.user_metadata?.avatar_url as string) || "",
  };
}

export async function getDashboardData() {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();

  const [incomeResult, expenseResult, goalResult, investmentResult] = await Promise.all([
    supabase.from("income").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("investments").select("*").eq("user_id", user.id).order("purchase_date", { ascending: false }),
  ]);

  return {
    income: (incomeResult.data ?? []) as IncomeRecord[],
    expenses: (expenseResult.data ?? []) as ExpenseRecord[],
    goals: (goalResult.data ?? []) as GoalRecord[],
    investments: (investmentResult.data ?? []) as InvestmentRecord[],
  };
}

export async function getIncomeRecords() {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();
  const { data } = await supabase.from("income").select("*").eq("user_id", user.id).order("date", { ascending: false });
  return (data ?? []) as IncomeRecord[];
}

export async function getExpenseRecords() {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();
  const { data } = await supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false });
  return (data ?? []) as ExpenseRecord[];
}

export async function getGoalRecords() {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();
  const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (data ?? []) as GoalRecord[];
}

export async function getWishlistRecords() {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();
  const { data } = await supabase.from("wishlist_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (data ?? []) as WishlistRecord[];
}

export async function getInvestmentRecords() {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();
  const { data } = await supabase.from("investments").select("*").eq("user_id", user.id).order("purchase_date", { ascending: false });
  return (data ?? []) as InvestmentRecord[];
}

export async function getAiData(selectedSessionId?: string | null) {
  noStore();
  const user = await getUserOrRedirect();
  const supabase = createClient();

  const { data: sessionsData } = await supabase
    .from("ai_chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const sessions = (sessionsData ?? []) as ChatSession[];
  const activeSessionId = selectedSessionId || sessions[0]?.id || null;

  if (!activeSessionId) {
    return { sessions, messages: [] as ChatMessage[], activeSessionId: null };
  }

  const ownedSession = sessions.find((session) => session.id === activeSessionId);
  if (!ownedSession) {
    return { sessions, messages: [] as ChatMessage[], activeSessionId: null };
  }

  const { data: messagesData } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("session_id", activeSessionId)
    .order("created_at", { ascending: true });

  return {
    sessions,
    messages: (messagesData ?? []) as ChatMessage[],
    activeSessionId,
  };
}

export async function getFinancialContextSummary(userId: string) {
  const supabase = createClient();
  const since = subDays(new Date(), 30).toISOString();

  const [incomeResult, expenseResult, goalResult, wishlistResult, investmentsResult] = await Promise.all([
    supabase.from("income").select("title, amount, category, date").eq("user_id", userId).gte("date", since.slice(0, 10)).order("date", { ascending: false }),
    supabase.from("expenses").select("title, amount, category, date").eq("user_id", userId).gte("date", since.slice(0, 10)).order("date", { ascending: false }),
    supabase.from("goals").select("title, target_amount, saved_amount, deadline, status").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("wishlist_items").select("title, price, item_type").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("investments").select("asset_name, asset_type, quantity, buy_price, current_price").eq("user_id", userId).order("purchase_date", { ascending: false }),
  ]);

  return {
    income: incomeResult.data ?? [],
    expenses: expenseResult.data ?? [],
    goals: goalResult.data ?? [],
    wishlist: wishlistResult.data ?? [],
    investments: investmentsResult.data ?? [],
  };
}
