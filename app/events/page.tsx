"use client";

import { useEffect, useState } from "react";
import { getEvents } from "../services/event.Service";
import EventForm from "./eventsform";
import EventList from "./eventlist";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a0f2e] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Events</h1>
          
          {!isEditing && <EventForm onSuccess={setEvents} />}
          
          <div className="mt-8">
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
