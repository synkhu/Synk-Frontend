"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { getArtists } from "../services/artist.Service";
import ArtistForm from "./artistform";
import ArtistList from "./artistlist";
import ProtectedRoute from "../../components/ProtectedRoute";
import { authService } from "../services/auth.service";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
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
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <p className="text-white">Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen py-8 px-4"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <div className="max-w-6xl mx-auto rounded-3xl border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/40 via-[#120626]/80 to-[#120626]/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-6">
              <h1 className="text-3xl font-extrabold text-white mb-6 tracking-wide">
                Artists
              </h1>
              <ArtistForm onSuccess={setArtists} />
              <div className="mt-6">
                <ArtistList artists={artists} onUpdate={setArtists} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
