"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

export default function VenueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [venueDetails, setVenueDetails] = useState<VenueDetails | null>(null);
  const [venueEvents, setVenueEvents] = useState<VenueEvent[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function unwrapParams() {
      const resolved = await params;
      setVenueId(resolved.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!venueId) return;
    const fetchData = async () => {
      try {
        const [venueRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/venues/${venueId}`),
          axios.get(`${API_URL}/venues/${venueId}/events`),
        ]);
        const v = venueRes.data;
        const e = eventsRes.data;

        setVenueDetails({
          id: v.id,
          name: v.name,
          address: v.address,
          city: v.city,
          country: v.country,
          description: v.description,
          capacity: v.capacity,
          isAdultOnly: v.isAdultOnly || v.is_adult_only,
          images: v.images || v.imageUrls?.map((u: string) => ({ imageUrl: u })) || null,
        });

        const items = Array.isArray(e) ? e : e.items || [];
        setVenueEvents(items);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load venue details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [venueId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !venueDetails) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 p-8 rounded-3xl text-center space-y-4 text-red-400">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error || "Venue not found"}</p>
        <button onClick={() => router.push("/")} className="w-full py-2 bg-white text-black font-bold rounded-xl">Back Home</button>
      </div>
    </div>
  );

  const imageUrls = venueDetails.images?.map(img => img.imageUrl).filter(Boolean) as string[] || [];

  return (
    <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row">
        <div className="lg:w-1/2 h-[400px] lg:h-auto relative overflow-hidden">
          {imageUrls.length > 0 ? (
            <>
              <img src={imageUrls[currentImageIndex]} alt={venueDetails.name} className="w-full h-full object-cover transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {imageUrls.length > 1 && (
                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                  {imageUrls.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`h-1 rounded-full transition-all ${idx === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/30"}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black flex items-center justify-center text-6xl font-bold text-white italic">
              {venueDetails.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="p-10 lg:w-1/2 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">Venue</span>
              {venueDetails.isAdultOnly && <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">18+ Only</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">{venueDetails.name}</h1>
            <div className="space-y-2">
              <p className="text-gray-300 flex items-center">
                <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {venueDetails.address}, {venueDetails.city}
              </p>
              {venueDetails.capacity && (
                <p className="text-gray-400 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Capacity: {venueDetails.capacity.toLocaleString()} guests
                </p>
              )}
            </div>
          </div>
          {venueDetails.description && <p className="text-gray-400 text-lg leading-relaxed">{venueDetails.description}</p>}
        </div>
      </section>

      <section className="space-y-8 px-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">Events at this Venue</h2>
        {venueEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venueEvents.map((event) => (
              <div key={event.id} onClick={() => router.push(`/events/${event.id}`)} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all cursor-pointer shadow-lg hover:shadow-purple-500/5">
                <div className="relative aspect-video overflow-hidden">
                  {event.thumbnailUrl ? (
                    <img src={event.thumbnailUrl} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                </div>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">{event.name}</h3>
                    <div className="space-y-1">
                      {event.artistName && (
                        <p className="text-purple-400 text-sm font-bold flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                          {event.artistName}
                        </p>
                      )}
                      {event.startTime && (
                        <p className="text-gray-500 text-xs flex items-center">
                          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white/5 group-hover:bg-white text-white group-hover:text-black font-bold rounded-2xl transition-all duration-300">
                    View Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white/5 border border-white/5 rounded-[3rem]">
            <p className="text-gray-500 font-medium">No events currently scheduled at this venue.</p>
          </div>
        )}
      </section>
    </div>
  );
}
