import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MyTicketsPage from '../../app/my-tickets/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('axios');
jest.mock('next/image', () => ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />);

const mockAxios = axios as jest.Mocked<typeof axios>;

Object.defineProperty(window, 'localStorage', {
  value: { getItem: jest.fn() },
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MyTicketsPage', () => {
  it('renders loading state initially', () => {
    render(<MyTicketsPage />);
    expect(screen.getByText('Fetching your tickets...')).toBeInTheDocument();
    const loadingDiv = screen.getByText('Fetching your tickets...').closest('div');
    const spinner = loadingDiv?.querySelector('div[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to home if no auth token', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    render(<MyTicketsPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error state on API failure', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');
    mockAxios.get.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });
    render(<MyTicketsPage />);
    await waitFor(() => expect(screen.getByText(/Server error/i)).toBeInTheDocument());
  });

  it('shows empty state when no tickets', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    render(<MyTicketsPage />);
    await waitFor(() => {
      expect(screen.getByText('No tickets found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse events/i })).toBeInTheDocument();
    });
  });

  it('renders tickets grouped by event with correct count', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');
    const mockTickets = [
      { id: '1', eventId: 'e1', eventName: 'Test Event 1', ticketTypeId: 't1', ticketTypeName: 'VIP', ticketToken: 'token1', createdAt: '2023-01-01' },
      { id: '2', eventId: 'e2', eventName: 'Test Event 2', ticketTypeId: 't2', ticketTypeName: 'Standard', ticketToken: 'token2', createdAt: '2023-01-02' },
    ];
    mockAxios.get.mockResolvedValueOnce({ data: mockTickets });
    render(<MyTicketsPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });
  });

  it('toggles category collapse/expand', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');
    const mockTickets = [
      { id: '1', eventId: 'e1', eventName: 'Test Event 1', ticketTypeId: 't1', ticketTypeName: 'VIP', ticketToken: 'token1', createdAt: '2023-01-01' },
    ];
    mockAxios.get.mockResolvedValueOnce({ data: mockTickets });
    render(<MyTicketsPage />);
    await waitFor(() => screen.getByText('Test Event 1'));

    const toggleBtn = screen.getByRole('button', { name: /test event 1/i });
    await userEvent.click(toggleBtn);
    await userEvent.click(toggleBtn);
  });

  it('handles ticket download', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');

    const mockTickets = [
      { id: '1', eventId: 'e1', eventName: 'Test Event 1', ticketTypeId: 't1', ticketTypeName: 'VIP', ticketToken: 'token1', createdAt: '2023-01-01' },
    ];

    mockAxios.get.mockResolvedValueOnce({ data: mockTickets });
    mockAxios.get.mockResolvedValueOnce({
      data: new Blob(['pdf content'], { type: 'application/pdf' }),
    });

    render(<MyTicketsPage />);
    await waitFor(() => screen.getByRole('button', { name: /download pass/i }));

    const downloadBtn = screen.getByRole('button', { name: /download pass/i });
    await userEvent.click(downloadBtn);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(mockAxios.get).toHaveBeenLastCalledWith(
        'https://api.synk.hu/tickets/1/download',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token'
          }),
          responseType: 'blob'
        })
      );
    });
  });
});
