"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";

const API_URL = "https://api.synk.hu";

interface ArtistEvent {
  id: string;
  name: string;
  venueId?: string | null;
  venueName?: string | null;
  startTime?: string;
  thumbnailUrl?: string | null;
}

interface ArtistEventsResponse {
  items: ArtistEvent[];
}

interface ArtistDetails {
  id: string;
  name: string;
  description?: string | null;
  profilePictureUrl?: string | null;
}

export default function ArtistDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistEvents, setArtistEvents] = useState<ArtistEventsResponse | null>(null);
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  useEffect(() => {
    async function unwrapParams() {
      const resolved = await params;
      setArtistId(resolved.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!artistId) return;

    const fetchArtistData = async () => {
      try {
        const [artistRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/artists/${artistId}`),
          axios.get(`${API_URL}/artists/${artistId}/events`),
        ]);

        const artist = artistRes.data as any;
        const eventsData = eventsRes.data as any;

        let items: ArtistEvent[] = [];
        const rawItems = Array.isArray(eventsData)
          ? eventsData
          : Array.isArray(eventsData.items)
          ? eventsData.items
          : [];

        items = rawItems.map((e: any) => ({
          ...e,
          venueId:
            e.venueId ??
            e.venueid ??
            e.venue?.id ??
            null,
        }));

        setArtistDetails({
          id: artist.id,
          name: artist.name,
          description: artist.description ?? null,
          profilePictureUrl:
            artist.profilePictureUrl ??
            artist.profile_picture_url ??
            null,
        });

        setArtistEvents({ items });
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load artist events");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

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
      <div className="main flex">
        <div className="nav">
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        </div>
        <div className="min-h-screen flex items-center justify-center bg-[#1a0f2e] w-full">
          <div className="text-xl text-white">Loading artist...</div>
        </div>
      </div>
    );
  }

  if (error || !artistDetails) {
    return (
      <div className="main flex">
        <div className="nav">
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        </div>
        <div className="min-h-screen flex items-center justify-center bg-[#1a0f2e] w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-300 mb-4">{error || "Artist not found"}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white px-6 py-2 rounded-lg transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main flex">
      <div className="nav">
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      </div>
      <div className="min-h-screen bg-[#1a0f2e] py-8 px-4 w-full">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="mb-6 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition text-lg font-medium"
          >
            <span>←</span> Back to Home
          </button>

          <div className="bg-[#2d1b4e] rounded-lg shadow-lg overflow-hidden mb-6 border border-[#5a3d8a] flex flex-col md:flex-row">
            {artistDetails.profilePictureUrl && (
              <div className="md:w-64 md:h-64 w-full h-64 overflow-hidden bg-gray-900 flex-shrink-0">
                <img
                  src={artistDetails.profilePictureUrl}
                  alt={artistDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8 flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">{artistDetails.name}</h1>
              {artistDetails.description && (
                <p className="text-gray-300 mb-3 whitespace-pre-wrap">
                  {artistDetails.description}
                </p>
              )}
              <p className="text-gray-400 text-sm">
                Események, ahol ez az előadó fellép.
              </p>
            </div>
          </div>

          <div className="bg-[#2d1b4e] rounded-lg shadow-lg p-6 border border-[#5a3d8a]">
            <h2 className="text-2xl font-bold text-white mb-4">Events</h2>
            {artistEvents?.items && artistEvents.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artistEvents.items.map((event) => (
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
                      {event.venueName && (
                        <p className="text-sm text-gray-300 mb-1">
                          📍{" "}
                          {event.venueId ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/venues/${event.venueId}`);
                              }}
                              className="text-purple-300 hover:text-purple-200 underline underline-offset-2 font-medium"
                            >
                              {event.venueName}
                            </button>
                          ) : (
                            event.venueName
                          )}
                        </p>
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
              <p className="text-gray-400">No events found for this artist.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
