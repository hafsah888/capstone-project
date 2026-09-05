"use client";

import { useState } from "react";

// TODO: replace mock data with real user data once Firestore auth is fixed
const initialProfile = {
  name: "Hassan Khan",
  email: "hassan.khan@example.com",
  memberSince: "January 2025",
};

const stats = [
  { label: "Total expenses tracked", value: "128" },
  { label: "Categories used", value: "7" },
  { label: "Member for", value: "20 months" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const openEditor = () => {
    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setIsEditing(true);
    setMessage("");
  };

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfile({ ...profile, name: draftName.trim() || profile.name, email: draftEmail.trim() || profile.email });
    setIsEditing(false);
    setMessage("Profile details updated for this session.");
  };

  return <main className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-8 sm:py-12"><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">Profile</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile</h1><p className="mt-2 max-w-xl text-slate-600 dark:text-slate-300">Your account details and spending journey in one place.</p>{message && <p role="status" className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p>}
    <div className="mt-8 space-y-5">
      <section aria-labelledby="profile-card-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200">{profile.name.charAt(0)}</div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">Account</p><h2 id="profile-card-title" className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2><p className="truncate text-sm text-slate-500 dark:text-slate-400">{profile.email}</p><p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">Member since {profile.memberSince}</p></div></div><button type="button" onClick={openEditor} className="rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/50">Edit profile</button></div></section>
      <section aria-label="Profile summary" className="grid gap-4 sm:grid-cols-3">{stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p><p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p></article>)}</section>
      <section className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-900 dark:bg-slate-900 sm:p-7"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-600 dark:text-rose-400">Account access</p><h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Ready to take a break?</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign out is currently a visual placeholder.</p></div><button type="button" onClick={() => setMessage("Sign out will be connected when authentication is enabled.")} className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70">Sign out</button></section>
    </div></div>{isEditing && <div role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><h2 id="edit-profile-title" className="text-xl font-bold text-slate-900 dark:text-white">Edit profile</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">These changes are temporary until account data is connected.</p><form onSubmit={saveProfile} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Name<input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" /></label><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email<input type="email" value={draftEmail} onChange={(event) => setDraftEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" /></label><div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Cancel</button><button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">Save changes</button></div></form></div></div>}</main>;
}
