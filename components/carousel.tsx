"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./carousel.css";

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

    const goToSlide = (index: number): void => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    if (loading) {
        return (
            <div className="carousel-shell flex items-center justify-center h-56 md:h-96">
                <p className="text-white text-xl">Loading events...</p>
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <div className="carousel-shell flex items-center justify-center h-56 md:h-96">
                <p className="text-white text-xl">No large events available</p>
            </div>
        )
    }

    return (
        <div className="carousel-shell">
            <div className="carousel-outer">
                <button
                    type="button"
                    className="carousel-arrow carousel-arrow-left"
                    onClick={prevSlide}
                    aria-label="Previous event"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            d="M15 19 8 12l7-7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                <div className="carousel-stage">
                    {events.map((event, index) => {
                        if (!totalSlides) return null;
                        const offset = (index - currentSlide + totalSlides) % totalSlides;

                        let positionClass = "carousel-card-hidden";
                        if (offset === 0) positionClass = "carousel-card-center";
                        else if (offset === 1) positionClass = "carousel-card-right-1";
                        else if (offset === totalSlides - 1)
                            positionClass = "carousel-card-left-1";
                        else if (offset === 2) positionClass = "carousel-card-right-2";
                        else if (offset === totalSlides - 2)
                            positionClass = "carousel-card-left-2";

                        return (
                            <button
                                key={event.id}
                                type="button"
                                className={`carousel-card ${positionClass}`}
                                onClick={() => router.push(`/events/${event.id}`)}
                            >
                                {event.thumbnailUrl ? (
                                    <img
                                        src={event.thumbnailUrl}
                                        alt={event.name}
                                        className="carousel-card-image"
                                    />
                                ) : (
                                    <div className="carousel-card-fallback" />
                                )}
                                <div className="carousel-card-gradient" />
                                <div className="carousel-card-content">
                                    <h3 className="carousel-card-title">{event.name}</h3>
                                    {event.venueName && (
                                        <p className="carousel-card-venue">{event.venueName}</p>
                                    )}
                                    <div className="carousel-card-cta">View details</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="carousel-arrow carousel-arrow-right"
                    onClick={nextSlide}
                    aria-label="Next event"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            d="m9 5 7 7-7 7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            <div className="carousel-dots">
                {events.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`carousel-dot ${
                            index === currentSlide ? "carousel-dot-active" : ""
                        }`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}