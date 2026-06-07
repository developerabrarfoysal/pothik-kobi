"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { deleteMedia, updateMedia } from "@/lib/actions/media";

type Media = {
  id: string;
  storageUrl: string;
  originalName: string;
  altText?: string | null;
  size: number;
  createdAt: string | Date;
};

export function MediaLibrary({ initialMedia }: { initialMedia: Media[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.asset) setMedia((prev) => [data.asset, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই মিডিয়া মুছে ফেলতে চান?")) return;
    await deleteMedia(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const formatSize = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">মিডিয়া লাইব্রেরি</h1>
          <p className="text-sm text-muted">{media.length} ফাইল</p>
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white">
          <Upload className="h-4 w-4" /> {uploading ? "আপলোড..." : "আপলোড"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {media.map((item) => (
          <div key={item.id} className="group overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="relative aspect-square">
              {item.storageUrl.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.storageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Image src={item.storageUrl} alt={item.altText || item.originalName} fill className="object-cover" sizes="200px" />
              )}
              <button onClick={() => handleDelete(item.id)} className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium">{item.originalName}</p>
              <p className="text-xs text-muted">{formatSize(item.size)}</p>
              <input
                defaultValue={item.altText || ""}
                onBlur={(e) => updateMedia(item.id, { altText: e.target.value })}
                placeholder="Alt text"
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
