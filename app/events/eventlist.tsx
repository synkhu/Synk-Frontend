"use client";

import { deleteEvent, updateEvent } from "../services/event.Service";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventList({ events = [] }: { events?: { id: number; name: string }[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  async function save(id: number) {
    await updateEvent(id, name);
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: number) {
    await deleteEvent(id);
    router.refresh();
  }

  return (
    <ul>
      {!events || events.length === 0 ? <li>No events found</li> : events.map((e) => (
        <li key={e.id}>
          {editingId === e.id ? (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <button onClick={() => save(e.id)}>Save</button>
            </>
          ) : (
            <>
              {e.name}
              <button onClick={() => {
                setEditingId(e.id);
                setName(e.name);
              }}>
                Edit
              </button>
              <button onClick={() => remove(e.id)}>Delete</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
