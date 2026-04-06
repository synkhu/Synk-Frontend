"use client";

import { deleteArtist, updateArtist } from "../services/artist.service";
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

import Modal from "../../components/Modal";

export default function ArtistList({
  artists = [],
  onUpdate,
}: ArtistListProps) {
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
      finalProfileUrl,
    );
    onUpdate(updatedArtists);
    setEditingId(null);
  }

  async function remove(id: number) {
    const updatedArtists = await deleteArtist(id);
    onUpdate(updatedArtists);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {!artists || artists.length === 0 ? (
          <div className="col-span-full text-center py-16 sm:py-24">
            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
              <span className="text-4xl">🎤</span>
            </div>
            <p className="text-white text-xl font-bold">No artists found</p>
            <p className="text-gray-500 mt-2">
              Start building your roster by adding artists.
            </p>
          </div>
        ) : (
          artists.map((a) => (
            <div key={a.id}>
              <div className="group relative h-full rounded-2xl border border-white/10 bg-[#1a0b2e]/60 backdrop-blur-sm overflow-hidden hover:bg-[#2d1b4e]/60 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                  <button
                    onClick={() => {
                      setEditingId(a.id);
                      setName(a.name);
                      setDescription(a.description || "");
                      setSpotifyUrl(a.spotifyUrl || "");
                      setProfilePictureUrl(a.profilePictureUrl || "");
                      setProfileFile(null);
                    }}
                    className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-full backdrop-blur-md transition-all"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 flex-grow">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/20 group-hover:border-purple-500/50 shadow-2xl shadow-purple-500/10 transition-all duration-500 group-hover:scale-105">
                      {a.profilePictureUrl ? (
                        <img
                          src={a.profilePictureUrl}
                          alt={a.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white/50">
                            {a.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {a.spotifyUrl && (
                      <div className="absolute bottom-0 right-0 bg-[#1DB954] text-white p-2 rounded-full shadow-lg transform translate-y-1 translate-x-1 border-4 border-[#1a0b2e]">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                      {a.name}
                    </h3>
                    {a.description && (
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {a.description}
                      </p>
                    )}
                  </div>

                  {a.spotifyUrl && (
                    <a
                      href={a.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-3 inline-flex items-center text-[10px] sm:text-xs font-bold text-gray-500 hover:text-[#1DB954] uppercase tracking-widest transition-colors"
                    >
                      Listen on Spotify <span className="ml-1">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={editingId !== null}
        onClose={() => setEditingId(null)}
        title="Edit Artist"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProfileFile(file);
                  // Keep existing URL if file is removed, or update logic if needed
                  // But here we rely on profileFile being present for save()
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/20 group-hover:border-purple-400 transition-all">
                <img
                  src={
                    profileFile
                      ? URL.createObjectURL(profileFile)
                      : profilePictureUrl || "https://via.placeholder.com/150"
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase">
                    Change
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Artist name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-xs sm:text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-xs sm:text-sm resize-none"
            />
            <input
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="Spotify URL"
              type="url"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-xs sm:text-sm"
            />
          </div>

          <button
            onClick={() => editingId && save(editingId)}
            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-white/20 mt-6"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </>
  );
}
