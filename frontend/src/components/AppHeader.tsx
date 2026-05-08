"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { clsx } from "clsx";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/predict", label: "Risk Screener" },
  { href: "/about", label: "About" },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/90 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors duration-200"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
            <Activity size={16} strokeWidth={2.5} />
          </span>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline-block">
            CKD Risk Screener
          </span>
          <span className="font-semibold text-sm tracking-tight sm:hidden">
            CKD AI
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "rounded-md px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors duration-150",
                    pathname === href
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
