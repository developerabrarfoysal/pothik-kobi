"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { createNavigationItem, updateNavigationItem, deleteNavigationItem, reorderNavigation } from "@/lib/actions/admin";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type NavItem = { id: string; label: string; href: string; isVisible: boolean };

function SortableNav({ item, onUpdate, onDelete }: { item: NavItem; onUpdate: (id: string, data: Partial<NavItem>) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-3 rounded-lg border bg-white p-3">
      <button {...attributes} {...listeners}><GripVertical className="h-4 w-4 text-gray-400" /></button>
      <input value={item.label} onChange={(e) => onUpdate(item.id, { label: e.target.value })} className="w-32 rounded border px-2 py-1 text-sm" />
      <input value={item.href} onChange={(e) => onUpdate(item.id, { href: e.target.value })} className="flex-1 rounded border px-2 py-1 text-sm" />
      <button onClick={() => onDelete(item.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

export function NavigationManager({ initial }: { initial: NavItem[] }) {
  const [items, setItems] = useState(initial.flatMap((n) => [n]));
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  const handleCreate = async () => {
    if (!label || !href) return;
    const item = await createNavigationItem({ label, href, isVisible: true });
    setItems((prev) => [...prev, item]);
    setLabel("");
    setHref("");
  };

  const handleUpdate = async (id: string, data: Partial<NavItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
    await updateNavigationItem(id, data);
  };

  const handleDelete = async (id: string) => {
    await deleteNavigationItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await reorderNavigation(reordered.map((i) => i.id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">নেভিগেশন</h1>
      <div className="mt-6 flex gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="লেবেল" className="rounded-lg border px-4 py-2" />
        <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/path" className="rounded-lg border px-4 py-2" />
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"><Plus className="h-4 w-4" /> যোগ</button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-4 space-y-2">
            {items.map((item) => <SortableNav key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
