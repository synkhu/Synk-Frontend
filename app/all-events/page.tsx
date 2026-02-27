"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

interface EventItem {
  id: string;
  name: string;
  venueName?: string | null;
  thumbnailUrl?: string;
  artistName?: string | null;
}

interface EventDetail extends EventItem {
  description?: string;
  totalCapacity?: number | null;
  startTime?: string;
  endTime?: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    country?: string;
    address?: string;
    capacity?: number;
  };
  artist?: {
    id: string;
    name: string;
    profilePictureUrl?: string;
    spotifyUrl?: string;
  };
  ticketTypes?: { id: string; name: string; price: number }[];
}

const API_URL = "https://api.synk.hu";

type Filters = {
  place: string;
  artist: string;
  maxPrice: string;
  maxCapacity: string;
};

export default function AllEventsPage() {
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    place: "",
    artist: "",
    maxPrice: "",
    maxCapacity: "",
  });
  const [priceSliderMin, setPriceSliderMin] = useState<number>(0);
  const [priceSliderMax, setPriceSliderMax] = useState<number>(100000);

  const router = useRouter();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const listRes = await axios.get(`${API_URL}/events`);
        const items: EventItem[] = listRes.data.items || [];

        const detailedEvents = await Promise.all(
          items.map(async (event) => {
            try {
              const res = await axios.get<EventDetail>(
                `${API_URL}/events/${event.id}`,
              );
              return res.data;
            } catch {
              return event as EventDetail;
            }
          }),
        );

        setEvents(detailedEvents);

        const allPrices: number[] = [];
        detailedEvents.forEach((ev) => {
          ev.ticketTypes?.forEach((tt) => {
            if (typeof tt.price === "number" && !Number.isNaN(tt.price)) {
              allPrices.push(tt.price);
            }
          });
        });

        if (allPrices.length > 0) {
          const min = Math.min(...allPrices);
          const max = Math.max(...allPrices);
          const roundedMin = Math.max(0, Math.floor(min / 1000) * 1000);
          const roundedMax = Math.max(
            roundedMin + 1000,
            Math.ceil(max / 1000) * 1000,
          );

          setPriceSliderMin(roundedMin);
          setPriceSliderMax(roundedMax);
          setFilters((prev) => ({ ...prev, maxPrice: String(roundedMax) }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getMinTicketPrice = (event: EventDetail): number | null => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return null;
    return event.ticketTypes.reduce(
      (min, tt) => (tt.price < min ? tt.price : min),
      event.ticketTypes![0].price,
    );
  };

  const getMaxTicketPrice = (event: EventDetail): number | null => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return null;
    return event.ticketTypes.reduce(
      (max, tt) => (tt.price > max ? tt.price : max),
      event.ticketTypes[0].price,
    );
  };

  const getCapacity = (event: EventDetail): number | null => {
    if (typeof event.totalCapacity === "number") return event.totalCapacity;
    if (event.venue && typeof event.venue.capacity === "number")
      return event.venue.capacity;
    return null;
  };

  const filteredEvents = events.filter((event) => {
    const placeFilter = filters.place.trim().toLowerCase();
    const artistFilter = filters.artist.trim().toLowerCase();
    const maxPriceFilter = parseFloat(filters.maxPrice);
    const maxCapacityFilter = parseInt(filters.maxCapacity, 10);

    if (placeFilter) {
      const placeText = [
        event.venue?.name,
        event.venue?.city,
        event.venue?.country,
        event.venue?.address,
        event.venueName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!placeText.includes(placeFilter)) return false;
    }

    if (artistFilter) {
      const artistText = (
        event.artist?.name ||
        event.artistName ||
        ""
      ).toLowerCase();
      if (!artistText.includes(artistFilter)) return false;
    }

    if (!Number.isNaN(maxPriceFilter)) {
      const maxPrice = getMaxTicketPrice(event);
      if (maxPrice === null || maxPrice > maxPriceFilter) return false;
    }

    if (!Number.isNaN(maxCapacityFilter)) {
      const capacity = getCapacity(event);
      if (capacity === null || capacity > maxCapacityFilter) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <p className="text-white">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div
            className="min-h-screen flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
      <div className="nav">
        <Navbar
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          navbarOpen={navbarOpen}
          setNavbarOpen={setNavbarOpen}
        />
      </div>
      <div className="content-column">
        <div
          className="min-h-screen py-8 px-4"
          style={{
            background:
              "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">All Events</h1>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#120626] border border-[#4c3073] rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-200">Place</label>
                <input
                  type="text"
                  value={filters.place}
                  onChange={(e) => handleFilterChange("place", e.target.value)}
                  placeholder="City, venue name..."
                  className="px-3 py-2 rounded-lg bg-[#120626] border border-[#4c3073] text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-200">Artist</label>
                <input
                  type="text"
                  value={filters.artist}
                  onChange={(e) => handleFilterChange("artist", e.target.value)}
                  placeholder="Artist name"
                  className="px-3 py-2 rounded-lg bg-[#120626] border border-[#4c3073] text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-200">
                  Max ticket price (HUF)
                  {filters.maxPrice &&
                    !Number.isNaN(parseFloat(filters.maxPrice)) && (
                      <span className="ml-2 text-xs text-gray-300">
                        up to {parseFloat(filters.maxPrice).toLocaleString()}{" "}
                        HUF
                      </span>
                    )}
                </label>
                <input
                  type="range"
                  min={priceSliderMin}
                  max={priceSliderMax}
                  step={1000}
                  value={filters.maxPrice || String(priceSliderMax)}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="w-full accent-[#2d1b4e]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-200">Max capacity</label>
                <select
                  value={filters.maxCapacity}
                  onChange={(e) =>
                    handleFilterChange("maxCapacity", e.target.value)
                  }
                  className="px-3 py-2 rounded-lg bg-[#120626] border border-[#4c3073] text-white text-sm focus:ring-2 focus:ring-[#2d1b4e]"
                >
                  <option value="">Any capacity</option>
                  <option value="200">Up to 200</option>
                  <option value="500">Up to 500</option>
                  <option value="1000">Up to 1 000</option>
                  <option value="2000">Up to 2 000</option>
                  <option value="5000">Up to 5 000</option>
                  <option value="10000">Up to 10 000</option>
                </select>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <p className="text-gray-300">No events match your filters.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const minPrice = getMinTicketPrice(event);
                  const capacity = getCapacity(event);

                  return (
                    <div
                      key={event.id}
                      className="bg-[#120626] border border-[#4c3073] rounded-xl overflow-hidden shadow-lg flex flex-col"
                    >
                      {event.thumbnailUrl && (
                        <img
                          src={event.thumbnailUrl}
                          alt={event.name}
                          className="h-40 w-full object-cover"
                        />
                      )}
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <h2
                          className="text-lg font-semibold text-white truncate"
                          title={event.name}
                        >
                          {event.name}
                        </h2>
                        {event.venue && (
                          <p className="text-sm text-gray-200 truncate">
                            {event.venue.name}
                            {event.venue.city ? `, ${event.venue.city}` : ""}
                          </p>
                        )}
                        {event.artist && (
                          <p className="text-sm text-gray-300">
                            Artist: {event.artist.name}
                          </p>
                        )}
                        {event.startTime && (
                          <p className="text-xs text-gray-300">
                            {new Date(event.startTime).toLocaleString()}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-200">
                          {minPrice !== null && (
                            <span>From {minPrice.toLocaleString()} HUF</span>
                          )}
                          {capacity !== null && (
                            <span>Capacity: {capacity.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <button
                          className="w-full bg-[#1f2437] hover:bg-[#2d1b4e] text-white text-sm font-medium py-2 rounded-lg border border-[#4c3073] shadow-sm hover:shadow-md transition"
                          onClick={() => router.push(`/events/${event.id}`)}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
