"use client";

import { deleteArtist, updateArtist } from "../services/artist.Service";
import { useState } from "react";

type ArtistListProps = {
  artists?: { id: number; name: string }[];
  onUpdate: (artists: any[]) => void;
};

export default function ArtistList({ artists = [], onUpdate }: ArtistListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  async function save(id: number) {
    const updatedArtists = await updateArtist(id, name);
    onUpdate(updatedArtists);
    setEditingId(null);
  }

  async function remove(id: number) {
    const updatedArtists = await deleteArtist(id);
    onUpdate(updatedArtists);
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
