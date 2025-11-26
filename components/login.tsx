// Login.tsx
import React from 'react'
import './navbar.css'

interface LoginPopupProps {
    visible: boolean
    email: string
    code: string
    loginStep: 'email' | 'code'
    onClose: () => void
    onEmailChange: (value: string) => void
    onCodeChange: (value: string) => void
    onGetCode: () => void
    onLogin: () => void
    onOpenRegister: () => void
    onBackToEmail: () => void
}

export default function LoginPopup({
    visible,
    email,
    code,
    loginStep,
    onClose,
    onEmailChange,
    onCodeChange,
    onGetCode,
    onLogin,
    onOpenRegister,
    onBackToEmail
}: LoginPopupProps) {

    if (!visible) return null

    return (
        <div className="popup-overlay">
            <div className="popup-container">

                <div className="popup-header">
                    <h2 className="popup-title">
                        {loginStep === 'email' ? 'Bejelentkezés' : 'Írd be a kódot'}
                    </h2>
                    <button onClick={onClose} className="popup-close">×</button>
                </div>

                {/* Email step */}
                {loginStep === 'email' ? (
                    <div>
                        <div className="popup-input-group">
                            <label className="popup-label">Email cím</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => onEmailChange(e.target.value)}
                                placeholder="Add meg az email címed"
                                className="popup-input"
                            />

                            <label className="popup-label">Jelszó</label>
                            <input
                                type="password"
                                placeholder="Add meg a jelszavad"
                                className="popup-input"
                            />
                        </div>

                        <button
                            onClick={onGetCode}
                            disabled={!email}
                            className="popup-primary-button"
                        >
                            Kód küldése
                        </button>

                        <button className="popup-secondary-button">
                            Elfelejtettem a jelszavamat
                        </button>

                        <a
                            href="#"
                            className="popup-register-link"
                            onClick={(e) => {
                                e.preventDefault()
                                onOpenRegister()
                            }}
                        >
                            Nincs még fiókod? Regisztrálj most!
                        </a>
                    </div>
                ) : (
                    /* Code verification step */
                    <div>
                        <div className="popup-input-group">
                            <p className="popup-info-text">
                                Elküldtünk egy kódot a(z) <strong>{email}</strong> email címre
                            </p>

                            <label className="popup-label">Ellenőrző kód</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => onCodeChange(e.target.value)}
                                placeholder="Add meg a kódot"
                                className="popup-input"
                            />
                        </div>

                        <button
                            onClick={onLogin}
                            disabled={!code}
                            className="popup-primary-button"
                        >
                            Bejelentkezés
                        </button>

                        <button
                            onClick={onBackToEmail}
                            className="popup-secondary-button"
                        >
                            Vissza
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
