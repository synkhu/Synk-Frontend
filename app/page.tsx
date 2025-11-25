"use client";

import Navbar from "../components/navbar";
import Carousel from "../components/carousel";

export default function Home() {
  return (
    <div className="main">

      <div className="nav">
        <Navbar />
      </div>

      <div className="carousel-container">
        <Carousel />
      </div>

    </div>
  );
}
