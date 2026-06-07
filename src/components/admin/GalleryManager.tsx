"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createGalleryAlbum, deleteGalleryAlbum, addGalleryItem, deleteGalleryItem } from "@/lib/actions/admin";
import { MediaPicker } from "./MediaPicker";
import Image from "next/image";

type Album = {
  id: string;
  title: string;
  slug: string;
  items: { id: string; media: { id: string; storageUrl: string; originalName: string } }[];
};

export function GalleryManager({ initial }: { initial: Album[] }) {
  const [albums, setAlbums] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

  const handleCreateAlbum = async () => {
    if (!newTitle) return;
    const album = await createGalleryAlbum({ title: newTitle, slug: newTitle, isVisible: true });
    setAlbums((prev) => [...prev, { ...album, items: [] }]);
    setNewTitle("");
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("এই অ্যালবাম মুছে ফেলতে চান?")) return;
    await deleteGalleryAlbum(id);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddItem = async (media: { id: string; storageUrl: string; originalName: string }) => {
    if (!activeAlbum) return;
    const item = await addGalleryItem(activeAlbum, media.id);
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === activeAlbum ? { ...a, items: [...a.items, { id: item.id, media }] } : a
      )
    );
    setPickerOpen(false);
  };

  const handleDeleteItem = async (albumId: string, itemId: string) => {
    await deleteGalleryItem(itemId);
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, items: a.items.filter((i) => i.id !== itemId) } : a))
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">গ্যালারি</h1>
      <div className="mt-6 flex gap-2">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="নতুন অ্যালবাম" className="rounded-lg border px-4 py-2" />
        <button onClick={handleCreateAlbum} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"><Plus className="h-4 w-4" /> তৈরি</button>
      </div>

      <div className="mt-6 space-y-6">
        {albums.map((album) => (
          <div key={album.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{album.title}</h2>
              <div className="flex gap-2">
                <button onClick={() => { setActiveAlbum(album.id); setPickerOpen(true); }} className="rounded-lg border px-3 py-1.5 text-sm">ছবি যোগ</button>
                <button onClick={() => handleDeleteAlbum(album.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {album.items.map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
                  {item.media.storageUrl.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.media.storageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={item.media.storageUrl} alt="" fill className="object-cover" sizes="150px" />
                  )}
                  <button onClick={() => handleDeleteItem(album.id, item.id)} className="absolute right-1 top-1 rounded bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleAddItem} />
    </div>
  );
}
