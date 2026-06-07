"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createVideo, deleteVideo } from "@/lib/actions/admin";
import { LazyVideoPlayer } from "@/components/shared/LazyVideoPlayer";

type Video = {
  id: string;
  title?: string | null;
  originalUrl: string;
  embedUrl: string;
  thumbnail?: string | null;
  provider: string;
  writing?: { title: string } | null;
};

export function VideosManager({ initial }: { initial: Video[] }) {
  const [videos, setVideos] = useState(initial);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const handleAdd = async () => {
    if (!url) return;
    const video = await createVideo({ originalUrl: url, title: title || undefined });
    setVideos((prev) => [video, ...prev]);
    setUrl("");
    setTitle("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ভিডিও মুছে ফেলতে চান?")) return;
    await deleteVideo(id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">ভিডিও</h1>
      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="শিরোনাম (ঐচ্ছিক)" className="rounded-lg border px-4 py-2" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube/Facebook URL" className="flex-1 rounded-lg border px-4 py-2" />
          <button onClick={handleAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"><Plus className="h-4 w-4" /> যোগ</button>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {videos.map((v) => (
          <div key={v.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{v.title || "শিরোনাম নেই"}</p>
                <p className="text-xs text-muted">{v.provider} • {v.writing?.title || "স্বতন্ত্র"}</p>
              </div>
              <button onClick={() => handleDelete(v.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-3">
              <LazyVideoPlayer embedUrl={v.embedUrl} thumbnail={v.thumbnail} title={v.title} provider={v.provider} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
