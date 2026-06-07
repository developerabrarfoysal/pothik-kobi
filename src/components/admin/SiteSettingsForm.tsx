"use client";

import { useState } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { saveSiteSettings } from "@/lib/actions/admin";
import { MediaPickerField } from "./MediaPicker";
import type { SiteSettings } from "@/lib/validations";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveSiteSettings(form);
      setStatus({ type: "success", message: "সেটিংস সংরক্ষিত হয়েছে" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ" });
    } finally {
      setSaving(false);
    }
  };

  const updateSocial = (index: number, field: "platform" | "url", value: string) => {
    const links = [...form.socialLinks];
    links[index] = { ...links[index], [field]: value };
    setForm({ ...form, socialLinks: links });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">সাইট সেটিংস</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white">
          <Save className="h-4 w-4" /> {saving ? "সংরক্ষণ..." : "সংরক্ষণ"}
        </button>
      </div>

      {status && (
        <div className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-bold">সাধারণ</h2>
          <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} placeholder="সাইটের নাম" className="w-full rounded border px-3 py-2" />
          <input value={form.siteTagline} onChange={(e) => setForm({ ...form, siteTagline: e.target.value })} placeholder="ট্যাগলাইন" className="w-full rounded border px-3 py-2" />
          <input value={form.writerName} onChange={(e) => setForm({ ...form, writerName: e.target.value })} placeholder="লেখকের নাম" className="w-full rounded border px-3 py-2" />
          <textarea value={form.writerBio} onChange={(e) => setForm({ ...form, writerBio: e.target.value })} placeholder="লেখক পরিচিতি" className="w-full rounded border px-3 py-2" rows={4} />
          <input value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} placeholder="ফুটার টেক্সট" className="w-full rounded border px-3 py-2" />
          <MediaPickerField value={form.logoId} onChange={(id) => setForm({ ...form, logoId: id })} label="লোগো" />
          <MediaPickerField value={form.faviconId} onChange={(id) => setForm({ ...form, faviconId: id })} label="ফ্যাভিকন" />
          <MediaPickerField value={form.writerPhotoId} onChange={(id) => setForm({ ...form, writerPhotoId: id })} label="লেখকের ছবি" />
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-bold">রঙ</h2>
          <div className="grid grid-cols-3 gap-4">
            {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
              <div key={key}>
                <label className="text-xs text-muted">{key === "primaryColor" ? "সবুজ" : key === "secondaryColor" ? "লাল" : "নীল"}</label>
                <input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 h-10 w-full cursor-pointer" />
              </div>
            ))}
          </div>

          <h2 className="mt-4 font-bold">যোগাযোগ</h2>
          <input value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="ইমেইল" className="w-full rounded border px-3 py-2" />
          <input value={form.contactPhone || ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="ফোন" className="w-full rounded border px-3 py-2" />
          <input value={form.contactAddress || ""} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} placeholder="ঠিকানা" className="w-full rounded border px-3 py-2" />

          <h2 className="mt-4 font-bold">সোশ্যাল লিংক</h2>
          {form.socialLinks.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input value={link.platform} onChange={(e) => updateSocial(i, "platform", e.target.value)} placeholder="প্ল্যাটফর্ম" className="w-1/3 rounded border px-3 py-2 text-sm" />
              <input value={link.url} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="URL" className="flex-1 rounded border px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
