import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyProfilePage from '../../app/my-profile/page';
import * as userService from '../../app/services/user.service';
import axios from 'axios';

jest.mock('../../app/services/auth.service', () => ({
  authService: {
    isSessionValid: jest.fn(),
    getToken: jest.fn(),
    sendVerificationEmail: jest.fn(),
  },
}));

const { authService: mockAuthService } = require('../../app/services/auth.service');

jest.mock('../../app/services/user.service', () => ({
  getCurrentUser: jest.fn(),
  updateUserProfile: jest.fn(),
  changePassword: jest.fn(),
  uploadProfilePicture: jest.fn(),
  clearUserCache: jest.fn(),
}));

jest.mock('axios');

const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  emailVerified: true,
  profilePictureUrl: 'https://example.com/avatar.jpg',
  role: 'user',
};

const mockUnverifiedUser = {
  ...mockUser,
  emailVerified: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MyProfilePage', () => {
  it('renders loading state initially', async () => {
    let resolvePromise: (value: typeof mockUser) => void;
    const promise = new Promise<typeof mockUser>((res) => { resolvePromise = res; });
    (userService.getCurrentUser as jest.Mock).mockReturnValue(promise);

    render(<MyProfilePage />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();

    await act(async () => { resolvePromise!(mockUser); });
  });

  it('renders error state when getCurrentUser fails', async () => {
    (userService.getCurrentUser as jest.Mock).mockRejectedValue({ response: { data: { message: 'Auth error' } } });
    render(<MyProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('Auth error')).toBeInTheDocument();
    });
  });

  it('renders profile with verified user data', async () => {
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    render(<MyProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });
  });

  it('renders unverified user with badge and verification button', async () => {
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUnverifiedUser);
    render(<MyProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Unverified')).toBeInTheDocument();
      expect(screen.getByText('Verify your email')).toBeInTheDocument();
      expect(screen.getByText('Send Verification Email')).toBeInTheDocument();
    });
  });

  it('handles name edit flow', async () => {
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (userService.updateUserProfile as jest.Mock).mockResolvedValue({
      ...mockUser,
      firstName: 'Jane',
      lastName: 'Smith',
    });

    render(<MyProfilePage />);
    await waitFor(() => screen.getByText('Personal Information'));

    fireEvent.click(screen.getByText('Edit'));

    const firstNameInput = screen.getByDisplayValue('John') as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue('Doe') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(userService.updateUserProfile).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
      });
      expect(screen.getByText('Success! Name updated.')).toBeInTheDocument();
    });
  });

  it('handles password change success', async () => {
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (userService.changePassword as jest.Mock).mockResolvedValue(undefined);

    render(<MyProfilePage />);
    await waitFor(() => screen.getByText('Security & Password'));

    const oldPasswordInput = screen.getByPlaceholderText('••••••••');
    const newPasswordInput = screen.getByPlaceholderText('Minimum 8 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Repeat new password');

    await act(async () => {
      fireEvent.change(oldPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });
    });

    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(userService.changePassword).toHaveBeenCalledWith('oldpass', 'newpass123');
      expect(screen.getByText('Password updated successfully.')).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    render(<MyProfilePage />);
    await waitFor(() => screen.getByText('Security & Password'));

    const oldPasswordInput = screen.getByPlaceholderText('••••••••');
    const newPasswordInput = screen.getByPlaceholderText('Minimum 8 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Repeat new password');

    await act(async () => {
      fireEvent.change(oldPasswordInput, { target: { value: 'oldpass' } });
      fireEvent.change(newPasswordInput, { target: { value: 'pass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    });
  });

  it('handles send verification email', async () => {
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUnverifiedUser);
    (mockAuthService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

    render(<MyProfilePage />);

    await waitFor(() => screen.getByText('Send Verification Email'));
    fireEvent.click(screen.getByText('Send Verification Email'));

    await waitFor(() => {
      expect(mockAuthService.sendVerificationEmail).toHaveBeenCalled();
      expect(screen.getByText('Success! Verification email sent.')).toBeInTheDocument();
    });
  });

  it('handles email verification from URL token', async () => {
    const originalLocation = window.location;
    const replaceStateMock = jest.fn();
    Object.defineProperty(window, 'history', { value: { replaceState: replaceStateMock } });

    const originalGet = URLSearchParams.prototype.get;
    URLSearchParams.prototype.get = function(key) {
      if (key === 'verification-token') {
        return 'testtoken';
      }
      return originalGet.call(this, key);
    };

    (mockAuthService.isSessionValid as jest.Mock).mockReturnValue(true);
    (mockAuthService.getToken as jest.Mock).mockReturnValue('mocktoken');
    (axios.post as jest.Mock).mockResolvedValue({ data: 'success' });
    (userService.clearUserCache as jest.Mock).mockResolvedValue(undefined);
    (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUnverifiedUser);

    render(<MyProfilePage />);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.synk.hu/auth/verify-email',
        { token: 'testtoken' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mocktoken',
          }),
        }),
      );
      expect(userService.clearUserCache).toHaveBeenCalled();
    });

    (window.location as any) = originalLocation;
  });
});