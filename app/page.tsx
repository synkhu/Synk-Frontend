"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Carousel from "../components/carousel";
import UpcomingEvents from "../components/UpcomingEvents";
import "./page.css";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [navbarOpen, setNavbarOpen] = useState(true);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
    setLoading(false);
  }, []);

  if (loading) return <div>Betöltés...</div>;

  return (
    <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
      <div className="nav">
        <Navbar
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          navbarOpen={navbarOpen}
          setNavbarOpen={setNavbarOpen}
        />
      </div>
      <div className="content-column">
        <div
          className="min-h-screen w-full py-8"
          style={{
            background:
              "radial-gradient(circle at 0 0, #53306f 0%, #2c1846 32%, #120626 80%)",
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="carousel-container">
              <Carousel />
            </div>
            <div className="upcoming-events">
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}