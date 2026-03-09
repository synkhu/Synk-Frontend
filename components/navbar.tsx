"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import RegisterPopup from "./register";
import LoginPopup from "./login";
import {
  getCurrentUser,
  getCachedUser,
  type CurrentUser,
} from "../app/services/user.service";

type NavbarProps = {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  navbarOpen?: boolean;
  setNavbarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

const NavItem = ({
  icon,
  label,
  onClick,
  danger = false,
  active = false,
  isNavbarOpen,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  isNavbarOpen: boolean;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center w-full h-12 rounded-2xl transition-all duration-300 ${
      isNavbarOpen ? "px-3" : "justify-center px-0"
    } ${
      danger
        ? "hover:bg-red-500/10 text-red-400 hover:text-red-300"
        : active
          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_20px_rgba(124,58,237,0.1)]"
          : "hover:bg-white/5 text-gray-400 hover:text-white border border-transparent"
    }`}
  >
    <div className="flex items-center justify-center w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
      {icon}
    </div>
    <div
      className={`font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isNavbarOpen
          ? "opacity-100 translate-x-0 w-32 ml-3"
          : "opacity-0 -translate-x-4 w-0 pointer-events-none ml-0"
      }`}
    >
      {label}
    </div>
    {!isNavbarOpen && (
      <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-x-2 group-hover:translate-x-0">
        {label}
      </div>
    )}
  </button>
);

export default function Navbar({
  loggedIn,
  setLoggedIn,
  navbarOpen,
  setNavbarOpen,
}: NavbarProps) {
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [loginStep, setLoginStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const pathname = usePathname();
  const router = useRouter();

  const isNavbarOpen = navbarOpen ?? true;
  const toggleNavbar = () => {
    if (setNavbarOpen) {
      setNavbarOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const applyUser = (user: CurrentUser | null) => {
      if (isMounted) setCurrentUser(user);
    };

    const fetchUser = async () => {
      if (loggedIn) {
        try {
          // If we already have cached user data, populate it after mount.
          // Scheduled to avoid sync setState directly inside the effect body.
          queueMicrotask(() => applyUser(getCachedUser()));
          const user = await getCurrentUser();
          applyUser(user);
        } catch {
          applyUser(null);
        }
      } else {
        queueMicrotask(() => applyUser(null));
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [loggedIn]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setLoggedIn(false);
      setCurrentUser(null);
    };
    window.addEventListener("session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session-expired", handleSessionExpired);
  }, [setLoggedIn]);

  const displayName = currentUser
    ? [currentUser.firstName, currentUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || currentUser.email
    : "";

  const openLogin = () => {
    if (loggedIn) {
      router.push("/my-tickets");
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
      const data = await res.json();
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
      <nav
        className={`h-[calc(100vh-1.5rem)] m-3 flex flex-col items-stretch bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden`}
      >
        <div className="flex flex-col h-full p-4 space-y-8">
          {/* Header */}
          <div
            className={`flex items-center px-2 h-10 transition-all duration-500 ${
              isNavbarOpen ? "justify-between" : "justify-center"
            }`}
          >
            <span
              className={`text-2xl font-black italic tracking-tighter text-white transition-all duration-500 ${
                isNavbarOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50 pointer-events-none w-0"
              }`}
            >
              SYNK
            </span>
            <button
              onClick={toggleNavbar}
              className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 hover:shadow-lg`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              >
                {isNavbarOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex flex-col">
            <div
              className={`flex items-center w-full p-2 rounded-[2rem] bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all duration-300 group ${
                isNavbarOpen
                  ? "px-2"
                  : "px-0 justify-center border-transparent bg-transparent"
              }`}
              onClick={() =>
                loggedIn ? router.push("/my-profile") : openLogin()
              }
            >
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-black shrink-0 shadow-xl border-2 border-white/20 overflow-hidden transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                {currentUser?.profilePictureUrl ? (
                  <Image
                    src={currentUser.profilePictureUrl}
                    alt={displayName || "User"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  displayName?.charAt(0)?.toUpperCase() || "S"
                )}
              </div>
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
                  isNavbarOpen
                    ? "ml-3 opacity-100 translate-x-0 w-32"
                    : "ml-0 opacity-0 -translate-x-4 w-0"
                }`}
              >
                <p className="text-sm font-bold text-white truncate">
                  {displayName || "Guest"}
                </p>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest truncate">
                  {!loggedIn ? "Join us" : currentUser?.role || "Member"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem
              label="Home"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
              onClick={() => router.push("/")}
              active={pathname === "/"}
              isNavbarOpen={isNavbarOpen}
            />

            <NavItem
              label="All Events"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              }
              onClick={() => router.push("/all-events")}
              active={pathname === "/all-events"}
              isNavbarOpen={isNavbarOpen}
            />

            <NavItem
              label={loggedIn ? "My Tickets" : "Log in"}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
                  <path d="M16 5V3a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2" />
                </svg>
              }
              onClick={openLogin}
              active={pathname === "/my-tickets"}
              isNavbarOpen={isNavbarOpen}
            />

            {loggedIn && (
              <NavItem
                label="My Profile"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
                onClick={() => router.push("/my-profile")}
                active={pathname === "/my-profile"}
                isNavbarOpen={isNavbarOpen}
              />
            )}

            {loggedIn &&
              (currentUser?.role === "Administrator" ||
                currentUser?.role === "Organizer") && (
                <div className="pt-6 mt-4 space-y-2 border-t border-white/5">
                  <p
                    className={`px-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all duration-500 ${
                      isNavbarOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 h-0 overflow-hidden"
                    }`}
                  >
                    Admin
                  </p>
                  <NavItem
                    label="Artists"
                    icon={
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    }
                    onClick={() => router.push("/artists")}
                    active={pathname?.startsWith("/artists")}
                    isNavbarOpen={isNavbarOpen}
                  />
                  <NavItem
                    label="Venues"
                    icon={
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    }
                    onClick={() => router.push("/venues")}
                    active={pathname?.startsWith("/venues")}
                    isNavbarOpen={isNavbarOpen}
                  />
                  <NavItem
                    label="Events"
                    icon={
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    }
                    onClick={() => router.push("/events")}
                    active={pathname === "/events"}
                    isNavbarOpen={isNavbarOpen}
                  />
                </div>
              )}
          </div>

          {/* Bottom Actions */}
          {loggedIn && (
            <div className="pt-4 border-t border-white/5">
              <NavItem
                label="Log out"
                danger
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                }
                onClick={handleLogout}
                isNavbarOpen={isNavbarOpen}
              />
            </div>
          )}
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
    </>
  );
}
