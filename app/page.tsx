"use client";

import Carousel from "../components/Carousel";
import UpcomingEvents from "../components/UpcomingEvents";

export default function Home() {
  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
        <section className="rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm border border-white/5 p-3 md:p-6">
          <Carousel />
        </section>
        
        <section className="space-y-6">
          <UpcomingEvents />
        </section>
      </div>
    </div>
  );
}
