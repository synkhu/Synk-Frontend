"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  ticketTypeId: string;
  ticketTypeName: string;
  ticketToken: string;
  createdAt: string;
  thumbnailUrl?: string;
  qrCode?: string;
}

interface GroupedTickets {
  [eventName: string]: Ticket[];
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, []);

  const toggleCategory = (eventName: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [eventName]: !prev[eventName]
    }));
  };

  const fetchTickets = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("https://api.synk.hu/tickets/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ticketsArray = Array.isArray(data) ? data : data.items || [];
      setTickets(ticketsArray);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTicket = async (ticketId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const { data } = await axios.get(`https://api.synk.hu/tickets/${ticketId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download ticket");
    }
  };

  const groupedTickets: GroupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.eventName]) {
      acc[ticket.eventName] = [];
    }
    acc[ticket.eventName].push(ticket);
    return acc;
  }, {} as GroupedTickets);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Fetching your tickets...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Tickets</h1>
        <p className="text-gray-500 text-sm md:text-base">View and manage your event passes grouped by event</p>
      </header>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 flex items-center">
          <svg className="w-6 h-6 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {Object.keys(groupedTickets).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 border border-white/10 rounded-[3rem]">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">No tickets found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Looks like you haven't booked any events yet. Check out our upcoming events!</p>
          </div>
          <button 
            onClick={() => router.push("/all-events")}
            className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedTickets).map(([eventName, tickets]) => (
            <div key={eventName} className="space-y-6">
              <button 
                onClick={() => toggleCategory(eventName)}
                className="w-full flex items-center gap-2 px-1 group/header"
              >
                <div className="h-8 w-1.5 bg-purple-600 rounded-full" />
                <h2 className="text-2xl font-black text-white tracking-tight uppercase transition-colors group-hover/header:text-purple-400">{eventName}</h2>
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                  {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
                </span>
                <svg 
                  className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${collapsedCategories[eventName] ? '-rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!collapsedCategories[eventName] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10"
                    >
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-purple-500/20">
                              {ticket.ticketTypeName}
                            </span>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 pt-2">Pass ID: #{ticket.id.slice(-6)}</p>
                          </div>
                          {ticket.qrCode && (
                            <div className="relative w-16 h-16 bg-white rounded-2xl p-2 flex-shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-110">
                              <Image 
                                src={ticket.qrCode} 
                                alt="QR" 
                                fill
                                className="p-2 object-contain"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); downloadTicket(ticket.id); }}
                          className="w-full py-4 bg-white text-black font-black text-sm rounded-2xl transition-all hover:bg-gray-200 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          DOWNLOAD PASS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
