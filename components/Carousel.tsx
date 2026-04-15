"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

interface EventItem {
  id: string;
  name: string;
  venueName?: string | null;
  thumbnailUrl?: string | null;
  totalCapacity?: number | null;
}

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const totalSlides = events.length;

  useEffect(() => {
    axios
      .get("https://api.synk.hu/events")
      .then((res) => {
        setEvents(res.data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load events:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [totalSlides]);

  const goToSlide = (index: number): void => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 md:h-[400px] bg-white/5 rounded-3xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 md:h-[400px] bg-white/5 rounded-3xl border border-white/5">
        <p className="text-gray-400 font-medium text-lg">No large events available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full md:py-6 group/carousel">
      <div className="relative h-[180px] md:h-[360px] perspective-[1600px] overflow-hidden">
        {/* Navigation Arrows */}
        <button
          type="button"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-purple-600 transition-all opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
          onClick={prevSlide}
          aria-label="Previous event"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19 8 12l7-7" /></svg>
        </button>

        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-purple-600 transition-all opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
          onClick={nextSlide}
          aria-label="Next event"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 5 7 7-7 7" /></svg>
        </button>

        {/* Slides */}
        <div className="relative w-full h-full flex items-center justify-center">
          {events.map((event, index) => {
            const offset = (index - currentSlide + totalSlides) % totalSlides;
            let style = {};
            let zIndex = 0;
            let opacity = 0;
            let pointerEvents: "auto" | "none" = "none";

            if (offset === 0) {
              style = { transform: "translateX(-50%) translateY(-50%) scale(1)" };
              zIndex = 30;
              opacity = 1;
              pointerEvents = "auto";
            } else if (offset === 1) {
              style = { transform: "translateX(20%) translateY(-50%) scale(0.85) rotateY(-10deg)" };
              zIndex = 20;
              opacity = 0.6;
            } else if (offset === totalSlides - 1) {
              style = { transform: "translateX(-120%) translateY(-50%) scale(0.85) rotateY(10deg)" };
              zIndex = 20;
              opacity = 0.6;
            } else if (offset === 2) {
              style = { transform: "translateX(80%) translateY(-50%) scale(0.7) rotateY(-20deg)" };
              zIndex = 10;
              opacity = 0.2;
            } else if (offset === totalSlides - 2) {
              style = { transform: "translateX(-180%) translateY(-50%) scale(0.7) rotateY(20deg)" };
              zIndex = 10;
              opacity = 0.2;
            }

            return (
              <button
                key={event.id}
                type="button"
                className={`absolute top-1/2 left-1/2 w-[100%] md:w-[60%] max-w-[640px] aspect-video rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${offset === 0 ? "block" : "hidden md:block"}`}
                style={{ ...style, zIndex, opacity, pointerEvents }}
                onClick={() => router.push(`/events/${event.id}`)}
              >
                {event.thumbnailUrl ? (
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.name}
                    fill
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-950" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 md:p-8 text-left">
                  <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-white md:mb-2 line-clamp-1">{event.name}</h3>
                  {event.venueName && (
                    <p className="text-xs sm:text-sm md:text-base text-gray-300 font-medium mb-2 md:mb-4">{event.venueName}</p>
                  )}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-purple-500 transition-colors">
                    View Event
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-3 md:mt-6">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full h-1.5 ${index === currentSlide ? "w-8 bg-purple-500" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
