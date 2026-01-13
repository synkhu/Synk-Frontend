"use client";

import { useEffect, useState } from "react";
import { getVenues } from "../services/venue.Service";
import VenueForm from "./venueform";
import VenueList from "./venuelist";
import ProtectedRoute from "../../components/ProtectedRoute";

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

  useEffect(() => {
    getVenues().then(setVenues);
  }, []);

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
