"use client";

import React, { useState, useEffect } from "react";
import "./navbar.css";
import RegisterPopup from "./register";
import LoginPopup from "./login";
import TicketsPopup from "./tickets";
import { authService } from "../app/services/auth.service";
import {
  getCachedUser,
  type CurrentUser,
  clearUserCache,
} from "../app/services/user.service";

type NavbarProps = {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  navbarOpen?: boolean;
  setNavbarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({
  loggedIn,
  setLoggedIn,
  navbarOpen,
  setNavbarOpen,
}: NavbarProps) {
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState<boolean>(false);
  const [showTicketsPopup, setShowTicketsPopup] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [loginStep, setLoginStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const [internalNavbarOpen, setInternalNavbarOpen] = useState<boolean>(false);
  const isNavbarOpen = navbarOpen ?? internalNavbarOpen;
  const toggleNavbar = () => {
    if (setNavbarOpen) {
      setNavbarOpen((prev) => !prev);
    } else {
      setInternalNavbarOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      // Load cached user data only (no server calls)
      const cachedUser = getCachedUser();
      setCurrentUser(cachedUser);

      // Load admin status
      authService
        .isAdmin()
        .then(setIsAdmin)
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
      setCurrentUser(null);
    }
  }, [loggedIn]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setLoggedIn(false);
      setIsAdmin(false);
      setCurrentUser(null);
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [setLoggedIn]);

  const displayName: string = (() => {
    if (currentUser) {
      const fullName = [currentUser.firstName, currentUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName) return fullName;
      if (currentUser.email) return currentUser.email;
    }

    return "";
  })();

  const openLogin = () => {
    if (loggedIn) {
      setShowTicketsPopup(true);
      return;
    }
    setShowLoginPopup(true);
    setLoginStep("email");
    setEmail("");
    setCode("");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setLoggedIn(false);
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("https://api.synk.hu/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password: code }),
      });

      const data: { token?: string; errors?: any } = await res.json();

      if (!res.ok) {
        alert(data?.errors?.Password?.[0] || "Login failed");
        return;
      }

      localStorage.setItem("authToken", data.token!);
      setLoggedIn(true);
      setShowLoginPopup(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <nav className={`navbar ${isNavbarOpen ? "open" : "closed"}`}>
        <div className="navbar-inner">
          {/* Top: avatar + name + primary user links */}
          <div className="navbar-top">
            <div className="navbar-top-row">
              <span className="navbar-brand">Synk</span>
              <button
                className="navbar-toggle"
                onClick={toggleNavbar}
                aria-label="Toggle navigation"
              >
                {isNavbarOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      d="M6 6L18 18M6 18L18 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      d="M3 6h18M3 12h18M3 18h18"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="button"
              className="nav-icon-button"
              onClick={() => (window.location.href = "/")}
              aria-label="Home"
            >
              <span className="nav-icon">
                {/* home icon */}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 2L2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9l-10-7z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="nav-label">Home</span>
              <span className="nav-tooltip">Home</span>
            </button>

            <div className="navbar-header">
              <button
                type="button"
                className="navbar-avatar"
                onClick={() => {
                  window.location.href = "/";
                }}
                aria-label="Profile / Home"
              >
                {currentUser?.profilePictureUrl ? (
                  <img
                    src={currentUser.profilePictureUrl}
                    alt={displayName}
                    className="navbar-avatar-image"
                  />
                ) : (
                  <span className="navbar-avatar-initial">
                    {displayName?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                )}
              </button>
              <div className="navbar-header-text">
                <span className="navbar-header-name">{displayName}</span>
              </div>
            </div>

            <div className="navbar-section navbar-section-user">
              <button
                type="button"
                className="nav-icon-button"
                onClick={openLogin}
                aria-label={loggedIn ? "My Tickets" : "Log in"}
              >
                <span className="nav-icon">
                  {/* ticket / login icon */}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 7a2 2 0 0 1 2-2h12a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V7z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="nav-label">
                  {loggedIn ? "My Tickets" : "Log in"}
                </span>
                <span className="nav-tooltip">
                  {loggedIn ? "My Tickets" : "Log in"}
                </span>
              </button>

              {loggedIn && (
                <button
                  type="button"
                  className="nav-icon-button"
                  onClick={() => {
                    window.location.href = "/my-profile";
                  }}
                  aria-label="My profile"
                >
                  <span className="nav-icon">
                    {/* user icon */}
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-7 2.2-7 4.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5C19 16.2 16.4 14 12 14z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="nav-label">My Profile</span>
                  <span className="nav-tooltip">My Profile</span>
                </button>
              )}
            </div>

            {loggedIn && isAdmin && <div className="navbar-divider" />}
          </div>

          {/* Admin pages */}
          {isAdmin && (
            <div className="navbar-section navbar-section-main">
              <button
                type="button"
                className="nav-icon-button"
                onClick={() => (window.location.href = "/artists")}
                aria-label="Artists admin"
              >
                <span className="nav-icon">
                  {/* music / artist icon */}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M9 4v11.5a2.5 2.5 0 1 1-1.5-2.3V6h8V4z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="nav-label">Artists</span>
                <span className="nav-tooltip">Artists</span>
              </button>

              <button
                type="button"
                className="nav-icon-button"
                onClick={() => (window.location.href = "/venues")}
                aria-label="Venues admin"
              >
                <span className="nav-icon">
                  {/* venue / building icon */}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 20V9.5L12 4l7 5.5V20H5zm4-7h2v3H9v-3zm4 0h2v3h-2v-3z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="nav-label">Venues</span>
                <span className="nav-tooltip">Venues</span>
              </button>

              <button
                type="button"
                className="nav-icon-button"
                onClick={() => (window.location.href = "/events")}
                aria-label="Events admin"
              >
                <span className="nav-icon">
                  {/* calendar icon */}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M7 4v2m10-2v2M5 9h14M6 6h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="nav-label">Events</span>
                <span className="nav-tooltip">Events</span>
              </button>

              <button
                type="button"
                className="nav-icon-button"
                onClick={() => (window.location.href = "/all-events")}
                aria-label="All events (filters)"
              >
                <span className="nav-icon">
                  {/* list / filter icon */}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 7h16M7 12h10M10 17h4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="nav-label">All events</span>
                <span className="nav-tooltip">All events</span>
              </button>
            </div>
          )}

          {/* Bottom section */}
          <div className="navbar-section navbar-section-bottom">
            {loggedIn && (
              <button
                type="button"
                className="nav-icon-button nav-icon-button-danger"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <span className="nav-icon">
                  {/* logout icon */}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4m5-5 3-3m0 0-3-3m3 3H10"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="nav-label">Log out</span>
                <span className="nav-tooltip">Log out</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Popup */}
      <LoginPopup
        visible={showLoginPopup}
        email={email}
        code={code}
        loginStep={loginStep}
        onClose={() => setShowLoginPopup(false)}
        onEmailChange={setEmail}
        onCodeChange={setCode}
        onGetCode={() => setLoginStep("code")}
        onLogin={handleLogin}
        onLoginSuccess={(sessionData: { token: string }) => {
          setLoggedIn(true);
          localStorage.setItem("authToken", sessionData.token);
          setShowLoginPopup(false);
        }}
        onOpenRegister={() => {
          setShowLoginPopup(false);
          setShowRegisterPopup(true);
        }}
        onBackToEmail={() => setLoginStep("email")}
      />
      {/* Register Popup */}
      <RegisterPopup
        visible={showRegisterPopup}
        onClose={() => setShowRegisterPopup(false)}
        onBackToLogin={() => {
          setShowRegisterPopup(false);
          setShowLoginPopup(true);
        }}
      />

      {/* Tickets Popup */}
      <TicketsPopup
        visible={showTicketsPopup}
        onClose={() => setShowTicketsPopup(false)}
      />
    </>
  );
}
