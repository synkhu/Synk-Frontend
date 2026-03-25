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
        imageUrls = await Promise.all(
          imageFiles.map((file) => uploadFile(file)),
        );
      }

      const updatedVenues = await createVenue(
        address,
        capacity,
        city,
        country,
        description,
        isAdultOnly,
        name,
        imageUrls,
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
    <form
      onSubmit={submit}
      className="max-w-2xl sm:max-w-4xl mx-auto space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Venue Name"
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
        <input
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          placeholder="Capacity"
          type="number"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider ml-1">
          Venue Images
        </label>
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImageFiles(files);
            }}
            className="w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer border border-white/10 rounded-2xl bg-white/5 p-1 sm:p-2"
          />
        </div>
        {imageFiles.length > 0 && (
          <p className="mt-1 text-[10px] sm:text-xs font-medium text-green-400 ml-1">
            ✓ {imageFiles.length} image(s) selected
          </p>
        )}
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10 resize-none"
      />
      <button
        type="submit"
        className="w-full bg-white text-black hover:bg-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg transition-all shadow-lg hover:shadow-white/20"
      >
        Add Venue
      </button>
    </form>
  );
}
