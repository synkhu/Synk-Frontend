'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const listRes = await axios.get('https://api.synk.hu/events');
        const first10 = listRes.data.items.slice(0, 10);
        const detailedEvents = await Promise.all(
          first10.map(async (event: EventItem) => {
            const res = await axios.get<EventDetail>(`https://api.synk.hu/events/${event.id}`);
            return res.data;
          })
        );
        setEvents(detailedEvents);
      } catch (err) {
        console.error(err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: dir === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading) return (
    <div className="flex flex-col space-y-4">
      <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
      <div className="flex space-x-6 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-none w-72 h-96 bg-white/5 rounded-3xl animate-pulse" />
        ))}
      </div>
    </div>
  );
  if (error) return <p className="text-red-400 font-medium">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight text-center sm:text-left mb-2 sm:mb-0">
          Upcoming Events
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex flex-nowrap space-x-6 overflow-x-auto max-w-full pb-4 snap-x snap-mandatory
             px-[10vw] sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          contain: 'layout paint size',
          minHeight: 'calc(300px + 7vw)',
          height: 'auto',
        }}
      >
        {events.map(event => (
          <div
            key={event.id}
            className="flex-none mt-1 w-[75vw] sm:w-[60vw] md:w-[360px] h-[310px] sm:h-[340px] md:h-[370px] group snap-center bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
          >
            <div className="relative aspect-video overflow-hidden">
              {event.thumbnailUrl ? (
                <Image
                  src={event.thumbnailUrl}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full inline-block mb-2">
                  <p className="text-[9px] sm:text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                    {event.startTime ? new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Upcoming'}
                  </p>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight">{event.name}</h3>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                {event.venue && (
                  <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{event.venue.name}</span>
                  </div>
                )}
                {event.artist && (
                  <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="truncate">{event.artist.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/events/${event.id}`)}
                className="w-full py-3 rounded-2xl bg-white text-black font-bold text-xs sm:text-sm transition-all hover:bg-gray-200 active:scale-95"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}