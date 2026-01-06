import { getArtists } from "../services/artist.Service";
import ArtistForm from "./artistform";
import ArtistList from "./artistlist";
import ProtectedRoute from "../../components/ProtectedRoute";

export default  async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <ProtectedRoute>
      <div style={{ padding: "2rem" }}>
        <h1>Artists</h1>

        <ArtistForm />
        <ArtistList artists={artists} />
      </div>
    </ProtectedRoute>
  );
}
