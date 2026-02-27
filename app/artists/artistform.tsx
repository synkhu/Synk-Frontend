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
      className="max-w-4xl mx-auto p-6 rounded-3xl border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/40 via-[#120626]/80 to-[#120626]/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] space-y-4 mb-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Add New Artist</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Artist name"
        required
        className="w-full px-4 py-2 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Artist description"
        className="w-full px-4 py-2 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
      />
      <input
        value={spotifyUrl}
        onChange={(e) => setSpotifyUrl(e.target.value)}
        placeholder="Spotify URL"
        type="url"
        className="w-full px-4 py-2 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
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
            setProfilePreview(file ? URL.createObjectURL(file) : null);
          }}
          className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2d1b4e] file:text-white hover:file:bg-[#4c3073]"
        />
        {profilePreview && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Preview:</p>
            <img
              src={profilePreview}
              alt="Profile preview"
              className="w-24 h-24 object-cover rounded-full border border-[#4c3073]"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-[#2d1b4e] hover:bg-[#4c3073] text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        Add Artist
      </button>
    </form>
  );
}
