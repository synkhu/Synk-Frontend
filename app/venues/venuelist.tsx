"use client";
import { deleteVenue, updateVenue } from "../services/venue.Service";
import { useRouter } from "next/navigation";
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

export default function VenueList({ venues = [] }: { venues?: Venue[] }) {
    const router = useRouter();
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
        await updateVenue(id, formData);
        setEditingId(null);
        router.refresh();
    }
    
    async function remove(id: number) {
        await deleteVenue(id);
        router.refresh();
    }
    
    return (
        <ul>
            {!venues || venues.length === 0 ? <li>No venues found</li> : venues.map((v) => (
                <li key={v.id}>
                    {editingId === v.id ? (
                        <>
                            <input 
                                placeholder="Address"
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                            />
                            <input 
                                placeholder="Description"
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            />
                            <input 
                                placeholder="Capacity"
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
                                value={formData.name} 
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