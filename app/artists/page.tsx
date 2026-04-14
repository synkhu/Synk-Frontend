"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getArtists } from "../services/artist.service";
import ArtistForm from "./artistform";
import ArtistList from "./artistlist";
import ProtectedRoute from "../../components/ProtectedRoute";
import { authService } from "../services/auth.service";
import Modal from "../../components/Modal";

type Artist = {
  id: number;
  name: string;
  description?: string | null;
  spotifyUrl?: string | null;
  profilePictureUrl?: string | null;
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <div className="py-8 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">Artists</h1>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Manage your roster of performers and creators</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-[#2d1b4e] hover:bg-[#4c3073] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#4c3073]/50 flex items-center space-x-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New</span>
            </button>
          </header>
          
          <div className="space-y-8 sm:space-y-12">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Artist">
              <ArtistForm onSuccess={(data) => {
                setArtists(data);
                setIsModalOpen(false);
              }} />
            </Modal>
            
            <section>
              <ArtistList artists={artists} onUpdate={setArtists} />
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
