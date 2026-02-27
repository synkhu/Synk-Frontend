import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./navbar.css";
import { authService, LoginCredentials } from "../app/services/auth.service";

interface LoginPopupProps {
  visible: boolean;
  email: string;
  code: string;
  loginStep: "email" | "code";
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onGetCode: () => void;
  onLogin: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onOpenRegister: () => void;
  onBackToEmail: () => void;
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
  onBackToEmail,
}: LoginPopupProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginWithAPI = async () => {
    if (!email || !password) {
      setError("Please fill in the email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credentials: LoginCredentials = { email, password };
      const sessionData = await authService.login(credentials);

      setLoginSuccess(true);
      setSessionInfo(sessionData);

      if (onLoginSuccess) onLoginSuccess(sessionData);

      setTimeout(() => {
        onClose();
        setPassword("");
        setLoginSuccess(false);
        setSessionInfo(null);
      }, 2000);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error?.response && error.response.data) {
        setError(
          error.response.data.errors?.Password?.[0] ||
            "Invalid email or password",
        );
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setError(null);
      setLoginSuccess(false);
    }
  }, [visible]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [visible, isLoading, onClose]);

  if (!visible || !mounted) return null;

  return createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2 className="popup-title">
            {loginStep === "email" ? "Log in" : "Enter the code"}
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
            ✓ Login successful! Redirecting...
            {sessionInfo?.user && (
              <div className="session-info">
                Welcome back, {sessionInfo.user.name || sessionInfo.user.email}!
              </div>
            )}
          </div>
        )}

        {loginStep === "email" ? (
          <div>
            <div className="popup-input-group">
              <label className="popup-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Enter your email"
                className="popup-input"
                disabled={isLoading}
              />

              <label className="popup-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter your password"
                className="popup-input"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isLoading &&
                    !loginSuccess &&
                    email &&
                    password
                  ) {
                    e.preventDefault();
                    handleLoginWithAPI();
                  }
                }}
              />
            </div>

            <button
              onClick={handleLoginWithAPI}
              disabled={!email || !password || isLoading || loginSuccess}
              className="popup-primary-button"
            >
              {isLoading
                ? "Logging in..."
                : loginSuccess
                  ? "✓ Success"
                  : "Log in"}
            </button>

            <button
              className="popup-secondary-button"
              disabled={isLoading || loginSuccess}
            >
              I forgot my password
            </button>

            <a
              href="#"
              className="popup-register-link"
              onClick={(e) => {
                e.preventDefault();
                if (!isLoading && !loginSuccess) onOpenRegister();
              }}
              style={{
                pointerEvents: isLoading || loginSuccess ? "none" : "auto",
              }}
            >
              Don't have an account? Register now!
            </a>
          </div>
        ) : (
          <div>
            <div className="popup-input-group">
              <p className="popup-info-text">
                We sent a code to <strong>{email}</strong>
              </p>

              <label className="popup-label">Verification code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Enter the code"
                className="popup-input"
                disabled={isLoading || loginSuccess}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isLoading &&
                    !loginSuccess &&
                    code
                  ) {
                    e.preventDefault();
                    onLogin();
                  }
                }}
              />
            </div>

            <button
              onClick={onLogin}
              disabled={!code || isLoading || loginSuccess}
              className="popup-primary-button"
            >
              {isLoading
                ? "Verifying..."
                : loginSuccess
                  ? "✓ Success"
                  : "Log in"}
            </button>

            <button
              onClick={onBackToEmail}
              className="popup-secondary-button"
              disabled={isLoading || loginSuccess}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
