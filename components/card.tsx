import React from 'react'

export default function Card() {
  return (
    <div className="relative w-full max-w-[1200px] h-[384px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: 'url(https://independentaustralia.net/_lib/slir/w800-c660x434/i/article/img/article-19811-hero.jpg?t=1749265169)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 p-8 backdrop-blur-sm bg-black/40 border-t border-white/5">
        <p className="text-white text-lg font-medium tracking-tight">Your description goes here</p>
      </div>
    </div>
  )
}
