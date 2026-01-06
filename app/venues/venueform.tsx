"use client";

import { useState } from "react";
import { createVenue } from "../services/venue.Service";
import { useRouter } from "next/navigation";

export default function VenueForm() {
    const [address, setAddress] = useState("");
    const [capacity, setCapacity] = useState(0);
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [description, setDescription] = useState("");
    const [isAdultOnly, setIsAdultOnly] = useState(false);
    const [name, setName] = useState("");
    const router = useRouter();

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        await createVenue(address, capacity, city, country, description, isAdultOnly, name);
        setAddress("");
        setCapacity(0);
        setCity("");
        setCountry("");
        setDescription("");
        setIsAdultOnly(false);
        setName("");
        router.refresh();
    }

    return (
        <form onSubmit={submit}>
            <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
            />
            <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <input
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                placeholder="Capacity"
                type="number"
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Venue Name"
            />
            
            <button>Add</button>
        </form>
    );
}
