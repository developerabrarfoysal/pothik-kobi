import { getDashboardStats, getAuditLogs } from "@/lib/actions/admin";
import { FileText, PenLine, Image, Mail, Tags } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [stats, logs] = await Promise.all([getDashboardStats(), getAuditLogs(10)]);

  const cards = [
    { label: "পেজ", value: stats.pages, icon: FileText, href: "/admin/pages" },
    { label: "লেখা", value: stats.writings, icon: PenLine, href: "/admin/writings" },
    { label: "মিডিয়া", value: stats.media, icon: Image, href: "/admin/media" },
    { label: "বিভাগ", value: stats.categories, icon: Tags, href: "/admin/categories" },
    { label: "অপঠিত বার্তা", value: stats.unreadMessages, icon: Mail, href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
      <p className="mt-1 text-muted">পথিক কবি ওয়েবসাইট পরিচালনা</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">{card.value}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-bold">সাম্প্রতিক কার্যকলাপ</h2>
        <div className="mt-4 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted">কোনো কার্যকলাপ নেই</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
                <span>
                  <strong>{log.action}</strong> — {log.entity}
                  {log.admin && <span className="text-muted"> ({log.admin.name})</span>}
                </span>
                <span className="text-xs text-muted">
                  {new Date(log.createdAt).toLocaleString("bn-BD")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
