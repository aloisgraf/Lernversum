"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/lizenznehmer", label: "Lizenznehmer und Kinder" },
  { href: "/admin/spiele", label: "Spiele und Themen" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
      {nav.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="rounded-xl px-4 py-3 font-semibold"
            style={active ? { background: "var(--lv-action)", color: "#fff" } : { color: "#fff" }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
