"use client";

import { deleteArtist, updateArtist } from "../services/artist.Service";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArtistList({ artists = [] }: { artists?: { id: number; name: string }[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  async function save(id: number) {
    await updateArtist(id, name);
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: number) {
    await deleteArtist(id);
    router.refresh();
  }

  return (
    <ul>
      {!artists || artists.length === 0 ? <li>No artists found</li> : artists.map((a) => (
        <li key={a.id}>
          {editingId === a.id ? (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <button onClick={() => save(a.id)}>Save</button>
            </>
          ) : (
            <>
              {a.name}
              <button onClick={() => {
                setEditingId(a.id);
                setName(a.name);
              }}>
                Edit
              </button>
              <button onClick={() => remove(a.id)}>Delete</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
