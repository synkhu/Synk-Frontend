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

const mapEventDetails = (data: any): EventDetails => ({
  ...data,
  venueId: data.venueId ?? data.venueid ?? data.venue?.id ?? undefined,
  venueName: data.venueName ?? data.venuename ?? data.venue?.name ?? undefined,
  venueAddress: data.venueAddress ?? data.venue_address ?? data.venue?.address ?? undefined,
  artistName: data.artistName ?? data.artistname ?? data.artist?.name ?? undefined,
  artistId: data.artistId ?? data.artistid ?? data.artist?.id ?? undefined,
});

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [eventId, setEventId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        setEvent(mapEventDetails(res.data));
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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const handleBuyTicket = async () => {
    const selectedItems = Object.entries(ticketQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ ticketTypeId: id, quantity: qty }));

    if (selectedItems.length === 0) return alert("Select at least one ticket");
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to purchase tickets");
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/orders/purchase`, 
        { eventId, items: selectedItems },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(`Purchased! Order ID: ${data.orderId}`);
      setTicketQuantities({});
      const res = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(mapEventDetails(res.data));
    } catch (err: any) {
      alert("Purchase failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4 bg-red-500/5 border border-red-500/20 p-8 rounded-3xl text-red-400">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error || "Event not found"}</p>
        <button onClick={() => router.push("/")} className="w-full py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200">Back Home</button>
      </div>
    </div>
  );

  const imageUrls = (event as any).imageUrls || [event.thumbnailUrl].filter(Boolean);

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Left: Event Main Content */}
        <div className="lg:col-span-3 space-y-10">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 aspect-video group">
            {imageUrls.length > 0 ? (
              <>
                <img 
                  src={imageUrls[currentImageIndex]} 
                  alt={event.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                {imageUrls.length > 1 && (
                  <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
                    {imageUrls.map((_: any, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />
            )}
          </div>

          <div className="space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest rounded-full">Music Event</span>
                {event.totalCapacity && <span className="px-4 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-full">{event.totalCapacity} Capacity</span>}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">{event.name}</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Date & Time</p>
                <p className="text-lg text-white font-semibold">{formatDate(event.startTime)}</p>
                <p className="text-sm text-gray-500">Ends {formatDate(event.endTime)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Location</p>
                <p className="text-lg text-white font-semibold">{event.venueName || "Venue TBD"}</p>
                {event.venueAddress && <p className="text-sm text-gray-500">{event.venueAddress}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">About Event</h2>
              <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Ticket Sidebar */}
        <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 space-y-8 backdrop-blur-xl">
            <header className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">Get Your Tickets</h2>
              <p className="text-gray-500 text-sm">Secure your spot at this event</p>
            </header>

            <div className="space-y-4">
              {event.ticketTypes?.map((ticket) => (
                <div 
                  key={ticket.id}
                  className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                    ticketQuantities[ticket.id] > 0 
                      ? "bg-purple-500/10 border-purple-500/50" 
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-lg">{ticket.name}</h3>
                        <p className="text-purple-400 font-bold">{ticket.price.toLocaleString()} HUF</p>
                      </div>
                      <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-1 border border-white/5">
                        <button 
                          onClick={() => setTicketQuantities(p => ({ ...p, [ticket.id]: Math.max(0, (p[ticket.id] || 0) - 1) }))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                        </button>
                        <span className="text-white font-bold w-6 text-center">{ticketQuantities[ticket.id] || 0}</span>
                        <button 
                          onClick={() => setTicketQuantities(p => ({ ...p, [ticket.id]: (p[ticket.id] || 0) + 1 }))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Object.values(ticketQuantities).some(v => v > 0) ? (
              <div className="space-y-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center px-2">
                  <span className="text-gray-400 font-medium">Total Price</span>
                  <span className="text-2xl font-bold text-white">
                    {event.ticketTypes?.reduce((acc, t) => acc + (t.price * (ticketQuantities[t.id] || 0)), 0).toLocaleString()} HUF
                  </span>
                </div>
                <button 
                  onClick={handleBuyTicket}
                  className="w-full py-5 bg-white hover:bg-gray-200 text-black font-extrabold rounded-[2rem] transition-all active:scale-[0.98] shadow-2xl shadow-white/5"
                >
                  Confirm Purchase
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm italic">Select ticket quantity to proceed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
