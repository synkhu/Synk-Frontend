import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";
const getToken = () => authService.getToken();

export const getVenues = async () => {
  const res = await axios.get(`${API_URL}/venues`);
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
  
  await axios.post(
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
  
  return await getVenues();
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
  
  await axios.put(`${API_URL}/venues/${id}`, venueData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await getVenues();
};

export const deleteVenue = async (id: string | number) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found.');
  
  await axios.delete(`${API_URL}/venues/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await getVenues();
};