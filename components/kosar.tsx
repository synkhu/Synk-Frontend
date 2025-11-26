// Cart.tsx
import React from 'react'
import './navbar.css'

export interface CartTicket {
    id: number
    eventName: string
    date: string
    time: string
    venue: string
    section?: string
    row?: string
    seat?: string
    price: number
    type: string
}

interface CartProps {
    visible: boolean
    cartItems: CartTicket[]
    onClose: () => void
    onRemove: (id: number) => void
    onDownload: (ticket: CartTicket) => void
    formatPrice: (p: number) => string
    formatDate: (d: string) => string
    calculateTotal: () => number
}

export default function Cart({
    visible,
    cartItems,
    onClose,
    onRemove,
    onDownload,
    formatPrice,
    formatDate,
    calculateTotal
}: CartProps) {

    if (!visible) return null

    return (
        <div className="popup-overlay">
            <div className="cart-popup-container">

                <div className="popup-header">
                    <h2 className="cart-title">Kosár</h2>
                    <button onClick={onClose} className="popup-close">×</button>
                </div>

                {cartItems.length === 0 ? (
                    <p className="cart-empty">A kosár üres</p>
                ) : (
                    <>
                        {cartItems.map(ticket => (
                            <div key={ticket.id} className="ticket-item">

                                <div className="ticket-header">
                                    <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                    <div className="ticket-price">{formatPrice(ticket.price)}</div>
                                </div>

                                <div className="ticket-details">
                                    <div><strong>Dátum:</strong> {formatDate(ticket.date)}</div>
                                    <div><strong>Idő:</strong> {ticket.time}</div>
                                    <div><strong>Helyszín:</strong> {ticket.venue}</div>
                                    <div><strong>Típus:</strong> {ticket.type}</div>

                                    {ticket.section && <div><strong>Szektor:</strong> {ticket.section}</div>}
                                    {ticket.row && ticket.row !== '-' && <div><strong>Sor:</strong> {ticket.row}</div>}
                                    {ticket.seat && <div><strong>Hely:</strong> {ticket.seat}</div>}
                                </div>

                                <div className="ticket-actions">
                                    <button
                                        onClick={() => onDownload(ticket)}
                                        className="ticket-action-button ticket-action-download"
                                    >
                                        Letöltés
                                    </button>

                                    <button
                                        onClick={() => onRemove(ticket.id)}
                                        className="ticket-action-button ticket-action-remove"
                                    >
                                        Törlés
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="cart-total">
                            <span>Összesen:</span>
                            <span>{formatPrice(calculateTotal())}</span>
                        </div>

                        <div className="cart-actions">
                            <button className="cart-close-button" onClick={onClose}>
                                Bezárás
                            </button>

                            <button className="cart-checkout-button">
                                Tovább a fizetéshez
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
