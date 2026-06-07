import { getAdminPages } from "@/lib/actions/pages";
import { getAdminWritings } from "@/lib/actions/writings";
import Link from "next/link";

export default async function AdminSeoPage() {
  const [pages, writings] = await Promise.all([getAdminPages(), getAdminWritings()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">SEO পরিচালনা</h1>
      <p className="mt-1 text-sm text-muted">প্রতিটি পেজ ও লেখার SEO সম্পাদনা করতে সংশ্লিষ্ট এডিটরে যান</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-bold">পেজ ({pages.length})</h2>
          <div className="mt-3 space-y-2">
            {pages.map((p) => (
              <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-gray-50">
                <span>{p.title}</span>
                <span className="text-xs text-muted">{p.seoMeta?.title || "SEO সেট নেই"}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-bold">লেখা ({writings.length})</h2>
          <div className="mt-3 space-y-2">
            {writings.slice(0, 20).map((w) => (
              <Link key={w.id} href={`/admin/writings/${w.id}`} className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-gray-50">
                <span>{w.title}</span>
                <span className="text-xs text-muted">{w.seoTitle || "SEO সেট নেই"}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
