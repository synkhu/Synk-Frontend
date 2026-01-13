'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import './carousel.css'
import Card from './card'

interface EventItem {
    id: string
    name: string
    venueName?: string | null
    thumbnailUrl?: string | null
    totalCapacity?: number | null
}

export default function Carousel() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const totalSlides = events.length

    useEffect(() => {
        axios.get('https://api.synk.hu/events')
            .then(res => {
                // Since totalCapacity is not available in the list endpoint,
                // show all events instead
                setEvents(res.data.items)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load events:', err)
                setLoading(false)
            })
    }, [])

    const goToSlide = (index: number): void => {
        setCurrentSlide(index)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    }

    if (loading) {
        return (
            <div className='carousel flex items-center justify-center h-56 md:h-96'>
                <p className='text-white text-xl'>Loading events...</p>
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <div className='carousel flex items-center justify-center h-56 md:h-96'>
                <p className='text-white text-xl'>No large events available</p>
            </div>
        )
    }

    return (
        <div className='carousel'>
            <div className='relative w-full' data-carousel='slide'>
            {/* Carousel wrapper */}
            <div className='relative h-56 overflow-hidden rounded-base md:h-96'>
                {events.map((event, index) => (
                    <div 
                        key={event.id}
                        className={`${currentSlide === index ? 'block' : 'hidden'} duration-700 ease-in-out h-full cursor-pointer`} 
                        data-carousel-item
                        onClick={() => router.push(`/events/${event.id}`)}
                    >
                        <div className='relative w-full h-full'>
                            {event.thumbnailUrl ? (
                                <img 
                                    src={event.thumbnailUrl} 
                                    alt={event.name}
                                    className='absolute block w-full h-full object-cover'
                                />
                            ) : (
                                <div className='absolute block w-full h-full bg-gradient-to-br from-purple-600 to-blue-600' />
                            )}
                            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6'>
                                <h3 className='text-white text-2xl font-bold mb-2'>{event.name}</h3>
                                {event.venueName && (
                                    <p className='text-white text-lg flex items-center gap-2'>
                                        <span>📍</span> {event.venueName}
                                    </p>
                                )}
                                {event.totalCapacity && (
                                    <p className='text-white text-sm mt-1'>
                                        Capacity: {event.totalCapacity} people
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Slider controls - Previous */}
            <button type='button' className='absolute top-0 left-0 z-40 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none' onClick={prevSlide}>
                <span className='inline-flex items-center justify-center w-10 h-10 rounded-base bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none'>
                <svg className='w-5 h-5 text-white rtl:rotate-180' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m15 19-7-7 7-7' /></svg>
                <span className='sr-only'>Previous</span>
                </span>
            </button>
            {/* Slider controls - Next */}
            <button type='button' className='absolute top-0 right-0 z-50 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none' onClick={nextSlide}>
                <span className='inline-flex items-center justify-center w-10 h-10 rounded-base bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none'>
                <svg className='w-5 h-5 text-white rtl:rotate-180' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m9 5 7 7-7 7' /></svg>
                <span className='sr-only'>Next</span>
                </span>
            </button>
            </div>
            {/* Closing button for the previous control */}
        </div>
    )
}