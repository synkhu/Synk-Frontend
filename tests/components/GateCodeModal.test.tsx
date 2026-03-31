import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GateCodeModal from '../../components/GateCodeModal';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../components/Modal', () => ({ isOpen, onClose, title, children }: any) => (
  <div data-testid="modal">{children}</div>
));

describe('GateCodeModal', () => {
  const eventId = '123';
  const eventName = 'Test Event';
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', async () => {
    (axios.request as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

    await act(async () =>
      render(<GateCodeModal isOpen={true} onClose={onClose} eventId={eventId} eventName={eventName} />)
    );

    expect(screen.getByText(/Loading code/i)).toBeInTheDocument();
  });

  it('renders gate code when API succeeds', async () => {
    (axios.request as jest.Mock).mockResolvedValue({ data: { gateStaffCode: 'GATE1234' } });

    await act(async () =>
      render(<GateCodeModal isOpen={true} onClose={onClose} eventId={eventId} eventName={eventName} />)
    );

    await waitFor(() => expect(screen.getByText(/GATE1234/i)).toBeInTheDocument());
    expect(screen.getByText(eventName)).toBeInTheDocument();
  });

  it('renders error message when API fails', async () => {
    const error = new Error('API failure');
    (axios.request as jest.Mock).mockRejectedValue(error);

    await act(async () =>
      render(<GateCodeModal isOpen={true} onClose={onClose} eventId={eventId} eventName={eventName} />)
    );

    await waitFor(() => expect(screen.getByText(/Failed to load gate code/i)).toBeInTheDocument());
  });

  it('calls onClose when close button clicked', async () => {
    (axios.request as jest.Mock).mockResolvedValue({ data: { gateStaffCode: 'GATE1234' } });

    await act(async () =>
      render(<GateCodeModal isOpen={true} onClose={onClose} eventId={eventId} eventName={eventName} />)
    );

    const closeButton = screen.getByText(/Close/i);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not fetch if isOpen is false', async () => {
    await act(async () =>
      render(<GateCodeModal isOpen={false} onClose={onClose} eventId={eventId} eventName={eventName} />)
    );

    expect(axios.request).not.toHaveBeenCalled();
  });

  it('includes auth token if present in localStorage', async () => {
    localStorage.setItem('authToken', 'TEST_TOKEN');

    (axios.request as jest.Mock).mockResolvedValue({ data: { gateStaffCode: 'GATE1234' } });

    await act(async () =>
      render(<GateCodeModal isOpen={true} onClose={onClose} eventId={eventId} eventName={eventName} />)
    );

    await waitFor(() =>
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: 'Bearer TEST_TOKEN' },
        })
      )
    );
  });
});