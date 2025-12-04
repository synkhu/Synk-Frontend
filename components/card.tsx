import React from 'react'
import './card.css'

export default function Card() {
  return (
    <div>
            <div className="border rounded-lg shadow-md overflow-hidden card" style={{ backgroundImage: 'url(https://independentaustralia.net/_lib/slir/w800-c660x434/i/article/img/article-19811-hero.jpg?t=1749265169)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <p className="text-gray-700">Your description goes here</p>
            </div>
          </div>
        </div>
  )
}
