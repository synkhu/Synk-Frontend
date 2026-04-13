import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArtistsPage from "../../app/artists/page";
import { getArtists } from "@/services/artist.service";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

jest.mock("@/services/artist.service");
jest.mock("@/services/auth.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../components/ProtectedRoute", () => ({ children }: any) => <div>{children}</div>);
jest.mock("../../components/Modal", () => ({ isOpen, children }: any) =>
  isOpen ? <div data-testid="modal">{children}</div> : null
);
jest.mock("../../app/artists/artistform", () => ({ onSuccess }: any) => (
  <button onClick={() => onSuccess([{ id: 1, name: "Dummy Artist" }])}>Submit Artist</button>
));
jest.mock("../../app/artists/artistlist", () => ({ artists }: any) => (
  <ul>{artists.map((a: any) => <li key={a.id}>{a.name}</li>)}</ul>
));

describe("ArtistsPage", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (getArtists as jest.Mock).mockResolvedValue([{ id: 1, name: "Artist One" }]);
    (authService.canAccessAdminPages as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner while checking auth", async () => {
    render(<ArtistsPage />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    await waitFor(() => expect(authService.canAccessAdminPages).toHaveBeenCalled());
  });

  it("renders artists list after authorization", async () => {
    render(<ArtistsPage />);
    await waitFor(() => expect(screen.getByText("Artists")).toBeInTheDocument());
    
    await waitFor(() => {
      expect(getArtists).toHaveBeenCalled();
    });
    
    expect(screen.getByText("Artist One")).toBeInTheDocument();
  });

  it("opens and closes the modal", async () => {
    render(<ArtistsPage />);
    await waitFor(() => screen.getByText("New"));

    fireEvent.click(screen.getByText("New"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Submit Artist"));
    await waitFor(() => expect(screen.getByText("Dummy Artist")).toBeInTheDocument());
  });

  it("redirects to home if unauthorized", async () => {
    (authService.canAccessAdminPages as jest.Mock).mockResolvedValue(false);
    render(<ArtistsPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });
});
