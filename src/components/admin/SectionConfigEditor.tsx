"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

type GridItem = { title: string; content: string };
type CardItem = { title: string; excerpt: string; href?: string };
type VideoItem = { embedUrl: string; thumbnail?: string; title?: string; provider?: string };

type SectionConfigEditorProps = {
  type: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
};

export function SectionConfigEditor({ type, config, onChange }: SectionConfigEditorProps) {
  const update = (patch: Record<string, unknown>) => onChange({ ...config, ...patch });

  if (type === "QUOTE_BLOCK") {
    return (
      <div className="space-y-2">
        <textarea placeholder="উক্তি/কবিতা" value={String(config.quote || "")} onChange={(e) => update({ quote: e.target.value })} className="w-full rounded border px-3 py-2 text-sm" rows={3} />
        <input placeholder="লেখক" value={String(config.author || "মুজাহিদ প্রিন্স")} onChange={(e) => update({ author: e.target.value })} className="w-full rounded border px-3 py-2 text-sm" />
      </div>
    );
  }

  if (type === "CUSTOM_RICH_TEXT" || type === "HTML_SAFE_BLOCK") {
    return <RichTextEditor content={String(config.html || "")} onChange={(html) => update({ html })} />;
  }

  if (type === "CTA_BLOCK") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <input placeholder="শিরোনাম" value={String(config.heading || "")} onChange={(e) => update({ heading: e.target.value })} className="rounded border px-3 py-2 text-sm" />
        <input placeholder="বাটন লিংক (/writings)" value={String(config.buttonHref || "")} onChange={(e) => update({ buttonHref: e.target.value })} className="rounded border px-3 py-2 text-sm" />
        <input placeholder="বাটন টেক্সট" value={String(config.buttonText || "")} onChange={(e) => update({ buttonText: e.target.value })} className="rounded border px-3 py-2 text-sm" />
        <textarea placeholder="বিবরণ" value={String(config.text || "")} onChange={(e) => update({ text: e.target.value })} className="rounded border px-3 py-2 text-sm sm:col-span-2" rows={2} />
      </div>
    );
  }

  if (type === "FEATURED_WRITINGS" || type === "LATEST_WRITINGS") {
    return (
      <label className="flex items-center gap-2 text-sm">
        প্রদর্শন সংখ্যা
        <input type="number" min={1} max={24} value={Number(config.limit) || 6} onChange={(e) => update({ limit: Number(e.target.value) })} className="w-20 rounded border px-2 py-1" />
      </label>
    );
  }

  if (type === "IMAGE_GALLERY") {
    return (
      <input
        placeholder="অ্যালবাম স্লাগ (যেমন: sahitto-chobi)"
        value={String(config.albumSlug || "")}
        onChange={(e) => update({ albumSlug: e.target.value })}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    );
  }

  if (type === "ABOUT_WRITER") {
    return (
      <div className="space-y-2">
        <input placeholder="নাম (ঐচ্ছিক)" value={String(config.name || "")} onChange={(e) => update({ name: e.target.value })} className="w-full rounded border px-3 py-2 text-sm" />
        <textarea placeholder="বিবরণ (ঐচ্ছিক)" value={String(config.bio || "")} onChange={(e) => update({ bio: e.target.value })} className="w-full rounded border px-3 py-2 text-sm" rows={3} />
        <p className="text-xs text-muted">ফাঁকা রাখলে সাইট সেটিংস থেকে লোড হবে</p>
      </div>
    );
  }

  if (type === "CUSTOM_GRID") {
    const items = (config.items as GridItem[]) || [];
    return (
      <GridCardsEditor
        items={items}
        onChange={(next) => update({ items: next })}
        fields={["title", "content"]}
        labels={["শিরোনাম", "বিষয়বস্তু"]}
      />
    );
  }

  if (type === "CUSTOM_CARDS") {
    const cards = (config.cards as CardItem[]) || [];
    return (
      <GridCardsEditor
        items={cards}
        onChange={(next) => update({ cards: next })}
        fields={["title", "excerpt", "href"]}
        labels={["শিরোনাম", "সংক্ষিপ্ত", "লিংক (ঐচ্ছিক)"]}
      />
    );
  }

  if (type === "VIDEO_GALLERY") {
    return <VideoGalleryEditor config={config} onChange={onChange} />;
  }

  if (type === "CONTACT_BLOCK") {
    return <p className="text-xs text-muted">যোগাযোগ ফর্ম সাইট সেটিংস থেকে তথ্য নেয়।</p>;
  }

  return null;
}

function VideoGalleryEditor({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const videos = (config.videos as VideoItem[]) || [];
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const addVideo = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/parse-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange({ ...config, videos: [...videos, data.video] });
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "অবৈধ URL");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube/Facebook URL" className="flex-1 rounded border px-3 py-2 text-sm" />
        <button type="button" onClick={addVideo} className="rounded bg-primary px-3 py-2 text-sm text-white">যোগ</button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="space-y-1">
        {videos.map((v, i) => (
          <div key={i} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
            <span className="truncate">{v.title || v.embedUrl}</span>
            <button type="button" onClick={() => onChange({ ...config, videos: videos.filter((_, idx) => idx !== i) })} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridCardsEditor({
  items,
  onChange,
  fields,
  labels,
}: {
  items: Record<string, string>[];
  onChange: (items: Record<string, string>[]) => void;
  fields: string[];
  labels: string[];
}) {
  const addItem = () => onChange([...items, Object.fromEntries(fields.map((f) => [f, ""]))]);
  const updateItem = (index: number, field: string, value: string) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded border p-3">
          <div className="mb-2 flex justify-between">
            <span className="text-xs font-medium">আইটেম {i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
          </div>
          {fields.map((field, fi) => (
            <input
              key={field}
              placeholder={labels[fi]}
              value={item[field] || ""}
              onChange={(e) => updateItem(i, field, e.target.value)}
              className="mb-2 w-full rounded border px-3 py-2 text-sm last:mb-0"
            />
          ))}
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-primary"><Plus className="h-4 w-4" /> আইটেম যোগ</button>
    </div>
  );
}
