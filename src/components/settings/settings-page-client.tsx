"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileData } from "@/lib/types";
import { passwordSchema, profileSchema } from "@/lib/validations";
import { z } from "zod";

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function SettingsPageClient({ profile }: { profile: ProfileData }) {
  const [message, setMessage] = useState<string | null>(null);
  const [dangerConfirm, setDangerConfirm] = useState("");
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  async function saveProfile(values: ProfileValues) {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    setMessage(data.message || "Profile updated.");
  }

  async function savePassword(values: PasswordValues) {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    setMessage(data.message || "Password updated.");
    passwordForm.reset();
  }

  async function deleteAllData() {
    const response = await fetch("/api/settings/delete-all", { method: "DELETE" });
    const data = await response.json();
    setMessage(data.message || "All data deleted.");
    setDangerConfirm("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="surface-shine overflow-hidden">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name and avatar URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={profileForm.handleSubmit(saveProfile)}>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input {...profileForm.register("displayName")} />
                {profileForm.formState.errors.displayName && <p className="text-sm text-destructive">{profileForm.formState.errors.displayName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Avatar URL</Label>
                <Input {...profileForm.register("avatarUrl")} />
                {profileForm.formState.errors.avatarUrl && <p className="text-sm text-destructive">{profileForm.formState.errors.avatarUrl.message}</p>}
              </div>
              <Button type="submit">Save Profile</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="surface-shine overflow-hidden">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Set a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={passwordForm.handleSubmit(savePassword)}>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" {...passwordForm.register("password")} />
                {passwordForm.formState.errors.password && <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card className="overflow-hidden border-destructive/20">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Delete all income, expenses, goals, and AI chat history tied to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Type DELETE to unlock the final confirmation.</p>
          <Input value={dangerConfirm} onChange={(event) => setDangerConfirm(event.target.value)} placeholder="Type DELETE" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={dangerConfirm !== "DELETE"}>Delete All My Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Final confirmation</AlertDialogTitle>
                <AlertDialogDescription>This permanently wipes every Finq record stored for your account.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAllData}>Delete everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {message && <p className="rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-primary">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
