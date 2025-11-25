"use client";

import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
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
