import Link from "next/link";

export default function Navbar() {
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/expenses/add", label: "Add Expense" },
    { href: "/history", label: "History" },
    { href: "/chat", label: "AI Assistant" },
    { href: "/settings", label: "Settings" },
    { href: "/profile", label: "Profile" },
    { href: "/health", label: "Health" },
  ];

  return (
    <nav className="border-b p-4 flex gap-6 flex-wrap">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-sm font-medium hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
