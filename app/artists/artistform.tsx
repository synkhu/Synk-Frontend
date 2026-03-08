"use client";

import { useState } from "react";
import { createArtist } from "../services/artist.Service";
import { uploadFile } from "../services/file.service";

type ArtistFormProps = {
  onSuccess: (artists: any[]) => void;
};

export default function ArtistForm({ onSuccess }: ArtistFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let profilePictureUrl: string | undefined;

      if (profileFile) {
        profilePictureUrl = await uploadFile(profileFile);
      }

      const updatedArtists = await createArtist(
        name,
        description,
        spotifyUrl,
        profilePictureUrl,
      );

      onSuccess(updatedArtists);

      setName("");
      setDescription("");
      setSpotifyUrl("");
      setProfileFile(null);
      setProfilePreview(null);
    } catch (err) {
      console.error("Failed to create artist:", err);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Artist name"
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Artist description"
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10 resize-none"
        />
        <input
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          placeholder="Spotify URL"
          type="url"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider ml-1">
          Profile picture
        </label>
        <div className="flex items-center space-x-6">
          <div className="relative group flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfileFile(file);
                setProfilePreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer border border-white/10 rounded-2xl bg-white/5 p-2"
            />
          </div>
          {profilePreview && (
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-white/20"
      >
        Add Artist
      </button>
    </form>
  );
}
