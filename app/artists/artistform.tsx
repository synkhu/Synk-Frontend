"use client";

import { useState } from "react";
import { createArtist } from "../services/artist.Service";
import { useRouter } from "next/navigation";

export default function ArtistForm() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const router = useRouter();

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        await createArtist( name , description, spotifyUrl );
        setName("");
        setDescription("");
        setSpotifyUrl("");
        router.refresh();
    }

    return (
        <form onSubmit={submit}>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Artist name"
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
            <button>Add</button>
        </form>
    );
}
