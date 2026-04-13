import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VenueForm from '@/venues/venueform';
import * as venueService from '../../app/services/venue.service';
import * as fileService from '../../app/services/file.service';

jest.mock('../../app/services/venue.service');
jest.mock('../../app/services/file.service');

const mockCreateVenue = venueService.createVenue as jest.Mock;
const mockUploadFile = fileService.uploadFile as jest.Mock;
const mockOnSuccess = jest.fn();

const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
const mockVenues = [{
  id: 1,
  name: 'Test Venue',
  city: 'Test City',
  address: 'Test Address',
  country: 'Test Country',
  capacity: 100,
  description: 'Test'
}];

describe('VenueForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateVenue.mockResolvedValue(mockVenues);
    mockUploadFile.mockResolvedValue('https://mock.url/image.jpg');
  });

  it('renders form inputs correctly', () => {
    render(<VenueForm onSuccess={mockOnSuccess} />);

    expect(screen.getByPlaceholderText('Venue Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Capacity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Venue/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Venue Images/i)).toBeInTheDocument();
  });

  it('updates input values on change', async () => {
    const user = userEvent.setup();
    render(<VenueForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByPlaceholderText('Venue Name');
    await user.type(nameInput, 'Test Venue');
    expect(nameInput).toHaveValue('Test Venue');

    const cityInput = screen.getByPlaceholderText('City');
    await user.type(cityInput, 'Test City');
    expect(cityInput).toHaveValue('Test City');

    const addressInput = screen.getByPlaceholderText('Address');
    await user.type(addressInput, '123 Test St');
    expect(addressInput).toHaveValue('123 Test St');

    const countryInput = screen.getByPlaceholderText('Country');
    await user.type(countryInput, 'Test Country');
    expect(countryInput).toHaveValue('Test Country');

    const capacityInput = screen.getByPlaceholderText('Capacity');
    await user.type(capacityInput, '100');
    expect(capacityInput).toHaveValue(100);

    const descInput = screen.getByPlaceholderText('Description');
    await user.type(descInput, 'Test Description');
    expect(descInput).toHaveValue('Test Description');
  });

  it('handles file selection', async () => {
    const user = userEvent.setup();
    render(<VenueForm onSuccess={mockOnSuccess} />);

    const fileInput = screen.getByLabelText(/Venue Images/i) as HTMLInputElement;
    await user.upload(fileInput, mockFile);

    expect(fileInput.files![0]).toStrictEqual(mockFile);
    expect(screen.getByText(/✓ 1 image\(s\) selected/)).toBeInTheDocument();
  });

  it('submits form successfully with images and resets form', async () => {
    const user = userEvent.setup();
    render(<VenueForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByPlaceholderText('Venue Name'), 'Test Venue');
    await user.type(screen.getByPlaceholderText('City'), 'Test City');
    await user.type(screen.getByPlaceholderText('Address'), '123 Test St');
    await user.type(screen.getByPlaceholderText('Country'), 'Test Country');
    await user.type(screen.getByPlaceholderText('Capacity'), '100');
    await user.type(screen.getByPlaceholderText('Description'), 'Test Desc');

    const fileInput = screen.getByLabelText(/Venue Images/i);
    await user.upload(fileInput, mockFile);

    await user.click(screen.getByRole('button', { name: /Add Venue/i }));

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledWith(mockFile);
      expect(mockCreateVenue).toHaveBeenCalledWith(
        '123 Test St',
        100,
        'Test City',
        'Test Country',
        'Test Desc',
        false,
        'Test Venue',
        ['https://mock.url/image.jpg']
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockVenues);
    });

    expect(screen.getByPlaceholderText('Venue Name')).toHaveValue('');
    expect(screen.getByPlaceholderText('City')).toHaveValue('');
    expect(screen.getByPlaceholderText('Address')).toHaveValue('');
    expect(screen.getByPlaceholderText('Country')).toHaveValue('');
    expect(screen.getByPlaceholderText('Capacity')).toHaveValue(0);
    expect(screen.getByPlaceholderText('Description')).toHaveValue('');

    const resetFileInput = screen.getByLabelText(/Venue Images/i) as HTMLInputElement;
    resetFileInput.value = '';
    expect(resetFileInput.files?.length).toBe(0);
  });

  it('submits form successfully without images', async () => {
    const user = userEvent.setup();
    render(<VenueForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByPlaceholderText('Venue Name'), 'Test Venue');
    await user.type(screen.getByPlaceholderText('City'), 'Test City');

    await user.click(screen.getByRole('button', { name: /Add Venue/i }));

    await waitFor(() => {
      expect(mockUploadFile).not.toHaveBeenCalled();
      expect(mockCreateVenue).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        false,
        'Test Venue',
        undefined
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockCreateVenue.mockRejectedValueOnce(new Error('API Error'));

    render(<VenueForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByPlaceholderText('Venue Name'), 'Test');
    await user.click(screen.getByRole('button', { name: /Add Venue/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create venue:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});