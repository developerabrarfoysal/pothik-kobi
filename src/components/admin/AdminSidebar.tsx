"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Home, PenLine, Tags, Image, Images,
  Video, Menu, Search, Settings, Mail, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/pages", label: "পেজ", icon: FileText },
  { href: "/admin/homepage", label: "হোমপেজ বিল্ডার", icon: Home },
  { href: "/admin/writings", label: "লেখালেখি", icon: PenLine },
  { href: "/admin/categories", label: "বিভাগ", icon: Tags },
  { href: "/admin/media", label: "মিডিয়া লাইব্রেরি", icon: Image },
  { href: "/admin/gallery", label: "গ্যালারি", icon: Images },
  { href: "/admin/videos", label: "ভিডিও", icon: Video },
  { href: "/admin/navigation", label: "নেভিগেশন", icon: Menu },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/settings", label: "সাইট সেটিংস", icon: Settings },
  { href: "/admin/messages", label: "যোগাযোগ বার্তা", icon: Mail },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="admin-sidebar flex w-64 shrink-0 flex-col text-white">
      <div className="border-b border-white/10 p-6">
        <Link href="/admin" className="font-serif text-xl font-bold">পথিক কবি</Link>
        <p className="mt-1 text-xs text-white/60">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link href="/" target="_blank" className="mb-2 block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10">
          সাইট দেখুন →
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/20">
          <LogOut className="h-4 w-4" /> লগআউট
        </button>
      </div>
    </aside>
  );
}
