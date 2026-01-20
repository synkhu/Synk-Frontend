"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getArtists } from "../services/artist.Service";
import ArtistForm from "./artistform";
import ArtistList from "./artistlist";
import ProtectedRoute from "../../components/ProtectedRoute";
import { authService } from "../services/auth.service";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const canAccess = await authService.canAccessAdminPages();
      if (!canAccess) {
        router.push('/');
        return;
      }
      setIsAuthorized(true);
      setIsChecking(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      getArtists().then(setArtists);
    }
  }, [isAuthorized]);

  if (isChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
      >
        <p className="text-white">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen py-8 px-4"
        style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Artists</h1>
          <ArtistForm onSuccess={setArtists} />
          <ArtistList artists={artists} onUpdate={setArtists} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
