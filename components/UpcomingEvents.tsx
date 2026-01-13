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

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    axios.get('https://api.synk.hu/events')
      .then(res => {
        setEvents(res.data.items.slice(0, 10));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load events');
        setLoading(false);
      });
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
    <div className='main'>
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
                <h3>{event.name}</h3>
                {event.venueName && <p>Venue: {event.venueName}</p>}
                {event.artistName && <p>Artist: {event.artistName}</p>}
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
