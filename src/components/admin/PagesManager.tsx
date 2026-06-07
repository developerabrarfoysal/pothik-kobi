"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import { createPage, deletePage } from "@/lib/actions/pages";

type Page = {
  id: string;
  title: string;
  slug: string;
  status: string;
  isHomepage: boolean;
  _count: { sections: number };
};

export function PagesManager({ initialPages }: { initialPages: Page[] }) {
  const [pages, setPages] = useState(initialPages);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const handleCreate = async () => {
    if (!title) return;
    setCreating(true);
    try {
      const page = await createPage({ title, slug: slug || undefined, status: "DRAFT" });
      window.location.href = `/admin/pages/${page.id}`;
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`"${pageTitle}" পেজ মুছে ফেলতে চান?`)) return;
    await deletePage(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">পেজ</h1>
          <p className="text-sm text-muted">ডাইনামিক পেজ তৈরি ও সম্পাদনা</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">নতুন পেজ</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input placeholder="পেজ শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border px-4 py-2" />
          <input placeholder="স্লাগ (ঐচ্ছিক)" value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-lg border px-4 py-2" />
          <button onClick={handleCreate} disabled={creating} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white">
            <Plus className="h-4 w-4" /> {creating ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">শিরোনাম</th>
              <th className="px-4 py-3 text-left">স্লাগ</th>
              <th className="px-4 py-3 text-left">অবস্থা</th>
              <th className="px-4 py-3 text-left">সেকশন</th>
              <th className="px-4 py-3 text-right">কার্যক্রম</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {page.title}
                  {page.isHomepage && <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">হোম</span>}
                </td>
                <td className="px-4 py-3 text-muted">/{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${page.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {page.status === "PUBLISHED" ? "প্রকাশিত" : "খসড়া"}
                  </span>
                </td>
                <td className="px-4 py-3">{page._count.sections}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/${page.isHomepage ? "" : page.slug}`} target="_blank" className="rounded p-1.5 hover:bg-gray-100"><Eye className="h-4 w-4" /></Link>
                    <Link href={`/admin/pages/${page.id}`} className="rounded p-1.5 hover:bg-gray-100"><Edit className="h-4 w-4" /></Link>
                    {!page.isHomepage && (
                      <button onClick={() => handleDelete(page.id, page.title)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
