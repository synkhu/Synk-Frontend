"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [navbarOpen, setNavbarOpen] = useState(true);

  const hideNavbar = pathname === "/reset-password";

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

  useEffect(() => {
    const initialize = () => {
      const isTokenSet = !!localStorage.getItem("authToken");
      setLoggedIn(isTokenSet);
      
      const savedNavbarState = localStorage.getItem("navbarOpen");
      if (savedNavbarState !== null) {
        setNavbarOpen(savedNavbarState === "true");
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
            ? navbarOpen
              ? "pl-15"
              : "pl-15"
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
