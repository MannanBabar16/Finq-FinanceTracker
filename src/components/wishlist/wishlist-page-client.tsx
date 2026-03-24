"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/components/providers/currency-provider";
import type { WishlistRecord } from "@/lib/types";
import { convertCurrencyInputToBase, convertCurrencyValue, wishlistItemTypes, type CurrencyCode } from "@/lib/utils";
import { wishlistSchema } from "@/lib/validations";
import { z } from "zod";

type WishlistFormValues = z.input<typeof wishlistSchema>;
type WishlistValues = z.output<typeof wishlistSchema>;

function WishlistForm({
  initialValues,
  onSubmit,
  trigger,
  title,
}: {
  initialValues?: Partial<WishlistFormValues>;
  onSubmit: (values: WishlistValues) => Promise<void>;
  trigger: React.ReactNode;
  title: string;
}) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryCurrency, setEntryCurrency] = useState<CurrencyCode>(currency);
  const form = useForm<WishlistFormValues, unknown, WishlistValues>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      title: "",
      price: 0,
      item_type: "want",
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    setEntryCurrency(currency);
    form.reset({
      title: initialValues?.title || "",
      price: initialValues?.price ? convertCurrencyValue(Number(initialValues.price), currency) : 0,
      item_type: initialValues?.item_type || "want",
      note: initialValues?.note || "",
    });
  }, [currency, form, initialValues, open]);

  function handleCurrencyChange(nextCurrency: CurrencyCode) {
    const currentPrice = Number(form.getValues("price") || 0);
    const basePrice = convertCurrencyInputToBase(currentPrice, entryCurrency);
    form.setValue("price", convertCurrencyValue(basePrice, nextCurrency), { shouldValidate: true });
    setEntryCurrency(nextCurrency);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Save something you want or need so it stays visible in future planning.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            setSaving(true);
            await onSubmit({
              ...values,
              price: convertCurrencyInputToBase(Number(values.price), entryCurrency),
            });
            setSaving(false);
            setOpen(false);
            form.reset();
          })}
        >
          <div className="space-y-2">
            <Label>Item name</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_140px]">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" {...form.register("price")} />
              {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
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
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.watch("item_type")} onValueChange={(value) => form.setValue("item_type", value as WishlistFormValues["item_type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wishlistItemTypes.map((itemType) => (
                  <SelectItem key={itemType} value={itemType}>{itemType === "want" ? "Want" : "Need"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea {...form.register("note")} placeholder="Why it matters, when you might buy it, or what to compare later." />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WishlistPageClient({ initialItems }: { initialItems: WishlistRecord[] }) {
  const { formatCurrency } = useCurrency();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"all" | "want" | "need">("all");

  async function createItem(values: WishlistValues) {
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (response.ok) setItems((current) => [data.record, ...current]);
  }

  async function updateItem(id: string, values: WishlistValues) {
    const response = await fetch(`/api/wishlist/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (response.ok) setItems((current) => current.map((item) => item.id === id ? data.record : item));
  }

  async function deleteItem(id: string) {
    const response = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }

  const filteredItems = useMemo(
    () => items.filter((item) => filter === "all" || item.item_type === filter),
    [items, filter],
  );

  const totalWants = items.filter((item) => item.item_type === "want").reduce((sum, item) => sum + Number(item.price), 0);
  const totalNeeds = items.filter((item) => item.item_type === "need").reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Saved items</CardDescription>
            <CardTitle>{items.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total wants</CardDescription>
            <CardTitle>{formatCurrency(totalWants)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total needs</CardDescription>
            <CardTitle>{formatCurrency(totalNeeds)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2">
          {(["all", "want", "need"] as const).map((itemType) => (
            <Button key={itemType} variant={filter === itemType ? "default" : "outline"} onClick={() => setFilter(itemType)}>
              {itemType === "all" ? "All" : itemType === "want" ? "Wants" : "Needs"}
            </Button>
          ))}
        </div>
        <WishlistForm title="Add item" onSubmit={createItem} trigger={<Button><Plus className="h-4 w-4" />Add item</Button>} />
      </div>

      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-[28px] p-10 text-center text-sm text-muted-foreground">
          Nothing saved yet. Add a future purchase so you do not lose track of it.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardDescription>{item.item_type === "want" ? "Future want" : "Future need"}</CardDescription>
                    <CardTitle className="mt-2 text-2xl text-primary">{item.title}</CardTitle>
                  </div>
                  <Badge variant={item.item_type === "need" ? "default" : "secondary"}>
                    {item.item_type === "want" ? "Want" : "Need"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  {item.item_type === "want" ? <Sparkles className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                  <span className="text-2xl font-semibold text-foreground">{formatCurrency(Number(item.price))}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="min-h-[48px] text-sm leading-6 text-muted-foreground">{item.note || "No note added yet."}</p>
                <div className="flex gap-2">
                  <WishlistForm
                    title="Edit item"
                    initialValues={{ title: item.title, price: Number(item.price), item_type: item.item_type, note: item.note || "" }}
                    onSubmit={(values) => updateItem(item.id, values)}
                    trigger={<Button variant="outline" className="flex-1"><Pencil className="h-4 w-4" />Edit</Button>}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete saved item?</AlertDialogTitle>
                        <AlertDialogDescription>This removes it from your wants and needs list.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteItem(item.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
