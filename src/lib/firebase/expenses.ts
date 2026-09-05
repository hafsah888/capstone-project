import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  Timestamp,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";

export type Expense = {
  id?: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  note?: string;
};

export type CurrencyCode = "USD" | "PKR" | "INR" | "EUR";
export type UserSettings = {
  currency: CurrencyCode;
  monthlyBudget: number;
  categories: string[];
};

export const defaultSettings: UserSettings = {
  currency: "USD",
  monthlyBudget: 0,
  categories: ["Food", "Transport", "Housing", "Entertainment", "Shopping", "Utilities", "Health"],
};

const expensesCollection = collection(db, "expenses");
const settingsDocument = doc(db, "settings", "user-preferences");

function mapExpense(document: { id: string; data: () => Record<string, unknown> }): Expense {
  const data = document.data();
  const storedDate = data.date;
  const date = storedDate instanceof Timestamp ? storedDate.toDate().toISOString() : String(storedDate ?? "");

  return {
    id: document.id,
    amount: Number(data.amount ?? 0),
    category: String(data.category ?? "Uncategorized"),
    date,
    description: data.description ? String(data.description) : undefined,
    note: data.note ? String(data.note) : undefined,
  };
}

export async function addExpense(expense: Omit<Expense, "id">): Promise<string> {
  try {
    const document = await addDoc(expensesCollection, {
      amount: expense.amount,
      category: expense.category.trim(),
      date: expense.date,
      description: expense.description?.trim() || "",
      note: expense.note?.trim() || "",
    });
    return document.id;
  } catch (error) {
    console.error("Unable to add expense:", error);
    throw new Error("Unable to save this expense. Please try again.");
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const snapshot = await getDocs(query(expensesCollection, orderBy("date", "desc")));
    return snapshot.docs.map(mapExpense);
  } catch (error) {
    console.error("Unable to fetch expenses:", error);
    throw new Error("Unable to load expenses. Please try again.");
  }
}

export async function getExpensesForMonth(year: number, month: number): Promise<Expense[]> {
  try {
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
    const end = new Date(Date.UTC(year, month, 1)).toISOString();
    const monthlyQuery = query(
      expensesCollection,
      where("date", ">=", start),
      where("date", "<", end),
      orderBy("date", "desc"),
    );
    const snapshot = await getDocs(monthlyQuery);
    return snapshot.docs.map(mapExpense);
  } catch (error) {
    console.error("Unable to fetch monthly expenses:", error);
    throw new Error("Unable to load this month's expenses. Please try again.");
  }
}

export async function getSettings(): Promise<UserSettings> {
  try {
    const snapshot = await getDoc(settingsDocument);
    if (!snapshot.exists()) return defaultSettings;
    const data = snapshot.data();
    return {
      currency: (data.currency as CurrencyCode) ?? defaultSettings.currency,
      monthlyBudget: Number(data.monthlyBudget ?? 0),
      categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories.map(String) : defaultSettings.categories,
    };
  } catch (error) {
    console.error("Unable to fetch settings:", error);
    throw new Error("Unable to load settings. Please try again.");
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  try {
    await setDoc(settingsDocument, settings, { merge: true });
  } catch (error) {
    console.error("Unable to save settings:", error);
    throw new Error("Unable to save settings. Please try again.");
  }
}

export async function deleteAllExpenses(): Promise<void> {
  try {
    const snapshot = await getDocs(expensesCollection);
    await Promise.all(snapshot.docs.map((expense) => deleteDoc(expense.ref)));
  } catch (error) {
    console.error("Unable to delete expenses:", error);
    throw new Error("Unable to delete expenses. Please try again.");
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await deleteDoc(doc(expensesCollection, id));
  } catch (error) {
    console.error("Unable to delete expense:", error);
    throw new Error("Unable to delete this expense. Please try again.");
  }
}