"use client";
import { deleteVenue, updateVenue, addVenueImages } from "../services/venue.Service";
import { uploadFile } from "../services/file.service";
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
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    
    async function save(id: number) {
        if (!formData.name.trim()) {
            alert("Venue name cannot be empty");
            return;
        }
        const updatedVenues = await updateVenue(id, formData);

        if (imageFiles.length > 0) {
            try {
                const imageUrls = await Promise.all(imageFiles.map((file) => uploadFile(file)));
                await addVenueImages(id, imageUrls);
            } catch (err) {
                console.error("Failed to upload or attach venue images:", err);
            }
        }

        onUpdate(updatedVenues);
        setEditingId(null);
        setImageFiles([]);
    }
    
    async function remove(id: number) {
        const updatedVenues = await deleteVenue(id);
        onUpdate(updatedVenues);
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!venues || venues.length === 0 ? (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">No venues found</p>
                </div>
            ) : venues.map((v) => (
                <div key={v.id}>
                    {editingId === v.id ? (
                        <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-6 space-y-3">
                            <h3 className="text-lg font-bold text-white mb-4">Edit Venue</h3>
                            <input 
                                placeholder="Name"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                            />
                            <input 
                                placeholder="Address"
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    placeholder="City"
                                    value={formData.city} 
                                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                                />
                                <input 
                                    placeholder="Country"
                                    value={formData.country} 
                                    onChange={(e) => setFormData({...formData, country: e.target.value})} 
                                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                                />
                            </div>
                            <input 
                                placeholder="Capacity"
                                type="number"
                                value={formData.capacity} 
                                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})} 
                                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Add Images
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
                                        {imageFiles.length} new image(s) will be uploaded and attached.
                                    </p>
                                )}
                            </div>
                            <textarea 
                                placeholder="Description"
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                rows={3}
                                className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400"
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => save(v.id)}
                                    className="flex-1 bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg transition"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => setEditingId(null)}
                                    className="bg-[#3a2659] hover:bg-[#4c3073] text-white px-4 py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_18px_50px_rgba(0,0,0,0.8)] overflow-hidden hover:shadow-[0_24px_70px_rgba(236,72,153,0.45)] transition-shadow duration-300">
                            <div className="p-6 space-y-3">
                                <h3 className="text-xl font-bold text-white">{v.name}</h3>
                                <div className="text-gray-300 text-sm space-y-1">
                                    <p className="flex items-center gap-2">
                                        <span>📍</span>
                                        <span>{v.city}, {v.country}</span>
                                    </p>
                                    <p className="text-gray-400">{v.address}</p>
                                    <p className="flex items-center gap-2">
                                        <span>👥</span>
                                        <span>Capacity: {v.capacity}</span>
                                    </p>
                                    {v.description && <p className="text-gray-400 mt-2">{v.description}</p>}
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-[#5a3d8a]">
                                    <button 
                                        onClick={() => {
                                            setEditingId(v.id);
                                            setFormData({
                                                name: v.name,
                                                city: v.city,
                                                address: v.address,
                                                country: v.country,
                                                capacity: v.capacity,
                                                description: v.description
                                            });
                                        }}
                                        className="flex-1 bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => remove(v.id)}
                                        className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
