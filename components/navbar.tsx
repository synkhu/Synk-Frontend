"use client";

import React, { useState, useEffect } from 'react'
import './navbar.css'
import RegisterPopup from './register'
import LoginPopup from './login'
import TicketsPopup from './tickets'
import { authService } from '../app/services/auth.service'

type NavbarProps = {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};

export default function Navbar({ loggedIn, setLoggedIn }: NavbarProps) {
    const [showLoginPopup, setShowLoginPopup] = useState(false)
    const [showRegisterPopup, setShowRegisterPopup] = useState(false)
    const [showTicketsPopup, setShowTicketsPopup] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    const [loginStep, setLoginStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')

    // Check admin status when login status changes
    useEffect(() => {
        if (loggedIn) {
            authService.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false))
        } else {
            setIsAdmin(false)
        }
    }, [loggedIn])


    // Open login/tickets popup
    const openLogin = () => {
        if (loggedIn) {
            setShowTicketsPopup(true)
            return;
        }
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
                    <button type="button" className="navbar-button" onClick={openLogin}>
                        Jegyeim
                    </button>

                    {loggedIn && (
                        <button type="button" className="navbar-button" onClick={handleLogout}>
                            Kijelentkezés
                        </button>
                    )}

                    {isAdmin && (
                        <>
                            <button type="button" className="navbar-button" onClick={() => window.location.href = '/artists'}>
                                Artists Admin
                            </button>

                            <button type="button" className="navbar-button" onClick={() => window.location.href = '/venues'}>
                                Venues Admin
                            </button>

                            <button type="button" className="navbar-button" onClick={() => window.location.href = '/events'}>
                                Events Admin
                            </button>
                        </>
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

            {/* Tickets Popup */}
            <TicketsPopup
                visible={showTicketsPopup}
                onClose={() => setShowTicketsPopup(false)}
            />
        </div>
    )
}
