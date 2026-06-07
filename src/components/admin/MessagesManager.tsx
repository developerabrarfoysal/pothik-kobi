"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { markContactRead, deleteContactMessage } from "@/lib/actions/admin";

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
};

export function MessagesManager({ initial }: { initial: Message[] }) {
  const [messages, setMessages] = useState(initial);

  const handleMarkRead = async (id: string) => {
    await markContactRead(id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("বার্তা মুছে ফেলতে চান?")) return;
    await deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">যোগাযোগ বার্তা</h1>
      <div className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <p className="text-muted">কোনো বার্তা নেই</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`rounded-xl border bg-white p-4 shadow-sm ${!m.isRead ? "border-primary/30 bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{m.name} <span className="font-normal text-muted">&lt;{m.email}&gt;</span></p>
                  {m.subject && <p className="text-sm font-medium">{m.subject}</p>}
                  <p className="mt-2 text-sm">{m.message}</p>
                  <p className="mt-2 text-xs text-muted">{new Date(m.createdAt).toLocaleString("bn-BD")}</p>
                </div>
                <div className="flex gap-2">
                  {!m.isRead && <button onClick={() => handleMarkRead(m.id)} className="rounded border px-2 py-1 text-xs">পঠিত</button>}
                  <button onClick={() => handleDelete(m.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
