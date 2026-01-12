"use client";

import { useState } from "react";
import { createArtist } from "../services/artist.Service";

type ArtistFormProps = {
  onSuccess: (artists: any[]) => void;
};

export default function ArtistForm({ onSuccess }: ArtistFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedArtists = await createArtist(name, description, spotifyUrl);

      onSuccess(updatedArtists);

      setName("");
      setDescription("");
      setSpotifyUrl("");
    } catch (err) {
      console.error("Failed to create artist:", err);
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Artist name"
        required
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Artist description"
      />
      <input
        value={spotifyUrl}
        onChange={(e) => setSpotifyUrl(e.target.value)}
        placeholder="Spotify URL"
        type="url"
      />
      <button type="submit">Add</button>
    </form>
  );
}
