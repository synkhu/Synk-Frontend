import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventList from "../../app/events/eventlist";
import { useRouter } from "next/navigation";

jest.mock("next/navigation");
jest.mock("../../components/Modal", () => {
  type Props = {
    isOpen: boolean;
    children: React.ReactNode;
    onClose?: () => void;
  };

  const MockModal = ({ isOpen, children }: Props) => {
    if (!isOpen) return null;
    return <div data-testid="edit-modal">{children}</div>;
  };

  MockModal.displayName = "MockModal";
  return MockModal;
});

jest.mock("../../components/GateCodeModal", () => {
  type Props = {
    isOpen: boolean;
  };

  const MockGateCodeModal = ({ isOpen }: Props) => {
    if (!isOpen) return null;
    return <div data-testid="gatecode-modal" />;
  };

  MockGateCodeModal.displayName = "MockGateCodeModal";
  return MockGateCodeModal;
});

jest.mock("../../app/services/event.service");
jest.mock("../../app/services/file.service");

const mockRouter = {
  push: jest.fn(),
};

const mockEvents = [
  {
    id: "1",
    name: "Test Event 1",
    venueName: "Test Venue",
    startTime: "2024-01-01T10:00:00Z",
    artistName: "Test Artist",
    ticketTypes: [
      { id: "t1", name: "VIP", price: 100, saleStartTime: "", saleEndTime: "", maxSaleCount: "10" },
      { id: "t2", name: "General", price: 50, saleStartTime: "", saleEndTime: "", maxSaleCount: "100" },
    ],
  },
];

const mockUpdateEvents = jest.fn();
const mockStartEdit = jest.fn();
const mockEndEdit = jest.fn();

describe("EventList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders no events message when events array is empty", () => {
    render(
      <EventList 
        events={[]} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    expect(screen.getByText("No events found")).toBeInTheDocument();
  });

  it("renders event cards with correct information", () => {
    render(
      <EventList 
        events={mockEvents} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    expect(screen.getByText("Test Venue")).toBeInTheDocument();
  });

  it("displays artist information", () => {
    render(
      <EventList 
        events={mockEvents} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("shows placeholder icon when no thumbnail", () => {
    render(
      <EventList 
        events={mockEvents} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    expect(screen.getAllByText("📅").length).toBeGreaterThan(0);
  });

  it("navigates to event detail on card click", async () => {
    render(
      <EventList 
        events={mockEvents} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    const eventCard = screen.getByText("Test Event 1").closest("div");
    fireEvent.click(eventCard!);
    expect(mockRouter.push).toHaveBeenCalledWith("/events/1");
  });

  it("opens gate code modal on gate code button click", async () => {
    render(
      <EventList 
        events={mockEvents} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    const gateCodeButtons = screen.getAllByTitle("Gate Code");
    fireEvent.click(gateCodeButtons[0]);
    await waitFor(() => expect(screen.getByTestId("gatecode-modal")).toBeInTheDocument());
  });

  it("opens edit modal on edit button click", async () => {
    render(
      <EventList 
        events={mockEvents} 
        onUpdate={mockUpdateEvents}
        onEditStart={mockStartEdit}
        onEditEnd={mockEndEdit}
      />
    );
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    await waitFor(() => expect(screen.getByTestId("edit-modal")).toBeInTheDocument());
    expect(mockStartEdit).toHaveBeenCalled();
  });
});