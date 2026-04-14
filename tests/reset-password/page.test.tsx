import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('axios');

const mockRouterPush = jest.fn();

const renderComponent = async (token: string = 'test-token') => {
  const mockSearchParams = new URLSearchParams(`token=${token}`);
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

  const Page = (await import('../../app/reset-password/page')).default;

  render(<Page />);
};

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  const getInputs = () => {
    const newPwInput = screen.getByLabelText(/^new password$/i);
    const confirmPwInput = screen.getByLabelText(/^confirm new password$/i);
    const button = screen.getByRole('button', { name: /reset password/i });
    return { newPwInput, confirmPwInput, button };
  };

  test('renders form with inputs and button', async () => {
    await renderComponent();
    const { newPwInput, confirmPwInput, button } = getInputs();
    expect(newPwInput).toBeInTheDocument();
    expect(confirmPwInput).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(screen.getByText(/8\+ characters/i)).toBeInTheDocument();
  });

  test('types into password inputs', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput } = getInputs();
    await user.type(newPwInput, 'Test123!');
    await user.type(confirmPwInput, 'Test123!');

    expect(newPwInput).toHaveValue('Test123!');
    expect(confirmPwInput).toHaveValue('Test123!');
  });

  test('shows error for empty password on submit', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { button } = getInputs();
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows error for short password', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'short');
    await user.type(confirmPwInput, 'short');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('shows error for missing uppercase letter', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'test123!');
    await user.type(confirmPwInput, 'test123!');
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/must contain at least one uppercase letter/i)
      ).toBeInTheDocument();
    });
  });

  test('shows error for missing lowercase letter', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'TEST123!');
    await user.type(confirmPwInput, 'TEST123!');
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/must contain at least one lowercase letter/i)
      ).toBeInTheDocument();
    });
  });

  test('shows error for missing number', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'TestPass!');
    await user.type(confirmPwInput, 'TestPass!');
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/must contain at least one number/i)
      ).toBeInTheDocument();
    });
  });

  test('shows error for missing special character', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'Test123');
    await user.type(confirmPwInput, 'Test123');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/special character/i)).toBeInTheDocument();
    });
  });

  test('shows error for password mismatch', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'Test123!');
    await user.type(confirmPwInput, 'Different!');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('shows error for missing token', async () => {
    const user = userEvent.setup();
    await renderComponent('');

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'Test123!');
    await user.type(confirmPwInput, 'Test123!');
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid or missing reset token/i)
      ).toBeInTheDocument();
    });
  });

  test('successful reset shows success popup and redirects', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'ValidPass123!');
    await user.type(confirmPwInput, 'ValidPass123!');
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/password reset successfully/i)
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ok/i }));

    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });

  test('api error shows error popup', async () => {
    const user = userEvent.setup();
    (axios.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'API Error' } },
    });

    await renderComponent();

    const { newPwInput, confirmPwInput, button } = getInputs();
    await user.type(newPwInput, 'ValidPass123!');
    await user.type(confirmPwInput, 'ValidPass123!');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});