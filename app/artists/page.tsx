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
        router.push("/");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <ProtectedRoute>
      <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <header className="mb-10 space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">Artists</h1>
            <p className="text-gray-500 font-medium">Manage your roster of performers and creators</p>
          </header>
          
          <div className="space-y-12">
            <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <ArtistForm onSuccess={setArtists} />
            </section>
            
            <section>
              <ArtistList artists={artists} onUpdate={setArtists} />
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
