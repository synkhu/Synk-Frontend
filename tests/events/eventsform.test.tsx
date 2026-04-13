import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventForm from "../../app/events/eventsform";
import * as eventService from "../../app/services/event.service";

jest.mock("../../app/services/event.service");
jest.mock("../../app/services/file.service");

const mockOnSuccess = jest.fn();

describe("EventForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (eventService.searchVenues as jest.Mock).mockResolvedValue([]);
    (eventService.searchArtists as jest.Mock).mockResolvedValue([]);
  });

  it("renders form fields correctly", () => {
    render(<EventForm onSuccess={mockOnSuccess} />);

    expect(screen.getByPlaceholderText('Event Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Describe your event...")).toBeInTheDocument();
    expect(screen.getByText("Start Time")).toBeInTheDocument();
    expect(screen.getByText("End Time")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add another ticket type/i })).toBeInTheDocument();
  });

  it("renders section headers", () => {
    render(<EventForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Date & Time")).toBeInTheDocument();
    expect(screen.getByText("Capacity & Tickets")).toBeInTheDocument();
    expect(screen.getByText("Location & Artist")).toBeInTheDocument();
    expect(screen.getByText("Ticket Types")).toBeInTheDocument();
  });

  it("shows validation alert for empty name", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<EventForm onSuccess={mockOnSuccess} />);

    fireEvent.submit(container.firstElementChild! as HTMLFormElement);

    expect(alertMock).toHaveBeenCalledWith("Event name is required");

    alertMock.mockRestore();
  });

  it("can add ticket type", async () => {
    render(<EventForm onSuccess={mockOnSuccess} />);
    
    const addButton = screen.getByRole("button", { name: /add another ticket type/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(2);
    });
  });

  it("cannot remove last ticket type", () => {
    render(<EventForm onSuccess={mockOnSuccess} />);
    
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("fills form with initial data", () => {
    const initialData = {
      name: "Test Event",
      description: "Test desc",
      startTime: "2024-01-01T10:00:00.000Z",
      endTime: "2024-01-01T12:00:00.000Z",
      venue: { id: "1", name: "Test Venue" },
    };

    render(<EventForm onSuccess={mockOnSuccess} initialData={initialData} />);

    expect(screen.getByDisplayValue("Test Event")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test desc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2024-01-01T10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2024-01-01T12:00")).toBeInTheDocument();
    expect(screen.getByText("✓ Venue Selected: Test Venue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("calls createEvent on successful submit", async () => {
    (eventService.searchVenues as jest.Mock).mockResolvedValue([{ id: '1', name: 'Test Venue' }]);
    (eventService.createEvent as jest.Mock).mockResolvedValue([]);
    
    render(<EventForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: "Test Event" } });
    
    fireEvent.change(screen.getByPlaceholderText("Describe your event..."), { target: { value: "Test" } });
    
    const dateInputs = Array.from(document.querySelectorAll('input[type="datetime-local"]')) as HTMLInputElement[];
    fireEvent.change(dateInputs[0], { target: { value: "2024-01-01T10:00" } });
    fireEvent.change(dateInputs[1], { target: { value: "2024-01-01T12:00" } });
    
    const venueInput = screen.getByPlaceholderText("Search Venue...");
    fireEvent.change(venueInput, { target: { value: "te" } });
    
    await waitFor(() => screen.getByText('Test Venue'));
    
    fireEvent.click(screen.getByText('Test Venue'));
    
    fireEvent.click(screen.getByRole("button", { name: /create event/i }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalled();
    });
    
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});

