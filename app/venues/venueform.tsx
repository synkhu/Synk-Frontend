"use client";

import { useState } from "react";
import { createVenue } from "../services/venue.Service";

interface Venue {
    id: number;
    name: string;
    city: string;
    address: string;
    country: string;
    capacity: number;
    description: string;
}

type VenueFormProps = {
    onSuccess: (venues: Venue[]) => void;
};

export default function VenueForm({ onSuccess }: VenueFormProps) {
    const [address, setAddress] = useState("");
    const [capacity, setCapacity] = useState(0);
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [description, setDescription] = useState("");
    const [isAdultOnly, setIsAdultOnly] = useState(false);
    const [name, setName] = useState("");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        
        try {
            const updatedVenues = await createVenue(address, capacity, city, country, description, isAdultOnly, name);
            onSuccess(updatedVenues);
            
            setAddress("");
            setCapacity(0);
            setCity("");
            setCountry("");
            setDescription("");
            setIsAdultOnly(false);
            setName("");
        } catch (err) {
            console.error("Failed to create venue:", err);
        }
    }

    return (
        <form onSubmit={submit}>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Venue Name"
                required
            />
            <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
            />
            <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
            />
            <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
            />
            <input
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                placeholder="Capacity"
                type="number"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <button type="submit">Add</button>
        </form>
    );
}
