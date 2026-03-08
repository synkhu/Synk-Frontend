"use client";

import { useState, useEffect } from "react";
import {
  createEvent,
  updateEvent,
  searchArtists,
  searchVenues,
} from "../services/event.Service";
import { uploadFile } from "../services/file.service";

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
  initialData?: any;
};

export default function EventForm({ onSuccess, initialData }: EventFormProps) {
  const [name, setName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [ticketMaxScanCount, setTicketMaxScanCount] = useState("");

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      name: "",
      price: 0,
      saleStartTime: "",
      saleEndTime: "",
      maxSaleCount: "",
    },
  ]);

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

  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setStartTime(initialData.startTime ? initialData.startTime.slice(0, 16) : "");
      setEndTime(initialData.endTime ? initialData.endTime.slice(0, 16) : "");
      setTotalCapacity(initialData.totalCapacity || "");
      setTicketMaxScanCount(initialData.ticketMaxScanCount || "");
      setThumbnailUrl(initialData.thumbnailUrl || "");

      if (initialData.venue) {
        setSelectedVenue(initialData.venue);
        setVenueQuery(initialData.venue.name);
      } else if (initialData.venueId) {
        setSelectedVenue({
          id: initialData.venueId,
          name: initialData.venueName || "Selected Venue",
        });
        setVenueQuery(initialData.venueName || "Selected Venue");
      }

      if (initialData.artist) {
        setSelectedArtistId(initialData.artist.id);
        setSelectedArtistName(initialData.artist.name);
        setArtistQuery(initialData.artist.name);
      } else if (initialData.artistId) {
        setSelectedArtistId(initialData.artistId);
        setSelectedArtistName(initialData.artistName || "Selected Artist");
        setArtistQuery(initialData.artistName || "Selected Artist");
      }

      if (initialData.ticketTypes && initialData.ticketTypes.length > 0) {
        setTicketTypes(
          initialData.ticketTypes.map((tt: any) => ({
            name: tt.name,
            price: tt.price,
            saleStartTime: tt.saleStartTime ? tt.saleStartTime.slice(0, 16) : "",
            saleEndTime: tt.saleEndTime ? tt.saleEndTime.slice(0, 16) : "",
            maxSaleCount: tt.maxSaleCount || "",
          }))
        );
      }
    }
  }, [initialData]);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return alert("Event name is required");
    if (!description.trim()) return alert("Description is required");
    if (!startTime) return alert("Start time is required");
    if (!endTime) return alert("End time is required");
    if (!selectedVenue) return alert("Please select a venue from the list");

    const validTicketTypes = ticketTypes.filter((tt) => tt.name.trim() !== "");
    if (validTicketTypes.some((tt) => tt.price <= 0)) {
      return alert("All ticket types must have a price greater than 0");
    }

    try {
      let thumbnailToSave: string | undefined = thumbnailUrl || undefined;

      if (selectedFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          selectedFiles.map((file) => uploadFile(file)),
        );
        if (uploadedUrls.length > 0) {
          thumbnailToSave = uploadedUrls[0];
        }
      }

      let updatedEvents;
      if (initialData) {
        updatedEvents = await updateEvent(
          initialData.id,
          name,
          description,
          startTime,
          endTime,
          selectedVenue.id,
          thumbnailToSave,
          selectedArtistId || null,
          totalCapacity ? parseInt(totalCapacity) : null,
          ticketMaxScanCount ? parseInt(ticketMaxScanCount) : null,
          validTicketTypes.length > 0
            ? validTicketTypes.map((tt) => ({
                name: tt.name,
                price: tt.price,
                saleStartTime: tt.saleStartTime || null,
                saleEndTime: tt.saleEndTime || null,
                maxSaleCount: tt.maxSaleCount ? parseInt(tt.maxSaleCount) : null,
              }))
            : null,
        );
      } else {
        updatedEvents = await createEvent(
          name,
          description,
          startTime,
          endTime,
          selectedVenue.id,
          thumbnailToSave,
          selectedArtistId || null,
          totalCapacity ? parseInt(totalCapacity) : null,
          ticketMaxScanCount ? parseInt(ticketMaxScanCount) : null,
          validTicketTypes.length > 0
            ? validTicketTypes.map((tt) => ({
                name: tt.name,
                price: tt.price,
                saleStartTime: tt.saleStartTime || null,
                saleEndTime: tt.saleEndTime || null,
                maxSaleCount: tt.maxSaleCount ? parseInt(tt.maxSaleCount) : null,
              }))
            : null,
        );
      }

      setName("");
      setThumbnailUrl("");
      setSelectedFiles([]);
      setDescription("");
      setStartTime("");
      setEndTime("");
      setTotalCapacity("");
      setTicketMaxScanCount("");
      setArtistQuery("");
      setSelectedArtistId(null);
      setSelectedArtistName("");
      setArtistResults([]);
      setVenueQuery("");
      setSelectedVenue(null);
      setVenueResults([]);
      setTicketTypes([
        {
          name: "",
          price: 0,
          saleStartTime: "",
          saleEndTime: "",
          maxSaleCount: "",
        },
      ]);

      onSuccess(updatedEvents);
    } catch (err: any) {
      console.error("❌ Full error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert(
        "Failed to create event. Check console. " +
          (err.response?.data?.errors
            ? JSON.stringify(err.response.data.errors)
            : err.response?.data?.message || err.message),
      );
    }
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
          Basic Information
        </h3>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event Name"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
          />

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider ml-1">
              Event Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles(files);
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer border border-white/10 rounded-2xl bg-white/5 p-2"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your event..."
            rows={4}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10 resize-none"
          />
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
          Date & Time
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-white/10"
            />
          </div>
        </div>
      </div>

      {/* Capacity & Tickets Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center">
          <span className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
          Capacity & Tickets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            value={totalCapacity}
            onChange={(e) => setTotalCapacity(e.target.value)}
            placeholder="Total Capacity"
            min="0"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all hover:bg-white/10"
          />

          <input
            type="number"
            value={ticketMaxScanCount}
            onChange={(e) => setTicketMaxScanCount(e.target.value)}
            placeholder="Max Scans Per Ticket"
            min="1"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all hover:bg-white/10"
          />
        </div>
      </div>

      {/* Location & Artist Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center">
          <span className="bg-pink-500/20 text-pink-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
          Location & Artist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Venue Autocomplete */}
          <div className="relative">
            <input
              value={venueQuery}
              onChange={(e) => {
                setVenueQuery(e.target.value);
                setSelectedVenue(null);
              }}
              placeholder="Search Venue..."
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all hover:bg-white/10"
            />
            {venueResults.length > 0 && (
              <ul className="absolute z-50 w-full mt-2 bg-black/90 border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-auto backdrop-blur-xl">
                {venueResults.map((venue) => (
                  <li
                    key={venue.id}
                    className="cursor-pointer px-6 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition first:rounded-t-2xl last:rounded-b-2xl"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setVenueQuery(venue.name);
                      setVenueResults([]);
                    }}
                  >
                    {venue.name}
                  </li>
                ))}
              </ul>
            )}
            {selectedVenue && (
              <p className="mt-2 text-xs font-bold text-green-400 uppercase tracking-wider ml-1">
                ✓ Venue Selected: {selectedVenue.name}
              </p>
            )}
          </div>

          {/* Artist Autocomplete */}
          <div className="relative">
            <input
              value={artistQuery}
              onChange={(e) => {
                setArtistQuery(e.target.value);
                setSelectedArtistId(null);
                setSelectedArtistName("");
              }}
              placeholder="Search Artist (optional)..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all hover:bg-white/10"
            />
            {artistResults.length > 0 && (
              <ul className="absolute z-50 w-full mt-2 bg-black/90 border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-auto backdrop-blur-xl">
                {artistResults.map((artist) => (
                  <li
                    key={artist.id}
                    className="cursor-pointer px-6 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition first:rounded-t-2xl last:rounded-b-2xl"
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
              <p className="mt-2 text-xs font-bold text-green-400 uppercase tracking-wider ml-1">
                ✓ Artist Selected: {selectedArtistName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Types Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center">
          <span className="bg-yellow-500/20 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
          Ticket Types
        </h3>

        {ticketTypes.map((ticket, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 relative group hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">
                Ticket Type {index + 1}
              </h4>
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setTicketTypes(ticketTypes.filter((_, i) => i !== index))
                  }
                  className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={ticket.name}
                onChange={(e) => {
                  const updated = [...ticketTypes];
                  updated[index].name = e.target.value;
                  setTicketTypes(updated);
                }}
                placeholder="Ticket Name (e.g. VIP)"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm"
              />

              <input
                type="number"
                value={ticket.price || ""}
                onChange={(e) => {
                  const updated = [...ticketTypes];
                  updated[index].price = parseFloat(e.target.value) || 0;
                  setTicketTypes(updated);
                }}
                placeholder="Price"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm"
              />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sale Start</label>
                <input
                  type="datetime-local"
                  value={ticket.saleStartTime}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].saleStartTime = e.target.value;
                    setTicketTypes(updated);
                  }}
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sale End</label>
                <input
                  type="datetime-local"
                  value={ticket.saleEndTime}
                  onChange={(e) => {
                    const updated = [...ticketTypes];
                    updated[index].saleEndTime = e.target.value;
                    setTicketTypes(updated);
                  }}
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm"
                />
              </div>

              <input
                type="number"
                value={ticket.maxSaleCount}
                onChange={(e) => {
                  const updated = [...ticketTypes];
                  updated[index].maxSaleCount = e.target.value;
                  setTicketTypes(updated);
                }}
                placeholder="Quantity Available"
                min="0"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
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
          className="w-full py-3 border border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider"
        >
          + Add Another Ticket Type
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-white/20"
      >
        {initialData ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}
