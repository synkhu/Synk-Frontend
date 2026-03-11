"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvents } from "../services/event.Service";
import EventForm from "./eventsform";
import EventList from "./eventlist";
import ProtectedRoute from "../../components/ProtectedRoute";
import { authService } from "../services/auth.service";
import Modal from "../../components/Modal";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <header className="mb-10 flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">Events</h1>
              <p className="text-gray-500 font-medium">Manage events and schedules</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#2d1b4e] hover:bg-[#4c3073] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#4c3073]/50 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New</span>
              </button>
            )}
          </header>

          <div className="space-y-12">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
              <EventForm onSuccess={(data) => {
                setEvents(data);
                setIsModalOpen(false);
              }} />
            </Modal>

            <section>
              <EventList
                events={events}
                onUpdate={setEvents}
                onEditStart={() => setIsEditing(true)}
                onEditEnd={() => setIsEditing(false)}
              />
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
