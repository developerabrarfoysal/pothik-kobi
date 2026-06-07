"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createCategory, updateCategory, deleteCategory, reorderCategories } from "@/lib/actions/writings";

type Category = { id: string; name: string; slug: string; color?: string | null; isVisible: boolean };

function SortableCategory({ cat, onUpdate, onDelete }: { cat: Category; onUpdate: (id: string, data: Partial<Category>) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: cat.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-3 rounded-lg border bg-white p-3">
      <button {...attributes} {...listeners}><GripVertical className="h-4 w-4 text-gray-400" /></button>
      <input value={cat.name} onChange={(e) => onUpdate(cat.id, { name: e.target.value })} className="flex-1 rounded border px-3 py-1.5 text-sm" />
      <input type="color" value={cat.color || "#006A4E"} onChange={(e) => onUpdate(cat.id, { color: e.target.value })} className="h-8 w-8 cursor-pointer" />
      <button onClick={() => onDelete(cat.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleCreate = async () => {
    if (!newName) return;
    const cat = await createCategory({ name: newName, slug: newName, isVisible: true });
    setCategories((prev) => [...prev, cat]);
    setNewName("");
  };

  const handleUpdate = async (id: string, data: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    await updateCategory(id, data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই বিভাগ মুছে ফেলতে চান?")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    await reorderCategories(reordered.map((c) => c.id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">লেখার বিভাগ</h1>
      <div className="mt-6 flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="নতুন বিভাগের নাম" className="rounded-lg border px-4 py-2" />
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"><Plus className="h-4 w-4" /> যোগ</button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-4 space-y-2">
            {categories.map((cat) => <SortableCategory key={cat.id} cat={cat} onUpdate={handleUpdate} onDelete={handleDelete} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
