"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteExpense, getExpenses, getSettings, type CurrencyCode, type Expense } from "@/lib/firebase/expenses";
import { formatCurrency } from "@/lib/formatCurrency";

const categoryColors = ["bg-indigo-500", "bg-orange-400", "bg-emerald-500", "bg-amber-400", "bg-rose-400", "bg-sky-500"];
type DateFilter = "all" | "this-month" | "last-month" | "custom";

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateLabel = (key: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key === dateKey(today)) return "Today";
  if (key === dateKey(yesterday)) return "Yesterday";
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export default function HistoryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [category, setCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getExpenses(), getSettings()])
      .then(([loadedExpenses, settings]) => {
        setExpenses(loadedExpenses);
        setCategories(settings.categories);
        setCurrency(settings.currency);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load expenses."))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const startKey = dateFilter === "this-month" ? dateKey(thisMonthStart) : dateFilter === "last-month" ? dateKey(lastMonthStart) : dateFilter === "custom" ? customFrom : "";
    const endKey = dateFilter === "this-month" ? dateKey(now) : dateFilter === "last-month" ? dateKey(lastMonthEnd) : dateFilter === "custom" ? customTo || customFrom : "";
    const normalizedSearch = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const expenseDate = dateKey(new Date(expense.date));
      const matchesCategory = category === "all" || expense.category === category;
      const matchesSearch = !normalizedSearch || (expense.note ?? "").toLowerCase().includes(normalizedSearch);
      const matchesDate = dateFilter === "all" || (Boolean(startKey) && Boolean(endKey) && expenseDate >= startKey && expenseDate <= endKey);
      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [category, customFrom, customTo, dateFilter, expenses, search]);

  const groupedExpenses = useMemo(() => filteredExpenses.reduce<Record<string, Expense[]>>((groups, expense) => {
    const key = dateKey(new Date(expense.date));
    groups[key] = [...(groups[key] ?? []), expense];
    return groups;
  }, {}), [filteredExpenses]);
  const filteredTotal = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

  const removeExpense = async (expense: Expense) => {
    if (!expense.id || !window.confirm("Delete this expense?")) return;
    setDeletingId(expense.id);
    setError("");
    try {
      await deleteExpense(expense.id);
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this expense.");
    } finally {
      setDeletingId(null);
    }
  };

  const filterControls = <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr]"><label className="text-sm font-semibold text-slate-700">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Date range<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"><option value="all">All time</option><option value="this-month">This month</option><option value="last-month">Last month</option><option value="custom">Custom range</option></select></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-1">Search notes<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. groceries" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /></label>{dateFilter === "custom" && <div className="grid grid-cols-2 gap-3 sm:col-span-2"><label className="text-sm font-semibold text-slate-700">From<input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /></label><label className="text-sm font-semibold text-slate-700">To<input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /></label></div>}</div>;

  return <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-4xl"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">Your activity</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">History</h1><p className="mt-2 text-slate-600">Review and refine your recorded expenses.</p>{error && <p role="alert" className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{isLoading ? <div role="status" className="mt-8 animate-pulse space-y-3"><div className="h-24 rounded-2xl bg-slate-200" />{[1, 2, 3].map((item) => <div key={item} className="h-20 rounded-2xl bg-slate-200" />)}</div> : <><section aria-label="History filters" className="mt-8 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5"><button type="button" className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800 sm:hidden" aria-expanded={isFiltersOpen} onClick={() => setIsFiltersOpen((open) => !open)}>Filters<span aria-hidden="true" className="text-lg text-indigo-600">{isFiltersOpen ? "−" : "+"}</span></button><div className={`${isFiltersOpen ? "mt-4" : "hidden"} sm:block`}>{filterControls}</div></section><section aria-label="Filtered expense summary" className="mt-4 flex flex-col gap-1 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold text-indigo-950">{filteredExpenses.length} {filteredExpenses.length === 1 ? "transaction" : "transactions"} <span className="font-normal text-indigo-700">· {formatCurrency(filteredTotal, currency)} total</span></p>{(category !== "all" || dateFilter !== "all" || search) && <button type="button" onClick={() => { setCategory("all"); setDateFilter("all"); setSearch(""); setCustomFrom(""); setCustomTo(""); }} className="text-left text-xs font-semibold text-indigo-700 hover:text-indigo-500 sm:text-right">Clear filters</button>}</section>{filteredExpenses.length === 0 ? <div className="mt-6 rounded-3xl border border-dashed border-indigo-200 bg-white/80 p-10 text-center shadow-sm"><div aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl font-light text-indigo-600">+</div><h2 className="mt-4 font-semibold text-slate-900">{expenses.length === 0 ? "No expenses recorded yet" : "No expenses match these filters"}</h2><p className="mt-1 text-sm text-slate-500">{expenses.length === 0 ? "Add your first expense to start building your history." : "Try a different category, date range, or note search."}</p>{expenses.length === 0 && <Link href="/expenses/add" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">Add an expense</Link>}</div> : <div className="mt-8 space-y-8">{Object.entries(groupedExpenses).sort(([a], [b]) => b.localeCompare(a)).map(([date, dateExpenses]) => <section key={date} aria-labelledby={`date-${date}`}><h2 id={`date-${date}`} className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/95 py-2 text-sm font-semibold text-slate-600 backdrop-blur">{getDateLabel(date)}</h2><div className="mt-3 space-y-3">{dateExpenses.map((expense) => <article key={expense.id} className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md sm:gap-4 sm:p-5"><span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full ${categoryColors[expense.category.length % categoryColors.length]}`} /><div className="min-w-0 flex-1"><div className="flex min-w-0 items-baseline gap-2"><h3 className="truncate font-semibold capitalize text-slate-900">{expense.category}</h3><p className="hidden truncate text-sm text-slate-500 sm:block">{expense.note || "No note added"}</p></div><p className="truncate text-sm text-slate-500 sm:hidden">{expense.note || "No note added"}</p><p className="mt-1 text-xs font-medium text-slate-400">{new Date(expense.date).toLocaleDateString()}</p></div><p className="shrink-0 text-base font-bold text-slate-900 sm:text-lg">{formatCurrency(expense.amount, currency)}</p><div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><Link href={`/expenses/add?edit=${expense.id}`} aria-label={`Edit ${expense.category} expense`} title="Edit expense" className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">✎</Link><button type="button" aria-label={`Delete ${expense.category} expense`} title="Delete expense" disabled={deletingId === expense.id} onClick={() => void removeExpense(expense)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50">×</button></div></article>)}</div></section>)}</div>}</>}</div></main>;
}
