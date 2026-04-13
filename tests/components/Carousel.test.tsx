import { render, screen, fireEvent, act } from '@testing-library/react';
import Carousel from '../../components/Carousel';
import axios from 'axios';
import { useRouter } from 'next/navigation';

jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();

describe('Carousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  it('renders loading state initially', () => {
    (axios.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<Carousel />);
    expect(screen.getByText(/Loading events/i)).toBeInTheDocument();
  });

  it('renders "No large events available" if API returns empty', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: [] } });
    await act(async () => render(<Carousel />));

    expect(screen.getByText(/No large events available/i)).toBeInTheDocument();
  });

  it('renders slides correctly when events exist', async () => {
    const events = [
      { id: '1', name: 'Event 1', thumbnailUrl: 'thumb1.jpg' },
      { id: '2', name: 'Event 2', thumbnailUrl: 'thumb2.jpg' },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: events } });

    await act(async () => render(<Carousel />));

    expect(screen.getByText(/Event 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Event 2/i)).toBeInTheDocument();

    const dots = screen.getAllByRole('button', { name: /Go to slide/i });
    expect(dots.length).toBe(events.length);
  });

  it('calls router.push when slide clicked', async () => {
    const events = [{ id: '1', name: 'Event 1', thumbnailUrl: 'thumb1.jpg' }];
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: events } });

    await act(async () => render(<Carousel />));

    const slideButton = screen.getByRole('heading', { name: /Event 1/i }).closest('button');

    expect(slideButton).not.toBeNull();
    fireEvent.click(slideButton!);

    expect(mockRouterPush).toHaveBeenCalledWith('/events/1');
  });

  it('calls goToSlide when pagination dot clicked', async () => {
    const events = [
      { id: '1', name: 'Event 1', thumbnailUrl: 'thumb1.jpg' },
      { id: '2', name: 'Event 2', thumbnailUrl: 'thumb2.jpg' },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: events } });

    await act(async () => render(<Carousel />));

    const secondDot = screen.getByRole('button', { name: /Go to slide 2/i });
    fireEvent.click(secondDot);

    const slideButton = screen.getByRole('heading', { name: /Event 2/i }).closest('button');
    expect(slideButton).toBeInTheDocument();
  });

  it('logs error if API fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('API failure');
    (axios.get as jest.Mock).mockRejectedValue(error);

    await act(async () => render(<Carousel />));

    expect(screen.getByText(/No large events available/i)).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load events:', error);

    consoleErrorSpy.mockRestore();
  });
});