"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, Mail, Sparkles, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/validations";

type AuthValues = z.infer<typeof authSchema>;

function AuthPanel({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit((values) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result =
        mode === "signin"
          ? await supabase.auth.signInWithPassword(values)
          : await supabase.auth.signUp({
              ...values,
              options: {
                data: {
                  display_name: values.email.split("@")[0],
                },
              },
            });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        setSuccess("Account created. Check your email to confirm your account.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  });

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[rgba(17,24,21,0.86)] p-4 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:rounded-[34px] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,181,104,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,138,0.18),transparent_28%)]" />
      <div className="relative space-y-4 sm:space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[12px] font-medium text-[rgba(241,231,212,0.82)]">
              <Sparkles className="h-3.5 w-3.5 text-[rgb(234,185,104)]" />
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-[rgb(248,242,230)] sm:text-3xl">
              {mode === "signin" ? "Sign in to Finq." : "Start with Finq."}
            </h2>
          </div>
          <div className="hidden rounded-[24px] border border-white/10 bg-white/6 p-3 text-[rgb(234,185,104)] sm:block">
            <WalletCards className="h-6 w-6" />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`} className="text-[rgb(236,227,211)]">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(230,220,201,0.46)]" />
              <Input
                id={`${mode}-email`}
                type="email"
                className="h-11 rounded-[18px] border-white/10 bg-white/6 pl-11 text-[rgb(248,242,230)] placeholder:text-[rgba(230,220,201,0.4)] focus-visible:ring-[rgba(232,181,104,0.45)] sm:h-12 sm:rounded-[20px]"
                placeholder="you@example.com"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && <p className="text-sm text-[rgb(255,153,144)]">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`} className="text-[rgb(236,227,211)]">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(230,220,201,0.46)]" />
              <Input
                id={`${mode}-password`}
                type="password"
                className="h-11 rounded-[18px] border-white/10 bg-white/6 pl-11 text-[rgb(248,242,230)] placeholder:text-[rgba(230,220,201,0.4)] focus-visible:ring-[rgba(232,181,104,0.45)] sm:h-12 sm:rounded-[20px]"
                placeholder="Minimum 6 characters"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && <p className="text-sm text-[rgb(255,153,144)]">{form.formState.errors.password.message}</p>}
          </div>
          {error && <p className="rounded-[18px] border border-[rgba(255,128,107,0.28)] bg-[rgba(120,35,24,0.24)] px-4 py-3 text-sm text-[rgb(255,179,162)]">{error}</p>}
          {success && <p className="rounded-[18px] border border-[rgba(72,191,145,0.28)] bg-[rgba(17,74,58,0.26)] px-4 py-3 text-sm text-[rgb(167,243,208)]">{success}</p>}
          <Button
            type="submit"
            className="h-11 w-full rounded-[18px] bg-[rgb(234,185,104)] text-[rgb(39,31,20)] shadow-[0_18px_40px_-24px_rgba(234,185,104,0.85)] hover:bg-[rgb(241,196,126)] sm:h-12 sm:rounded-[20px]"
            disabled={pending}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AuthForm() {
  return (
    <Tabs defaultValue="signin" className="w-full">
      <div className="mb-4 flex items-center justify-end sm:mb-5">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-full border border-white/10 bg-white/6 p-1 sm:w-auto">
          <TabsTrigger value="signin" className="rounded-full px-4 py-2 text-[13px] text-[rgba(231,221,203,0.7)] data-[state=active]:bg-[rgb(234,185,104)] data-[state=active]:text-[rgb(39,31,20)] data-[state=active]:shadow-none sm:px-5">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="rounded-full px-4 py-2 text-[13px] text-[rgba(231,221,203,0.7)] data-[state=active]:bg-[rgb(234,185,104)] data-[state=active]:text-[rgb(39,31,20)] data-[state=active]:shadow-none sm:px-5">
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="signin" className="mt-0">
        <AuthPanel mode="signin" />
      </TabsContent>
      <TabsContent value="signup" className="mt-0">
        <AuthPanel mode="signup" />
      </TabsContent>
    </Tabs>
  );
}
