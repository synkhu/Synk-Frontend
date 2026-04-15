import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import type { ReactNode } from "react";
import GateCodeModal from '../../components/GateCodeModal';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../components/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="modal">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  },
}));

describe('GateCodeModal', () => {
  const eventId = '123';
  const eventName = 'Test Event';
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', async () => {
    (axios.request as jest.Mock).mockReturnValue(new Promise(() => {}));

    await act(async () =>
      render(
        <GateCodeModal
          isOpen={true}
          onClose={onClose}
          eventId={eventId}
          eventName={eventName}
        />
      )
    );

    expect(screen.getByText(/Loading code/i)).toBeInTheDocument();
  });

  it('renders gate code when API succeeds', async () => {
    (axios.request as jest.Mock).mockResolvedValue({
      data: { gateStaffCode: 'GATE1234' },
    });

    await act(async () =>
      render(
        <GateCodeModal
          isOpen={true}
          onClose={onClose}
          eventId={eventId}
          eventName={eventName}
        />
      )
    );

    await waitFor(() =>
      expect(screen.getByText(/GATE1234/i)).toBeInTheDocument()
    );

    expect(screen.getByText(eventName)).toBeInTheDocument();
  });

  it('renders error message when API fails', async () => {
    const error = new Error('API failure');
    (axios.request as jest.Mock).mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () =>
      render(
        <GateCodeModal
          isOpen={true}
          onClose={onClose}
          eventId={eventId}
          eventName={eventName}
        />
      )
    );

    await waitFor(() =>
      expect(screen.getByText(/Failed to load gate code/i)).toBeInTheDocument()
    );

    consoleSpy.mockRestore();
  });

  it('calls onClose when close button clicked', async () => {
    (axios.request as jest.Mock).mockResolvedValue({
      data: { gateStaffCode: 'GATE1234' },
    });

    await act(async () =>
      render(
        <GateCodeModal
          isOpen={true}
          onClose={onClose}
          eventId={eventId}
          eventName={eventName}
        />
      )
    );

    const closeButton = screen.getAllByRole('button', { name: /close/i })[0];
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not fetch if isOpen is false', async () => {
    await act(async () =>
      render(
        <GateCodeModal
          isOpen={false}
          onClose={onClose}
          eventId={eventId}
          eventName={eventName}
        />
      )
    );

    expect(axios.request).not.toHaveBeenCalled();
  });

  it('includes auth token if present in localStorage', async () => {
    localStorage.setItem('authToken', 'TEST_TOKEN');

    (axios.request as jest.Mock).mockResolvedValue({
      data: { gateStaffCode: 'GATE1234' },
    });

    await act(async () =>
      render(
        <GateCodeModal
          isOpen={true}
          onClose={onClose}
          eventId={eventId}
          eventName={eventName}
        />
      )
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
