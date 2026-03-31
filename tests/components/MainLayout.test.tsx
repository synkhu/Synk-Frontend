import { render, screen } from "@testing-library/react";
import MainLayout from "../../components/MainLayout";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}));

describe("MainLayout", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      pathname: "/",
    });
  });

  it("renders MainLayout with Navbar and children", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const loginButtons = screen.getAllByRole("button", { name: /log in/i });
    expect(loginButtons.length).toBeGreaterThan(0);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});