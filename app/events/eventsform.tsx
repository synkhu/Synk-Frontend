"use client";

import { useState, useEffect } from "react";
import { createEvent, searchArtists, searchVenues } from "../services/event.Service";

type Artist = { id: string; name: string };
type Venue = { id: string; name: string };

type EventFormProps = {
  onSuccess: (events: any[]) => void;
};

export default function EventForm({ onSuccess }: EventFormProps) {
  const [name, setName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* Artist autocomplete */
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

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

    console.log("🔍 Form values before sending:", {
      name,
      description,
      startTime,
      endTime,
      venueId: selectedVenue.id,
      thumbnailUrl,
      selectedArtist
    });

    try {
      const updatedEvents = await createEvent(
        name,
        description,
        startTime,
        endTime,
        selectedVenue.id,
        thumbnailUrl || undefined,
        selectedArtist ?? undefined
      );

      // Reset form
      setName(""); setThumbnailUrl(""); setDescription("");
      setStartTime(""); setEndTime("");
      setArtistQuery(""); setSelectedArtist(null); setArtistResults([]);
      setVenueQuery(""); setSelectedVenue(null); setVenueResults([]);

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
    <form onSubmit={submit} className="relative space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Event name"
        required
      />

      <input
        value={thumbnailUrl}
        onChange={(e) => setThumbnailUrl(e.target.value)}
        placeholder="Thumbnail URL"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Event description"
        rows={4}
        required
      />

      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />

      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />

      {/* Venue Autocomplete */}
      <div className="relative">
        <input
          value={venueQuery}
          onChange={(e) => { setVenueQuery(e.target.value); setSelectedVenue(null); }}
          placeholder="Search venue"
          required
        />
        {venueResults.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border rounded shadow">
            {venueResults.map((venue) => (
              <li
                key={venue.id}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                onClick={() => { setSelectedVenue(venue); setVenueQuery(venue.name); setVenueResults([]); }}
              >
                {venue.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Artist Autocomplete */}
      <div className="relative">
        <input
          value={artistQuery}
          onChange={(e) => { setArtistQuery(e.target.value); setSelectedArtist(null); }}
          placeholder="Search artist (optional)"
        />
        {artistResults.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border rounded shadow">
            {artistResults.map((artist) => (
              <li
                key={artist.id}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                onClick={() => { setSelectedArtist(artist.name); setArtistQuery(artist.name); setArtistResults([]); }}
              >
                {artist.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {selectedArtist && <p>Selected Artist: <strong>{selectedArtist}</strong></p>}

      <button type="submit">Add</button>
    </form>
  );
}
