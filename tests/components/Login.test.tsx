import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

(mockedAxios.create as jest.Mock).mockImplementation(() => ({
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

import LoginPopup from "../../components/Login";

const defaultProps = {
  visible: true,
  email: "",
  code: "",
  loginStep: "email" as const,
  onClose: jest.fn(),
  onEmailChange: jest.fn(),
  onCodeChange: jest.fn(),
  onGetCode: jest.fn(),
  onLogin: jest.fn(),
  onLoginSuccess: jest.fn(),
  onOpenRegister: jest.fn(),
  onBackToEmail: jest.fn(),
};

describe("LoginPopup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<LoginPopup {...defaultProps} />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("calls onEmailChange when email input changes", () => {
    render(<LoginPopup {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(defaultProps.onEmailChange).toHaveBeenCalledWith("test@example.com");
  });

  it("calls handleForgotPassword and shows error when API fails", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: "Failed to send reset email" } },
    });

    render(<LoginPopup {...defaultProps} email="test@example.com" />);
    const forgotButton = screen.getByText(/Forgot password\?/i);
    fireEvent.click(forgotButton);

    await waitFor(() =>
      expect(screen.getByText(/Failed to send reset email/i)).toBeInTheDocument()
    );
  });

  it("calls onOpenRegister when 'Create an account' is clicked", () => {
    render(<LoginPopup {...defaultProps} />);
    const registerButton = screen.getByText(/Create an account/i);
    fireEvent.click(registerButton);
    expect(defaultProps.onOpenRegister).toHaveBeenCalled();
  });
});