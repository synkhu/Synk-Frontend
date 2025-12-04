// Register.tsx
import React, { useState } from 'react'
import axios from 'axios'
import './navbar.css'


interface RegisterPopupProps {
    onClose: () => void
    onBackToLogin: () => void
    visible: boolean
}

export default function RegisterPopup({ visible, onClose, onBackToLogin }: RegisterPopupProps) {
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    })

    const [registerLoading, setRegisterLoading] = useState(false)
    const [registerError, setRegisterError] = useState('')
    const [registerSuccess, setRegisterSuccess] = useState(false)

    const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setRegisterLoading(true)
        setRegisterError('')
        setRegisterSuccess(false)

        try {
            const { data } = await axios.post('https://api.synk.hu/auth/register', registerData, {
                headers: {'Content-Type': 'application/json'}
            })

            console.log('Registration successful:', data)
            setRegisterSuccess(true)

            setRegisterData({ email: '', password: '', firstName: '', lastName: '' })

            setTimeout(() => {
                onClose()
            }, 2000)

        } catch (error: any) {
            console.error('Registration error:', error)
            const msg = error.response?.data?.message 
                || error.response?.data?.error 
                || 'Sikertelen regisztráció. Kérjük, próbáld újra.'
            setRegisterError(msg)
        } finally {
            setRegisterLoading(false)
        }
    }

    if (!visible) return null

    return (
        <div className="popup-overlay">
            <div className="popup-container">

                <div className="popup-header">
                    <h2 className="popup-title">Regisztráció</h2>
                    <button onClick={onClose} className="popup-close">×</button>
                </div>

                {registerSuccess && (
                    <div className="popup-success">Sikeres regisztráció!</div>
                )}

                {registerError && (
                    <div className="popup-error">{registerError}</div>
                )}

                <form onSubmit={handleRegisterSubmit}>
                    <div className="popup-input-group">
                        <label className="popup-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterInputChange}
                            className="popup-input"
                            required
                        />

                        <label className="popup-label">Jelszó</label>
                        <input
                            type="password"
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterInputChange}
                            className="popup-input"
                            required
                        />

                        <label className="popup-label">Keresztnév</label>
                        <input
                            type="text"
                            name="firstName"
                            value={registerData.firstName}
                            onChange={handleRegisterInputChange}
                            className="popup-input"
                            required
                        />

                        <label className="popup-label">Vezetéknév</label>
                        <input
                            type="text"
                            name="lastName"
                            value={registerData.lastName}
                            onChange={handleRegisterInputChange}
                            className="popup-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="popup-primary-button"
                        disabled={registerLoading}
                    >
                        {registerLoading ? 'Regisztráció...' : 'Regisztrálok'}
                    </button>

                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="popup-secondary-button"
                    >
                        Vissza a bejelentkezéshez
                    </button>
                </form>
            </div>
        </div>
    )
}
