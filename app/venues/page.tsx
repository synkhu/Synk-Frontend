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
      getVenues().then(setVenues);
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
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">Venues</h1>
            <p className="text-gray-500 font-medium">Manage locations and event spaces</p>
          </header>
          
          <div className="space-y-12">
            <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <VenueForm onSuccess={setVenues} />
            </section>
            
            <section>
              <VenueList venues={venues} onUpdate={setVenues} />
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
