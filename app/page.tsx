"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Carousel from "../components/carousel";
import "./page.css";

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

      {loggedIn && (
        <div className="login-status">Be vagy jelentkezve</div>
      )}

      <div className="carousel-container flex">
        <Carousel />
      </div>
    </div>
  );
}