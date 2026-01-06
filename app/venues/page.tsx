import { getVenues } from "../services/venue.Service";
import VenueForm from "./venueform";
import VenueList from "./venuelist";
import ProtectedRoute from "../../components/ProtectedRoute";

export default  async function VenuesPage() {
  const venues = await getVenues();

  return (
    <ProtectedRoute>
      <div style={{ padding: "2rem" }}>
        <h1>Venues</h1>
    
        <VenueForm />
        <VenueList venues={venues} />
      </div>
    </ProtectedRoute>
  );
}
