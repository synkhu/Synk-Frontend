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
        router.push("/");
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
            Manage Events
          </h1>
          
          <div className="space-y-8">
            {!isEditing && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <EventForm onSuccess={setEvents} />
              </div>
            )}
            
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <EventList
                events={events}
                onUpdate={setEvents}
                onEditStart={() => setIsEditing(true)}
                onEditEnd={() => setIsEditing(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
