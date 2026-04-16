"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = "https://api.synk.hu";

interface ArtistEvent {
  id: string;
  name: string;
  venueId?: string | null;
  venueName?: string | null;
  startTime?: string;
  thumbnailUrl?: string | null;
  venue?: {
    id: string;
  };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistEvents, setArtistEvents] = useState<ArtistEvent[]>([]);
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    async function unwrapParams() {
      const resolved = await params;
      setArtistId(resolved.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!artistId) return;
    const fetchData = async () => {
      try {
        const [artistRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/artists/${artistId}`),
          axios.get(`${API_URL}/artists/${artistId}/events`),
        ]);
        const artist = artistRes.data;

        setArtistDetails({
          id: artist.id,
          name: artist.name,
          description: artist.description,
          profilePictureUrl: artist.profilePictureUrl || artist.profile_picture_url,
          spotifyUrl: artist.spotifyUrl || artist.spotify_url || artist.spotify,
        });

        const data = eventsRes.data;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];
        setArtistEvents(items.map((e: ArtistEvent) => ({
          ...e,
          venueId: e.venueId ?? e.venue?.id,
        })));
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load artist details");
        } else {
          setError("Failed to load artist details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [artistId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !artistDetails) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 p-8 rounded-3xl text-center space-y-4 text-red-400">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error || "Artist not found"}</p>
        <button onClick={() => router.push("/")} className="w-full py-2 bg-white text-black font-bold rounded-xl">Back Home</button>
      </div>
    </div>
  );

  return (
    <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row">
        <div className="md:w-80 md:h-80 w-full h-72 flex-shrink-0 relative overflow-hidden">
          {artistDetails.profilePictureUrl ? (
            <Image src={artistDetails.profilePictureUrl} alt={artistDetails.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-6xl font-bold text-white italic">
              {artistDetails.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="flex-1 p-6 md:p-10 space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">Performer</span>
            <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight leading-none">{artistDetails.name}</h1>
          </div>
          {artistDetails.description && <p className="text-gray-400 text-sm md:text-lg leading-relaxed line-clamp-3">{artistDetails.description}</p>}
          <div className="flex flex-wrap gap-4 pt-4">
            {artistDetails.spotifyUrl && (
              <a href={artistDetails.spotifyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all active:scale-95 space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.223.367-.694.482-1.061.259-2.858-1.742-6.455-2.136-10.692-1.17-.421.097-.84-.167-.937-.588-.097-.421.167-.84.588-.937 4.631-1.06 8.604-.613 11.843 1.339.367.222.482.694.259 1.057zm1.472-3.258c-.281.457-.879.605-1.336.324-3.272-2.012-8.259-2.592-12.128-1.417-.515.157-1.066-.134-1.223-.649-.157-.515.134-1.066.649-1.223 4.419-1.341 9.914-.698 13.684 1.623.457.281.605.879.324 1.336l.03.006zm.126-3.41c-3.924-2.33-10.392-2.546-14.172-1.398-.602.183-1.238-.162-1.421-.764-.183-.602.162-1.238.764-1.421 4.331-1.315 11.472-1.058 16.007 1.634.541.321.718 1.02.397 1.56-.321.541-1.02.718-1.56.397l-.015-.008z" /></svg>
                <span>Listen on Spotify</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight px-4">Upcoming Events</h2>
        {artistEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {artistEvents.map((event) => (
              <div key={event.id} onClick={() => router.push(`/events/${event.id}`)} className="group flex bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/[0.08] transition-all cursor-pointer">
                <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                  {event.thumbnailUrl ? (
                    <Image src={event.thumbnailUrl} alt={event.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center space-y-2">
                  <h3 className="text-base md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{event.name}</h3>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {event.venueName || "Venue TBD"}
                    </p>
                    {event.startTime && (
                      <p className="text-gray-500 text-xs flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(event.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white/5 border border-white/5 rounded-[3rem]">
            <p className="text-gray-500 font-medium">No upcoming events scheduled for this artist.</p>
          </div>
        )}
      </section>
    </div>
  );
}
