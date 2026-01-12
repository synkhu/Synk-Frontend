"use client";

import { useEffect, useState } from "react";
import { getEvents } from "../services/event.Service";
import EventForm from "./eventsform";
import EventList from "./eventlist";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <ProtectedRoute>
      <div style={{ padding: "2rem" }}>
        <h1>Events</h1>
        <EventForm onSuccess={setEvents} />
        <EventList events={events} onUpdate={setEvents} />
      </div>
    </ProtectedRoute>
  );
}
