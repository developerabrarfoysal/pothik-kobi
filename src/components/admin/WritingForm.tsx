"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { createWriting, updateWriting } from "@/lib/actions/writings";
import { createVideo, deleteVideo } from "@/lib/actions/admin";
import { addWritingGalleryItem, deleteWritingGalleryItem, createTag } from "@/lib/actions/writings";
import { RichTextEditor } from "./RichTextEditor";
import { MediaPickerField, MediaPicker } from "./MediaPicker";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type Video = { id: string; title?: string | null; originalUrl: string; provider: string };
type GalleryItem = { id: string; caption?: string | null; media: { id: string; storageUrl: string; originalName: string } };

type WritingFormProps = {
  categories: Category[];
  tags: Tag[];
  writing?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    status: string;
    categoryId?: string | null;
    featuredImageId?: string | null;
    featuredImage?: { storageUrl: string } | null;
    ogImageId?: string | null;
    ogImage?: { storageUrl: string } | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    tags?: { tag: Tag }[];
    videos?: Video[];
    galleryItems?: GalleryItem[];
  };
};

export function WritingForm({ categories, tags: initialTags, writing }: WritingFormProps) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [form, setForm] = useState({
    title: writing?.title || "",
    slug: writing?.slug || "",
    excerpt: writing?.excerpt || "",
    content: writing?.content || "",
    status: writing?.status || "DRAFT",
    categoryId: writing?.categoryId || "",
    featuredImageId: writing?.featuredImageId || null as string | null,
    ogImageId: writing?.ogImageId || null as string | null,
    seoTitle: writing?.seoTitle || "",
    seoDescription: writing?.seoDescription || "",
    tagIds: writing?.tags?.map((t) => t.tag.id) || [] as string[],
  });
  const [featuredImage, setFeaturedImage] = useState(writing?.featuredImage);
  const [ogImage, setOgImage] = useState(writing?.ogImage);
  const [videos, setVideos] = useState(writing?.videos || []);
  const [galleryItems, setGalleryItems] = useState(writing?.galleryItems || []);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [newTag, setNewTag] = useState("");
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload = { ...form, categoryId: form.categoryId || null, content: form.content };
      if (writing) {
        await updateWriting(writing.id, payload);
        setStatus({ type: "success", message: "লেখা সংরক্ষিত হয়েছে" });
      } else {
        const created = await createWriting(payload);
        router.push(`/admin/writings/${created.id}`);
      }
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddVideo = async () => {
    if (!videoUrl || !writing) return;
    setVideoError("");
    try {
      const video = await createVideo({ originalUrl: videoUrl, writingId: writing.id });
      setVideos((prev) => [...prev, video]);
      setVideoUrl("");
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "অবৈধ ভিডিও URL");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("ভিডিও মুছে ফেলতে চান?")) return;
    await deleteVideo(id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const tag = await createTag(newTag.trim());
    setTags((prev) => [...prev.filter((t) => t.id !== tag.id), tag]);
    setForm((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }));
    setNewTag("");
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleAddGallery = async (media: { id: string; storageUrl: string; originalName: string }) => {
    if (!writing) return;
    const item = await addWritingGalleryItem(writing.id, media.id);
    setGalleryItems((prev) => [...prev, { id: item.id, media }]);
    setGalleryPickerOpen(false);
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("গ্যালারি ছবি মুছে ফেলতে চান?")) return;
    await deleteWritingGalleryItem(id);
    setGalleryItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/writings" className="text-sm text-primary hover:underline">← লেখা তালিকা</Link>
          <h1 className="text-2xl font-bold">{writing ? "লেখা সম্পাদনা" : "নতুন লেখা"}</h1>
        </div>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="শিরোনাম" className="w-full rounded-lg border px-4 py-3 text-lg font-bold" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="স্লাগ (ইংরেজি/বাংলা)" className="w-full rounded-lg border px-4 py-2" />
          <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="সংক্ষিপ্ত বিবরণ" className="w-full rounded-lg border px-4 py-2" rows={2} />
          <RichTextEditor content={form.content} onChange={(content) => setForm({ ...form, content })} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="font-bold">প্রকাশনা</h3>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-2 w-full rounded border px-3 py-2">
              <option value="DRAFT">খসড়া</option>
              <option value="PUBLISHED">প্রকাশিত</option>
            </select>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-2 w-full rounded border px-3 py-2">
              <option value="">বিভাগ নির্বাচন</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <MediaPickerField
              value={form.featuredImageId}
              media={featuredImage ? { id: form.featuredImageId!, storageUrl: featuredImage.storageUrl, originalName: "" } : null}
              onChange={(id, media) => { setForm({ ...form, featuredImageId: id }); if (media) setFeaturedImage({ storageUrl: media.storageUrl }); }}
              label="ফিচার্ড ছবি"
            />
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="font-bold">SEO</h3>
            <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="SEO শিরোনাম" className="mt-2 w-full rounded border px-3 py-2 text-sm" />
            <textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="SEO বিবরণ" className="mt-2 w-full rounded border px-3 py-2 text-sm" rows={2} />
            <div className="mt-3">
              <MediaPickerField
                value={form.ogImageId}
                media={ogImage ? { id: form.ogImageId!, storageUrl: ogImage.storageUrl, originalName: "" } : null}
                onChange={(id, media) => { setForm({ ...form, ogImageId: id }); if (media) setOgImage({ storageUrl: media.storageUrl }); }}
                label="OG ছবি"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="font-bold">ট্যাগ</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-3 py-1 text-xs ${form.tagIds.includes(tag.id) ? "bg-primary text-white" : "bg-gray-100"}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="নতুন ট্যাগ" className="flex-1 rounded border px-2 py-1 text-sm" />
              <button type="button" onClick={handleAddTag} className="rounded bg-primary px-3 py-1 text-sm text-white">যোগ</button>
            </div>
          </div>

          {writing && (
            <>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h3 className="font-bold">ভিডিও</h3>
                <div className="mt-2 flex gap-2">
                  <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube/Facebook URL" className="flex-1 rounded border px-3 py-2 text-sm" />
                  <button type="button" onClick={handleAddVideo} className="rounded bg-primary px-3 py-2 text-sm text-white">যোগ</button>
                </div>
                {videoError && <p className="mt-1 text-xs text-red-600">{videoError}</p>}
                <div className="mt-3 space-y-2">
                  {videos.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded border p-2 text-xs">
                      <span className="truncate">{v.title || v.originalUrl}</span>
                      <button type="button" onClick={() => handleDeleteVideo(v.id)} className="text-red-600">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">গ্যালারি</h3>
                  <button type="button" onClick={() => setGalleryPickerOpen(true)} className="text-sm text-primary">ছবি যোগ</button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.media.storageUrl} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => handleDeleteGallery(item.id)} className="absolute right-1 top-1 rounded bg-red-500 px-1 text-xs text-white">×</button>
                    </div>
                  ))}
                </div>
                <MediaPicker open={galleryPickerOpen} onClose={() => setGalleryPickerOpen(false)} onSelect={handleAddGallery} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
