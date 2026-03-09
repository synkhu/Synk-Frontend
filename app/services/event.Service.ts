import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";
const getToken = () => authService.getToken();

const parseDateRFC3339 = (value: string | null | undefined): string => {
  if (!value || value.trim() === "") {
    throw new Error("parseDateRFC3339: empty value");
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) {
    throw new Error(`parseDateRFC3339: invalid format "${value}"`);
  }

  const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
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

export const getEvents = async () => {
  const res = await axios.get(`${API_URL}/events`);
  const data = res.data.items;

  return data;
};

export const createEvent = async (
  name: string,
  description: string,
  startTime: string,
  endTime: string,
  venueId: string,
  thumbnailUrl?: string,
  artistId?: string | null,
  totalCapacity?: number | null,
  ticketMaxScanCount?: number | null,
  ticketTypes?: Array<{
    name: string;
    price: number;
    saleStartTime?: string | null;
    saleEndTime?: string | null;
    maxSaleCount?: number | null;
  }> | null,
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");
  if (!venueId) throw new Error("Venue ID is required.");

  const startISO = parseDateRFC3339(startTime);
  const endISO = parseDateRFC3339(endTime);

  const payload = {
    name,
    description,
    startTime: startISO,
    endTime: endISO,
    venueId,
    thumbnailUrl: thumbnailUrl || null,
    artistId: artistId || null,
    totalCapacity: totalCapacity ?? null,
    ticketMaxScanCount: ticketMaxScanCount ?? null,
    ticketTypes:
      ticketTypes && ticketTypes.length > 0
        ? ticketTypes.map((tt) => ({
            name: tt.name,
            price: tt.price,
            saleStartTime: tt.saleStartTime
              ? new Date(tt.saleStartTime).toISOString()
              : null,
            saleEndTime: tt.saleEndTime
              ? new Date(tt.saleEndTime).toISOString()
              : null,
            maxSaleCount: tt.maxSaleCount ?? null,
          }))
        : null,
  };

  await axios.post(`${API_URL}/events`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Invalidate cache
  return await getEvents();
};

export const updateEvent = async (
  id: string,
  name: string,
  description: string,
  startTime: string,
  endTime: string,
  venueId: string,
  thumbnailUrl?: string,
  artistId?: string | null,
  totalCapacity?: number | null,
  ticketMaxScanCount?: number | null,
  ticketTypes?: Array<{
    id?: string;
    name: string;
    price: number;
    saleStartTime?: string | null;
    saleEndTime?: string | null;
    maxSaleCount?: number | null;
  }> | null,
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");
  if (!venueId) throw new Error("Venue ID is required.");

  const startISO = parseDateRFC3339(startTime);
  const endISO = parseDateRFC3339(endTime);

  const payload = {
    name,
    description,
    startTime: startISO,
    endTime: endISO,
    venueId,
    thumbnailUrl: thumbnailUrl || null,
    artistId: artistId || null,
    totalCapacity: totalCapacity ?? null,
    ticketMaxScanCount: ticketMaxScanCount ?? null,
    ticketTypes:
      ticketTypes && ticketTypes.length > 0
        ? ticketTypes.map((tt) => ({
            id: tt.id,
            name: tt.name,
            price: tt.price,
            saleStartTime: tt.saleStartTime
              ? new Date(tt.saleStartTime).toISOString()
              : null,
            saleEndTime: tt.saleEndTime
              ? new Date(tt.saleEndTime).toISOString()
              : null,
            maxSaleCount: tt.maxSaleCount ?? null,
          }))
        : null,
  };

  await axios.put(`${API_URL}/events/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Invalidate cache
  return await getEvents();
};

export const createTicketType = async (
  eventId: string,
  ticketType: {
    name: string;
    price: number;
    saleStartTime?: string | null;
    saleEndTime?: string | null;
    maxSaleCount?: number | null;
  },
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  const payload = {
    name: ticketType.name,
    price: ticketType.price,
    saleStartTime: ticketType.saleStartTime
      ? new Date(ticketType.saleStartTime).toISOString()
      : null,
    saleEndTime: ticketType.saleEndTime
      ? new Date(ticketType.saleEndTime).toISOString()
      : null,
    maxSaleCount: ticketType.maxSaleCount ?? null,
  };

  await axios.post(`${API_URL}/events/${eventId}/ticket-types`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteTicketType = async (eventId: string, ticketTypeId: string) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  await axios.delete(
    `${API_URL}/events/${eventId}/ticket-types/${ticketTypeId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

export const deleteEvent = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  await axios.delete(`${API_URL}/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Invalidate cache
  return await getEvents();
};

export const searchArtists = async (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await axios.get(`${API_URL}/artists`, {
    params: { Search: trimmed, pageSize: 10 },
  });

  return res.data.items;
};

export const searchVenues = async (query: string) => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const res = await axios.get(`${API_URL}/venues`, {
    params: { Search: trimmed, pageSize: 10 },
  });

  return res.data.items;
};
