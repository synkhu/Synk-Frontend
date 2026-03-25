"use client";
import {
  deleteVenue,
  updateVenue,
  addVenueImages,
} from "../services/venue.Service";
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

import Modal from "../../components/Modal";

export default function VenueList({ venues = [], onUpdate }: VenueListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    country: "",
    capacity: 0,
    description: "",
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
        const imageUrls = await Promise.all(
          imageFiles.map((file) => uploadFile(file)),
        );
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {!venues || venues.length === 0 ? (
          <div className="col-span-full text-center py-24">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📍</span>
            </div>
            <p className="text-white text-xl font-bold">No venues found</p>
            <p className="text-gray-500 mt-2">
              Get started by creating your first venue.
            </p>
          </div>
        ) : (
          venues.map((v) => (
            <div key={v.id}>
              <div className="group relative h-full rounded-[2rem] border border-white/10 bg-[#1a0b2e]/60 backdrop-blur-sm overflow-hidden hover:bg-[#2d1b4e]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                  <button
                    onClick={() => {
                      setEditingId(v.id);
                      setFormData({
                        name: v.name,
                        city: v.city,
                        address: v.address,
                        country: v.country,
                        capacity: v.capacity,
                        description: v.description,
                      });
                    }}
                    className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => remove(v.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-full backdrop-blur-md transition-all"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                      {v.name}
                    </h3>
                    <p className="text-purple-400 font-medium text-xs sm:text-sm flex items-center">
                      <span className="mr-1">📍</span> {v.city}, {v.country}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center text-xs sm:text-sm text-gray-400 bg-white/5 px-3 py-2 sm:px-3 sm:py-3 rounded-xl border border-white/5">
                      <span className="mr-3 text-lg">🏠</span>
                      <span className="truncate">{v.address}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-400 bg-white/5 px-3 py-2 sm:px-3 sm:py-3 rounded-xl border border-white/5">
                      <span className="mr-3 text-lg">👥</span>
                      <span>
                        Capacity:{" "}
                        <span className="text-white font-bold">{v.capacity}</span>
                      </span>
                    </div>
                  </div>

                  {v.description && (
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-3 sm:pt-4 mt-3 sm:mt-4">
                      {v.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={editingId !== null}
        onClose={() => setEditingId(null)}
        title="Edit Venue"
      >
        <div className="space-y-4">
          <input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <input
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            <input
              placeholder="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <input
            placeholder="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                capacity: Number(e.target.value),
              })
            }
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
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
              className="w-full text-[10px] sm:text-xs text-gray-400 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-[10px] sm:file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
            {imageFiles.length > 0 && (
              <p className="mt-1 text-[8px] sm:text-[10px] font-bold text-green-400 ml-1">
                {imageFiles.length} new images selected
              </p>
            )}
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
          />
          <button
            onClick={() => editingId && save(editingId)}
            className="w-full bg-white text-black hover:bg-gray-200 py-2.5 sm:py-3 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-white/20"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </>
  );
}
