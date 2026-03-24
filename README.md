# Finq

Finq is a personal finance web app built with Next.js 14 App Router, Tailwind CSS, shadcn-style UI primitives, Supabase Auth/DB, Recharts, and the Google Gemini API.

## Stack

- Next.js 14 App Router
- Tailwind CSS
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Google Gemini (`@google/generative-ai`)
- `react-hook-form` + `zod`
- Recharts
- `react-markdown`
- `next-themes`
- `lucide-react`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Update [.env.local](E:/Finance Management App/.env.local) with your real Supabase and Gemini credentials.
3. In Supabase SQL editor, run [schema.sql](E:/Finance Management App/supabase/schema.sql).
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Supabase Notes

- Enable Email/Password auth in Supabase Auth.
- The app stores display name and avatar URL in `auth.users` metadata.
- All app tables use RLS and are scoped to `auth.uid()`.

## Features

- Email/password auth with middleware-protected routes
- Dashboard with PKR summary cards, trend line chart, and category donuts
- Income and expense ledgers with filters, pagination, edit/delete confirmations, and optimistic updates
- Savings goals tracker with inline progress updates
- Wants & needs tracker for future purchases with PKR price planning
- Investment tracker for stocks, crypto, gold, funds, and similar holdings
- Gemini-powered AI finance assistant with session history and streamed responses
- Settings for profile, password, theme, and full data wipe

## Verification

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

If you add a new table from an updated schema later, rerun the SQL changes in Supabase before testing that feature.
