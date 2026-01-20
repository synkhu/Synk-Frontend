"use client";

import { deleteArtist, updateArtist } from "../services/artist.Service";
import { uploadFile } from "../services/file.service";
import { useState } from "react";

type ArtistListProps = {
  artists?: {
    id: number;
    name: string;
    description?: string;
    spotifyUrl?: string;
    profilePictureUrl?: string;
  }[];
  onUpdate: (artists: any[]) => void;
};

export default function ArtistList({ artists = [], onUpdate }: ArtistListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);

  async function save(id: number) {
    let finalProfileUrl = profilePictureUrl || undefined;

    if (profileFile) {
      finalProfileUrl = await uploadFile(profileFile);
    }

    const updatedArtists = await updateArtist(
      id,
      name,
      description,
      spotifyUrl,
      finalProfileUrl
    );
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
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-6 space-y-3">
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Profile picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfileFile(file);
                    setProfilePictureUrl(file ? "" : a.profilePictureUrl || "");
                  }}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4c3073] file:text-white hover:file:bg-[#5a3d8a]"
                />
                {(profileFile || a.profilePictureUrl) && (
                  <div className="mt-3 flex items-center gap-3">
                    {(profileFile || a.profilePictureUrl) && (
                      <img
                        src={profileFile ? URL.createObjectURL(profileFile) : a.profilePictureUrl!}
                        alt="Profile preview"
                        className="w-16 h-16 object-cover rounded-full border border-[#5a3d8a]"
                      />
                    )}
                    <span className="text-xs text-gray-400">Current / new picture</span>
                  </div>
                )}
              </div>
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
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_18px_50px_rgba(0,0,0,0.8)] overflow-hidden hover:shadow-[0_24px_70px_rgba(236,72,153,0.45)] transition-shadow duration-300">
              <div className="p-6 space-y-3">
                {a.profilePictureUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={a.profilePictureUrl}
                      alt={a.name}
                      className="w-20 h-20 object-cover rounded-full border border-[#5a3d8a]"
                    />
                  </div>
                )}
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
