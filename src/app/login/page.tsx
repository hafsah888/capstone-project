"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

type AuthMode = "sign-in" | "sign-up";

type FieldErrors = {
  email?: string;
  password?: string;
};

function getFriendlyAuthError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect. Check your details and try again.";
    case "auth/email-already-in-use":
      return "An account already exists with this email. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow popups and try again.";
    case "auth/cancelled-popup-request":
      return "Another sign-in request is already in progress.";
    case "auth/network-request-failed":
      return "We could not reach Firebase. Check your connection and try again.";
    default:
      return "We could not complete authentication. Please try again.";
  }
}

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setAuthError("");
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateFields(email, password);
    setFieldErrors(errors);
    setAuthError("");
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      if (mode === "sign-up") await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/");
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    setFieldErrors({});
    setIsLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/");
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 px-4 py-10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-8"><div className="w-full max-w-md"><div className="mb-7 text-center"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">Welcome back</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{mode === "sign-in" ? "Sign in to your tracker" : "Create your tracker account"}</h1><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Keep your expenses, budgets, and spending story in one place.</p></div><section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(67,85,219,0.45)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-7"><div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"><button type="button" onClick={() => changeMode("sign-in")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "sign-in" ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-200" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>Sign In</button><button type="button" onClick={() => changeMode("sign-up")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "sign-up" ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-200" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>Sign Up</button></div><form onSubmit={handleEmailAuth} noValidate className="mt-6 space-y-4"><label htmlFor="login-email" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Email<input id="login-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} />{fieldErrors.email && <span id="email-error" className="mt-1.5 block text-xs font-normal text-rose-600 dark:text-rose-400">{fieldErrors.email}</span>}</label><label htmlFor="login-password" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Password<input id="login-password" name="password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800" aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "password-error" : undefined} />{fieldErrors.password && <span id="password-error" className="mt-1.5 block text-xs font-normal text-rose-600 dark:text-rose-400">{fieldErrors.password}</span>}</label>{authError && <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{authError}</p>}<button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? "Please wait..." : mode === "sign-in" ? "Sign In" : "Create account"}</button></form><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /><span className="text-xs font-medium text-slate-400">or</span><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div><button type="button" onClick={() => void handleGoogleAuth()} disabled={isLoading} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"><span aria-hidden="true" className="text-lg font-bold text-indigo-600">G</span>Continue with Google</button></section></div></main>;
}
