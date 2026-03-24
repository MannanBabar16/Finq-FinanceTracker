export interface IncomeRecord {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  created_at: string;
}

export interface ExpenseRecord {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  created_at: string;
}

export interface GoalRecord {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  status: "active" | "completed" | "cancelled";
  created_at: string;
}

export interface WishlistRecord {
  id: string;
  user_id: string;
  title: string;
  price: number;
  item_type: "want" | "need";
  note: string | null;
  created_at: string;
}

export interface InvestmentRecord {
  id: string;
  user_id: string;
  asset_name: string;
  asset_type: "stock" | "crypto" | "gold" | "fund" | "real_estate" | "other";
  quantity: number;
  buy_price: number;
  current_price: number | null;
  platform: string | null;
  purchase_date: string;
  note: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ProfileData {
  email: string;
  displayName: string;
  avatarUrl: string;
}
