"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/components/providers/currency-provider";
import type { InvestmentRecord } from "@/lib/types";
import { convertCurrencyInputToBase, convertCurrencyValue, formatShortDate, investmentTypes, type CurrencyCode } from "@/lib/utils";
import { investmentSchema } from "@/lib/validations";
import { z } from "zod";

type InvestmentFormValues = z.input<typeof investmentSchema>;
type InvestmentValues = z.output<typeof investmentSchema>;

function extractErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as {
    message?: string;
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };

  if (maybeError.message) return maybeError.message;
  if (maybeError.formErrors?.[0]) return maybeError.formErrors[0];

  const firstFieldError = Object.values(maybeError.fieldErrors || {}).find(
    (messages) => Array.isArray(messages) && messages.length > 0,
  );

  if (firstFieldError?.[0]) return firstFieldError[0];
  return fallback;
}

function InvestmentForm({
  initialValues,
  onSubmit,
  trigger,
  title,
}: {
  initialValues?: Partial<InvestmentFormValues>;
  onSubmit: (values: InvestmentValues) => Promise<{ ok: true } | { ok: false; error: string }>;
  trigger: React.ReactNode;
  title: string;
}) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [priceCurrency, setPriceCurrency] = useState<CurrencyCode>(currency);
  const form = useForm<InvestmentFormValues, unknown, InvestmentValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      asset_name: "",
      asset_type: "stock",
      quantity: 0,
      buy_price: 0,
      current_price: "",
      platform: "",
      purchase_date: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    setPriceCurrency(currency);
    form.reset({
      asset_name: initialValues?.asset_name || "",
      asset_type: initialValues?.asset_type || "stock",
      quantity: initialValues?.quantity || 0,
      buy_price: initialValues?.buy_price ? convertCurrencyValue(Number(initialValues.buy_price), currency) : 0,
      current_price: initialValues?.current_price === null || initialValues?.current_price === undefined || initialValues?.current_price === ""
        ? ""
        : convertCurrencyValue(Number(initialValues.current_price), currency),
      platform: initialValues?.platform || "",
      purchase_date: initialValues?.purchase_date || new Date().toISOString().slice(0, 10),
      note: initialValues?.note || "",
    });
    setFormError(null);
  }, [currency, form, initialValues, open]);

  function handleCurrencyChange(nextCurrency: CurrencyCode) {
    const currentBuyPrice = Number(form.getValues("buy_price") || 0);
    const currentPriceValue = form.getValues("current_price");
    const baseBuyPrice = convertCurrencyInputToBase(currentBuyPrice, priceCurrency);

    form.setValue("buy_price", convertCurrencyValue(baseBuyPrice, nextCurrency), { shouldValidate: true });

    if (currentPriceValue !== "" && currentPriceValue !== null) {
      const baseCurrentPrice = convertCurrencyInputToBase(Number(currentPriceValue), priceCurrency);
      form.setValue("current_price", convertCurrencyValue(baseCurrentPrice, nextCurrency), { shouldValidate: true });
    }

    setPriceCurrency(nextCurrency);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Add an investment entry with enough detail to track cost basis and current value.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            setSaving(true);
            setFormError(null);
            const result = await onSubmit({
              ...values,
              buy_price: convertCurrencyInputToBase(Number(values.buy_price), priceCurrency),
              current_price: values.current_price === null ? null : convertCurrencyInputToBase(Number(values.current_price), priceCurrency),
            });
            setSaving(false);
            if (result.ok) {
              setOpen(false);
              form.reset();
            } else {
              setFormError(result.error);
            }
          })}
        >
          <div className="space-y-2">
            <Label>Asset name</Label>
            <Input {...form.register("asset_name")} placeholder="BTC, Apple, Gold, Meezan ETF..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.watch("asset_type")} onValueChange={(value) => form.setValue("asset_type", value as InvestmentFormValues["asset_type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purchase date</Label>
              <Input type="date" {...form.register("purchase_date")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Price currency</Label>
            <Select value={priceCurrency} onValueChange={(value) => handleCurrencyChange(value as CurrencyCode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">Pakistan Rupee</SelectItem>
                <SelectItem value="USD">US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" step="0.0001" {...form.register("quantity")} />
            </div>
            <div className="space-y-2">
              <Label>Buy price</Label>
              <Input type="number" step="0.01" {...form.register("buy_price")} />
            </div>
            <div className="space-y-2">
              <Label>Current price</Label>
              <Input type="number" step="0.01" {...form.register("current_price")} placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Platform / broker</Label>
            <Input {...form.register("platform")} placeholder="Binance, PSX, local jeweler, mutual fund app..." />
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea {...form.register("note")} placeholder="Why you bought it, long-term thesis, allocation notes..." />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save investment"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InvestmentsPageClient({ initialRecords }: { initialRecords: InvestmentRecord[] }) {
  const { formatCurrency } = useCurrency();
  const [records, setRecords] = useState(initialRecords);
  const [filter, setFilter] = useState<"all" | InvestmentRecord["asset_type"]>("all");
  const [pageError, setPageError] = useState<string | null>(null);

  async function createRecord(values: InvestmentValues) {
    setPageError(null);
    const response = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = extractErrorMessage(data?.error, "Unable to save investment.");
      setPageError(error);
      return { ok: false as const, error };
    }
    setRecords((current) => [data.record, ...current]);
    return { ok: true as const };
  }

  async function updateRecord(id: string, values: InvestmentValues) {
    setPageError(null);
    const response = await fetch(`/api/investments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = extractErrorMessage(data?.error, "Unable to update investment.");
      setPageError(error);
      return { ok: false as const, error };
    }
    setRecords((current) => current.map((item) => item.id === id ? data.record : item));
    return { ok: true as const };
  }

  async function deleteRecord(id: string) {
    setPageError(null);
    const response = await fetch(`/api/investments/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPageError(extractErrorMessage(data?.error, "Unable to delete investment."));
      return;
    }
    setRecords((current) => current.filter((item) => item.id !== id));
  }

  const filteredRecords = useMemo(
    () => records.filter((record) => filter === "all" || record.asset_type === filter),
    [records, filter],
  );

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        const invested = Number(record.quantity) * Number(record.buy_price);
        const current = record.current_price === null ? invested : Number(record.quantity) * Number(record.current_price);
        acc.invested += invested;
        acc.current += current;
        return acc;
      },
      { invested: 0, current: 0 },
    );
  }, [filteredRecords]);

  const gainLoss = totals.current - totals.invested;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total invested</CardDescription>
            <CardTitle>{formatCurrency(totals.invested)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Current value</CardDescription>
            <CardTitle>{formatCurrency(totals.current)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unrealized P/L</CardDescription>
            <CardTitle className={gainLoss >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>{formatCurrency(gainLoss)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          {investmentTypes.map((type) => (
            <Button key={type} variant={filter === type ? "default" : "outline"} onClick={() => setFilter(type)}>
              {type.replace("_", " ")}
            </Button>
          ))}
        </div>
        <InvestmentForm title="Add investment" onSubmit={createRecord} trigger={<Button><Plus className="h-4 w-4" />Add investment</Button>} />
      </div>

      {pageError && <p className="text-sm text-destructive">{pageError}</p>}

      <Card>
        <CardContent className="pt-6">
          {filteredRecords.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No investment entries yet. Add stocks, bitcoin, gold, funds, or any long-term holding.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Invested</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const invested = Number(record.quantity) * Number(record.buy_price);
                  const current = record.current_price === null ? invested : Number(record.quantity) * Number(record.current_price);
                  const pnl = current - invested;

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.asset_name}</p>
                          <p className="text-xs text-muted-foreground">{record.platform || "No platform"}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{record.asset_type.replace("_", " ")}</Badge></TableCell>
                      <TableCell>{Number(record.quantity)}</TableCell>
                      <TableCell>{formatCurrency(invested)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{formatCurrency(current)}</p>
                          <p className={`text-xs ${pnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>{pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatShortDate(record.purchase_date)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <InvestmentForm
                            title="Edit investment"
                            initialValues={{
                              asset_name: record.asset_name,
                              asset_type: record.asset_type,
                              quantity: Number(record.quantity),
                              buy_price: Number(record.buy_price),
                              current_price: record.current_price ?? "",
                              platform: record.platform || "",
                              purchase_date: record.purchase_date,
                              note: record.note || "",
                            }}
                            onSubmit={(values) => updateRecord(record.id, values)}
                            trigger={<Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>}
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete investment?</AlertDialogTitle>
                                <AlertDialogDescription>This removes the investment entry permanently.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRecord(record.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-accent" />Why these fields?</CardTitle>
          <CardDescription>This setup works across stocks, crypto, gold, funds, and similar assets without pretending you have live market sync.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <p><strong className="text-foreground">Quantity + buy price</strong> gives you cost basis.</p>
          <p><strong className="text-foreground">Current price</strong> is optional so you can manually update valuation when you want.</p>
          <p><strong className="text-foreground">Platform + note</strong> keeps context like broker, wallet, thesis, or lock-in details.</p>
        </CardContent>
      </Card>
    </div>
  );
}
