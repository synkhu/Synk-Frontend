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
  spotifyUrl?: string | null;
}

export default function ArtistDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
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
          spotifyUrl:
            artist.spotifyUrl ??
            artist.spotify_url ??
            artist.spotifyLink ??
            artist.spotify_link ??
            artist.spotify ??
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
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center w-full"
            style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
          >
            <div className="text-xl text-white">Loading artist...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artistDetails) {
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
      </div>
    );
  }

  return (
    <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
      <div className="nav">
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
      </div>
      <div className="content-column">
        <div
          className="min-h-screen py-8 px-4 w-full"
          style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
        >
          <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="mb-6 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition text-lg font-medium"
          >
            <span>←</span> Back to Home
          </button>
          <div className="relative overflow-hidden mb-8 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-fuchsia-700/60 via-purple-900/80 to-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] flex flex-col md:flex-row">
            {artistDetails.profilePictureUrl && (
              <div className="md:w-72 md:h-72 w-full h-64 overflow-hidden bg-gray-900 flex-shrink-0 relative">
                <img
                  src={artistDetails.profilePictureUrl}
                  alt={artistDetails.name}
                  className="w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/95 via-fuchsia-700/50 to-transparent" />
              </div>
            )}
            <div className="p-8 flex-1">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-purple-200/80 mb-2">Performer</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.75)]">{artistDetails.name}</h1>
              {artistDetails.description && (
                <p className="text-gray-200 mb-3 whitespace-pre-wrap max-w-2xl">
                  {artistDetails.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
                <p className="text-purple-100/80 text-sm max-w-md">
                  Upcoming events and past shows with this artist.
                </p>
                {artistDetails.spotifyUrl && (
                  <a
                    href={artistDetails.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-500/80 via-emerald-400/80 to-lime-400/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_12px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.85)] hover:scale-[1.02] transition-transform"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-900" />
                    <span>Listen on Spotify</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-gradient-to-br from-purple-900/80 via-[#2d1b4e] to-[#120626] shadow-[0_18px_60px_rgba(0,0,0,0.85)] p-6 border border-purple-500/40">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">Events</h2>
            {artistEvents?.items && artistEvents.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artistEvents.items.map((event) => (
                  <div
                    key={event.id}
                    className="bg-[#1a0f2e] rounded-2xl border border-purple-500/40 overflow-hidden hover:border-pink-400 hover:shadow-[0_18px_55px_rgba(0,0,0,0.9)] transition cursor-pointer flex flex-col"
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
                      <span className="mt-auto text-pink-300 text-sm font-semibold tracking-wide">View details →</span>
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
    </div>
  );
}
