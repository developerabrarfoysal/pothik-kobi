"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Eye, Save, CheckCircle, AlertCircle } from "lucide-react";
import {
  updatePage, updatePageHero, createPageSection, updatePageSection, deletePageSection, reorderPageSections, updatePageSeo,
} from "@/lib/actions/pages";
import { MediaPickerField } from "./MediaPicker";
import { SectionConfigEditor } from "./SectionConfigEditor";

const SECTION_TYPES = [
  { value: "HERO_3D", label: "৩D হিরো" },
  { value: "FEATURED_WRITINGS", label: "নির্বাচিত লেখা" },
  { value: "LATEST_WRITINGS", label: "সাম্প্রতিক লেখা" },
  { value: "CATEGORY_TABS", label: "বিভাগ ট্যাব" },
  { value: "ABOUT_WRITER", label: "লেখক পরিচিতি" },
  { value: "QUOTE_BLOCK", label: "উক্তি/কবিতা" },
  { value: "IMAGE_GALLERY", label: "ছবি গ্যালারি" },
  { value: "VIDEO_GALLERY", label: "ভিডিও গ্যালারি" },
  { value: "CUSTOM_RICH_TEXT", label: "রিচ টেক্সট" },
  { value: "CUSTOM_GRID", label: "কাস্টম গ্রিড" },
  { value: "CUSTOM_CARDS", label: "কাস্টম কার্ড" },
  { value: "CONTACT_BLOCK", label: "যোগাযোগ" },
  { value: "CTA_BLOCK", label: "CTA ব্লক" },
];

type Section = {
  id: string;
  type: string;
  title?: string | null;
  sortOrder: number;
  isVisible: boolean;
  config: Record<string, unknown>;
};

type Page = {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt?: string | null;
  isHomepage?: boolean;
  hero?: {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    backgroundImageId?: string | null;
    backgroundImage?: { storageUrl: string } | null;
  } | null;
  sections: Section[];
  seoMeta?: {
    title?: string | null;
    description?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
    ogImageId?: string | null;
    ogImage?: { storageUrl: string } | null;
  } | null;
};

