import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";
const getToken = () => authService.getToken();

export const getArtists = async () => {
  const res = await axios.get(`${API_URL}/artists`);
  return res.data.items;
};

export const createArtist = async (
  name: string,
  description: string,
  spotifyUrl: string
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  await axios.post(
    `${API_URL}/artists`,
    {
      name,
      description: description || null,
      spotifyUrl: spotifyUrl || null,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 🔁 Refetch after create
  return getArtists();
};

export const updateArtist = async (id: number, name: string) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  await axios.put(
    `${API_URL}/artists/${id}`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 🔁 Refetch after update
  return getArtists();
};

export const deleteArtist = async (id: number) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  await axios.delete(`${API_URL}/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔁 Refetch after delete
  return getArtists();
};

export const searchArtists = async (query: string) => {
  if (!query.trim()) return [];

  const res = await axios.get(`${API_URL}/artists`, {
    params: {
      Search: query,
      pageSize: 10,
    },
  });

  return res.data.items;
};
