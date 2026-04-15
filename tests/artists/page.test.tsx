import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import ArtistsPage from "../../app/artists/page";
import { getArtists } from "../../app/services/artist.service";
import { authService } from "../../app/services/auth.service";
import { useRouter } from "next/navigation";

jest.mock("../../app/services/artist.service");
jest.mock("../../app/services/auth.service");

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../components/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("../../components/Modal", () => ({
  __esModule: true,
  default: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: ReactNode;
  }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
}));

jest.mock("../../app/artists/artistform", () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: (artists: { id: number; name: string }[]) => void }) => (
    <button onClick={() => onSuccess([{ id: 1, name: "Dummy Artist" }])}>
      Submit Artist
    </button>
  ),
}));

jest.mock("../../app/artists/artistlist", () => ({
  __esModule: true,
  default: ({ artists }: { artists: { id: number; name: string }[] }) => (
    <ul>
      {artists.map((a) => (
        <li key={a.id}>{a.name}</li>
      ))}
    </ul>
  ),
}));

describe("ArtistsPage", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (getArtists as jest.Mock).mockResolvedValue([
      { id: 1, name: "Artist One" },
    ]);

    (authService.canAccessAdminPages as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner while checking auth", async () => {
    render(<ArtistsPage />);
    const spinner = document.querySelector(".animate-spin");

    expect(spinner).toBeInTheDocument();

    await waitFor(() =>
      expect(authService.canAccessAdminPages).toHaveBeenCalled()
    );
  });

  it("renders artists list after authorization", async () => {
    render(<ArtistsPage />);

    await waitFor(() =>
      expect(screen.getByText("Artists")).toBeInTheDocument()
    );

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

    await waitFor(() =>
      expect(screen.getByText("Dummy Artist")).toBeInTheDocument()
    );
  });

  it("redirects to home if unauthorized", async () => {
    (authService.canAccessAdminPages as jest.Mock).mockResolvedValue(false);
    render(<ArtistsPage />);

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/")
    );
  });
});
