'use client'
import { useState } from 'react'
import Image from 'next/image'
import './carousel.css'
import Card from './card'

export default function Carousel() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const totalSlides = 5

    const goToSlide = (index: number): void => {
        setCurrentSlide(index)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    }

    return (
        <div className='carousel'>
            <div className='relative w-full' data-carousel='slide'>
            {/* Carousel wrapper */}
            <div className='relative h-56 overflow-hidden rounded-base md:h-96'>
                {/* Item 1 */}
                <div className={`${currentSlide === 0 ? 'block' : 'hidden'} duration-700 ease-in-out h-full`} data-carousel-item>
                    <Card/>
                </div>
                {/* Item 2 */}
                <div className={`${currentSlide === 1 ? 'block' : 'hidden'} duration-700 ease-in-out h-full`} data-carousel-item>
                    <Card/>
                </div>
                {/* Item 3 */}
                <div className={`${currentSlide === 2 ? 'block' : 'hidden'} duration-700 ease-in-out h-full`} data-carousel-item>
                    <Card/>
                </div>
                {/* Item 4 */}
                <div className={`${currentSlide === 3 ? 'block' : 'hidden'} duration-700 ease-in-out h-full`} data-carousel-item>
                    <Card/>
                </div>
                {/* Item 5 */}
                <div className={`${currentSlide === 4 ? 'block' : 'hidden'} duration-700 ease-in-out h-full`} data-carousel-item>
                    <Card/>
                </div>
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