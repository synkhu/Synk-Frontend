"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Carousel from "../components/carousel";
import "./page.css";
import UpcomingEvents from "../components/UpcomingEvents";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
    setLoading(false);
  }, []);

  if (loading) return <div>Betöltés...</div>;

  return (
    <div className="main flex">
      <div className="nav">
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      </div>
      <div className="content-column" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div className="carousel-container">
          <Carousel />
        </div>
        <div className="upcoming-events" style={{ marginTop: "1rem" }}>
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}