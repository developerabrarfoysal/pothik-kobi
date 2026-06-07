"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/validations";

type ContactSectionProps = {
  settings: SiteSettings;
  title?: string | null;
};

export function ContactSection({ settings, title }: ContactSectionProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "বার্তা পাঠাতে ব্যর্থ");
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold">{title || "যোগাযোগ"}</h2>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4 text-muted">
            {settings.contactEmail && <p><strong>ইমেইল:</strong> {settings.contactEmail}</p>}
            {settings.contactPhone && <p><strong>ফোন:</strong> {settings.contactPhone}</p>}
            {settings.contactAddress && <p><strong>ঠিকানা:</strong> {settings.contactAddress}</p>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <input required placeholder="আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-4 py-3" />
            <input required type="email" placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border px-4 py-3" />
            <input placeholder="ফোন (ঐচ্ছিক)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border px-4 py-3" />
            <input placeholder="বিষয়" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border px-4 py-3" />
            <textarea required rows={4} placeholder="বার্তা" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border px-4 py-3" />
            <button type="submit" disabled={status === "loading"} className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50">
              {status === "loading" ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </button>
            {status === "success" && <p className="text-center text-sm text-primary">ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে।</p>}
            {status === "error" && <p className="text-center text-sm text-red-600">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
