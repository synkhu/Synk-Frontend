import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import EventDetailsPage from "../../../app/events/[id]/page";
import axios from "axios";
import { useRouter } from "next/navigation";

jest.mock("axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../components/Modal", () => {
  type ModalProps = {
    isOpen: boolean;
    children: React.ReactNode;
  };

  return {
    __esModule: true,
    default: ({ isOpen, children }: ModalProps) =>
      isOpen ? <div data-testid="modal">{children}</div> : null,
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
  window.alert = jest.fn();
});

describe("EventDetailsPage", () => {
  const pushMock = jest.fn();

  const mockEvent = {
    id: "1",
    name: "Test Event",
    description: "Test description",
    startTime: "2024-01-01T20:00:00Z",
    endTime: "2024-01-01T22:00:00Z",
    thumbnailUrl: "https://example.com/event.jpg",
    venueName: "Test Venue",
    venueAddress: "123 Test St",
    artistName: "Test Artist",
    ticketTypes: [
      {
        id: "t1",
        name: "General Admission",
        price: 5000,
        remainingCount: 100,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes("/events/1")) return Promise.resolve({ data: mockEvent });
      if (url.includes("/addresses")) return Promise.resolve({ data: [] });
      return Promise.reject(new Error("Not found"));
    });
  });

  const renderPage = async (): Promise<void> => {
    await act(async () => {
      render(
        <EventDetailsPage
          params={Promise.resolve({ id: "1" })}
        />
      );
    });
  };

  it("renders loading spinner initially", async () => {
    const { container } = render(
      <EventDetailsPage params={Promise.resolve({ id: "1" })} />
    );

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    await screen.findByText("Test Event");
  });

  it("renders event details", async () => {
    await renderPage();
    await screen.findByText("Test Event");

    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Test Venue")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
    expect(screen.getByText("General Admission")).toBeInTheDocument();

    expect(
      screen.getByText((text) =>
        (text.includes("5000") || text.includes("5,000")) && text.includes("HUF")
      )
    ).toBeInTheDocument();
  });

  it("renders error state", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(
        <EventDetailsPage params={Promise.resolve({ id: "999" })} />
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load event details")
      ).toBeInTheDocument();
    });
  });

  it("increments and decrements ticket quantity", async () => {
    await renderPage();
    await screen.findByText("Test Event");

    const plusButton = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("M12 4v16"))!;

    const minusButton = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("M20 12H4"))!;

    await userEvent.click(plusButton);
    expect(screen.getByText("1")).toBeInTheDocument();

    await userEvent.click(minusButton);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows total price when ticket selected", async () => {
    await renderPage();
    await screen.findByText("Test Event");

    const plusButton = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("M12 4v16"))!;

    await userEvent.click(plusButton);

    const totalContainer = screen.getByText("Total Price").closest("div")!;

    await waitFor(() => {
      expect(
        within(totalContainer).getByText((text) =>
          (text.includes("5000") || text.includes("5,000")) && text.includes("HUF")
        )
      ).toBeInTheDocument();
    });
  });

  it("opens modal when clicking checkout with tickets", async () => {
    localStorage.setItem("authToken", "fake-token");

    await renderPage();
    await screen.findByText("Test Event");

    const plusButton = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("M12 4v16"))!;

    await userEvent.click(plusButton);

    const checkoutButton = await screen.findByText("Confirm Purchase");
    await userEvent.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  it("does not allow checkout without tickets", async () => {
    await renderPage();
    await screen.findByText("Test Event");

    expect(screen.queryByText("Confirm Purchase")).not.toBeInTheDocument();
  });

  it("calls API with correct event id", async () => {
    await renderPage();

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/events/1")
      );
    });
  });
});