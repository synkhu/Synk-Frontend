"use client";

import Navbar from "../components/navbar";
import Carousel from "../components/carousel";
import "./page.css";

export default function Home() {
  return (
    <div className="main flex">

      <div  className="nav">
        <Navbar />
      </div>

      <div  className="carousel-container flex">
        <Carousel />
      </div>

    </div>
  );
}
//loginhoz még kellene valami