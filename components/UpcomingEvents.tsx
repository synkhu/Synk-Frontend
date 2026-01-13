'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import './UpcomingEvents.css';

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

  const scroll = (dir: 'left' | 'right', cardsToScroll = 1) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const card = container.querySelector<HTMLElement>('.card');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const scrollDistance = (cardWidth + gap) * cardsToScroll;

    container.scrollBy({
      left: dir === 'right' ? scrollDistance : -scrollDistance,
      behavior: 'smooth',
    });
  };

  if (loading) return <p>Loading events…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Upcoming events</h2>
      <div className="event-container">
        <button className="carousel-arrow left" onClick={() => scroll('left', 4)}>&lt;</button>
        <div className="carousel-viewport">
          <div className="carousel-cards" ref={containerRef}>
            {events.map(event => (
              <div className='card' key={event.id}>
                {event.thumbnailUrl && (
                  <img src={event.thumbnailUrl} alt={event.name} className="card-image" />
                )}
                <div className='card-body'>
                  <h3>{event.name}</h3>
                  {event.venue && <p>Venue: {event.venue.name}{event.venue.city ? `, ${event.venue.city}` : ''}</p>}
                  {event.artist && <p>Artist: {event.artist.name}</p>}
                  {event.startTime && <p>Start: {new Date(event.startTime).toLocaleDateString()}</p>}
                  {event.ticketTypes && <p>{event.ticketTypes.length} ticket type{event.ticketTypes.length !== 1 ? 's' : ''}</p>}
                </div>
                <div className="card-footer">
                  <button
                    className="details-button"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="carousel-arrow right" onClick={() => scroll('right', 4)}>&gt;</button>
      </div>
    </div>
  );
}
