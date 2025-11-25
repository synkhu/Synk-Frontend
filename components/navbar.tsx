import React, { useState } from 'react'
import './navbar.css'

export default function Navbar() {
    const [showPopup, setShowPopup] = useState(false)
    const [showCartPopup, setShowCartPopup] = useState(false)
    const [loginStep, setLoginStep] = useState('email') // 'email' or 'code'
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    
    // Sample cart data - in a real app, this would come from your state management
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            eventName: "Szilveszteri Koncert",
            date: "2024-12-31",
            time: "20:00",
            venue: "Budapest Sportaréna",
            section: "A-12",
            row: "5",
            seat: "23",
            price: 12500,
            type: "Normál"
        },
        {
            id: 2,
            eventName: "Jazz Fesztivál",
            date: "2024-11-15",
            time: "19:30",
            venue: "Müpa Budapest",
            section: "Főtér",
            row: "-",
            seat: "Álló",
            price: 8500,
            type: "Normál"
        },
        {
            id: 3,
            eventName: "Színház: Macbeth",
            date: "2024-10-20",
            time: "18:00",
            venue: "Nemzeti Színház",
            section: "Első emelet",
            row: "3",
            seat: "15",
            price: 6500,
            type: "Kedvezményes"
        }
    ])

    const handleJegyeimClick = () => {
        setShowPopup(true)
        setLoginStep('email')
        setEmail('')
        setCode('')
    }

    const handleKosarClick = () => {
        setShowCartPopup(true)
    }

    const handleGetCode = () => {
        // Here you would typically send the code to the user's email
        console.log('Sending code to:', email)
        // For demo purposes, we'll just switch to code entry
        setLoginStep('code')
    }

    const handleLogin = () => {
        // Here you would verify the code
        console.log('Verifying code:', code, 'for email:', email)
        // If successful:
        setShowPopup(false)
        alert('Sikeres bejelentkezés!')
    }

    const handleForgotPassword = () => {
        // Handle forgot password logic here
        alert('Elfelejtett jelszó funkció')
    }

    const closePopup = () => {
        setShowPopup(false)
        setLoginStep('email')
        setEmail('')
        setCode('')
    }

    const closeCartPopup = () => {
        setShowCartPopup(false)
    }

    const removeTicket = (ticketId: number) => {
        setCartItems(cartItems.filter(item => item.id !== ticketId))
    }

    const downloadTicket = (ticket) => {
        // In a real app, this would generate/download the ticket PDF
        alert(`Letöltés: ${ticket.eventName} jegy`)
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price, 0)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('hu-HU', {
            style: 'currency',
            currency: 'HUF'
        }).format(price)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-logo">
                    <div className="navbar-logo-icon">S</div>
                    <h1 className="navbar-logo-text">Synk</h1>
                </div>

                <label htmlFor="nav-search" className="navbar-search-label">Search</label>
                <input
                    id="nav-search"
                    type="search"
                    placeholder="Search..."
                    className="navbar-search-input"
                />

                <div className="navbar-buttons">
                    <button
                        type="button"
                        className="navbar-button"
                        onClick={handleKosarClick}
                    >
                        Kosár megtekintése ({cartItems.length})
                    </button>

                    <button
                        type="button"
                        className="navbar-button"
                        onClick={handleJegyeimClick}
                    >
                        Jegyeim
                    </button>
                </div>
            </nav>

            {/* Login Popup */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <div className="popup-header">
                            <h2 className="popup-title">
                                {loginStep === 'email' ? 'Bejelentkezés' : 'Írd be a kódot'}
                            </h2>
                            <button
                                onClick={closePopup}
                                className="popup-close"
                            >
                                ×
                            </button>
                        </div>

                        {loginStep === 'email' ? (
                            <div>
                                <div className="popup-input-group">
                                    <label className="popup-label">
                                        Email cím
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Add meg az email címed"
                                        className="popup-input"
                                    />
                                </div>

                                <button
                                    onClick={handleGetCode}
                                    disabled={!email}
                                    className="popup-primary-button"
                                >
                                    Kód küldése
                                </button>

                                <button
                                    onClick={handleForgotPassword}
                                    className="popup-secondary-button"
                                >
                                    Elfelejtettem a jelszavamat
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="popup-input-group">
                                    <p className="popup-info-text">
                                        Elküldtünk egy kódot a(z) <strong>{email}</strong> email címre
                                    </p>
                                    <label className="popup-label">
                                        Ellenőrző kód
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Add meg a kódot"
                                        className="popup-input"
                                    />
                                </div>

                                <button
                                    onClick={handleLogin}
                                    disabled={!code}
                                    className="popup-primary-button"
                                >
                                    Bejelentkezés
                                </button>

                                <button
                                    onClick={() => setLoginStep('email')}
                                    className="popup-secondary-button"
                                >
                                    Vissza
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Kosár popup */}
            {showCartPopup && (
                <div className="popup-overlay">
                    <div className="cart-popup-container">
                        <div className="popup-header">
                            <h2 className="cart-title">Kosár</h2>
                            <button
                                onClick={closeCartPopup}
                                className="popup-close"
                            >
                                ×
                            </button>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="cart-empty">
                                <p>A kosár üres</p>
                            </div>
                        ) : (
                            <>
                                {cartItems.map(ticket => (
                                    <div key={ticket.id} className="ticket-item">
                                        <div className="ticket-header">
                                            <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                            <div className="ticket-price">{formatPrice(ticket.price)}</div>
                                        </div>
                                        
                                        <div className="ticket-details">
                                            <div className="ticket-detail">
                                                <strong>Dátum:</strong> {formatDate(ticket.date)}
                                            </div>
                                            <div className="ticket-detail">
                                                <strong>Idő:</strong> {ticket.time}
                                            </div>
                                            <div className="ticket-detail">
                                                <strong>Helyszín:</strong> {ticket.venue}
                                            </div>
                                            <div className="ticket-detail">
                                                <strong>Jegy típusa:</strong> {ticket.type}
                                            </div>
                                            {ticket.section && (
                                                <div className="ticket-detail">
                                                    <strong>Szektor:</strong> {ticket.section}
                                                </div>
                                            )}
                                            {ticket.row && ticket.row !== '-' && (
                                                <div className="ticket-detail">
                                                    <strong>Sor:</strong> {ticket.row}
                                                </div>
                                            )}
                                            {ticket.seat && (
                                                <div className="ticket-detail">
                                                    <strong>Hely:</strong> {ticket.seat}
                                                </div>
                                            )}
                                        </div>

                                        <div className="ticket-actions">
                                            <button
                                                onClick={() => downloadTicket(ticket)}
                                                className="ticket-action-button ticket-action-download"
                                            >
                                                Letöltés
                                            </button>
                                            <button
                                                onClick={() => removeTicket(ticket.id)}
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
                                    <button className="cart-close-button" onClick={closeCartPopup}>
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
            )}
        </div>
    )

}

