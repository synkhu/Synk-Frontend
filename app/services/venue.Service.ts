import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";
const getToken = () => authService.getToken();

export const getVenues = async () => {
  const res = await axios.get(`${API_URL}/venues`); // ✅ PARENTHESES not backticks
  console.log('API Response:', res.data);
  return res.data.items;
};

export const createVenue = async (
  address: string, 
  capacity: number, 
  city: string, 
  country: string, 
  description: string, 
  isAdultOnly: boolean, 
  name: string
) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  
  return axios.post(
    `${API_URL}/venues`,
    { 
      address,
      capacity,
      city,
      country,
      description,
      isAdultOnly,
      name
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
};

export const updateVenue = async (id: number, venueData: Partial<{
  address?: string;
  capacity?: number;
  city?: string;
  country?: string;
  description?: string;
  isAdultOnly?: boolean;
  name?: string;
}>) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found.');
  
  console.log('Updating venue with data:', venueData);
  
  return axios.put(`${API_URL}/venues/${id}`, venueData, { // ✅ PARENTHESES not backticks
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const deleteVenue = async (id: string | number) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found.');
  
  return axios.delete(`${API_URL}/venues/${id}`, { // ✅ PARENTHESES not backticks
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};