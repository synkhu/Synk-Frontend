import { render, waitFor } from '@testing-library/react';
import AuthInitializer from '../../components/AuthInitializer';
import { authService } from '../../app/services/auth.service';
import { getCurrentUser } from '../../app/services/user.service';

jest.mock('../../app/services/auth.service');
jest.mock('../../app/services/user.service');

describe('AuthInitializer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('does nothing if no session exists', () => {
    (authService.getSession as jest.Mock).mockReturnValue(null);

    render(<AuthInitializer />);

    expect(authService.isSessionValid).not.toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(authService.initialize).not.toHaveBeenCalled();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('logs out and dispatches event if session is invalid', () => {
    const mockDispatch = jest.spyOn(window, 'dispatchEvent');
    (authService.getSession as jest.Mock).mockReturnValue({ token: 'abc' });
    (authService.isSessionValid as jest.Mock).mockReturnValue(false);

    render(<AuthInitializer />);

    expect(authService.logout).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(CustomEvent));

    mockDispatch.mockRestore();
  });

  it('initializes and caches user if session is valid', async () => {
    (authService.getSession as jest.Mock).mockReturnValue({ token: 'abc' });
    (authService.isSessionValid as jest.Mock).mockReturnValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user1', name: 'Test' });

    render(<AuthInitializer />);

    await waitFor(() => {
      expect(authService.initialize).toHaveBeenCalled();
      expect(getCurrentUser).toHaveBeenCalled();
    });
  });

  it('handles getCurrentUser error without breaking', async () => {
    (authService.getSession as jest.Mock).mockReturnValue({ token: 'abc' });
    (authService.isSessionValid as jest.Mock).mockReturnValue(true);
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error('fail'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AuthInitializer />);

    await waitFor(() => {
      expect(authService.initialize).toHaveBeenCalled();
      expect(getCurrentUser).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to cache user data on init:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});