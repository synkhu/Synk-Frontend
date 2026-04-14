import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArtistList from "../../app/artists/artistlist";
import { deleteArtist } from "../../app/services/artist.service";

jest.mock("../../app/services/artist.service");
jest.mock("../../components/Modal", () => {
  const MockModal = ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    onClose?: () => void;
  }) => {
    if (!isOpen) return null;
    return <div data-testid="edit-modal">{children}</div>;
  };

  MockModal.displayName = "MockModal";
  return MockModal;
});

const mockArtists = [
  {
    id: 1,
    name: "Artist One",
    description: "Test desc",
    spotifyUrl: "https://spotify.com",
    profilePictureUrl: "https://example.com/img.jpg",
  },
];

const mockOnUpdate = jest.fn();

describe("ArtistList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no artists", () => {
    render(<ArtistList artists={[]} onUpdate={mockOnUpdate} />);
    expect(screen.getByText("No artists found")).toBeInTheDocument();
  });

  it("renders artist cards", () => {
    render(<ArtistList artists={mockArtists} onUpdate={mockOnUpdate} />);
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Listen on Spotify")).toBeInTheDocument();
  });

  it("opens edit modal on edit button click", async () => {
    render(<ArtistList artists={mockArtists} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() =>
      expect(screen.getByTestId("edit-modal")).toBeInTheDocument()
    );

    expect(screen.getByPlaceholderText("Artist name")).toHaveValue(
      "Artist One"
    );
  });

  it("deletes artist successfully", async () => {
    (deleteArtist as jest.Mock).mockResolvedValue([]);

    render(<ArtistList artists={mockArtists} onUpdate={mockOnUpdate} />);

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(deleteArtist).toHaveBeenCalledWith(1));
    expect(mockOnUpdate).toHaveBeenCalledWith([]);
  });

  it("shows Spotify link when present", () => {
    render(<ArtistList artists={mockArtists} onUpdate={mockOnUpdate} />);
    expect(screen.getByText("Listen on Spotify")).toBeInTheDocument();
  });

  it("renders artist without profile picture", () => {
    const artistsNoImage = [{ id: 2, name: "Artist Two" }];

    render(
      <ArtistList artists={artistsNoImage as { id: number; name: string }[]} onUpdate={mockOnUpdate} />
    );

    expect(screen.getByText("Artist Two")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});