"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  const fetchTickets = useCallback(async () => {
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
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.message
          : "Failed to load tickets";

      setError(message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const toggleCategory = (eventName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [eventName]: !prev[eventName],
    }));
  };

  const downloadTicket = async (ticketId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const { data } = await axios.get(
        `https://api.synk.hu/tickets/${ticketId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download ticket");
    }
  };

  const groupedTickets: GroupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.eventName]) acc[ticket.eventName] = [];
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
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          My Tickets
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          View and manage your event passes grouped by event
        </p>
      </header>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 flex items-center">
          <svg className="w-6 h-6 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {Object.keys(groupedTickets).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 border border-white/10 rounded-[3rem]">
          <h3 className="text-2xl font-bold text-white">
            No tickets found
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Looks like you haven&apos;t booked any events yet. Check out our upcoming events!
          </p>

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
                className="w-full flex flex-col md:flex-row items-start md:items-center gap-2 px-1 group/header"
              >
                <h2 className="text-2xl font-black text-white uppercase">
                  {eventName}
                </h2>
              </button>

              {!collapsedCategories[eventName] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white/5 border border-white/10 rounded-[2.5rem]"
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-xs text-gray-500">
                          Pass ID: #{ticket.id.slice(-6)}
                        </p>

                        {ticket.qrCode && (
                          <div className="relative w-16 h-16 bg-white rounded-2xl">
                            <Image
                              src={ticket.qrCode}
                              alt="QR"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}

                        <button
                          onClick={() => downloadTicket(ticket.id)}
                          className="w-full py-4 bg-white text-black font-black rounded-2xl"
                        >
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