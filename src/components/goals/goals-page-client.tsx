"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/components/providers/currency-provider";
import type { GoalRecord } from "@/lib/types";
import { convertCurrencyInputToBase, convertCurrencyValue, formatShortDate, type CurrencyCode } from "@/lib/utils";
import { goalSchema } from "@/lib/validations";
import { z } from "zod";

type GoalFormValues = z.input<typeof goalSchema>;
type GoalValues = z.output<typeof goalSchema>;

function GoalForm({ initialValues, onSubmit, trigger, title }: { initialValues?: Partial<GoalFormValues>; onSubmit: (values: GoalValues) => Promise<void>; trigger: React.ReactNode; title: string; }) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryCurrency, setEntryCurrency] = useState<CurrencyCode>(currency);
  const form = useForm<GoalFormValues, unknown, GoalValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      target_amount: 0,
      saved_amount: 0,
      deadline: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    setEntryCurrency(currency);
    form.reset({
      title: initialValues?.title || "",
      target_amount: initialValues?.target_amount ? convertCurrencyValue(Number(initialValues.target_amount), currency) : 0,
      saved_amount: initialValues?.saved_amount ? convertCurrencyValue(Number(initialValues.saved_amount), currency) : 0,
      deadline: initialValues?.deadline || "",
    });
  }, [currency, form, initialValues, open]);

  function handleCurrencyChange(nextCurrency: CurrencyCode) {
    const currentTarget = Number(form.getValues("target_amount") || 0);
    const currentSaved = Number(form.getValues("saved_amount") || 0);
    const baseTarget = convertCurrencyInputToBase(currentTarget, entryCurrency);
    const baseSaved = convertCurrencyInputToBase(currentSaved, entryCurrency);

    form.setValue("target_amount", convertCurrencyValue(baseTarget, nextCurrency), { shouldValidate: true });
    form.setValue("saved_amount", convertCurrencyValue(baseSaved, nextCurrency), { shouldValidate: true });
    setEntryCurrency(nextCurrency);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Track savings progress against a target.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => {
          setSaving(true);
          await onSubmit({
            ...values,
            target_amount: convertCurrencyInputToBase(Number(values.target_amount), entryCurrency),
            saved_amount: convertCurrencyInputToBase(Number(values.saved_amount), entryCurrency),
          });
          setSaving(false);
          setOpen(false);
          form.reset();
        })}>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={entryCurrency} onValueChange={(value) => handleCurrencyChange(value as CurrencyCode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">Pakistan Rupee</SelectItem>
                <SelectItem value="USD">US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Target Amount</Label>
              <Input type="number" step="0.01" {...form.register("target_amount")} />
            </div>
            <div className="space-y-2">
              <Label>Saved Amount</Label>
              <Input type="number" step="0.01" {...form.register("saved_amount")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input type="date" {...form.register("deadline")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Goal"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GoalsPageClient({ initialGoals }: { initialGoals: GoalRecord[] }) {
  const { currency, formatCurrency } = useCurrency();
  const [goals, setGoals] = useState(initialGoals);

  async function createGoal(values: GoalValues) {
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    setGoals((current) => [data.record, ...current]);
  }

  async function updateGoal(id: string, values: Partial<GoalValues> & { status?: string }) {
    const response = await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) return;
    const data = await response.json();
    setGoals((current) => current.map((goal) => goal.id === id ? data.record : goal));
  }

  async function deleteGoal(id: string) {
    const response = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setGoals((current) => current.filter((goal) => goal.id !== id));
  }

  const activeCount = goals.filter((goal) => goal.status === "active").length;

  return (
    <div className="space-y-6">
      <Card className="surface-shine overflow-hidden">
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active goals</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-primary">{activeCount}</p>
          </div>
          <GoalForm title="Add Goal" onSubmit={createGoal} trigger={<Button><Plus className="h-4 w-4" />Add Goal</Button>} />
        </CardContent>
      </Card>
      {goals.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-sm text-muted-foreground">No goals yet. Add one to start tracking your progress.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount || 1)) * 100));
            return (
              <Card key={goal.id} className="surface-shine overflow-hidden">
                <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-white/35 dark:border-white/8">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Deadline: {goal.deadline ? formatShortDate(goal.deadline) : "Open-ended"}</p>
                  </div>
                  <Badge variant={goal.status === "completed" ? "default" : goal.status === "cancelled" ? "destructive" : "secondary"}>{goal.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{formatCurrency(Number(goal.saved_amount))}</span>
                      <span className="text-muted-foreground">of {formatCurrency(Number(goal.target_amount))}</span>
                    </div>
                    <Progress value={progress} />
                    <p className="mt-2 text-xs text-muted-foreground">{progress}% funded</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Update saved amount ({currency})</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        defaultValue={convertCurrencyValue(Number(goal.saved_amount), currency)}
                        onBlur={(event) => updateGoal(goal.id, {
                          saved_amount: convertCurrencyInputToBase(Number(event.target.value), currency),
                          target_amount: Number(goal.target_amount),
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => updateGoal(goal.id, { status: "completed", saved_amount: Number(goal.target_amount) })}>Complete</Button>
                    <Button variant="outline" onClick={() => updateGoal(goal.id, { status: "cancelled" })}>Cancel</Button>
                    <GoalForm title="Edit Goal" initialValues={{ title: goal.title, target_amount: Number(goal.target_amount), saved_amount: Number(goal.saved_amount), deadline: goal.deadline || "" }} onSubmit={(values) => updateGoal(goal.id, values)} trigger={<Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete goal?</AlertDialogTitle>
                          <AlertDialogDescription>This removes the goal permanently.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteGoal(goal.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
