"use client";

import { useEffect, useState } from "react";
import { getArtists } from "../services/artist.Service";
import ArtistForm from "./artistform";
import ArtistList from "./artistlist";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    getArtists().then(setArtists);
  }, []);

  return (
    <ProtectedRoute>
      <div style={{ padding: "2rem" }}>
        <h1>Artists</h1>
        <ArtistForm onSuccess={setArtists} />
        <ArtistList artists={artists} onUpdate={setArtists} />
      </div>
    </ProtectedRoute>
  );
}
