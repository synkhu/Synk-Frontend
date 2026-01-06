import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";
const getToken = () => authService.getToken();

export const getArtists = async () => {
  const res = await axios.get(`${API_URL}/artists`);
  console.log('API Response:', res.data);
  return res.data.items; // Changed from res.data.data to res.data.items
};

export const createArtist = async (name: string, description: string, spotifyUrl: string) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  
  return axios.post(
    `${API_URL}/artists`,
    { 
      name, 
      description: description || null, 
      spotifyUrl: spotifyUrl || null 
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
};

export const updateArtist = async (id: number, name: string) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found.');
  
  return axios.put(`${API_URL}/artists/${id}`, { name }, { // ✅ Fixed - parentheses
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const deleteArtist = async (id: number) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found.');
  
  return axios.delete(`${API_URL}/artists/${id}`, { // ✅ Fixed - parentheses
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};