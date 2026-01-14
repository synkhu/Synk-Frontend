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
  gateTime?: string;
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
      data.venueName ??
      data.venuename ??
      data.venue?.name ??
      undefined,
    venueAddress:
      data.venueAddress ??
      data.venue_address ??
      data.venue?.address ??
      undefined,
    artistName:
      data.artistName ??
      data.artistname ??
      data.artist?.name ??
      undefined,
    artistId:
      data.artistId ??
      data.artistid ??
      data.artist?.id ??
      undefined,
  };
};

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [eventId, setEventId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
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

  const handleBuyTicket = async () => {
    // Get selected tickets with quantities > 0
    const selectedItems = Object.entries(ticketQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity
      }));

    if (selectedItems.length === 0) {
      alert("Please select at least one ticket");
      return;
    }

    if (!eventId) {
      alert("Event ID not found");
      return;
    }

    // Get auth token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to purchase tickets");
      router.push("/");
      return;
    }

    try {
      const options = {
        method: 'POST',
        url: `${API_URL}/orders/purchase`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          eventId: eventId,
          items: selectedItems
        }
      };

      const { data } = await axios.request(options);
      
      // Show success message with order details
      alert(
        `Successfully purchased ${data.ticketCount} ticket(s)!\n\n` +
        `Order ID: ${data.orderId}\n` +
        `Total Amount: ${data.totalAmount} HUF\n` +
        `Status: ${data.status}\n\n` +
        `Check your tickets in "Jegyeim" section.`
      );
      
      // Reset selection
      setTicketQuantities({});
      
      // Refresh event details to update remaining tickets
      const res = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(mapEventDetails(res.data));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || "Failed to purchase tickets. Please try again.";
      alert(`Error: ${typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}`);
    }
  };

  if (loading) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
        </div>
        <div className="content-column">
          <div className="min-h-screen flex items-center justify-center bg-[#1a0f2e] w-full">
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
          <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
        </div>
        <div className="content-column">
          <div className="min-h-screen flex items-center justify-center bg-[#1a0f2e] w-full">
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
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} navbarOpen={navbarOpen} setNavbarOpen={setNavbarOpen} />
      </div>
      <div className="content-column">
        <div className="min-h-screen bg-[#1a0f2e] py-8 px-4 w-full">
          <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="mb-6 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition text-lg font-medium"
          >
            <span>←</span> Back to Home
          </button>

        {/* Event Header */}
        <div className="bg-[#2d1b4e] rounded-lg shadow-lg overflow-hidden mb-6 border border-[#5a3d8a]">
          {event.thumbnailUrl && (
            <div className="w-full h-96 overflow-hidden bg-gray-900">
              <img
                src={event.thumbnailUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date & Time Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-semibold text-purple-300">Start Time</p>
                    <p className="text-gray-300">{formatDate(event.startTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="font-semibold text-purple-300">End Time</p>
                    <p className="text-gray-300">{formatDate(event.endTime)}</p>
                  </div>
                </div>

                {event.gateTime && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚪</span>
                    <div>
                      <p className="font-semibold text-purple-300">Gates Open</p>
                      <p className="text-gray-300">{formatDate(event.gateTime)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Venue & Artist Info */}
              <div className="space-y-3">
                {event.venueName && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="font-semibold text-purple-300">Venue</p>
                      {event.venueId ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/venues/${event.venueId}`)}
                          className="text-purple-300 hover:text-purple-200 underline underline-offset-2 font-medium"
                        >
                          {event.venueName}
                        </button>
                      ) : (
                        <p className="text-gray-300">{event.venueName}</p>
                      )}
                      {event.venueAddress && (
                        <p className="text-sm text-gray-400">{event.venueAddress}</p>
                      )}
                    </div>
                  </div>
                )}

                {event.artistName && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎤</span>
                    <div>
                      <p className="font-semibold text-purple-300">Artist</p>
                      {event.artistId ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/artists/${event.artistId}`)}
                          className="text-purple-300 hover:text-purple-200 underline underline-offset-2 font-medium"
                        >
                          {event.artistName}
                        </button>
                      ) : (
                        <p className="text-gray-300">{event.artistName}</p>
                      )}
                    </div>
                  </div>
                )}

                {event.totalCapacity && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-semibold text-purple-300">Capacity</p>
                      <p className="text-gray-300">{event.totalCapacity} people</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-[#5a3d8a] pt-6">
              <h2 className="text-2xl font-bold text-white mb-3">About This Event</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Ticket Purchase Section */}
        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <div className="bg-[#2d1b4e] rounded-lg shadow-lg p-8 border border-[#5a3d8a]">
            <h2 className="text-3xl font-bold text-white mb-6">Get Your Tickets</h2>
            
            <div className="space-y-4 mb-8">
              {event.ticketTypes.map((ticket) => {
                const isAvailable = !ticket.maxSaleCount || (ticket.remainingCount && ticket.remainingCount > 0);
                const isSaleActive = true; // TODO: Check if current time is between saleStartTime and saleEndTime
                const currentQuantity = ticketQuantities[ticket.id] || 0;
                const maxAllowed = ticket.remainingCount || 10;
                
                return (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 transition border-[#5a3d8a] ${
                      !isAvailable || !isSaleActive ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{ticket.name}</h3>
                          {ticket.maxSaleCount && (
                            <p className="text-sm text-gray-400">
                              {ticket.remainingCount || 0} / {ticket.maxSaleCount} available
                            </p>
                          )}
                          {ticket.saleStartTime && ticket.saleEndTime && (
                            <p className="text-xs text-gray-500">
                              Sale: {new Date(ticket.saleStartTime).toLocaleDateString()} - {new Date(ticket.saleEndTime).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-2xl font-bold text-purple-300 min-w-[120px] text-right">{ticket.price.toFixed(0)} HUF</p>
                        
                        {isAvailable && isSaleActive ? (
                          <div className="flex items-center gap-3 bg-[#1a0f2e] rounded-lg px-4 py-2">
                            <button
                              onClick={() => {
                                const newQuantity = Math.max(0, currentQuantity - 1);
                                setTicketQuantities(prev => ({
                                  ...prev,
                                  [ticket.id]: newQuantity
                                }));
                              }}
                              disabled={currentQuantity === 0}
                              className="w-8 h-8 rounded-full bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                              -
                            </button>
                            <span className="text-white font-semibold min-w-[30px] text-center">{currentQuantity}</span>
                            <button
                              onClick={() => {
                                const newQuantity = Math.min(maxAllowed, currentQuantity + 1);
                                setTicketQuantities(prev => ({
                                  ...prev,
                                  [ticket.id]: newQuantity
                                }));
                              }}
                              disabled={currentQuantity >= maxAllowed}
                              className="w-8 h-8 rounded-full bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-[140px] text-right">
                            {!isAvailable && <p className="text-sm text-red-400">Sold Out</p>}
                            {!isSaleActive && <p className="text-sm text-orange-400">Not Available</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total and Purchase */}
            <div className="border-t border-[#5a3d8a] pt-6">
              {Object.keys(ticketQuantities).some(id => ticketQuantities[id] > 0) ? (
                <div className="space-y-4">
                  {/* Breakdown */}
                  <div className="space-y-2">
                    {event.ticketTypes
                      .filter(ticket => ticketQuantities[ticket.id] > 0)
                      .map(ticket => (
                        <div key={ticket.id} className="flex justify-between text-gray-300">
                          <span>{ticket.name} x {ticketQuantities[ticket.id]}</span>
                          <span>{(ticket.price * ticketQuantities[ticket.id]).toFixed(0)} HUF</span>
                        </div>
                      ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center bg-[#3d2b5e] p-4 rounded-lg border border-[#5a3d8a]">
                    <span className="text-2xl font-bold text-white">Total:</span>
                    <span className="text-3xl font-bold text-purple-300">
                      {event.ticketTypes
                        .reduce((sum, ticket) => {
                          const qty = ticketQuantities[ticket.id] || 0;
                          return sum + (ticket.price * qty);
                        }, 0)
                        .toFixed(0)} HUF
                    </span>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={handleBuyTicket}
                    className="w-full bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg"
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
  );
}
