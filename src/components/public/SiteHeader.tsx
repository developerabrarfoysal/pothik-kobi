"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  href: string;
  children?: { id: string; label: string; href: string }[];
};

type SiteHeaderProps = {
  siteName: string;
  logoUrl?: string | null;
  navItems: NavItem[];
  primaryColor?: string;
};

export function SiteHeader({ siteName, logoUrl, navItems, primaryColor }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const defaultNav: NavItem[] = navItems.length
    ? navItems
    : [
        { id: "1", label: "হোম", href: "/" },
        { id: "2", label: "লেখালেখি", href: "/writings" },
        { id: "3", label: "আমার সম্পর্কে", href: "/about" },
        { id: "4", label: "যোগাযোগ", href: "/contact" },
      ];

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold md:text-2xl" style={{ color: primaryColor }}>
          {logoUrl && !logoUrl.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto md:h-10" />
          ) : null}
          <span>{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {defaultNav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10",
                pathname === item.href && "bg-primary/10 text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="মেনু">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="flex flex-col px-4 py-2">
              {defaultNav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-medium",
                    pathname === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
