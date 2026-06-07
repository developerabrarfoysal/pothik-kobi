"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { X, Upload, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaAsset = {
  id: string;
  storageUrl: string;
  altText?: string | null;
  originalName: string;
  width?: number | null;
  height?: number | null;
};

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
  selectedId?: string | null;
};

export function MediaPicker({ open, onClose, onSelect, selectedId }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setMedia(data.items || []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  if (open && !loaded && !loading) {
    loadMedia();
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.asset) {
        setMedia((prev) => [data.asset, ...prev]);
        onSelect(data.asset);
        onClose();
      }
    } finally {
      setUploading(false);
    }
  };

  const filtered = media.filter(
    (m) =>
      m.originalName.toLowerCase().includes(search.toLowerCase()) ||
      m.altText?.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">মিডিয়া লাইব্রেরি</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b px-6 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ছবি খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <Upload className="h-4 w-4" />
            {uploading ? "আপলোড হচ্ছে..." : "আপলোড"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-gray-500">লোড হচ্ছে...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500">কোনো মিডিয়া নেই। আপলোড করুন।</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg",
                    selectedId === item.id ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                  )}
                >
                  {item.storageUrl.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.storageUrl} alt={item.altText || ""} className="h-full w-full object-cover" />
                  ) : (
                    <Image src={item.storageUrl} alt={item.altText || item.originalName} fill className="object-cover" sizes="200px" />
                  )}
                  {selectedId === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <Check className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="truncate text-xs text-white">{item.originalName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type MediaPickerFieldProps = {
  value?: string | null;
  media?: MediaAsset | null;
  onChange: (mediaId: string | null, media?: MediaAsset) => void;
  label?: string;
};

export function MediaPickerField({ value, media, onChange, label }: MediaPickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-gray-50">
          {media?.storageUrl ? (
            media.storageUrl.startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.storageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image src={media.storageUrl} alt="" fill className="object-cover" sizes="96px" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">ছবি নেই</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            ছবি নির্বাচন
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg border px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              সরান
            </button>
          )}
        </div>
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => onChange(m.id, m)}
        selectedId={value}
      />
    </div>
  );
}
