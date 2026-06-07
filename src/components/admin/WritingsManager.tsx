"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import { deleteWriting, toggleWritingStatus } from "@/lib/actions/writings";

type Writing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category?: { name: string } | null;
  publishedAt?: Date | string | null;
};

export function WritingsManager({ writings: initial }: { writings: Writing[] }) {
  const [writings, setWritings] = useState(initial);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" মুছে ফেলতে চান?`)) return;
    await deleteWriting(id);
    setWritings((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggle = async (id: string, current: string) => {
    const newStatus = current === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await toggleWritingStatus(id, newStatus as "DRAFT" | "PUBLISHED");
    setWritings((prev) => prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">লেখালেখি</h1>
          <p className="text-sm text-muted">কবিতা, গল্প ও সাহিত্য পরিচালনা</p>
        </div>
        <Link href="/admin/writings/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white">
          <Plus className="h-4 w-4" /> নতুন লেখা
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">শিরোনাম</th>
              <th className="px-4 py-3 text-left">বিভাগ</th>
              <th className="px-4 py-3 text-left">অবস্থা</th>
              <th className="px-4 py-3 text-right">কার্যক্রম</th>
            </tr>
          </thead>
          <tbody>
            {writings.map((w) => (
              <tr key={w.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{w.title}</td>
                <td className="px-4 py-3 text-muted">{w.category?.name || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(w.id, w.status)} className={`rounded-full px-2 py-0.5 text-xs ${w.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {w.status === "PUBLISHED" ? "প্রকাশিত" : "খসড়া"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {w.status === "PUBLISHED" && (
                      <Link href={`/writings/${w.slug}`} target="_blank" className="rounded p-1.5 hover:bg-gray-100"><Eye className="h-4 w-4" /></Link>
                    )}
                    <Link href={`/admin/writings/${w.id}`} className="rounded p-1.5 hover:bg-gray-100"><Edit className="h-4 w-4" /></Link>
                    <button onClick={() => handleDelete(w.id, w.title)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {writings.length === 0 && <p className="p-8 text-center text-muted">কোনো লেখা নেই</p>}
      </div>
    </div>
  );
}
