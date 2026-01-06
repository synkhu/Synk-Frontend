import { getEvents } from "../services/event.Service";
import EventsForm from "./eventsform";
import EventList from "./eventlist";
import ProtectedRoute from "../../components/ProtectedRoute";

export default  async function EventsPage() {
  const events = await getEvents();

  return (
    <ProtectedRoute>
      <div style={{ padding: "2rem" }}>
        <h1>Events</h1>

        <EventsForm />
        <EventList events={events} />
      </div>
    </ProtectedRoute>
  );
}
