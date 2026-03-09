"use client";

import {
  deleteEvent,
  updateEvent,
  createTicketType,
  deleteTicketType,
  getEvents,
  searchArtists,
  searchVenues,
} from "../services/event.Service";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import Modal from "../../components/Modal";

type TicketType = {
  id?: string;
  name: string;
  price: number;
  saleStartTime: string;
  saleEndTime: string;
  maxSaleCount: string;
};

type Event = {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  venueId?: string;
  venueName?: string;
  thumbnailUrl?: string;
  artistId?: string;
  artistName?: string;
  totalCapacity?: number;
  ticketMaxScanCount?: number;
};

type EventListProps = {
  events?: Event[];
  onUpdate: (events: any[]) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
};

export default function EventList({
  events = [],
  onUpdate,
  onEditStart,
  onEditEnd,
}: EventListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    venueId: "",
    thumbnailUrl: "",
    artistId: "",
    totalCapacity: "",
    ticketMaxScanCount: "",
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [deletedTicketTypeIds, setDeletedTicketTypeIds] = useState<string[]>([]);

  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<any[]>([]);
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<any[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (venueQuery.trim().length < 2) return setVenueResults([]);
      try {
        const results = await searchVenues(venueQuery);
        setVenueResults(results);
      } catch (err) {
        console.error("Venue search failed:", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [venueQuery]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (artistQuery.trim().length < 2) return setArtistResults([]);
      try {
        const results = await searchArtists(artistQuery);
        setArtistResults(results);
      } catch (err) {
        console.error("Artist search failed:", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [artistQuery]);

  async function save(id: string) {
    if (!formData.name.trim()) {
      alert("Event name cannot be empty");
      return;
    }

    const validTicketTypes = ticketTypes.filter((tt) => tt.name.trim() !== "");
    const existingTicketTypes = validTicketTypes.filter((tt) => tt.id);
    const newTicketTypes = validTicketTypes.filter((tt) => !tt.id);

    try {
      // 1. Update event details and existing ticket types
      await updateEvent(
        id,
        formData.name,
        formData.description,
        formData.startTime,
        formData.endTime,
        formData.venueId,
        formData.thumbnailUrl || undefined,
        formData.artistId || null,
        formData.totalCapacity ? parseInt(formData.totalCapacity) : null,
        formData.ticketMaxScanCount
          ? parseInt(formData.ticketMaxScanCount)
          : null,
        existingTicketTypes.length > 0
          ? existingTicketTypes.map((tt) => ({
              id: tt.id,
              name: tt.name,
              price: tt.price,
              saleStartTime: tt.saleStartTime ? new Date(tt.saleStartTime).toISOString() : null,
              saleEndTime: tt.saleEndTime ? new Date(tt.saleEndTime).toISOString() : null,
              maxSaleCount: tt.maxSaleCount ? parseInt(tt.maxSaleCount) : null,
            }))
          : null,
      );

      // 2. Create new ticket types
      for (const tt of newTicketTypes) {
        await createTicketType(id, {
          name: tt.name,
          price: tt.price,
          saleStartTime: tt.saleStartTime,
          saleEndTime: tt.saleEndTime,
          maxSaleCount: tt.maxSaleCount ? parseInt(tt.maxSaleCount) : null,
        });
      }

      // 3. Delete removed ticket types
      for (const ticketId of deletedTicketTypeIds) {
        try {
          await deleteTicketType(id, ticketId);
        } catch (e) {
          console.warn(`Failed to delete ticket type ${ticketId}`, e);
        }
      }

      // 4. Refresh events list
      const updatedEvents = await getEvents();
      onUpdate(updatedEvents);
      setEditingId(null);
      onEditEnd();
      setDeletedTicketTypeIds([]);
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("Failed to save event changes");
    }
  }

  async function remove(id: string) {
    const updatedEvents = await deleteEvent(id);
    onUpdate(updatedEvents);
  }

  async function startEdit(event: Event) {
    setEditingId(event.id);
    onEditStart();

    try {
      const response = await axios.get(
        `https://api.synk.hu/events/${event.id}`,
      );
      const fullEvent = response.data;

      setFormData({
        name: fullEvent.name || "",
        description: fullEvent.description || "",
        startTime: toDateTimeLocal(fullEvent.startTime),
        endTime: toDateTimeLocal(fullEvent.endTime),
        venueId: fullEvent.venueId || "",
        thumbnailUrl: fullEvent.thumbnailUrl || "",
        artistId: fullEvent.artistId || "",
        totalCapacity: fullEvent.totalCapacity?.toString() || "",
        ticketMaxScanCount: fullEvent.ticketMaxScanCount?.toString() || "",
      });

      if (fullEvent.ticketTypes && fullEvent.ticketTypes.length > 0) {
        setTicketTypes(
          fullEvent.ticketTypes.map((tt: any) => ({
            id: tt.id,
            name: tt.name || "",
            price: tt.price || 0,
            saleStartTime: toDateTimeLocal(tt.saleStartTime),
            saleEndTime: toDateTimeLocal(tt.saleEndTime),
            maxSaleCount: tt.maxSaleCount?.toString() || "",
          })),
        );
      } else {
        setTicketTypes([
          {
            name: "",
            price: 0,
            saleStartTime: "",
            saleEndTime: "",
            maxSaleCount: "",
          },
        ]);
      }

      setVenueQuery(event.venueName || "");
      setArtistQuery(fullEvent.artistName || "");
      setDeletedTicketTypeIds([]);
    } catch (err) {
      console.error("Failed to fetch event details:", err);
      alert("Failed to load event details for editing");
    }
  }

  const toDateTimeLocal = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString();
    } catch {
      return "N/A";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!events || events.length === 0 ? (
          <div className="col-span-full text-center py-24">
            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
              <span className="text-4xl">📅</span>
            </div>
            <p className="text-white text-xl font-bold">No events found</p>
            <p className="text-gray-500 mt-2">Start scheduling your events.</p>
          </div>
        ) : (
          events.map((e) => (
            <div key={e.id}>
              <div
                className="group relative h-full rounded-[2rem] border border-white/10 bg-[#1a0b2e]/60 backdrop-blur-sm overflow-hidden hover:bg-[#2d1b4e]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 flex flex-col cursor-pointer"
                onClick={() => router.push(`/events/${e.id}`)}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      startEdit(e);
                    }}
                    className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      remove(e.id);
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-full backdrop-blur-md transition-all"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {e.thumbnailUrl ? (
                  <div className="h-48 w-full overflow-hidden relative">
                    <img
                      src={e.thumbnailUrl}
                      alt={e.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b2e] to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center relative">
                    <span className="text-5xl opacity-50">📅</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b2e] to-transparent opacity-60"></div>
                  </div>
                )}

                <div className="p-6 pt-2 flex flex-col space-y-4 flex-grow">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                      {e.name}
                    </h3>
                    {e.venueName && (
                      <p className="text-purple-400 font-medium text-sm flex items-center">
                        <span className="mr-1">📍</span> {e.venueName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {e.startTime && (
                      <div className="flex items-center text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="mr-3 text-lg">📅</span>
                        <span className="truncate">
                          {formatDate(e.startTime)}
                        </span>
                      </div>
                    )}
                    {e.artistName && (
                      <div className="flex items-center text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="mr-3 text-lg">🎤</span>
                        <span className="truncate">{e.artistName}</span>
                      </div>
                    )}
                  </div>

                  {e.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mt-2">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={editingId !== null}
        onClose={() => {
          setEditingId(null);
          onEditEnd();
        }}
        title="Edit Event"
      >
        <div className="space-y-4">
          <input
            placeholder="Event Name"
            value={formData.name}
            onChange={(ev) =>
              setFormData({ ...formData, name: ev.target.value })
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(ev) =>
              setFormData({ ...formData, description: ev.target.value })
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm resize-none"
            rows={3}
          />
          <input
            placeholder="Thumbnail URL"
            value={formData.thumbnailUrl}
            onChange={(ev) =>
              setFormData({ ...formData, thumbnailUrl: ev.target.value })
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(ev) =>
                  setFormData({ ...formData, startTime: ev.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(ev) =>
                  setFormData({ ...formData, endTime: ev.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Capacity"
              value={formData.totalCapacity}
              onChange={(ev) =>
                setFormData({
                  ...formData,
                  totalCapacity: ev.target.value,
                })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
            <input
              type="number"
              placeholder="Max Scan Count"
              value={formData.ticketMaxScanCount}
              onChange={(ev) =>
                setFormData({
                  ...formData,
                  ticketMaxScanCount: ev.target.value,
                })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
          </div>

          {/* Venue Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
              Venue
            </label>
            <input
              value={venueQuery}
              onChange={(ev) => {
                setVenueQuery(ev.target.value);
              }}
              placeholder="Search venue"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
            {venueResults.length > 0 && (
              <ul className="absolute z-50 w-full bg-[#1a0b2e] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto mt-1">
                {venueResults.map((venue) => (
                  <li
                    key={venue.id}
                    className="cursor-pointer px-4 py-2 hover:bg-white/10 text-white text-sm"
                    onClick={() => {
                      setFormData({ ...formData, venueId: venue.id });
                      setVenueQuery(venue.name);
                      setVenueResults([]);
                    }}
                  >
                    {venue.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Artist Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
              Artist
            </label>
            <input
              value={artistQuery}
              onChange={(ev) => {
                setArtistQuery(ev.target.value);
              }}
              placeholder="Search artist (optional)"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
            {artistResults.length > 0 && (
              <ul className="absolute z-50 w-full bg-[#1a0b2e] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto mt-1">
                {artistResults.map((artist) => (
                  <li
                    key={artist.id}
                    className="cursor-pointer px-4 py-2 hover:bg-white/10 text-white text-sm"
                    onClick={() => {
                      setFormData({ ...formData, artistId: artist.id });
                      setArtistQuery(artist.name);
                      setArtistResults([]);
                    }}
                  >
                    {artist.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-bold text-white mb-4">
              Ticket Types
            </h4>
            {ticketTypes.map((ticket, index) => (
              <div
                key={index}
                className="border border-white/10 p-4 rounded-xl bg-white/5 mb-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-gray-400 uppercase tracking-wider">
                    Ticket Type {index + 1}
                  </span>
                  {ticketTypes.length > 1 && (
                    <button
                      onClick={() => {
                        const ticket = ticketTypes[index];
                        if (ticket.id) {
                          setDeletedTicketTypeIds([
                            ...deletedTicketTypeIds,
                            ticket.id,
                          ]);
                        }
                        setTicketTypes(
                          ticketTypes.filter((_, i) => i !== index),
                        );
                      }}
                      className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={ticket.name}
                    onChange={(ev) => {
                      setTicketTypes(ticketTypes.map((t, i) => 
                        i === index ? { ...t, name: ev.target.value } : t
                      ));
                    }}
                    placeholder="Ticket Name"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                  <input
                    type="number"
                    value={ticket.price || ""}
                    onChange={(ev) => {
                      setTicketTypes(ticketTypes.map((t, i) => 
                        i === index ? { ...t, price: parseFloat(ev.target.value) || 0 } : t
                      ));
                    }}
                    placeholder="Price"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                  <input
                    type="datetime-local"
                    value={ticket.saleStartTime}
                    onChange={(ev) => {
                      setTicketTypes(ticketTypes.map((t, i) => 
                        i === index ? { ...t, saleStartTime: ev.target.value } : t
                      ));
                    }}
                    placeholder="Sale start"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                  <input
                    type="datetime-local"
                    value={ticket.saleEndTime}
                    onChange={(ev) => {
                      setTicketTypes(ticketTypes.map((t, i) => 
                        i === index ? { ...t, saleEndTime: ev.target.value } : t
                      ));
                    }}
                    placeholder="Sale end"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                  <input
                    type="number"
                    value={ticket.maxSaleCount}
                    onChange={(ev) => {
                      setTicketTypes(ticketTypes.map((t, i) => 
                        i === index ? { ...t, maxSaleCount: ev.target.value } : t
                      ));
                    }}
                    placeholder="Max available"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setTicketTypes([
                  ...ticketTypes,
                  {
                    name: "",
                    price: 0,
                    saleStartTime: "",
                    saleEndTime: "",
                    maxSaleCount: "",
                  },
                ])
              }
              className="w-full py-2 border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 rounded-xl text-sm font-bold transition-all"
            >
              + Add Ticket Type
            </button>
          </div>

          <button
            onClick={() => editingId && save(editingId)}
            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-white/20"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </>
  );
}
