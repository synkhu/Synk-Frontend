import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VenueList from '../../app/venues/venuelist';

jest.mock('../../app/services/venue.service', () => ({
  updateVenue: jest.fn(),
  deleteVenue: jest.fn(),
  addVenueImages: jest.fn(),
}));

jest.mock('../../app/services/file.service', () => ({
  uploadFile: jest.fn(),
}));

jest.mock('../../components/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, title, onClose, children }: any) =>
    isOpen ? (
      <>
        <h3>{title}</h3>
        <button onClick={onClose}>Close</button>
        <div>{children}</div>
      </>
    ) : null,
}));

const { updateVenue: mockUpdateVenue, deleteVenue: mockDeleteVenue, addVenueImages: mockAddVenueImages } = require('../../app/services/venue.service');
const { uploadFile: mockUploadFile } = require('../../app/services/file.service');

interface Venue {
  id: number;
  name: string;
  city: string;
  address: string;
  country: string;
  capacity: number;
  description: string;
}

const mockVenues: Venue[] = [
  { id: 1, name: 'Test Venue 1', city: 'Test City', address: '123 Test Street', country: 'Test Country', capacity: 1000, description: 'Test venue description' },
  { id: 2, name: 'Test Venue 2', city: 'Another City', address: '456 Another St', country: 'Another Country', capacity: 500, description: 'Another venue description' },
];

const mockOnUpdate = jest.fn();

describe('VenueList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateVenue.mockResolvedValue(mockVenues);
    mockDeleteVenue.mockResolvedValue(mockVenues.slice(1));
    mockUploadFile.mockResolvedValue('https://example.com/image.jpg');
    mockAddVenueImages.mockResolvedValue(undefined);
  });

  it('renders empty state when no venues', () => {
    render(<VenueList venues={[]} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('No venues found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first venue.')).toBeInTheDocument();
    expect(screen.getByText(/📍/)).toBeInTheDocument();
  });

  it('renders venue cards with correct content', () => {
    render(<VenueList venues={mockVenues} onUpdate={mockOnUpdate} />);

    expect(screen.getByRole('heading', { name: 'Test Venue 1' })).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return element?.textContent === '📍 Test City, Test Country';
      })
    ).toBeInTheDocument();

    expect(screen.getByText((content, element) => element?.textContent === '🏠123 Test Street')).toBeInTheDocument();
    expect(screen.getByText((content, element) => element?.textContent === '👥Capacity: 1000')).toBeInTheDocument();
    expect(screen.getByText('Test venue description')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Test Venue 2' })).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return element?.textContent === '📍 Another City, Another Country';
      })
    ).toBeInTheDocument();
    expect(screen.getByText((content, element) => element?.textContent === '👥Capacity: 500')).toBeInTheDocument();
    expect(screen.getByText('Another venue description')).toBeInTheDocument();
  });

  it('opens edit modal and pre-fills form', async () => {
    render(<VenueList venues={mockVenues} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getAllByTitle('Edit')[0]);

    await waitFor(() => expect(screen.getByText('Edit Venue')).toBeInTheDocument());

    expect(screen.getByDisplayValue('Test Venue 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Test Street')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Country')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test venue description')).toBeInTheDocument();
  });

  it('saves edited venue and calls onUpdate', async () => {
    render(<VenueList venues={mockVenues} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getAllByTitle('Edit')[0]);

    await waitFor(() => screen.getByText('Edit Venue'));

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Updated Venue' } });
    fireEvent.change(screen.getByPlaceholderText('Capacity'), { target: { value: '1500' } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateVenue).toHaveBeenCalledWith(1, {
        name: 'Updated Venue',
        city: 'Test City',
        address: '123 Test Street',
        country: 'Test Country',
        capacity: 1500,
        description: 'Test venue description',
      });
      expect(mockOnUpdate).toHaveBeenCalledWith(mockVenues);
    });
  });

  it('deletes venue when delete clicked', async () => {
    render(<VenueList venues={mockVenues} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getAllByTitle('Delete')[0]);

    await waitFor(() => {
      expect(mockDeleteVenue).toHaveBeenCalledWith(1);
      expect(mockOnUpdate).toHaveBeenCalledWith(mockVenues.slice(1));
    });
  });

  it('closes modal when close clicked', async () => {
    render(<VenueList venues={mockVenues} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getAllByTitle('Edit')[0]);
    await waitFor(() => screen.getByText('Edit Venue'));

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => expect(screen.queryByText('Edit Venue')).not.toBeInTheDocument());
  });

  it('alerts when name is empty on save', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(jest.fn());

    render(<VenueList venues={mockVenues} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getAllByTitle('Edit')[0]);
    await waitFor(() => screen.getByText('Edit Venue'));

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Venue name cannot be empty'));

    alertSpy.mockRestore();
  });
});