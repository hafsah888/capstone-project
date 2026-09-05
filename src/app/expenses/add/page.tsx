import AddExpenseForm from "@/components/AddExpenseForm";

export default function AddExpensePage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">New transaction</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add Expense</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">Record a purchase to keep your spending history current.</p>
        </div>
      <AddExpenseForm />
      </div>
    </main>
  );
}
