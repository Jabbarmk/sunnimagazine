"use client";

import { useState, useEffect } from "react";
import { getEvents, saveEvent, deleteEvent } from "@/lib/api";
import type { EventItem } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";

const EMPTY = { title: "", description: "", poster: "", eventDate: "" };

function fmtDate(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      setEvents(await getEvents());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, []);

  const reset = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); };

  const set = (k: keyof typeof EMPTY) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleEdit = (ev: EventItem) => {
    setEditId(ev.id);
    setForm({ title: ev.title, description: ev.description, poster: ev.poster, eventDate: ev.eventDate });
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (Object.keys(errs).length) { setFe(errs); return; }
    try {
      await saveEvent({
        id: editId ?? "evt_" + Date.now(),
        title: form.title.trim(),
        description: form.description.trim(),
        poster: form.poster,
        eventDate: form.eventDate,
      });
      reset(); reload();
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id); reload();
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">Events</h1>
        <p className="text-[13px] text-gray-500 mt-1">{loading ? "Loading…" : `${events.length} events`}</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Event" : "Add Event"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={set("title")} placeholder="Event title" className={inp("title")} />
            {fe.title && <p className="text-[11px] text-red-500 mt-1">{fe.title}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Event Date</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={set("eventDate")}
              className={inp("eventDate")}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Poster Image</label>
            <ImageUpload value={form.poster || null} onChange={(v) => setForm((f) => ({ ...f, poster: v }))} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Event details…"
              rows={4} className={`${inp("description")} resize-y`} />
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
              {editId ? "Save Changes" : "Add Event"}
            </button>
            {editId && (
              <button onClick={reset}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <SkeletonRows count={3} hasImage />
      ) : (
        <div className="space-y-3">
          {events.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400">
              No events yet. Add one above.
            </div>
          )}
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl border border-gray-200 flex items-start gap-3 p-3">
              {ev.poster ? (
                <img src={ev.poster} alt={ev.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[22px]">📅</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-800 line-clamp-1">{ev.title}</div>
                {ev.eventDate && (
                  <div className="text-[11px] text-amber-600 font-medium mt-0.5">{fmtDate(ev.eventDate)}</div>
                )}
                {ev.description && <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{ev.description}</div>}
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => handleEdit(ev)} className="text-[12px] text-gray-400 hover:text-gray-700">Edit</button>
                <button onClick={() => handleDelete(ev.id)} className="text-[12px] text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
