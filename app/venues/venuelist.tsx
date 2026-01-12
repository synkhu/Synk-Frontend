"use client";
import { deleteVenue, updateVenue } from "../services/venue.Service";
import { useState } from "react";

interface Venue {
    id: number;
    name: string;
    city: string;
    address: string;
    country: string;
    capacity: number;
    description: string;
}

type VenueListProps = {
    venues?: Venue[];
    onUpdate: (venues: Venue[]) => void;
};

export default function VenueList({ venues = [], onUpdate }: VenueListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        city: "",
        address: "",
        country: "",
        capacity: 0,
        description: ""
    });
    
    async function save(id: number) {
        if (!formData.name.trim()) {
            alert("Venue name cannot be empty");
            return;
        }
        const updatedVenues = await updateVenue(id, formData);
        onUpdate(updatedVenues);
        setEditingId(null);
    }
    
    async function remove(id: number) {
        const updatedVenues = await deleteVenue(id);
        onUpdate(updatedVenues);
    }
    
    return (
        <ul>
            {!venues || venues.length === 0 ? <li>No venues found</li> : venues.map((v) => (
                <li key={v.id}>
                    {editingId === v.id ? (
                        <>
                            <input 
                                placeholder="Name"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            />
                            <input 
                                placeholder="Address"
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                            />
                            <input 
                                placeholder="Capacity"
                                type="number"
                                value={formData.capacity} 
                                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})} 
                            />
                            <input 
                                placeholder="City"
                                value={formData.city} 
                                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                            />
                            <input 
                                placeholder="Country"
                                value={formData.country} 
                                onChange={(e) => setFormData({...formData, country: e.target.value})} 
                            />
                            <textarea 
                                placeholder="Description"
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            />
                            <button onClick={() => save(v.id)}>Save</button>
                        </>
                    ) : (
                        <>
                            <strong>{v.name}</strong> - {v.city}, {v.country}<br />
                            {v.address} | Capacity: {v.capacity}<br />
                            {v.description}
                            <button onClick={() => {
                                setEditingId(v.id);
                                setFormData({
                                    name: v.name,
                                    city: v.city,
                                    address: v.address,
                                    country: v.country,
                                    capacity: v.capacity,
                                    description: v.description
                                });
                            }}>
                                Edit
                            </button>
                            <button onClick={() => remove(v.id)}>Delete</button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}