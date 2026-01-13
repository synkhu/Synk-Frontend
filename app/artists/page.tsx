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
      <div className="min-h-screen bg-[#1a0f2e] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Artists</h1>
          <ArtistForm onSuccess={setArtists} />
          <ArtistList artists={artists} onUpdate={setArtists} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
