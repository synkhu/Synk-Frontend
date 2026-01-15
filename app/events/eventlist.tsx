"use client";

import { deleteEvent, updateEvent, searchArtists, searchVenues } from "../services/event.Service";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type TicketType = {
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

export default function EventList({ events = [], onUpdate, onEditStart, onEditEnd }: EventListProps) {
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
    ticketMaxScanCount: ""
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

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
    
    const validTicketTypes = ticketTypes.filter(tt => tt.name.trim() !== "");
    
    const updatedEvents = await updateEvent(
      id,
      formData.name,
      formData.description,
      formData.startTime,
      formData.endTime,
      formData.venueId,
      formData.thumbnailUrl || undefined,
      formData.artistId || null,
      formData.totalCapacity ? parseInt(formData.totalCapacity) : null,
      formData.ticketMaxScanCount ? parseInt(formData.ticketMaxScanCount) : null,
      validTicketTypes.length > 0 ? validTicketTypes.map(tt => ({
        name: tt.name,
        price: tt.price,
        saleStartTime: tt.saleStartTime || null,
        saleEndTime: tt.saleEndTime || null,
        maxSaleCount: tt.maxSaleCount ? parseInt(tt.maxSaleCount) : null
      })) : null
    );
    onUpdate(updatedEvents);
    setEditingId(null);
    onEditEnd();
  }

  async function remove(id: string) {
    const updatedEvents = await deleteEvent(id);
    onUpdate(updatedEvents);
  }

  async function startEdit(event: Event) {
    setEditingId(event.id);
    onEditStart();

    try {
      const response = await axios.get(`https://api.synk.hu/events/${event.id}`);
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
        ticketMaxScanCount: fullEvent.ticketMaxScanCount?.toString() || ""
      });
      
  
      if (fullEvent.ticketTypes && fullEvent.ticketTypes.length > 0) {
        setTicketTypes(fullEvent.ticketTypes.map((tt: any) => ({
          name: tt.name || "",
          price: tt.price || 0,
          saleStartTime: toDateTimeLocal(tt.saleStartTime),
          saleEndTime: toDateTimeLocal(tt.saleEndTime),
          maxSaleCount: tt.maxSaleCount?.toString() || ""
        })));
      } else {
        setTicketTypes([{ name: "", price: 0, saleStartTime: "", saleEndTime: "", maxSaleCount: "" }]);
      }
      
      setVenueQuery(event.venueName || "");
      setArtistQuery(fullEvent.artistName || "");
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {!events || events.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No events found</p>
        </div>
      ) : events.map((e) => (
        <div key={e.id}>
          {editingId === e.id ? (
            <div className="col-span-full max-w-4xl mx-auto p-6 bg-[#2d1b4e] rounded-lg shadow-lg space-y-4 mb-4 border border-[#5a3d8a]">
              <h3 className="text-xl font-bold text-white">Edit Event</h3>
              
              <input
                placeholder="Event Name"
                value={formData.name}
                onChange={(ev) => setFormData({ ...formData, name: ev.target.value })}
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(ev) => setFormData({ ...formData, description: ev.target.value })}
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                rows={3}
              />
              <input
                placeholder="Thumbnail URL"
                value={formData.thumbnailUrl}
                onChange={(ev) => setFormData({ ...formData, thumbnailUrl: ev.target.value })}
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(ev) => setFormData({ ...formData, startTime: ev.target.value })}
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(ev) => setFormData({ ...formData, endTime: ev.target.value })}
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Total Capacity"
                  value={formData.totalCapacity}
                  onChange={(ev) => setFormData({ ...formData, totalCapacity: ev.target.value })}
                  className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                />
                <input
                  type="number"
                  placeholder="Max Scan Count"
                  value={formData.ticketMaxScanCount}
                  onChange={(ev) => setFormData({ ...formData, ticketMaxScanCount: ev.target.value })}
                  className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                />
              </div>
              
              {/* Venue Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Venue</label>
                <input
                  value={venueQuery}
                  onChange={(ev) => { setVenueQuery(ev.target.value); }}
                  placeholder="Search venue"
                  className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                />
                {venueResults.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
                    {venueResults.map((venue) => (
                      <li
                        key={venue.id}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-50"
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Artist</label>
                <input
                  value={artistQuery}
                  onChange={(ev) => { setArtistQuery(ev.target.value); }}
                  placeholder="Search artist (optional)"
                  className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                />
                {artistResults.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
                    {artistResults.map((artist) => (
                      <li
                        key={artist.id}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-50"
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
              
              {/* Ticket Types */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Ticket Types</h4>
                {ticketTypes.map((ticket, index) => (
                  <div key={index} className="border border-gray-300 p-3 rounded-lg bg-[#3a2659] mb-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Ticket Type {index + 1}</span>
                      {ticketTypes.length > 1 && (
                        <button
                          onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={ticket.name}
                        onChange={(ev) => {
                          const updated = [...ticketTypes];
                          updated[index].name = ev.target.value;
                          setTicketTypes(updated);
                        }}
                        placeholder="Ticket name"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        value={ticket.price || ""}
                        onChange={(ev) => {
                          const updated = [...ticketTypes];
                          updated[index].price = parseFloat(ev.target.value) || 0;
                          setTicketTypes(updated);
                        }}
                        placeholder="Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={ticket.saleStartTime}
                        onChange={(ev) => {
                          const updated = [...ticketTypes];
                          updated[index].saleStartTime = ev.target.value;
                          setTicketTypes(updated);
                        }}
                        placeholder="Sale start"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={ticket.saleEndTime}
                        onChange={(ev) => {
                          const updated = [...ticketTypes];
                          updated[index].saleEndTime = ev.target.value;
                          setTicketTypes(updated);
                        }}
                        placeholder="Sale end"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        value={ticket.maxSaleCount}
                        onChange={(ev) => {
                          const updated = [...ticketTypes];
                          updated[index].maxSaleCount = ev.target.value;
                          setTicketTypes(updated);
                        }}
                        placeholder="Max available"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setTicketTypes([...ticketTypes, { name: "", price: 0, saleStartTime: "", saleEndTime: "", maxSaleCount: "" }])}
                  className="w-full bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded"
                >
                  + Add Ticket Type
                </button>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => save(e.id)}
                  className="bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setEditingId(null);
                    onEditEnd();
                  }}
                  className="bg-[#3a2659]0 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#2d1b4e] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[#5a3d8a]">
              {e.thumbnailUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <img 
                    src={e.thumbnailUrl} 
                    alt={e.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-white line-clamp-2">{e.name}</h3>
                
                {e.description && (
                  <p className="text-gray-300 text-sm line-clamp-3">{e.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-200">
                  {e.startTime && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📅</span>
                      <span className="font-medium">Start:</span>
                      <span>{formatDate(e.startTime)}</span>
                    </div>
                  )}
                  
                  {e.endTime && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🕐</span>
                      <span className="font-medium">End:</span>
                      <span>{formatDate(e.endTime)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">📍</span>
                    <span className="font-medium">Venue:</span>
                    <span>{e.venueName || "N/A"}</span>
                  </div>
                  
                  {e.artistName && (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">🎤</span>
                      <span className="font-medium">Artist:</span>
                      <span>{e.artistName}</span>
                    </div>
                  )}
                  
                  {e.totalCapacity && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">👥</span>
                      <span className="font-medium">Capacity:</span>
                      <span>{e.totalCapacity}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-[#5a3d8a]">
                  <button 
                    onClick={(ev) => {
                      ev.preventDefault();
                      router.push(`/events/${e.id}`);
                    }}
                    className="flex-1 bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => startEdit(e)}
                    className="bg-[#3a2659] hover:bg-[#4c3073] text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => remove(e.id)}
                    className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

