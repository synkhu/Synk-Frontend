"use client";

import React, { useState } from 'react'
import './navbar.css'
import RegisterPopup from './register'
import LoginPopup from './login'
import Cart, { CartTicket } from './kosar'

type NavbarProps = {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};

export default function Navbar({ loggedIn, setLoggedIn }: NavbarProps) {
    const [showLoginPopup, setShowLoginPopup] = useState(false)
    const [showCartPopup, setShowCartPopup] = useState(false)
    const [showRegisterPopup, setShowRegisterPopup] = useState(false)

    const [loginStep, setLoginStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')

    const [cartItems, setCartItems] = useState<CartTicket[]>([
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

    // Open login popup
    const openLogin = () => {
        if (loggedIn) return;
        setShowLoginPopup(true)
        setLoginStep('email')
        setEmail('')
        setCode('')
    }

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setLoggedIn(false);
    };

    const handleLogin = async () => {
        try {
            const res = await fetch("https://api.synk.hu/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password: code }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data?.errors?.Password?.[0] || "Login failed");
                return;
            }

            localStorage.setItem("authToken", data.token);
            setLoggedIn(true);
            setShowLoginPopup(false);
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    const removeTicket = (ticketId: number) => {
        setCartItems(cartItems.filter(item => item.id !== ticketId))
    }

    const downloadTicket = (ticket: CartTicket) => {
        alert(`Letöltés: ${ticket.eventName} jegy`)
    }

    const calculateTotal = () =>
        cartItems.reduce((total, item) => total + item.price, 0)

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(price)

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-logo">
                    <div className="navbar-logo-icon">S</div>
                    <h1 className="navbar-logo-text">Synk</h1>
                </div>

                <label htmlFor="nav-search" className="navbar-search-label">Search</label>
                <input id="nav-search" type="search" placeholder="Search..." className="navbar-search-input" />

                <div className="navbar-buttons">
                    <button type="button" className="navbar-button" onClick={() => setShowCartPopup(true)}>
                        Kosár megtekintése ({cartItems.length})
                    </button>

                    <button type="button" className="navbar-button" onClick={openLogin}>
                        Jegyeim
                    </button>

                    {loggedIn && (
                        <button type="button" className="navbar-button" onClick={handleLogout}>
                            Kijelentkezés
                        </button>
                    )}
                </div>
            </nav>

            {/* Login Popup */}
            <LoginPopup
                visible={showLoginPopup}
                email={email}
                code={code}
                loginStep={loginStep}
                onClose={() => setShowLoginPopup(false)}
                onEmailChange={setEmail}
                onCodeChange={setCode}
                onGetCode={() => setLoginStep('code')}
                onLogin={handleLogin}
                onLoginSuccess={(sessionData: { token: string }) => {
                    setLoggedIn(true);
                    setShowLoginPopup(false);
                    localStorage.setItem("authToken", sessionData.token);
                }}
                onOpenRegister={() => {
                    setShowLoginPopup(false)
                    setShowRegisterPopup(true)
                }}
                onBackToEmail={() => setLoginStep('email')}
            />

            {/* Register Popup */}
            <RegisterPopup
                visible={showRegisterPopup}
                onClose={() => setShowRegisterPopup(false)}
                onBackToLogin={() => {
                    setShowRegisterPopup(false)
                    setShowLoginPopup(true)
                }}
            />

            {/* Cart Component */}
            <Cart
                visible={showCartPopup}
                cartItems={cartItems}
                onClose={() => setShowCartPopup(false)}
                onRemove={removeTicket}
                onDownload={downloadTicket}
                formatPrice={formatPrice}
                formatDate={formatDate}
                calculateTotal={calculateTotal}
            />
        </div>
    )
}
