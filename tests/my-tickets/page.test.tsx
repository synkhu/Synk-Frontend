import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MyTicketsPage from '../../app/my-tickets/page';
import Image from 'next/image';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('axios');

jest.mock('next/image', () => {
  function MockImage({ src, alt }: { src: string; alt: string }) {
    return <Image src={src} alt={alt} />;
  }
  return MockImage;
});

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

const mockTickets = [
  {
    id: '1',
    eventId: 'e1',
    eventName: 'Test Event 1',
    ticketTypeId: 't1',
    ticketTypeName: 'VIP',
    ticketToken: 'token1',
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    eventId: 'e2',
    eventName: 'Test Event 2',
    ticketTypeId: 't2',
    ticketTypeName: 'Standard',
    ticketToken: 'token2',
    createdAt: '2023-01-02',
  },
];

describe('MyTicketsPage', () => {
  it('renders loading state initially', () => {
    render(<MyTicketsPage />);

    expect(screen.getByText('Fetching your tickets...')).toBeInTheDocument();

    const loadingDiv = screen
      .getByText('Fetching your tickets...')
      .closest('div');

    expect(
      loadingDiv?.querySelector('div[class*="animate-spin"]')
    ).toBeInTheDocument();
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

    mockAxios.get.mockRejectedValueOnce({
      response: { data: { message: 'Server error' } },
    });

    render(<MyTicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load tickets/i)
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no tickets', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');

    mockAxios.get.mockResolvedValueOnce({ data: [] });

    render(<MyTicketsPage />);

    await waitFor(() => {
      expect(screen.getByText('No tickets found')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /browse events/i })
      ).toBeInTheDocument();
    });
  });

  it('renders tickets grouped by event', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');

    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes('/tickets/my')) {
        return Promise.resolve({ data: mockTickets });
      }

      throw new Error('Unexpected call');
    });

    render(<MyTicketsPage />);

    await expect(screen.findByText('Test Event 1')).resolves.toBeTruthy();
    await expect(screen.findByText('Test Event 2')).resolves.toBeTruthy();
  });

  it('toggles category collapse/expand', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('token');

    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes('/tickets/my')) {
        return Promise.resolve({ data: mockTickets });
      }

      throw new Error('Unexpected call');
    });

    render(<MyTicketsPage />);

    const toggleBtn = await screen.findByRole('button', {
      name: /test event 1/i,
    });

    await userEvent.click(toggleBtn);
    await userEvent.click(toggleBtn);
  });
});