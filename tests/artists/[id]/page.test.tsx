import { render, screen, waitFor } from "@testing-library/react";
import ArtistDetailsPage from "@/artists/[id]/page";
import axios from "axios";

jest.mock("axios");
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ArtistDetailsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/artists/1")) {
        return Promise.resolve({
          data: {
            id: "1",
            name: "Test Artist",
            description: "Test description",
            profilePictureUrl: "https://example.com/artist.jpg",
            spotifyUrl: "https://spotify.com/artist",
          },
        });
      }
      return Promise.resolve({ data: { items: [] } });
    });
  });

  it("renders loading spinner", async () => {
    await waitFor(() => {
      const { container } = render(<ArtistDetailsPage params={{ id: "1" } as any} />);
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("renders artist details successfully", async () => {
    render(<ArtistDetailsPage params={{ id: "1" } as any} />);
    await waitFor(() => {
      expect(screen.getByText("Test Artist")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
    });
  });

  it("renders error state", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));
    render(<ArtistDetailsPage params={{ id: "999" } as any} />);
    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Failed to load artist details")).toBeInTheDocument();
    });
  });

  it("renders no events state", async () => {
    render(<ArtistDetailsPage params={{ id: "1" } as any} />);
    await waitFor(() => {
      expect(screen.queryByText("Test Event")).not.toBeInTheDocument();
    });
  });
});