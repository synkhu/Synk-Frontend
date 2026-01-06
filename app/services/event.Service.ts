import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";
const getToken = () => authService.getToken();

/* ===================== HELPERS ===================== */

/**
 * Converts datetime-local input (YYYY-MM-DDTHH:mm) to RFC 3339 ISO string
 */
const parseDateRFC3339 = (value: string | null | undefined): string => {
  if (!value || value.trim() === "") {
    throw new Error("parseDateRFC3339: empty value");
  }

  // Accepts "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    throw new Error(`parseDateRFC3339: invalid format "${value}"`);
  }

  const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // JS month 0-based
  const day = parseInt(dayStr, 10);
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  const seconds = secStr ? parseInt(secStr, 10) : 0;

  const date = new Date(year, month, day, hours, minutes, seconds);
  if (isNaN(date.getTime())) {
    throw new Error(`parseDateRFC3339: invalid date object "${value}"`);
  }

  return date.toISOString();
};

/* ===================== EVENTS ===================== */

export const getEvents = async () => {
  const res = await axios.get(`${API_URL}/events`);
  return res.data.items;
};

/**
 * Create an event
 * @param name Event name
 * @param description Event description
 * @param startTime Must be datetime-local string like "2026-01-06T18:30"
 * @param endTime Must be datetime-local string
 * @param venueId Must be venue ID from autocomplete, NOT the name
 * @param thumbnailUrl Optional thumbnail
 * @param artistName Optional artist name
 */
export const createEvent = async (
  name: string,
  description: string,
  startTime: string,
  endTime: string,
  venueId: string,
  thumbnailUrl?: string,
  artistName?: string
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");
  if (!venueId) throw new Error("Venue ID is required.");

  const startISO = parseDateRFC3339(startTime);
  const endISO = parseDateRFC3339(endTime);

  return axios.post(
    `${API_URL}/events`,
    {
      request: {
        name,
        description,
        startTime: startISO,
        endTime: endISO,
        venueId,
        thumbnailUrl: thumbnailUrl || null,
        artistname: artistName || null,
      },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateEvent = async (id: number, name: string) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  return axios.put(
    `${API_URL}/events/${id}`,
    { name },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteEvent = async (id: number) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  return axios.delete(`${API_URL}/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ===================== ARTIST SEARCH ===================== */

export const searchArtists = async (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await axios.get(`${API_URL}/artists`, {
    params: { Search: trimmed, pageSize: 10 },
  });

  return res.data.items;
};

/* ===================== VENUE SEARCH ===================== */

export const searchVenues = async (query: string) => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const res = await axios.get(`${API_URL}/venues`, {
    params: { Search: trimmed, pageSize: 10 },
  });

  return res.data.items;
};
