"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { isMobile as checkIsMobile } from "../utils/isMobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hideNavbar = pathname === "/reset-password";

  useEffect(() => {
    const checkMobile = () => setIsMobile(checkIsMobile(navigator.userAgent));
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const initialize = () => {
      const isTokenSet = !!localStorage.getItem("authToken");
      setLoggedIn(isTokenSet);

      const isMobileNow = checkIsMobile(navigator.userAgent);

      if (isMobileNow) {
        setNavbarOpen(false);
      } else {
        const savedNavbarState = localStorage.getItem("navbarOpen");
        if (savedNavbarState !== null) {
          setNavbarOpen(savedNavbarState === "true");
        } else {
          setNavbarOpen(true);
        }
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    localStorage.setItem("navbarOpen", String(navbarOpen));
  }, [navbarOpen]);

  return (
    <div className="flex min-h-screen bg-[#2a1b4d] text-[#ededed]">
      {!hideNavbar && (
        <Navbar
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          navbarOpen={navbarOpen}
          setNavbarOpen={setNavbarOpen}
        />
      )}
      <main
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          hideNavbar
            ? ""
            : isMobile
            ? "pl-15"
            : navbarOpen
            ? "pl-64"
            : "pl-20"
        }`}
      >
        <div className="min-h-screen w-full bg-radial-at-tl from-[#a78bfa]/30 via-[#5b21b6]/30 to-[#2a1b4d] bg-fixed">
          {children}
        </div>
      </main>
    </div>
  );
}