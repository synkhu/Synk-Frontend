import React from 'react'
import './UpcomingEvents.css'
export default function UpcomingEvents() {
  return (
    <div className='main'>
    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map((i) => (
            <div className='card' key={i}>
                <h3>Event {i}</h3>
                <p>Short description for event {i}.</p>
                <div className="card-footer">
                    <time className="event-time">Apr {10 + i}</time>
                    <button className="details-button">Details</button>
                </div>
            </div>
        ))}
    </div>
    </div>
  )
}
