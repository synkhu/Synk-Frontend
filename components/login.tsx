// Login.tsx
import React, { useState, useEffect } from 'react'
import './navbar.css'
import { authService, LoginCredentials } from '../app/services/auth.service'

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
    onLoginSuccess?: (sessionData: any) => void
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
    onLoginSuccess,
    onOpenRegister,
    onBackToEmail
}: LoginPopupProps) {
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loginSuccess, setLoginSuccess] = useState(false)
    const [sessionInfo, setSessionInfo] = useState<any>(null)

    const handlePasswordChange = (value: string) => {
        setPassword(value)
    }

    const handleLoginWithAPI = async () => {
        if (!email || !password) {
            setError('Kérjük, töltsd ki az email címet és a jelszót')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const credentials: LoginCredentials = { email, password }
            const sessionData = await authService.login(credentials)
            console.log('Login successful:', sessionData)

            setLoginSuccess(true)
            setSessionInfo(sessionData)

            if (onLoginSuccess) onLoginSuccess(sessionData)

            setTimeout(() => {
                onClose()
                setPassword('')
                setLoginSuccess(false)
                setSessionInfo(null)
            }, 2000)
        } catch (error: any) {
            console.error('Login error:', error)
            if (error?.response && error.response.data) {
                setError(error.response.data.errors?.Password?.[0] || 'Hibás email vagy jelszó')
            } else {
                setError('Hibás email vagy jelszó')
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!visible) {
            setPassword('')
            setError(null)
            setLoginSuccess(false)
        }
    }, [visible])

    // Add ESC key handler
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && visible && !isLoading) {
                onClose()
            }
        }
        
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [visible, isLoading, onClose])

    if (!visible) return null

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-container" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2 className="popup-title">
                        {loginStep === 'email' ? 'Bejelentkezés' : 'Írd be a kódot'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="popup-close"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                {error && <div className="popup-error-message">{error}</div>}

                {loginSuccess && (
                    <div className="popup-success-message">
                        ✓ Sikeres bejelentkezés! Átirányítás...
                        {sessionInfo?.user && (
                            <div className="session-info">
                                Üdvözöljük vissza, {sessionInfo.user.name || sessionInfo.user.email}!
                            </div>
                        )}
                    </div>
                )}

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
                                disabled={isLoading}
                            />

                            <label className="popup-label">Jelszó</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                placeholder="Add meg a jelszavad"
                                className="popup-input"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            onClick={handleLoginWithAPI}
                            disabled={!email || !password || isLoading || loginSuccess}
                            className="popup-primary-button"
                        >
                            {isLoading ? 'Bejelentkezés folyamatban...' : loginSuccess ? '✓ Sikeres' : 'Bejelentkezés'}
                        </button>

                        <button
                            className="popup-secondary-button"
                            disabled={isLoading || loginSuccess}
                        >
                            Elfejeltem a jelszavamat
                        </button>

                        <a
                            href="#"
                            className="popup-register-link"
                            onClick={(e) => {
                                e.preventDefault()
                                if (!isLoading && !loginSuccess) onOpenRegister()
                            }}
                            style={{ pointerEvents: isLoading || loginSuccess ? 'none' : 'auto' }}
                        >
                            Nincs még fiókod? Regisztrálj most!
                        </a>
                    </div>
                ) : (
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
                                disabled={isLoading || loginSuccess}
                            />
                        </div>

                        <button
                            onClick={onLogin}
                            disabled={!code || isLoading || loginSuccess}
                            className="popup-primary-button"
                        >
                            {isLoading ? 'Ellenőrzés...' : loginSuccess ? '✓ Sikeres' : 'Bejelentkezés'}
                        </button>

                        <button
                            onClick={onBackToEmail}
                            className="popup-secondary-button"
                            disabled={isLoading || loginSuccess}
                        >
                            Vissza
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}