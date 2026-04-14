import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import VenuesPage from '../../app/venues/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../../app/services/venue.service', () => ({
  getVenues: jest.fn(),
}));
jest.mock('../../app/services/auth.service', () => ({
  authService: {
    canAccessAdminPages: jest.fn(),
    isSessionValid: jest.fn(),
    getSession: jest.fn(),
  },
}));

jest.mock('../../app/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    loading: false,
    user: null,
  })),
}));

jest.mock('../../components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-content">{children}</div>
  ),
}));
jest.mock('../../components/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div>{children}</div> : null),
}));
jest.mock('../../app/venues/venueform', () => ({
  __esModule: true,
  default: jest.fn(() => <div>VenueForm</div>),
}));
jest.mock('../../app/venues/venuelist', () => ({
  __esModule: true,
  default: jest.fn(() => <div>VenueList</div>),
}));

import * as authServiceModule from '../../app/services/auth.service';
import * as venueServiceModule from '../../app/services/venue.service';
import VenueForm from '../../app/venues/venueform';

const authService = authServiceModule.authService as jest.Mocked<
  typeof authServiceModule.authService
>;

const getVenues = venueServiceModule.getVenues as jest.Mock;
const MockVenueForm = VenueForm as jest.Mock;

const mockVenues = [
  {
    id: 1,
    name: 'Test Venue',
    city: 'Test City',
    address: '123 Test St',
    country: 'Test Country',
    capacity: 1000,
    description: 'Test desc',
  },
];

describe('VenuesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.isSessionValid.mockReturnValue(true);

    authService.getSession.mockReturnValue({
      user: null,
      token: 'mock-token',
      expiresAt: new Date(Date.now() + 1000000).toISOString(),
    });
  });

  it('renders loading spinner while checking auth', () => {
    render(<VenuesPage />);
    expect(screen.queryByText('Venues')).not.toBeInTheDocument();
  });

  it('redirects to / if not authorized', async () => {
    authService.canAccessAdminPages.mockResolvedValueOnce(false);
    render(<VenuesPage />);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/')
    );
  });

  it('renders main content when authorized with empty venues', async () => {
    authService.canAccessAdminPages.mockResolvedValueOnce(true);
    getVenues.mockResolvedValueOnce([]);

    render(<VenuesPage />);
    const wrapper = await screen.findByTestId('protected-content');

    expect(
      within(wrapper).getByRole('heading', { name: /venues/i })
    ).toBeInTheDocument();

    expect(
      within(wrapper).getByRole('button', { name: /new/i })
    ).toBeInTheDocument();

    expect(within(wrapper).getByText('VenueList')).toBeInTheDocument();
  });

  it('opens modal when New button clicked', async () => {
    authService.canAccessAdminPages.mockResolvedValueOnce(true);
    getVenues.mockResolvedValueOnce(mockVenues);

    render(<VenuesPage />);
    const wrapper = await screen.findByTestId('protected-content');

    const newButton = within(wrapper).getByRole('button', {
      name: /new/i,
    });

    fireEvent.click(newButton);

    await waitFor(() =>
      expect(screen.getByText('VenueForm')).toBeInTheDocument()
    );
  });

  it('handles VenueForm success by updating venues', async () => {
    const updatedVenues = [
      ...mockVenues,
      {
        id: 2,
        name: 'New Venue',
        city: 'New City',
        address: 'New St',
        country: 'New Country',
        capacity: 2000,
        description: 'New',
      },
    ];

    authService.canAccessAdminPages.mockResolvedValueOnce(true);
    getVenues
      .mockResolvedValueOnce(mockVenues)
      .mockResolvedValueOnce(updatedVenues);

    MockVenueForm.mockImplementation(
      ({
        onSuccess,
      }: {
        onSuccess: (venues: typeof updatedVenues) => void;
      }) => {
        setTimeout(() => onSuccess(updatedVenues), 50);
        return <div>VenueForm</div>;
      }
    );

    render(<VenuesPage />);
    const wrapper = await screen.findByTestId('protected-content');

    const newButton = within(wrapper).getByRole('button', {
      name: /new/i,
    });

    fireEvent.click(newButton);

    await waitFor(() =>
      expect(screen.getByText('VenueForm')).toBeInTheDocument()
    );

    expect(getVenues).toHaveBeenCalledTimes(1);
  });
});