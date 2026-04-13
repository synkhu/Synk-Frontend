import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../../components/ProtectedRoute";
import * as useAuthHook from "../../app/hooks/useAuth";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("ProtectedRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading spinner when auth is loading", () => {
    jest.spyOn(useAuthHook, "useAuth").mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      getToken: jest.fn(),
      checkAuth: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });

  test("redirects when user is not authenticated", () => {
    jest.spyOn(useAuthHook, "useAuth").mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      getToken: jest.fn(),
      checkAuth: jest.fn(),
    });

    render(
      <ProtectedRoute redirectTo="/login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  test("renders children when user is authenticated", () => {
    jest.spyOn(useAuthHook, "useAuth").mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: "123", name: "Test User" },
      login: jest.fn(),
      logout: jest.fn(),
      getToken: jest.fn(),
      checkAuth: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});