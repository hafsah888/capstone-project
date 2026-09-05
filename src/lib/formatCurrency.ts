import type { CurrencyCode } from "@/lib/firebase/expenses";

export const currencyOptions: Array<{ code: CurrencyCode; label: string; symbol: string }> = [
  { code: "USD", label: "USD", symbol: "$" },
  { code: "PKR", label: "PKR", symbol: "₨" },
  { code: "INR", label: "INR", symbol: "₹" },
  { code: "EUR", label: "EUR", symbol: "€" },
];

export function formatCurrency(amount: number, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}