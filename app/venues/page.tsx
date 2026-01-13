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
      <div className="min-h-screen bg-[#1a0f2e] flex items-center justify-center">
        <p className="text-white">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a0f2e] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Venues</h1>
          <VenueForm onSuccess={setVenues} />
          <VenueList venues={venues} onUpdate={setVenues} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
