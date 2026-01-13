"use client";

import { useState, useEffect } from "react";
import { createEvent, searchArtists, searchVenues } from "../services/event.Service";

type Artist = { id: string; name: string };
type Venue = { id: string; name: string };

type TicketType = {
  name: string;
  price: number;
  saleStartTime: string;
  saleEndTime: string;
  maxSaleCount: string;
};

type EventFormProps = {
  onSuccess: (events: any[]) => void;
};

export default function EventForm({ onSuccess }: EventFormProps) {
  const [name, setName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [gateTime, setGateTime] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [ticketMaxScanCount, setTicketMaxScanCount] = useState("");
  
  /* Ticket types */
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "", price: 0, saleStartTime: "", saleEndTime: "", maxSaleCount: "" }
  ]);

  /* Artist autocomplete */
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedArtistName, setSelectedArtistName] = useState<string>("");

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

  /* Venue autocomplete */
  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

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

  /* Submit */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return alert("Event name is required");
    if (!description.trim()) return alert("Description is required");
    if (!startTime) return alert("Start time is required");
    if (!endTime) return alert("End time is required");
    if (!selectedVenue) return alert("Please select a venue from the list");

    // Validate ticket types if any are provided
    const validTicketTypes = ticketTypes.filter(tt => tt.name.trim() !== "");
    if (validTicketTypes.some(tt => tt.price <= 0)) {
      return alert("All ticket types must have a price greater than 0");
    }

    try {
      const updatedEvents = await createEvent(
        name,
        description,
        startTime,
        endTime,
        selectedVenue.id,
        thumbnailUrl || undefined,
        selectedArtistId || null,
        gateTime || null,
        totalCapacity ? parseInt(totalCapacity) : null,
        ticketMaxScanCount ? parseInt(ticketMaxScanCount) : null,
        validTicketTypes.length > 0 ? validTicketTypes.map(tt => ({
          name: tt.name,
          price: tt.price,
          saleStartTime: tt.saleStartTime || null,
          saleEndTime: tt.saleEndTime || null,
          maxSaleCount: tt.maxSaleCount ? parseInt(tt.maxSaleCount) : null
        })) : null
      );

      // Reset form
      setName(""); setThumbnailUrl(""); setDescription("");
      setStartTime(""); setEndTime(""); setGateTime("");
      setTotalCapacity(""); setTicketMaxScanCount("");
      setArtistQuery(""); setSelectedArtistId(null); setSelectedArtistName(""); setArtistResults([]);
      setVenueQuery(""); setSelectedVenue(null); setVenueResults([]);
      setTicketTypes([{ name: "", price: 0, saleStartTime: "", saleEndTime: "", maxSaleCount: "" }]);

      onSuccess(updatedEvents);
    } catch (err: any) {
      console.error("❌ Full error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert(
        "Failed to create event. Check console. " +
        (err.response?.data?.errors 
          ? JSON.stringify(err.response.data.errors)
          : err.response?.data?.message || err.message)
      );
    }
  }

  return (
    <form onSubmit={submit} className="max-w-4xl mx-auto p-6 bg-[#2d1b4e] rounded-lg shadow-lg space-y-6 border border-[#5a3d8a]">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>

      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-[#5a3d8a] pb-2">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Event Name <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event name"
            required
            className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Thumbnail URL
          </label>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your event..."
            rows={4}
            required
            className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400 resize-none"
          />
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-300 border-b border-[#5a3d8a] pb-2">Date & Time</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Gate Opening Time
            </label>
            <input
              type="datetime-local"
              value={gateTime}
              onChange={(e) => setGateTime(e.target.value)}
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Capacity & Tickets Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-300 border-b border-[#5a3d8a] pb-2">Capacity & Tickets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Total Capacity
            </label>
            <input
              type="number"
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(e.target.value)}
              placeholder="e.g., 500"
              min="0"
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Max Scans Per Ticket
            </label>
            <input
              type="number"
              value={ticketMaxScanCount}
              onChange={(e) => setTicketMaxScanCount(e.target.value)}
              placeholder="e.g., 1"
              min="1"
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Venue & Artist Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-300 border-b border-[#5a3d8a] pb-2">Location & Artist</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Venue Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Venue <span className="text-red-400">*</span>
            </label>
            <input
              value={venueQuery}
              onChange={(e) => { setVenueQuery(e.target.value); setSelectedVenue(null); }}
              placeholder="Search for venue..."
              required
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
            {venueResults.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-[#5a3d8a] rounded-lg shadow-lg max-h-60 overflow-auto">
                {venueResults.map((venue) => (
                  <li
                    key={venue.id}
                    className="cursor-pointer px-4 py-2 hover:bg-[#4c3073] transition"
                    onClick={() => { setSelectedVenue(venue); setVenueQuery(venue.name); setVenueResults([]); }}
                  >
                    {venue.name}
                  </li>
                ))}
              </ul>
            )}
            {selectedVenue && (
              <p className="mt-1 text-sm text-green-600">✓ Selected: {selectedVenue.name}</p>
            )}
          </div>

          {/* Artist Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Artist
            </label>
            <input
              value={artistQuery}
              onChange={(e) => { setArtistQuery(e.target.value); setSelectedArtistId(null); setSelectedArtistName(""); }}
              placeholder="Search for artist (optional)..."
              className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg focus:ring-2 focus:ring-[#4c3073] focus:border-transparent outline-none transition bg-[#1a0f2e] text-white placeholder-gray-400"
            />
            {artistResults.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-[#5a3d8a] rounded-lg shadow-lg max-h-60 overflow-auto">
                {artistResults.map((artist) => (
                  <li
                    key={artist.id}
                    className="cursor-pointer px-4 py-2 hover:bg-[#4c3073] transition"
                    onClick={() => { 
                      setSelectedArtistId(artist.id); 
                      setSelectedArtistName(artist.name);
                      setArtistQuery(artist.name); 
                      setArtistResults([]); 
                    }}
                  >
                    {artist.name}
                  </li>
                ))}
              </ul>
            )}
            {selectedArtistName && (
              <p className="mt-1 text-sm text-green-600">✓ Selected: {selectedArtistName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Types Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-300 border-b border-[#5a3d8a] pb-2">Ticket Types</h3>
        
        {ticketTypes.map((ticket, index) => (
          <div key={index} className="border border-[#5a3d8a] p-4 rounded-lg bg-[#3a2659] space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-300">Ticket Type {index + 1}</h4>
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                  className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  value={ticket.name}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].name = e.target.value;
                    setTicketTypes(updated);
                  }}
                  placeholder="e.g., VIP, General, Early Bird"
                  className="w-full px-3 py-2 border border-[#5a3d8a] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                <input
                  type="number"
                  value={ticket.price || ""}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].price = parseFloat(e.target.value) || 0;
                    setTicketTypes(updated);
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-[#5a3d8a] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sale Start Time</label>
                <input
                  type="datetime-local"
                  value={ticket.saleStartTime}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].saleStartTime = e.target.value;
                    setTicketTypes(updated);
                  }}
                  className="w-full px-3 py-2 border border-[#5a3d8a] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sale End Time</label>
                <input
                  type="datetime-local"
                  value={ticket.saleEndTime}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].saleEndTime = e.target.value;
                    setTicketTypes(updated);
                  }}
                  className="w-full px-3 py-2 border border-[#5a3d8a] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Available</label>
                <input
                  type="number"
                  value={ticket.maxSaleCount}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].maxSaleCount = e.target.value;
                    setTicketTypes(updated);
                  }}
                  placeholder="e.g., 100"
                  min="0"
                  className="w-full px-3 py-2 border border-[#5a3d8a] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setTicketTypes([...ticketTypes, { name: "", price: 0, saleStartTime: "", saleEndTime: "", maxSaleCount: "" }])}
          className="w-full bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg transition font-medium"
        >
          + Add Another Ticket Type
        </button>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="w-full bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-6 py-3 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg"
      >
        Create Event
      </button>
    </form>
  );
}


