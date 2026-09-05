"use client";

import { FormEvent, useEffect, useState } from "react";
import { addExpense, defaultSettings, getSettings } from "@/lib/firebase/expenses";

export default function AddExpenseForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState(defaultSettings.categories);

  useEffect(() => {
    getSettings().then((settings) => setCategories(settings.categories)).catch(() => setCategories(defaultSettings.categories));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSubmitted(false);
      setError("Enter an amount greater than zero.");
      return;
    }

    if (!category.trim()) {
      setSubmitted(false);
      setError("Enter a category.");
      return;
    }

    setError("");
    setSubmitted(false);
    setIsSaving(true);

    try {
      await addExpense({ amount: numericAmount, category, date: new Date(`${date}T12:00:00`).toISOString(), note, description: note });
      setAmount("");
      setCategory("");
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      setSubmitted(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this expense.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-xl space-y-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(67,85,219,0.45)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-7">
      <div>
        <label htmlFor="expense-amount" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Amount</label>
        <input
          id="expense-amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-indigo-200 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label htmlFor="expense-date" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Date</label>
        <input id="expense-date" name="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm outline-none transition duration-200 hover:border-indigo-200 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
      </div>
      <div>
        <label htmlFor="expense-note" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Note <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="expense-note" name="note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What was this expense for?" className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-indigo-200 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
      </div>
      <div>
        <label htmlFor="expense-category" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Category</label>
        <select
          id="expense-category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-indigo-200 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        >
          <option value="">Choose a category</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {submitted && <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Expense added successfully.</p>}
      <button type="submit" disabled={isSaving} className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">{isSaving ? "Saving..." : "Add expense"}</button>
    </form>
  );
}