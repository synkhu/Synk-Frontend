"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface EventItem {
  id: string;
  name: string;
  venueName?: string | null;
  thumbnailUrl?: string;
  artistName?: string | null;
}

interface EventDetail extends EventItem {
  description?: string;
  totalCapacity?: number | null;
  startTime?: string;
  endTime?: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    country?: string;
    address?: string;
    capacity?: number;
  };
  artist?: {
    id: string;
    name: string;
    profilePictureUrl?: string;
    spotifyUrl?: string;
  };
  ticketTypes?: { id: string; name: string; price: number }[];
}

const API_URL = "https://api.synk.hu";

type Filters = {
  place: string;
  artist: string;
  maxPrice: string;
  maxCapacity: string;
};

export default function AllEventsPage() {
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    place: "", artist: "", maxPrice: "", maxCapacity: "",
  });
  const [priceSliderMin, setPriceSliderMin] = useState<number>(0);
  const [priceSliderMax, setPriceSliderMax] = useState<number>(100000);

  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/events`);
        const items: EventItem[] = data.items || [];
        const detailedEvents = await Promise.all(items.map(async (event) => {
          try {
            const res = await axios.get<EventDetail>(`${API_URL}/events/${event.id}`);
            return res.data;
          } catch {
            return event as EventDetail;
          }
        }));
        setEvents(detailedEvents);

        const allPrices = detailedEvents.flatMap(ev => ev.ticketTypes?.map(tt => tt.price) || []).filter(p => !isNaN(p));
        if (allPrices.length > 0) {
          const min = Math.min(...allPrices);
          const max = Math.max(...allPrices);
          setPriceSliderMin(Math.floor(min / 1000) * 1000);
          setPriceSliderMax(Math.ceil(max / 1000) * 1000);
          setFilters(prev => ({ ...prev, maxPrice: String(Math.ceil(max / 1000) * 1000) }));
        }
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const placeFilter = filters.place.trim().toLowerCase();
    const artistFilter = filters.artist.trim().toLowerCase();
    const maxPriceFilter = parseFloat(filters.maxPrice);
    const maxCapacityFilter = parseInt(filters.maxCapacity, 10);

    if (placeFilter) {
      const placeText = [event.venue?.name, event.venue?.city, event.venueName].filter(Boolean).join(" ").toLowerCase();
      if (!placeText.includes(placeFilter)) return false;
    }
    if (artistFilter) {
      const artistText = (event.artist?.name || event.artistName || "").toLowerCase();
      if (!artistText.includes(artistFilter)) return false;
    }
    if (!isNaN(maxPriceFilter)) {
      const prices = event.ticketTypes?.map(t => t.price) || [];
      if (prices.length > 0 && Math.min(...prices) > maxPriceFilter) return false;
    }
    if (!isNaN(maxCapacityFilter)) {
      const cap = event.totalCapacity || event.venue?.capacity || 0;
      if (cap > maxCapacityFilter) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Explore Events</h1>
        <p className="text-gray-500">Find the best parties, concerts and festivals</p>
      </header>

      {/* Filters */}
      <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
            <input
              type="text"
              value={filters.place}
              onChange={(e) => setFilters(p => ({ ...p, place: e.target.value }))}
              placeholder="Search city or venue..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Artist</label>
            <input
              type="text"
              value={filters.artist}
              onChange={(e) => setFilters(p => ({ ...p, artist: e.target.value }))}
              placeholder="Search performer..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Max Price (HUF)</label>
            <div className="px-1 pt-2">
              <input
                type="range"
                min={priceSliderMin}
                max={priceSliderMax}
                step={1000}
                value={filters.maxPrice || priceSliderMax}
                onChange={(e) => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                <span>{priceSliderMin.toLocaleString()}</span>
                <span className="text-purple-400 font-extrabold">{parseInt(filters.maxPrice || String(priceSliderMax)).toLocaleString()} HUF</span>
                <span>{priceSliderMax.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Capacity</label>
            <select
              value={filters.maxCapacity}
              onChange={(e) => setFilters(p => ({ ...p, maxCapacity: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900">Any size</option>
              {[200, 500, 1000, 2000, 5000, 10000].map(c => (
                <option key={c} value={c} className="bg-zinc-900">Up to {c.toLocaleString()}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white/5 border border-white/5 rounded-[3rem]">
          <p className="text-gray-500 font-medium">No events found matching your filters.</p>
          <button onClick={() => setFilters({ place: "", artist: "", maxPrice: "", maxCapacity: "" })} className="text-purple-400 font-bold hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const minPrice = event.ticketTypes?.length ? Math.min(...event.ticketTypes.map(t => t.price)) : null;
            return (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2 cursor-pointer shadow-xl hover:shadow-purple-500/5"
              >
                <div className="relative aspect-video overflow-hidden">
                  {event.thumbnailUrl ? (
                    <Image 
                      src={event.thumbnailUrl} 
                      alt={event.name} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  {minPrice && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
                      <p className="text-[10px] font-extrabold text-white uppercase tracking-widest">From {minPrice.toLocaleString()} HUF</p>
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">{event.name}</h2>
                    <div className="flex flex-col space-y-1">
                      <p className="text-gray-400 text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.venue?.name || event.venueName}
                      </p>
                      <p className="text-gray-500 text-xs flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {event.startTime ? new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
                      </p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white/5 group-hover:bg-white text-white group-hover:text-black font-bold rounded-2xl transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
