"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/components/providers/currency-provider";
import type { ExpenseRecord } from "@/lib/types";
import { convertCurrencyInputToBase, convertCurrencyValue, expenseCategories, expenseCategoryColors, formatShortDate, type CurrencyCode } from "@/lib/utils";
import { expenseSchema } from "@/lib/validations";
import { z } from "zod";

type ExpenseFormValues = z.input<typeof expenseSchema>;
type ExpenseValues = z.output<typeof expenseSchema>;

function ExpenseForm({ initialValues, onSubmit, trigger, title, description }: { initialValues?: Partial<ExpenseFormValues>; onSubmit: (values: ExpenseValues) => Promise<void>; trigger: React.ReactNode; title: string; description: string; }) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryCurrency, setEntryCurrency] = useState<CurrencyCode>(currency);
  const form = useForm<ExpenseFormValues, unknown, ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "Food",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    setEntryCurrency(currency);
    form.reset({
      title: initialValues?.title || "",
      amount: initialValues?.amount ? convertCurrencyValue(Number(initialValues.amount), currency) : 0,
      category: (initialValues?.category as ExpenseValues["category"]) || "Food",
      date: initialValues?.date || new Date().toISOString().slice(0, 10),
      note: initialValues?.note || "",
    });
  }, [currency, form, initialValues, open]);

  function handleCurrencyChange(nextCurrency: CurrencyCode) {
    const currentAmount = Number(form.getValues("amount") || 0);
    const baseAmount = convertCurrencyInputToBase(currentAmount, entryCurrency);
    form.setValue("amount", convertCurrencyValue(baseAmount, nextCurrency), { shouldValidate: true });
    setEntryCurrency(nextCurrency);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => {
          setSaving(true);
          await onSubmit({
            ...values,
            amount: convertCurrencyInputToBase(Number(values.amount), entryCurrency),
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
          <div className="grid gap-4 md:grid-cols-[1fr_140px]">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...form.register("amount")} />
              {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as ExpenseFormValues["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea {...form.register("note")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesPageClient({ initialRecords }: { initialRecords: ExpenseRecord[] }) {
  const { formatCurrency } = useCurrency();
  const [records, setRecords] = useState(initialRecords);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const pageSize = 8;

  async function createRecord(values: ExpenseValues) {
    const tempId = `temp-${Date.now()}`;
    const optimisticRecord: ExpenseRecord = {
      id: tempId,
      user_id: "temp",
      title: values.title,
      amount: Number(values.amount),
      category: values.category,
      date: values.date,
      note: values.note || null,
      created_at: new Date().toISOString(),
    };
    setRecords((current) => [optimisticRecord, ...current]);
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    setRecords((current) => current.map((item) => item.id === tempId ? data.record : item));
  }

  async function updateRecord(id: string, values: ExpenseValues) {
    const previous = records;
    setRecords((current) => current.map((item) => item.id === id ? { ...item, ...values, amount: Number(values.amount), note: values.note || null } : item));
    const response = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) setRecords(previous);
  }

  async function deleteRecord(id: string) {
    const previous = records;
    setRecords((current) => current.filter((item) => item.id !== id));
    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!response.ok) setRecords(previous);
  }

  const filtered = useMemo(() => {
    const next = records.filter((record) => {
      if (categoryFilter !== "all" && record.category !== categoryFilter) return false;
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      return true;
    });

    next.sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortKey === "amount") return (Number(a.amount) - Number(b.amount)) * modifier;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier;
    });

    return next;
  }, [records, categoryFilter, startDate, endDate, sortKey, sortDirection]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const totalSpend = filtered.reduce((sum, record) => sum + Number(record.amount), 0);

  return (
    <div className="space-y-6">
      <Card className="surface-shine overflow-hidden">
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Filtered expense total</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-primary">{formatCurrency(totalSpend)}</p>
          </div>
          <ExpenseForm title="Add Expense" description="Capture a new expense transaction." onSubmit={createRecord} trigger={<Button><Plus className="h-4 w-4" />Add Expense</Button>} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {expenseCategories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Button variant="outline" onClick={() => {
            setSortDirection((current) => current === "asc" ? "desc" : "asc");
            setSortKey((current) => current === "date" ? "amount" : "date");
          }}>
            <ArrowDownUp className="h-4 w-4" />
            Sort: {sortKey}
          </Button>
        </CardContent>
      </Card>

      <div className="glass-card overflow-hidden rounded-3xl animate-rise-in">
        {paginated.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No expense records match the current filters.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>{formatCurrency(Number(record.amount))}</TableCell>
                  <TableCell><Badge className={expenseCategoryColors[record.category] || ""} variant="outline">{record.category}</Badge></TableCell>
                  <TableCell>{formatShortDate(record.date)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">{record.note || "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <ExpenseForm title="Edit Expense" description="Update this expense entry." initialValues={{ title: record.title, amount: Number(record.amount), category: record.category as ExpenseFormValues["category"], date: record.date, note: record.note || "" }} onSubmit={(values) => updateRecord(record.id, values)} trigger={<Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete expense entry?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
