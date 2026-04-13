import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../components/Register';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../app/services/user.service', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
}));

jest.mock('../../app/services/auth.service', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ token: 'fake-token' }),
  },
}));

describe('Register Component', () => {
  const onClose = jest.fn();
  const onBackToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<Register visible={true} onClose={onClose} onBackToLogin={onBackToLogin} />);
    
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/First/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minimum 8 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join SYNK/i })).toBeInTheDocument();
  });

  test('calls onBackToLogin when "Sign in" is clicked', () => {
    render(<Register visible={true} onClose={onClose} onBackToLogin={onBackToLogin} />);
    fireEvent.click(screen.getByText(/Sign in/i));
    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });

  test('displays error message on failed registration', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          errors: { email: ['Email already taken'] },
        },
      },
    });

    render(<Register visible={true} onClose={onClose} onBackToLogin={onBackToLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/First/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Minimum 8 characters/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Join SYNK/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email already taken/i)).toBeInTheDocument();
    });
  });

  test('submits form successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    render(<Register visible={true} onClose={onClose} onBackToLogin={onBackToLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/First/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Minimum 8 characters/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Join SYNK/i }));

    await waitFor(() => {
      expect(screen.getByText(/Welcome to the family!/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('closes modal when Escape is pressed', () => {
    render(<Register visible={true} onClose={onClose} onBackToLogin={onBackToLogin} />);
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});