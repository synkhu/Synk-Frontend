"use client";

import React, { useState, useEffect } from 'react';
import './navbar.css';
import RegisterPopup from './register';
import LoginPopup from './login';
import TicketsPopup from './tickets';
import { authService } from '../app/services/auth.service';

type NavbarProps = {
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    navbarOpen?: boolean;
    setNavbarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ loggedIn, setLoggedIn, navbarOpen, setNavbarOpen }: NavbarProps) {
    const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
    const [showRegisterPopup, setShowRegisterPopup] = useState<boolean>(false);
    const [showTicketsPopup, setShowTicketsPopup] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [loginStep, setLoginStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');

    const [internalNavbarOpen, setInternalNavbarOpen] = useState<boolean>(false);
    const isNavbarOpen = navbarOpen ?? internalNavbarOpen;
    const toggleNavbar = () => {
        if (setNavbarOpen) {
            setNavbarOpen(prev => !prev);
        } else {
            setInternalNavbarOpen(prev => !prev);
        }
    };

    useEffect(() => {
        if (loggedIn) {
            authService.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
        } else {
            setIsAdmin(false);
        }
    }, [loggedIn]);

    const openLogin = () => {
        if (loggedIn) {
            setShowTicketsPopup(true);
            return;
        }
        setShowLoginPopup(true);
        setLoginStep('email');
        setEmail('');
        setCode('');
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

            const data: { token?: string; errors?: any } = await res.json();

            if (!res.ok) {
                alert(data?.errors?.Password?.[0] || "Login failed");
                return;
            }

            localStorage.setItem("authToken", data.token!);
            setLoggedIn(true);
            setShowLoginPopup(false);
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <>
            {/* Hamburger button */}
            <button
                className="navbar-toggle"
                onClick={toggleNavbar}
                aria-label="Toggle navigation"
            >
                {isNavbarOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}
            </button>

            <nav className={`navbar ${isNavbarOpen ? "open" : "closed"}`}>
                <div className="navbar-logo">
                    <div className="navbar-logo-icon">S</div>
                    <h1 className="navbar-logo-text">Synk</h1>
                </div>

                <div className="navbar-buttons">
                    <button type="button" className="navbar-button" onClick={openLogin}>
                        {loggedIn ? "Jegyeim" : "Log in"}
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
                    localStorage.setItem("authToken", sessionData.token);
                    setShowLoginPopup(false);
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
        </>
    );
}
