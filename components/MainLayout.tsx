"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [navbarOpen, setNavbarOpen] = useState(true);

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
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          navbarOpen ? "w-72" : "w-24"
        }`}
      >
        <Navbar
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          navbarOpen={navbarOpen}
          setNavbarOpen={setNavbarOpen}
        />
      </div>
      <main 
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          navbarOpen ? "pl-72" : "pl-24"
        }`}
      >
        <div className="min-h-screen w-full bg-radial-at-tl from-[#a78bfa]/30 via-[#5b21b6]/30 to-[#2a1b4d] bg-fixed">
          {children}
        </div>
      </main>
    </div>
  );
}
