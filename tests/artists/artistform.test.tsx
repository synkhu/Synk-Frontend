import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArtistForm from "../../app/artists/artistform";
import { createArtist } from "@/services/artist.service";

jest.mock("@/services/artist.service");

describe("ArtistForm", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields", () => {
    render(<ArtistForm onSuccess={mockOnSuccess} />);
    expect(screen.getByPlaceholderText("Artist name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Artist description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Spotify URL")).toBeInTheDocument();
    expect(screen.getByText("Profile picture")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add artist/i })).toBeInTheDocument();
  });

  it("submits form successfully", async () => {
    (createArtist as jest.Mock).mockResolvedValue([{ id: 1, name: "Test Artist" }]);

    render(<ArtistForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("Artist name"), { target: { value: "Test Artist" } });
    fireEvent.change(screen.getByPlaceholderText("Artist description"), { target: { value: "Test description" } });
    fireEvent.change(screen.getByPlaceholderText("Spotify URL"), { target: { value: "https://spotify.com/artist" } });

    fireEvent.click(screen.getByRole("button", { name: /add artist/i }));

    await waitFor(() => expect(createArtist).toHaveBeenCalled());
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("handles form submission error", async () => {
    (createArtist as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<ArtistForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("Artist name"), { target: { value: "Test Artist" } });
    fireEvent.click(screen.getByRole("button", { name: /add artist/i }));

    await waitFor(() => expect(createArtist).toHaveBeenCalled());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
