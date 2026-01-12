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
      <div style={{ padding: "2rem" }}>
        <h1>Venues</h1>
        <VenueForm onSuccess={setVenues} />
        <VenueList venues={venues} onUpdate={setVenues} />
      </div>
    </ProtectedRoute>
  );
}
