"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { authService, LoginCredentials } from "../app/services/auth.service";
import { getCurrentUser } from "../app/services/user.service";

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
  onClose,
  onEmailChange,
  onLoginSuccess,
  onOpenRegister,
}: LoginPopupProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleForgotPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    setError(null);

    try {
      await axios.post("https://api.synk.hu/auth/forgot-password", { email }, {
        headers: { "Content-Type": "application/json" },
      });
      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLoginWithAPI = async () => {
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credentials: LoginCredentials = { email, password };
      const sessionData = await authService.login(credentials);
      await getCurrentUser();

      setLoginSuccess(true);
      if (onLoginSuccess) onLoginSuccess(sessionData);

      setTimeout(() => {
        onClose();
        setPassword("");
        setLoginSuccess(false);
      }, 1500);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.response?.data?.errors?.Password?.[0] || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setError(null);
      setLoginSuccess(false);
      setForgotSuccess(false);
    }
  }, [visible]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible && !isLoading) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [visible, isLoading, onClose]);

  if (!visible || !mounted) return null;

  const portal = createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {loginSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Login successful! Welcome back.
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={isLoading || loginSuccess}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-gray-400">Password</label>
                <button className="text-xs text-purple-400 hover:text-purple-300 font-medium" onClick={handleForgotPassword} disabled={forgotLoading || isLoading || loginSuccess}>{forgotLoading ? "Sending..." : "Forgot password?"}</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={isLoading || loginSuccess}
                onKeyDown={(e) => e.key === "Enter" && handleLoginWithAPI()}
              />
            </div>

            <button
              onClick={handleLoginWithAPI}
              disabled={!email || !password || isLoading || loginSuccess}
              className="w-full py-4 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:opacity-50 text-black font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-black/20"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading && !loginSuccess) onOpenRegister();
                }}
                className="text-white font-semibold hover:underline decoration-purple-500 underline-offset-4"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {portal}
      {forgotSuccess && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <p className="text-white text-center font-semibold text-lg">Password reset email sent.</p>
            <button
              onClick={() => setForgotSuccess(false)}
              className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              OK
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
