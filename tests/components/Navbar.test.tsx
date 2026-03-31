import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}));

describe("Navbar", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it("renders without crashing", () => {
    render(<Navbar loggedIn={false} setLoggedIn={jest.fn()} />);
    expect(screen.getByAltText(/synk logo/i)).toBeInTheDocument();
  });

  it("shows login button when not logged in", () => {
    render(<Navbar loggedIn={false} setLoggedIn={jest.fn()} />);
    const loginButtons = screen.getAllByText(/log in/i);
    expect(loginButtons[0]).toBeInTheDocument();
    expect(screen.getByText(/guest/i)).toBeInTheDocument();
  });

  it("does not show user info when not logged in", () => {
    render(<Navbar loggedIn={false} setLoggedIn={jest.fn()} />);
    expect(screen.queryByText(/member/i)).not.toBeInTheDocument();
  });

  it("shows user info when logged in", () => {
    render(<Navbar loggedIn={true} setLoggedIn={jest.fn()} />);
    
    const toggleButton = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText(/guest/i)).toBeInTheDocument();
    expect(screen.getByText(/member/i)).toBeInTheDocument();
  });
});