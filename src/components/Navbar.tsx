import Link from "next/link";

export default function Navbar() {
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/expenses/add", label: "Add Expense" },
    { href: "/history", label: "History" },
    { href: "/chat", label: "AI Assistant" },
    { href: "/settings", label: "Settings" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="flex flex-wrap gap-6 border-b border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-700 hover:text-indigo-600 hover:underline dark:text-slate-300 dark:hover:text-indigo-300">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
