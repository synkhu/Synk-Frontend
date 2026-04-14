import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventsPage from "../../app/events/page";
import { getEvents } from "../../app/services/event.service";
import { authService } from "../../app/services/auth.service";
import { useRouter } from "next/navigation";

jest.mock("../../app/services/event.service");
jest.mock("../../app/services/auth.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../components/ProtectedRoute", () => {
  const MockProtectedRoute = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  MockProtectedRoute.displayName = "MockProtectedRoute";
  return MockProtectedRoute;
});

jest.mock("../../components/Modal", () => {
  const MockModal = ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null;

  MockModal.displayName = "MockModal";
  return MockModal;
});

describe("EventsPage", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (getEvents as jest.Mock).mockResolvedValue([{ id: 1, name: "Event One" }]);
    (authService.canAccessAdminPages as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner while checking auth", async () => {
    render(<EventsPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    await waitFor(() =>
      expect(authService.canAccessAdminPages).toHaveBeenCalled()
    );
  });

  it("renders events list after authorization", async () => {
    render(<EventsPage />);
    await waitFor(() =>
      expect(screen.getByText("Events")).toBeInTheDocument()
    );
  });

  it("opens and closes the modal", async () => {
    render(<EventsPage />);
    await waitFor(() => screen.getByText("New"));

    fireEvent.click(screen.getByText("New"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("redirects to home if unauthorized", async () => {
    (authService.canAccessAdminPages as jest.Mock).mockResolvedValue(false);
    render(<EventsPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });
});