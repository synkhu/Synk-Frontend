"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";

interface GateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

export default function GateCodeModal({ isOpen, onClose, eventId, eventName }: GateCodeModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchCode();
    }
  }, [isOpen, eventId]);

  const fetchCode = async () => {
    setLoading(true);
    setError(null);
    setCode(null);

    const options = {
      method: 'GET',
      url: `https://api.synk.hu/events/${eventId}/staff-code`
    };

    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        (options as any).headers = { Authorization: `Bearer ${token}` };
      }

      const { data } = await axios.request(options);
      if (typeof data === 'object' && data !== null && 'gateStaffCode' in data) {
        setCode(data.gateStaffCode);
      } else {
        setCode(String(data));
      }
    } catch (error) {
      setError("Failed to load gate code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gate Code">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div>
            <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Event</h3>
            <p className="text-2xl font-bold text-white">{eventName}</p>
        </div>
        
        <div className="w-full p-8 bg-white/5 rounded-2xl border border-white/10">
            {loading ? (
                <div className="animate-pulse text-purple-400">Loading code...</div>
            ) : error ? (
                <div className="text-red-400">{error}</div>
            ) : (
                <div className="space-y-2">
                    <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Access Code</p>
                    <p className="text-5xl font-mono font-bold text-purple-400 tracking-wider select-all">
                        {code}
                    </p>
                </div>
            )}
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
