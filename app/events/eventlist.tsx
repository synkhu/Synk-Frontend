"use client";

import { deleteEvent, updateEvent, searchArtists, searchVenues } from "../services/event.Service";
import { useState, useEffect } from "react";

type Event = {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  venueId?: string;
  venueName?: string;
  thumbnailUrl?: string;
  artistName?: string;
};

type EventListProps = {
  events?: Event[];
  onUpdate: (events: any[]) => void;
};

export default function EventList({ events = [], onUpdate }: EventListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    venueId: "",
    thumbnailUrl: "",
    artistName: "" // ✅ Changed from artistname to artistName
  });

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
    
    const updatedEvents = await updateEvent(
      id,
      formData.name,
      formData.description,
      formData.startTime,
      formData.endTime,
      formData.venueId,
      formData.thumbnailUrl || undefined,
      formData.artistName || undefined // ✅ Changed from artistname to artistName
    );
    onUpdate(updatedEvents);
    setEditingId(null);
  }

  async function remove(id: string) {
    const updatedEvents = await deleteEvent(id);
    onUpdate(updatedEvents);
  }

  // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
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

  // Format date for display
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

  // Debug: log the first event to see its structure
  useEffect(() => {
    if (events.length > 0) {
      console.log("First event data:", events[0]);
    }
  }, [events]);

  return (
    <ul>
      {!events || events.length === 0 ? <li>No events found</li> : events.map((e) => (
        <li key={e.id}>
          {editingId === e.id ? (
            <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
              <input
                placeholder="Event Name"
                value={formData.name}
                onChange={(ev) => setFormData({ ...formData, name: ev.target.value })}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(ev) => setFormData({ ...formData, description: ev.target.value })}
              />
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(ev) => setFormData({ ...formData, startTime: ev.target.value })}
              />
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(ev) => setFormData({ ...formData, endTime: ev.target.value })}
              />
              
              {/* Venue Autocomplete */}
              <div style={{ position: "relative" }}>
                <input
                  value={venueQuery}
                  onChange={(ev) => { setVenueQuery(ev.target.value); }}
                  placeholder="Search venue"
                />
                {venueResults.length > 0 && (
                  <ul style={{ position: "absolute", zIndex: 50, width: "100%", background: "white", border: "1px solid #ccc" }}>
                    {venueResults.map((venue) => (
                      <li
                        key={venue.id}
                        style={{ cursor: "pointer", padding: "0.5rem" }}
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

              <input
                placeholder="Thumbnail URL"
                value={formData.thumbnailUrl}
                onChange={(ev) => setFormData({ ...formData, thumbnailUrl: ev.target.value })}
              />

              {/* Artist Autocomplete */}
              <div style={{ position: "relative" }}>
                <input
                  value={artistQuery}
                  onChange={(ev) => { setArtistQuery(ev.target.value); }}
                  placeholder="Search artist (optional)"
                />
                {artistResults.length > 0 && (
                  <ul style={{ position: "absolute", zIndex: 50, width: "100%", background: "white", border: "1px solid #ccc" }}>
                    {artistResults.map((artist) => (
                      <li
                        key={artist.id}
                        style={{ cursor: "pointer", padding: "0.5rem" }}
                        onClick={() => {
                          setFormData({ ...formData, artistName: artist.name }); // ✅ Changed from artistname to artistName
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

              <button onClick={() => save(e.id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <strong>{e.name}</strong><br />
              {e.description && <>{e.description}<br /></>}
              {e.startTime && <>Start: {formatDate(e.startTime)}<br /></>}
              {e.endTime && <>End: {formatDate(e.endTime)}<br /></>}
              Venue: {e.venueName || "N/A"}<br />
              Artist: {e.artistName || "N/A"}<br />
              {e.thumbnailUrl && <img src={e.thumbnailUrl} alt={e.name} style={{ width: "100px" }} />}
              <br />
              <button onClick={() => {
                setEditingId(e.id);
                setFormData({
                  name: e.name,
                  description: e.description || "",
                  startTime: toDateTimeLocal(e.startTime),
                  endTime: toDateTimeLocal(e.endTime),
                  venueId: e.venueId || "",
                  thumbnailUrl: e.thumbnailUrl || "",
                  artistName: e.artistName || "" // ✅ Changed from artistname to artistName
                });
                setVenueQuery(e.venueName || "");
                setArtistQuery(e.artistName || "");
              }}>
                Edit
              </button>
              <button onClick={() => remove(e.id)}>Delete</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