function SortableSection({ section, onUpdate, onDelete }: {
  section: Section;
  onUpdate: (id: string, data: Partial<Section>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 cursor-grab text-gray-400"><GripVertical className="h-5 w-5" /></button>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}
            </span>
            <input
              value={section.title || ""}
              onChange={(e) => onUpdate(section.id, { title: e.target.value })}
              placeholder="সেকশন শিরোনাম (ঐচ্ছিক)"
              className="flex-1 rounded border px-3 py-1.5 text-sm"
            />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={section.isVisible} onChange={(e) => onUpdate(section.id, { isVisible: e.target.checked })} />
              দৃশ্যমান
            </label>
            <button type="button" onClick={() => onDelete(section.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
          <SectionConfigEditor
            type={section.type}
            config={section.config || {}}
            onChange={(config) => onUpdate(section.id, { config })}
          />
        </div>
      </div>
    </div>
  );
}

export function PageEditor({ page: initialPage }: { page: Page }) {
  const [page, setPage] = useState(initialPage);
  const [sections, setSections] = useState(initialPage.sections);
  const [hero, setHero] = useState(initialPage.hero);
  const [seo, setSeo] = useState(initialPage.seoMeta || {});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [newSectionType, setNewSectionType] = useState("FEATURED_WRITINGS");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const previewHref = page.isHomepage || page.slug === "home" ? "/" : `/${page.slug}`;

  const handleSavePage = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await updatePage(page.id, {
        title: page.title,
        slug: page.slug,
        excerpt: page.excerpt || undefined,
        status: page.status as "DRAFT" | "PUBLISHED",
      });
      if (hero) await updatePageHero(page.id, hero);
      for (const section of sections) {
        await updatePageSection(section.id, {
          type: section.type,
          title: section.title,
          isVisible: section.isVisible,
          config: section.config,
        });
      }
      await updatePageSeo(page.id, {
        title: seo.title || undefined,
        description: seo.description || undefined,
        canonicalUrl: seo.canonicalUrl || undefined,
        ogImageId: seo.ogImageId || null,
        noIndex: seo.noIndex || false,
      });
      setStatus({ type: "success", message: "পেজ সংরক্ষিত হয়েছে" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    try {
      const section = await createPageSection(page.id, { type: newSectionType, isVisible: true, config: {} });
      setSections((prev) => [...prev, { ...section, config: section.config as Record<string, unknown> }]);
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "সেকশন যোগ ব্যর্থ" });
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("এই সেকশন মুছে ফেলতে চান?")) return;
    await deletePageSection(id);
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);
    await reorderPageSections(page.id, reordered.map((s) => s.id));
  };

  const updateSectionLocal = (id: string, data: Partial<Section>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...data, config: data.config ?? s.config } : s)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/pages" className="text-sm text-primary hover:underline">← পেজ তালিকা</Link>
          <h1 className="text-2xl font-bold">{page.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={previewHref} target="_blank" className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm">
            <Eye className="h-4 w-4" /> প্রিভিউ
          </Link>
          <button onClick={handleSavePage} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white">
            <Save className="h-4 w-4" /> {saving ? "সংরক্ষণ..." : "সংরক্ষণ"}
          </button>
        </div>
      </div>

      {status && (
        <div className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-bold">পেজ তথ্য</h2>
          <input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="শিরোনাম" />
          <input value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="স্লাগ" />
          <textarea value={page.excerpt || ""} onChange={(e) => setPage({ ...page, excerpt: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="সংক্ষিপ্ত বিবরণ" rows={2} />
          <select value={page.status} onChange={(e) => setPage({ ...page, status: e.target.value })} className="w-full rounded border px-3 py-2">
            <option value="DRAFT">খসড়া</option>
            <option value="PUBLISHED">প্রকাশিত</option>
          </select>
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-bold">হিরো ব্যানার</h2>
          {hero && (
            <>
              <input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="হিরো শিরোনাম" />
              <input value={hero.subtitle || ""} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="উপশিরোনাম" />
              <textarea value={hero.description || ""} onChange={(e) => setHero({ ...hero, description: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="বিবরণ" rows={2} />
              <MediaPickerField
                value={hero.backgroundImageId}
                media={hero.backgroundImage ? { id: hero.backgroundImageId!, storageUrl: hero.backgroundImage.storageUrl, originalName: "" } : null}
                onChange={(id) => setHero({ ...hero, backgroundImageId: id })}
                label="পটভূমি ছবি"
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-bold">SEO</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={seo.title || ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} placeholder="SEO শিরোনাম" className="rounded border px-3 py-2 text-sm" />
          <input value={seo.canonicalUrl || ""} onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })} placeholder="Canonical URL (ঐচ্ছিক)" className="rounded border px-3 py-2 text-sm" />
          <textarea value={seo.description || ""} onChange={(e) => setSeo({ ...seo, description: e.target.value })} placeholder="SEO বিবরণ" className="rounded border px-3 py-2 text-sm md:col-span-2" rows={2} />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={seo.noIndex || false} onChange={(e) => setSeo({ ...seo, noIndex: e.target.checked })} />
            noindex (সার্চ ইঞ্জিনে দেখাবেন না)
          </label>
          <MediaPickerField
            value={seo.ogImageId}
            media={seo.ogImage ? { id: seo.ogImageId!, storageUrl: seo.ogImage.storageUrl, originalName: "" } : null}
            onChange={(id) => setSeo({ ...seo, ogImageId: id })}
            label="OG ছবি"
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">পেজ সেকশন ({sections.length})</h2>
          <div className="flex gap-2">
            <select value={newSectionType} onChange={(e) => setNewSectionType(e.target.value)} className="rounded border px-3 py-2 text-sm">
              {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button onClick={handleAddSection} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white">
              <Plus className="h-4 w-4" /> সেকশন যোগ
            </button>
          </div>
        </div>

        {sections.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted">কোনো সেকশন নেই — উপর থেকে সেকশন যোগ করুন</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="mt-4 space-y-3">
              {sections.map((section) => (
                <SortableSection key={section.id} section={section} onUpdate={updateSectionLocal} onDelete={handleDeleteSection} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
