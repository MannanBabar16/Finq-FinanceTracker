import { z } from "zod";
import { expenseCategories, goalStatuses, incomeCategories, investmentTypes, wishlistItemTypes } from "@/lib/utils";

const amountField = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .pipe(z.number().positive("Enter an amount greater than 0."));

const nonNegativeAmountField = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .pipe(z.number().min(0, "Value cannot be negative."));

export const authSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const incomeSchema = z.object({
  title: z.string().min(2, "Title is required."),
  amount: amountField,
  category: z.enum(incomeCategories),
  date: z.string().min(1, "Date is required."),
  note: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(2, "Title is required."),
  amount: amountField,
  category: z.enum(expenseCategories),
  date: z.string().min(1, "Date is required."),
  note: z.string().optional(),
});

export const goalSchema = z.object({
  title: z.string().min(2, "Title is required."),
  target_amount: amountField,
  saved_amount: nonNegativeAmountField,
  deadline: z.string().optional(),
});

export const goalStatusSchema = z.object({
  saved_amount: nonNegativeAmountField.optional(),
  target_amount: amountField.optional(),
  status: z.enum(goalStatuses).optional(),
});

export const wishlistSchema = z.object({
  title: z.string().min(2, "Title is required."),
  price: amountField,
  item_type: z.enum(wishlistItemTypes),
  note: z.string().optional(),
});

export const investmentSchema = z.object({
  asset_name: z.string().min(2, "Asset name is required."),
  asset_type: z.enum(investmentTypes),
  quantity: amountField,
  buy_price: amountField,
  current_price: z.union([z.string(), z.number(), z.literal("")]).transform((value) => value === "" ? null : Number(value)).refine((value) => value === null || value >= 0, "Current price cannot be negative."),
  platform: z.string().optional(),
  purchase_date: z.string().min(1, "Purchase date is required."),
  note: z.string().optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, "Display name is required."),
  avatarUrl: z.string().url("Enter a valid URL.").or(z.literal("")),
});

export const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
});
