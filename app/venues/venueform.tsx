"use client";

import { useState } from "react";
import { createVenue } from "../services/venue.Service";
import { uploadFile } from "../services/file.service";

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
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        
        try {
            let imageUrls: string[] | undefined = undefined;

            if (imageFiles.length > 0) {
                imageUrls = await Promise.all(imageFiles.map((file) => uploadFile(file)));
            }

            const updatedVenues = await createVenue(
                address,
                capacity,
                city,
                country,
                description,
                isAdultOnly,
                name,
                imageUrls
            );
            onSuccess(updatedVenues);
            
            setAddress("");
            setCapacity(0);
            setCity("");
            setCountry("");
            setDescription("");
            setIsAdultOnly(false);
            setName("");
            setImageFiles([]);
        } catch (err) {
            console.error("Failed to create venue:", err);
        }
    }

    return (
        <form onSubmit={submit} className="max-w-4xl mx-auto p-6 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Venue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Venue Name"
                    required
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                />
                <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                />
                <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                />
                <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                />
                <input
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    placeholder="Capacity"
                    type="number"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Venue Images (you can select multiple)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setImageFiles(files);
                    }}
                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4c3073] file:text-white hover:file:bg-[#5a3d8a]"
                />
                {imageFiles.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                        {imageFiles.length} image(s) selected. They will be uploaded and attached to this venue.
                    </p>
                )}
            </div>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
            />
            <button type="submit" className="w-full bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-6 py-3 rounded-lg font-semibold transition">
                Add Venue
            </button>
        </form>
    );
}
