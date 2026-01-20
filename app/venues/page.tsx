"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVenues } from "../services/venue.Service";
import VenueForm from "./venueform";
import VenueList from "./venuelist";
import ProtectedRoute from "../../components/ProtectedRoute";
import { authService } from "../services/auth.service";

interface Venue {
  id: number;
  name: string;
  city: string;
  address: string;
  country: string;
  capacity: number;
  description: string;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
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
      getVenues().then(setVenues);
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
        <div className="max-w-6xl mx-auto rounded-3xl border border-purple-500/40 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-6">
          <h1 className="text-3xl font-extrabold text-white mb-6 tracking-wide">Venues</h1>
          <VenueForm onSuccess={setVenues} />
          <div className="mt-6">
            <VenueList venues={venues} onUpdate={setVenues} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
