"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";

const API_URL = "https://api.synk.hu";

interface VenueEvent {
  id: string;
  name: string;
  artistName?: string | null;
  startTime?: string;
  thumbnailUrl?: string | null;
}

interface VenueDetails {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  capacity?: number | null;
  isAdultOnly?: boolean | null;
  images?: { id?: string; imageUrl?: string }[] | null;
}

interface VenueEventsResponse {
  items: VenueEvent[];
}

export default function VenueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [venueDetails, setVenueDetails] = useState<VenueDetails | null>(null);
  const [venueEvents, setVenueEvents] = useState<VenueEventsResponse | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  useEffect(() => {
    async function unwrapParams() {
      const resolved = await params;
      setVenueId(resolved.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!venueId) return;

    const fetchVenueData = async () => {
      try {
        const [venueRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/venues/${venueId}`),
          axios.get(`${API_URL}/venues/${venueId}/events`),
        ]);

        const v = venueRes.data as any;
        const e = eventsRes.data as any;

        let items: VenueEvent[] = [];
        if (Array.isArray(e)) {
          items = e;
        } else if (Array.isArray(e.items)) {
          items = e.items;
        }

        setVenueDetails({
          id: v.id,
          name: v.name,
          address: v.address ?? null,
          city: v.city ?? null,
          country: v.country ?? null,
          description: v.description ?? null,
          capacity: v.capacity ?? null,
          isAdultOnly: v.isAdultOnly ?? v.is_adult_only ?? null,
          images: Array.isArray(v.images)
            ? v.images
            : Array.isArray(v.imageUrls)
            ? v.imageUrls.map((u: string) => ({ imageUrl: u }))
            : null,
        });

        setVenueEvents({ items });
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load venue events");
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, [venueId]);

  // Reset image index when venue changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [venueDetails?.id]);

  // Auto-advance carousel when there are multiple images
  useEffect(() => {
    if (!venueDetails) return;

    const raw = venueDetails as any;
    const imagesArray: { imageUrl?: string }[] = Array.isArray(raw?.images)
      ? raw.images
      : Array.isArray(raw?.imageUrls)
      ? raw.imageUrls.map((u: string) => ({ imageUrl: u }))
      : [];

    const imageUrls: string[] = imagesArray
      .map((img) => img?.imageUrl)
      .filter((u): u is string => typeof u === "string" && u.length > 0);

    if (imageUrls.length <= 1) return;

    const total = imageUrls.length;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(timer);
  }, [venueDetails?.id]);

  const formatDate = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
        </div>
        <div
          className="min-h-screen flex items-center justify-center w-full"
          style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
        >
          <div className="text-xl text-white">Loading venue...</div>
        </div>
      </div>
    );
  }

  if (error || !venueDetails) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center w-full"
            style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
              <p className="text-gray-300 mb-4">{error || "Venue not found"}</p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white px-6 py-2 rounded-lg transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
      <div className="nav">
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
      </div>
      <div className="content-column">
        <div className="min-h-screen py-8 px-4 w-full" style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}>
          <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="mb-6 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition text-lg font-medium"
          >
            <span>←</span> Back to Home
          </button>

          <div className="bg-[#2d1b4e] rounded-lg shadow-lg overflow-hidden mb-6 border border-[#5a3d8a]">
            {(() => {
              const raw = venueDetails as any;
              const imagesArray: { imageUrl?: string }[] = Array.isArray(raw?.images)
                ? raw.images
                : Array.isArray(raw?.imageUrls)
                ? raw.imageUrls.map((u: string) => ({ imageUrl: u }))
                : [];

              const imageUrls: string[] = imagesArray
                .map((img) => img?.imageUrl)
                .filter((u): u is string => typeof u === "string" && u.length > 0);

              if (!imageUrls.length) return null;

              const total = imageUrls.length;
              const current = Math.min(currentImageIndex, total - 1);
              const canSlide = total > 1;

              const goPrev = () => {
                setCurrentImageIndex((prev) => (prev - 1 + total) % total);
              };

              const goNext = () => {
                setCurrentImageIndex((prev) => (prev + 1) % total);
              };

              return (
                <div className="relative w-full h-72 md:h-96 overflow-hidden bg-black">
                  <img
                    src={imageUrls[current]}
                    alt={venueDetails.name}
                    className="w-full h-full object-cover"
                  />

                  {canSlide && (
                    <>
                      {/* Navigation arrows */}
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition"
                      >
                        ›
                      </button>

                      {/* Dots indicator */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                        {imageUrls.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full border border-white/60 transition ${
                              idx === current ? "bg-white" : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            <div className="p-8">
              <h1 className="text-4xl font-bold text-white mb-4">{venueDetails.name}</h1>
              {venueDetails.address && (
                <p className="text-gray-300 mb-1">📍 {venueDetails.address}</p>
              )}
              {(venueDetails.city || venueDetails.country) && (
                <p className="text-gray-400 mb-3">
                  {[venueDetails.city, venueDetails.country].filter(Boolean).join(", ")}
                </p>
              )}
              {venueDetails.capacity != null && (
                <p className="text-gray-300 mb-1">👥 Capacity: {venueDetails.capacity} people</p>
              )}
              {venueDetails.isAdultOnly && (
                <p className="text-red-400 text-sm">🔞 18+ only venue</p>
              )}
              {venueDetails.description && (
                <p className="text-gray-300 mt-4 whitespace-pre-wrap">{venueDetails.description}</p>
              )}
            </div>
          </div>

          <div className="bg-[#2d1b4e] rounded-lg shadow-lg p-6 border border-[#5a3d8a]">
            <h2 className="text-2xl font-bold text-white mb-4">Events at this venue</h2>
            {venueEvents?.items && venueEvents.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venueEvents.items.map((event) => (
                  <div
                    key={event.id}
                    className="bg-[#1a0f2e] rounded-lg border border-[#5a3d8a] overflow-hidden hover:border-purple-400 transition cursor-pointer flex flex-col"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    {event.thumbnailUrl && (
                      <div className="h-40 w-full overflow-hidden bg-black">
                        <img
                          src={event.thumbnailUrl}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                      {event.artistName && (
                        <p className="text-sm text-gray-300 mb-1">🎤 {event.artistName}</p>
                      )}
                      {event.startTime && (
                        <p className="text-sm text-gray-400 mb-2">🕒 {formatDate(event.startTime)}</p>
                      )}
                      <span className="mt-auto text-purple-300 text-sm font-medium">View details →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No events found for this venue.</p>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
