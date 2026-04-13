import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

const DelayedAllEventsPage = React.lazy(
  () =>
    new Promise<{ default: typeof import('../../app/all-events/page').default }>((resolve) =>
      setTimeout(() => resolve(import('../../app/all-events/page')), 50)
    )
);

describe('AllEventsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url === 'https://api.synk.hu/events') {
        return Promise.resolve({
          data: { items: [{ id: '1', name: 'Test Event', venueName: 'Test Venue' }] }
        });
      }
      return Promise.resolve({
        data: {
          id: '1',
          name: 'Test Event',
          venueName: 'Test Venue',
          ticketTypes: [{ price: 5000 }],
          venue: { name: 'Test Venue' },
          startTime: '2024-01-01'
        }
      });
    });
  });

  it('renders loading spinner', () => {
    const { container } = render(
      <Suspense fallback={<div className="animate-spin" />}>
        <DelayedAllEventsPage />
      </Suspense>
    );
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('renders header', async () => {
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <DelayedAllEventsPage />
        </Suspense>
      );
    });
    await waitFor(() => expect(screen.getByText('Explore Events')).toBeInTheDocument());
  });

  it('renders filters', async () => {
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <DelayedAllEventsPage />
        </Suspense>
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Artist')).toBeInTheDocument();
      expect(screen.getByText('Price Range (HUF)')).toBeInTheDocument();
      expect(screen.getByText('Capacity')).toBeInTheDocument();
    });
  });

  it('renders event cards', async () => {
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <DelayedAllEventsPage />
        </Suspense>
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  it('clicks event card navigates', async () => {
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <DelayedAllEventsPage />
        </Suspense>
      );
    });
    await waitFor(() => screen.getByText('Test Event'));
    const cardElement = screen.getByText('Test Event').closest('div[class*="group"]')!;
    fireEvent.click(cardElement);
    expect(mockPush).toHaveBeenCalledWith('/events/1');
  });

  it('shows empty state', async () => {
    mockedAxios.get.mockResolvedValue({ data: { items: [] } });
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <DelayedAllEventsPage />
        </Suspense>
      );
    });
    await waitFor(() => expect(screen.getByText(/no events/i)).toBeInTheDocument());
  });
});