"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvents } from "../services/event.Service";
import EventForm from "./eventsform";
import EventList from "./eventlist";
import ProtectedRoute from "../../components/ProtectedRoute";
import { authService } from "../services/auth.service";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const canAccess = await authService.canAccessAdminPages();
      if (!canAccess) {
        router.push('/');
        return;
      }
      setIsAuthorized(true);
      setIsChecking(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      getEvents().then(setEvents);
    }
  }, [isAuthorized]);

  if (isChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
      >
        <p className="text-white">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen py-8 px-4"
        style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}
      >
        <div className="max-w-6xl mx-auto rounded-3xl border border-purple-500/40 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-6">
          <h1 className="text-3xl font-extrabold text-white mb-6 tracking-wide">Events</h1>
          {!isEditing && <EventForm onSuccess={setEvents} />}
          <div className="mt-6">
            <EventList 
              events={events} 
              onUpdate={setEvents} 
              onEditStart={() => setIsEditing(true)}
              onEditEnd={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
