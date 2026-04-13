import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventsPage from "@/events/page";
import { getEvents } from "@/services/event.service";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

jest.mock("@/services/event.service");
jest.mock("@/services/auth.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../components/ProtectedRoute", () => ({ children }: any) => <div>{children}</div>);
jest.mock("../../components/Modal", () => ({ isOpen, children }: any) =>
  isOpen ? <div data-testid="modal">{children}</div> : null
);

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
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    await waitFor(() => expect(authService.canAccessAdminPages).toHaveBeenCalled());
  });

  it("renders events list after authorization", async () => {
    render(<EventsPage />);
    await waitFor(() => expect(screen.getByText("Events")).toBeInTheDocument());
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

