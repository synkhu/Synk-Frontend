"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "../../../components/navbar";
import "../../../app/page.css";

const API_URL = "https://api.synk.hu";

type TicketType = {
  id: string;
  name: string;
  price: number;
  saleStartTime?: string;
  saleEndTime?: string;
  maxSaleCount?: number;
  remainingCount?: number;
};

type EventDetails = {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  thumbnailUrl?: string;
  totalCapacity?: number;
  ticketMaxScanCount?: number;
  venueId?: string;
  venueName?: string;
  venueAddress?: string;
  artistName?: string;
  artistId?: string;
  ticketTypes?: TicketType[];
};

const mapEventDetails = (data: any): EventDetails => {
  return {
    ...data,
    venueId: data.venueId ?? data.venueid ?? data.venue?.id ?? undefined,
    venueName:
      data.venueName ?? data.venuename ?? data.venue?.name ?? undefined,
    venueAddress:
      data.venueAddress ??
      data.venue_address ??
      data.venue?.address ??
      undefined,
    artistName:
      data.artistName ?? data.artistname ?? data.artist?.name ?? undefined,
    artistId: data.artistId ?? data.artistid ?? data.artist?.id ?? undefined,
  };
};

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<string, number>
  >({});
  const [eventId, setEventId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [navbarOpen, setNavbarOpen] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    async function fetchEventDetails() {
      try {
        const res = await axios.get(`${API_URL}/events/${eventId}`);
        const data = res.data as any;
        setEvent(mapEventDetails(data));
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load event details");
        setLoading(false);
      }
    }

    fetchEventDetails();
  }, [eventId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    // Reset image index when event changes
    setCurrentImageIndex(0);
  }, [event?.id]);

  const handleBuyTicket = async () => {
    const selectedItems = Object.entries(ticketQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity,
      }));

    if (selectedItems.length === 0) {
      alert("Please select at least one ticket");
      return;
    }

    if (!eventId) {
      alert("Event ID not found");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to purchase tickets");
      router.push("/");
      return;
    }

    try {
      const options = {
        method: "POST",
        url: `${API_URL}/orders/purchase`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          eventId: eventId,
          items: selectedItems,
        },
      };

      const { data } = await axios.request(options);

      alert(
        `Successfully purchased ${data.ticketCount} ticket(s)!\n\n` +
          `Order ID: ${data.orderId}\n` +
          `Total Amount: ${data.totalAmount} HUF\n` +
          `Status: ${data.status}\n\n` +
          `Check your tickets in "My Tickets" section.`,
      );

      setTicketQuantities({});

      const res = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(mapEventDetails(res.data));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Failed to purchase tickets. Please try again.";
      alert(
        `Error: ${typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)}`,
      );
    }
  };

  if (loading) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center w-full"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <div className="text-xl text-white">Loading event details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center w-full"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
              <p className="text-gray-300 mb-4">{error || "Event not found"}</p>
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
        <Navbar
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          navbarOpen={navbarOpen}
          setNavbarOpen={setNavbarOpen}
        />
      </div>
      <div className="content-column">
        <div
          className="h-screen py-2 px-2 w-full overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
          }}
        >
          <div className="w-full mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push("/")}
              className="mb-4 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition text-base font-medium"
            >
              <span>←</span> Back to Home
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start h-[calc(100vh-76px)]">
              {/* Event Header */}
              <div className="relative overflow-hidden rounded-3xl border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/60 via-[#120626]/80 to-[#120626]/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
                {(() => {
                  const raw = event as any;
                  const imageUrls: string[] =
                    (Array.isArray(raw?.imageUrls) ? raw.imageUrls : null) ||
                    (Array.isArray(raw?.images) ? raw.images : null) ||
                    (Array.isArray(raw?.gallery) ? raw.gallery : null) ||
                    (event.thumbnailUrl ? [event.thumbnailUrl] : []);

                  if (!imageUrls.length) return null;

                  const total = imageUrls.length;
                  const current = Math.min(currentImageIndex, total - 1);
                  const canSlide = total > 1;

                  const goPrev = () => {
                    setCurrentImageIndex((prev) => (prev - 1 + total) % total);
                  };

                  const goNext = () => {
                    setCurrentImageIndex((prev) => (prev + 1) % total);
                  };

                  return (
                    <div className="relative w-full h-64 overflow-hidden">
                      <img
                        src={imageUrls[current]}
                        alt={event.name}
                        className="w-full h-full object-cover scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120626]/95 via-[#2d1b4e]/60 to-transparent" />

                      {canSlide && (
                        <>
                          {/* Navigation arrows */}
                          <button
                            type="button"
                            onClick={goPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition border border-white/40 backdrop-blur-sm"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition border border-white/40 backdrop-blur-sm"
                          >
                            ›
                          </button>

                          {/* Dots indicator */}
                          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                            {imageUrls.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2.5 h-2.5 rounded-full border border-white/60 transition ${
                                  idx === current ? "bg-white" : "bg-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                <div className="p-6">
                  <p className="text-sm font-semibold tracking-[0.25em] uppercase text-purple-200/80 mb-2">
                    Music Event
                  </p>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-[0_10px_25px_rgba(0,0,0,0.75)]">
                    {event.name}
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Date & Time Info */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="font-semibold text-purple-200">
                            Start Time
                          </p>
                          <p className="text-gray-100">
                            {formatDate(event.startTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🕐</span>
                        <div>
                          <p className="font-semibold text-purple-200">
                            End Time
                          </p>
                          <p className="text-gray-100">
                            {formatDate(event.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Venue & Artist Info */}
                    <div className="space-y-3">
                      {event.venueName && (
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📍</span>
                          <div>
                            <p className="font-semibold text-purple-200">
                              Venue
                            </p>
                            {event.venueId ? (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/venues/${event.venueId}`)
                                }
                                className="text-purple-300 hover:text-purple-200 underline underline-offset-2 font-medium"
                              >
                                {event.venueName}
                              </button>
                            ) : (
                              <p className="text-gray-100">{event.venueName}</p>
                            )}
                            {event.venueAddress && (
                              <p className="text-sm text-purple-100/80">
                                {event.venueAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {event.artistName && (
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🎤</span>
                          <div>
                            <p className="font-semibold text-purple-200">
                              Artist
                            </p>
                            {event.artistId ? (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/artists/${event.artistId}`)
                                }
                                className="text-purple-300 hover:text-purple-200 underline underline-offset-2 font-medium"
                              >
                                {event.artistName}
                              </button>
                            ) : (
                              <p className="text-gray-100">
                                {event.artistName}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {event.totalCapacity && (
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">👥</span>
                          <div>
                            <p className="font-semibold text-purple-200">
                              Capacity
                            </p>
                            <p className="text-gray-100">
                              {event.totalCapacity} people
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="border-t border-[#4c3073]/60 pt-3 mt-1">
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">
                      About This Event
                    </h2>
                    <p className="text-gray-200 whitespace-pre-wrap max-w-3xl">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Purchase Section */}
              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="rounded-3xl bg-gradient-to-br from-[#2d1b4e]/80 via-[#2d1b4e] to-[#120626] shadow-[0_18px_60px_rgba(0,0,0,0.85)] p-4 border border-[#4c3073]/60 max-h-[65vh] overflow-y-auto tickets-scroll">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold tracking-[0.35em] uppercase text-purple-200/80 mb-2">
                      Ticket
                    </p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide mb-2">
                      Choose your ticket
                    </h2>
                    <p className="text-sm text-purple-100/80 max-w-xl mx-auto">
                      Select the perfect option for your night – from a single
                      show to a full season of music experiences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {event.ticketTypes!.map((ticket) => {
                      const isAvailable =
                        !ticket.maxSaleCount ||
                        (ticket.remainingCount && ticket.remainingCount > 0);
                      const isSaleActive = true;
                      const currentQuantity = ticketQuantities[ticket.id] || 0;
                      const maxAllowed = ticket.remainingCount || 10;

                      let borderClasses = "border-[#4c3073]/50";

                      if (currentQuantity >= 3) {
                        borderClasses = "border-[#5a3d8a]/80";
                      } else if (currentQuantity >= 1) {
                        borderClasses = "border-[#4c3073]/70";
                      }

                      const maxVisualSteps = 5;
                      const clampedQuantity = Math.min(
                        currentQuantity,
                        maxVisualSteps,
                      );
                      const strength = clampedQuantity / maxVisualSteps; // 0..1
                      const overlayOpacity =
                        strength === 0 ? 0 : 0.25 + strength * 0.75; // 0, then 0.4..1

                      return (
                        <div
                          key={ticket.id}
                          className={`relative overflow-hidden rounded-[20px] p-4 border bg-[#120626]/90 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.9)] ${borderClasses} ${
                            !isAvailable || !isSaleActive ? "opacity-60" : ""
                          }`}
                        >
                          {/* Animated color overlay for "waterpaint" effect */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(circle at 0 0, rgba(244,114,182,0.7) 0%, rgba(129,140,248,0.9) 32%, rgba(56,189,248,0.6) 55%, rgba(15,23,42,0.98) 90%)",
                              mixBlendMode: "screen",
                              opacity: overlayOpacity,
                              transition:
                                "opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                            }}
                          />

                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="text-center mb-3">
                              <p className="text-xs tracking-[0.25em] uppercase text-purple-100/80">
                                {ticket.name}
                              </p>
                              <p className="mt-3 text-2xl font-extrabold text-white">
                                {ticket.price.toFixed(0)} HUF
                              </p>
                              {ticket.maxSaleCount && (
                                <p className="mt-1 text-[11px] text-purple-100/80">
                                  {ticket.remainingCount || 0} /{" "}
                                  {ticket.maxSaleCount} available
                                </p>
                              )}
                              {ticket.saleStartTime && ticket.saleEndTime && (
                                <p className="mt-1 text-[11px] text-purple-100/70">
                                  Sale:{" "}
                                  {new Date(
                                    ticket.saleStartTime,
                                  ).toLocaleDateString()}{" "}
                                  –{" "}
                                  {new Date(
                                    ticket.saleEndTime,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {isAvailable && isSaleActive ? (
                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-purple-100/80 tracking-wide uppercase">
                                  Quantity
                                </span>
                                <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1.5 border border-white/10">
                                  <button
                                    onClick={() => {
                                      const newQuantity = Math.max(
                                        0,
                                        currentQuantity - 1,
                                      );
                                      setTicketQuantities((prev) => ({
                                        ...prev,
                                        [ticket.id]: newQuantity,
                                      }));
                                    }}
                                    disabled={currentQuantity === 0}
                                    className="w-8 h-8 rounded-full bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                                  >
                                    -
                                  </button>
                                  <span className="text-white font-semibold min-w-[26px] text-center text-sm">
                                    {currentQuantity}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newQuantity = Math.min(
                                        maxAllowed,
                                        currentQuantity + 1,
                                      );
                                      setTicketQuantities((prev) => ({
                                        ...prev,
                                        [ticket.id]: newQuantity,
                                      }));
                                    }}
                                    disabled={currentQuantity >= maxAllowed}
                                    className="w-8 h-8 rounded-full bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-auto text-right text-sm">
                                {!isAvailable && (
                                  <p className="text-red-300">Sold Out</p>
                                )}
                                {!isSaleActive && (
                                  <p className="text-orange-300">
                                    Not Available
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total and Purchase */}
                  <div className="border-t border-[#4c3073]/60 pt-3 mt-1">
                    {Object.keys(ticketQuantities).some(
                      (id) => ticketQuantities[id] > 0,
                    ) ? (
                      <div className="space-y-4">
                        {/* Breakdown */}
                        <div className="space-y-2">
                          {event.ticketTypes
                            .filter((ticket) => ticketQuantities[ticket.id] > 0)
                            .map((ticket) => (
                              <div
                                key={ticket.id}
                                className="flex justify-between text-gray-300"
                              >
                                <span>
                                  {ticket.name} x {ticketQuantities[ticket.id]}
                                </span>
                                <span>
                                  {(
                                    ticket.price * ticketQuantities[ticket.id]
                                  ).toFixed(0)}{" "}
                                  HUF
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center bg-[#2d1b4e] px-3 py-3 rounded-lg border border-[#4c3073]/60">
                          <span className="text-2xl font-bold text-white">
                            Total:
                          </span>
                          <span className="text-3xl font-bold text-purple-200">
                            {event.ticketTypes
                              .reduce((sum, ticket) => {
                                const qty = ticketQuantities[ticket.id] || 0;
                                return sum + ticket.price * qty;
                              }, 0)
                              .toFixed(0)}{" "}
                            HUF
                          </span>
                        </div>

                        {/* Purchase Button */}
                        <button
                          onClick={handleBuyTicket}
                          className="w-full bg-gradient-to-r from-[#4c3073] to-[#2d1b4e] hover:from-[#5a3d8a] hover:to-[#4c3073] text-white px-6 py-3 rounded-xl font-semibold text-base transition shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
                        >
                          Purchase Tickets
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        Select ticket quantities above to purchase
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
