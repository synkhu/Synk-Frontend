import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './navbar.css'
import axios from 'axios'

interface Ticket {
    id: string
    eventId: string
    eventName: string
    ticketTypeId: string
    ticketTypeName: string
    ticketToken: string
    createdAt: string
    eventStartTime?: string
    venueName?: string
    thumbnailUrl?: string
    qrCode?: string
}

interface TicketsPopupProps {
    visible: boolean
    onClose: () => void
}

export default function TicketsPopup({ visible, onClose }: TicketsPopupProps) {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!visible) {
            setError(null)
            return
        }

        fetchTickets()
    }, [visible])
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && visible) {
                onClose()
            }
        }
        
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [visible, onClose])

    const fetchTickets = async () => {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
            setError('Kérjük, jelentkezz be a jegyeid megtekintéséhez')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const options = {
                method: 'GET',
                url: 'https://api.synk.hu/tickets/my',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }

            const { data } = await axios.request(options)
            const ticketsArray = Array.isArray(data) ? data : data.items || []
            setTickets(ticketsArray)
        } catch (error: any) {
            setError(error.response?.data?.message || 'Nem sikerült betölteni a jegyeket')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'N/A'
            return date.toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'N/A'
        }
    }

    const formatPrice = (price?: number) => {
        if (price === undefined || price === null || isNaN(price)) return 'N/A'
        return new Intl.NumberFormat('hu-HU', {
            style: 'currency',
            currency: 'HUF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const downloadTicket = async (ticketId: string) => {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
            alert('Kérjük, jelentkezz be a jegy letöltéséhez')
            return
        }

        try {
            const options = {
                method: 'GET',
                url: `https://api.synk.hu/tickets/${ticketId}/download`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' as const
            }

            const { data } = await axios.request(options)
            const blob = new Blob([data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `ticket-${ticketId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            alert('Nem sikerült letölteni a jegyet')
        }
    }

    if (!visible || !mounted) return null

    return createPortal(
        <div className="popup-overlay" onClick={onClose}>
            <div
                className="popup-container"
                style={{ maxWidth: '900px', maxHeight: '85vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="popup-header">
                    <h2 className="popup-title">Jegyeim</h2>
                    <button
                        onClick={onClose}
                        className="popup-close"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                {error && <div className="popup-error-message">{error}</div>}

                {isLoading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-300">Jegyek betöltése...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-300 text-lg mb-4">Még nincs egyetlen jegyed sem.</p>
                        <p className="text-gray-400 text-sm">
                            Vásárolj jegyeket az események oldalon!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="bg-[#2d1b4e] rounded-lg shadow-lg overflow-hidden border border-[#5a3d8a] hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="md:flex">
                                    {/* Event Image */}
                                    {ticket.thumbnailUrl && (
                                        <div className="md:w-48 md:flex-shrink-0">
                                            <img
                                                src={ticket.thumbnailUrl}
                                                alt={ticket.eventName}
                                                className="h-48 w-full md:h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Ticket Details */}
                                    <div className="p-6 flex-1">
                                        <h3 className="text-xl font-bold text-white mb-3">
                                            {ticket.eventName}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-400">🎫</span>
                                                <span className="text-gray-300">
                                                    <strong className="text-white">Típus:</strong> {ticket.ticketTypeName}
                                                </span>
                                            </div>

                                            {ticket.venueName && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-400">📍</span>
                                                    <span className="text-gray-300">
                                                        <strong className="text-white">Helyszín:</strong> {ticket.venueName}
                                                    </span>
                                                </div>
                                            )}

                                            {ticket.eventStartTime && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-400">📅</span>
                                                    <span className="text-gray-300">
                                                        <strong className="text-white">Időpont:</strong> {formatDate(ticket.eventStartTime)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 md:col-span-2">
                                                <span className="text-gray-400">🛒</span>
                                                <span className="text-gray-400 text-xs">
                                                    Vásárlás: {formatDate(ticket.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {ticket.qrCode && (
                                            <div className="mt-4 flex justify-center bg-white rounded-lg p-3 inline-block">
                                                <img
                                                    src={ticket.qrCode}
                                                    alt="QR Code"
                                                    className="w-32 h-32"
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => downloadTicket(ticket.id)}
                                                className="flex-1 bg-[#5a3d8a] hover:bg-[#6b4d9a] text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                            >
                                                <span>⬇️</span>
                                                <span>Jegy letöltése</span>
                                            </button>
                                            <button
                                                onClick={() => window.location.href = `/events/${ticket.eventId}`}
                                                className="flex-1 bg-[#4c3073] hover:bg-[#5a3d8a] text-white px-4 py-2 rounded-lg font-medium transition"
                                            >
                                                Esemény megtekintése
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && tickets.length > 0 && (
                    <button
                        onClick={onClose}
                        className="popup-primary-button mt-4"
                    >
                        Bezárás
                    </button>
                )}
            </div>
        </div>,
        document.body
    )
}
