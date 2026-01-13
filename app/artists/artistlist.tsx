"use client";

import { deleteArtist, updateArtist } from "../services/artist.Service";
import { useState } from "react";

type ArtistListProps = {
  artists?: { id: number; name: string; description?: string; spotifyUrl?: string }[];
  onUpdate: (artists: any[]) => void;
};

export default function ArtistList({ artists = [], onUpdate }: ArtistListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");

  async function save(id: number) {
    const updatedArtists = await updateArtist(id, name, description, spotifyUrl);
    onUpdate(updatedArtists);
    setEditingId(null);
  }

  async function remove(id: number) {
    const updatedArtists = await deleteArtist(id);
    onUpdate(updatedArtists);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {!artists || artists.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400 text-lg">No artists found</p>
        </div>
      ) : artists.map((a) => (
        <div key={a.id}>
          {editingId === a.id ? (
            <div className="bg-[#2d1b4e] rounded-lg shadow-lg p-6 space-y-3 border border-[#5a3d8a]">
              <h3 className="text-lg font-bold text-white mb-4">Edit Artist</h3>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Artist name"
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
              />
              <input
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="Spotify URL"
                type="url"
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => save(a.id)}
                  className="flex-1 bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
                <button 
                  onClick={() => setEditingId(null)}
                  className="bg-[#3a2659] hover:bg-[#4c3073] text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#2d1b4e] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[#5a3d8a]">
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-white">{a.name}</h3>
                {a.description && <p className="text-gray-300 text-sm">{a.description}</p>}
                {a.spotifyUrl && (
                  <a 
                    href={a.spotifyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition"
                  >
                    <span>🎵</span> Spotify
                  </a>
                )}
                <div className="flex gap-2 pt-4 border-t border-[#5a3d8a]">
                  <button 
                    onClick={() => {
                      setEditingId(a.id);
                      setName(a.name);
                      setDescription(a.description || "");
                      setSpotifyUrl(a.spotifyUrl || "");
                    }}
                    className="flex-1 bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => remove(a.id)}
                    className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
