import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import VenueDetailsPage from '../../../app/venues/[id]/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VenueDetailsPage', () => {
  const mockVenueId = '123';
  const mockParams = Promise.resolve({ id: mockVenueId });

  const mockVenueDetails = {
    id: mockVenueId,
    name: 'Test Venue',
    address: '123 Test St',
    city: 'Test City',
    description: 'Test venue description',
    capacity: 5000,
    isAdultOnly: true,
    images: [
      { imageUrl: 'https://example.com/image1.jpg' },
      { imageUrl: 'https://example.com/image2.jpg' },
    ],
  };

  const mockEvents = [
    {
      id: 'event1',
      name: 'Test Event 1',
      artistName: 'Test Artist',
      startTime: '2024-01-01T20:00:00Z',
      thumbnailUrl: 'https://example.com/event1.jpg',
    },
    {
      id: 'event2',
      name: 'Test Event 2',
      startTime: '2024-01-02T20:00:00Z',
      thumbnailUrl: 'https://example.com/event2.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner and then venue details', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: mockVenueDetails }).mockResolvedValueOnce({ data: mockEvents });

  render(<VenueDetailsPage params={mockParams} />);
  
  expect(document.querySelector('.animate-spin')).toBeInTheDocument();

  expect(await screen.findByText('Test Venue')).toBeInTheDocument();
});

  it('shows error state when fetch fails', async () => {
    const errorMessage = 'Failed to load venue details';
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /error/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back home/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows venue error when no venue details', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByRole('heading', { name: /error/i })).toBeInTheDocument();
  });

  it('renders venue details correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockVenueDetails }).mockResolvedValueOnce({ data: mockEvents });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByText('Test Venue')).toBeInTheDocument();
    expect(await screen.findByText('Test venue description')).toBeInTheDocument();
    expect(await screen.findByText('18+ Only')).toBeInTheDocument();
    expect(await screen.findByText('Venue')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Events at this Venue' })).toBeInTheDocument();
  });

  it('renders venue initial when no images', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { ...mockVenueDetails, images: [] } }).mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByText('T')).toBeInTheDocument();
  });

  it('handles image carousel dots', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockVenueDetails }).mockResolvedValueOnce({ data: mockEvents });

    const { container } = await act(async () => render(<VenueDetailsPage params={mockParams} />));

    expect(await screen.findByRole('img', { name: /Test Venue/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelectorAll('button.h-1\\.5.rounded-full').length).toBeGreaterThan(0);
    });
  });

  it('renders multiple events', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockVenueDetails }).mockResolvedValueOnce({ data: mockEvents });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByText('Test Event 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Event 2')).toBeInTheDocument();
  });

  it('renders single event correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockVenueDetails }).mockResolvedValueOnce({ data: [mockEvents[0]] });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByText('Test Event 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Artist')).toBeInTheDocument();
  });

  it('shows empty events state', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockVenueDetails }).mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    expect(await screen.findByText('No events currently scheduled at this venue.')).toBeInTheDocument();
  });

  it('renders without adult only badge when false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { ...mockVenueDetails, isAdultOnly: false } }).mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<VenueDetailsPage params={mockParams} />);
    });

    await waitFor(() => {
      expect(screen.queryByText('18+ Only')).not.toBeInTheDocument();
    });
  });
});