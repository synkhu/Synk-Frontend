"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  venueName?: string;
  venueAddress?: string;
  artistName?: string;
  artistId?: string;
  ticketTypes?: TicketType[];
};

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [eventId, setEventId] = useState<string | null>(null);
  const router = useRouter();

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
        setEvent(res.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch event details:", err);
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
    if (!selectedTicketType) {
      alert("Please select a ticket type");
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
          ticketTypeId: selectedTicketType,
          quantity: quantity
        }
      };

      const { data } = await axios.request(options);
      console.log("Purchase successful:", data);
      
      alert(`Successfully purchased ${quantity} ticket(s)! Check your tickets in your account.`);
      
      // Reset selection
      setSelectedTicketType(null);
      setQuantity(1);
      
      // Refresh event details to update remaining tickets
      const res = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(res.data);
      
    } catch (error: any) {
      console.error("Purchase failed:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || "Failed to purchase tickets. Please try again.";
      alert(`Error: ${typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Event not found"}</p>
          <button
            onClick={() => router.push("/events")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/events")}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 transition"
        >
          <span>←</span> Back to Events
        </button>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {event.thumbnailUrl && (
            <div className="w-full h-96 overflow-hidden bg-gray-200">
              <img
                src={event.thumbnailUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date & Time Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-semibold text-gray-700">Start Time</p>
                    <p className="text-gray-600">{formatDate(event.startTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="font-semibold text-gray-700">End Time</p>
                    <p className="text-gray-600">{formatDate(event.endTime)}</p>
                  </div>
                </div>

                {event.gateTime && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚪</span>
                    <div>
                      <p className="font-semibold text-gray-700">Gates Open</p>
                      <p className="text-gray-600">{formatDate(event.gateTime)}</p>
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
                      <p className="font-semibold text-gray-700">Venue</p>
                      <p className="text-gray-600">{event.venueName}</p>
                      {event.venueAddress && (
                        <p className="text-sm text-gray-500">{event.venueAddress}</p>
                      )}
                    </div>
                  </div>
                )}

                {event.artistName && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎤</span>
                    <div>
                      <p className="font-semibold text-gray-700">Artist</p>
                      <p className="text-gray-600">{event.artistName}</p>
                    </div>
                  </div>
                )}

                {event.totalCapacity && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-semibold text-gray-700">Capacity</p>
                      <p className="text-gray-600">{event.totalCapacity} people</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Ticket Purchase Section */}
        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get Your Tickets</h2>
            
            <div className="space-y-4 mb-8">
              {event.ticketTypes.map((ticket) => {
                const isAvailable = !ticket.maxSaleCount || (ticket.remainingCount && ticket.remainingCount > 0);
                const isSaleActive = true; // TODO: Check if current time is between saleStartTime and saleEndTime
                
                return (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 transition ${
                      selectedTicketType === ticket.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${!isAvailable || !isSaleActive ? "opacity-50" : "cursor-pointer"}`}
                    onClick={() => isAvailable && isSaleActive && setSelectedTicketType(ticket.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="ticketType"
                          checked={selectedTicketType === ticket.id}
                          onChange={() => setSelectedTicketType(ticket.id)}
                          disabled={!isAvailable || !isSaleActive}
                          className="w-5 h-5"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.name}</h3>
                          {ticket.maxSaleCount && (
                            <p className="text-sm text-gray-600">
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
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${ticket.price.toFixed(2)}</p>
                        {!isAvailable && <p className="text-sm text-red-600">Sold Out</p>}
                        {!isSaleActive && <p className="text-sm text-orange-600">Not Available</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity and Purchase */}
            {selectedTicketType && (
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-700">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${(
                      (event.ticketTypes.find((t) => t.id === selectedTicketType)?.price || 0) * quantity
                    ).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleBuyTicket}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg"
                >
                  Purchase Tickets
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
