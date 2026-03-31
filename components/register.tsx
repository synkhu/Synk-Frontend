"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { getCurrentUser } from "../app/services/user.service";

interface RegisterPopupProps {
  onClose: () => void;
  onBackToLogin: () => void;
  visible: boolean;
}

export default function RegisterPopup({
  visible,
  onClose,
  onBackToLogin,
}: RegisterPopupProps) {
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible && !registerLoading) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [visible, registerLoading, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");

    try {
      await axios.post("https://api.synk.hu/auth/register", registerData, {
        headers: { "Content-Type": "application/json" },
      });

      const { authService } = await import("../app/services/auth.service");
      await authService.login({
        email: registerData.email,
        password: registerData.password,
      });

      await getCurrentUser();
      setRegisterSuccess(true);
      setRegisterData({ email: "", password: "", firstName: "", lastName: "" });

      setTimeout(() => {
        onClose();
        setRegisterSuccess(false);
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      let msg = "Registration failed. Please try again.";
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        for (const field in errors) {
          if (Array.isArray(errors[field]) && errors[field].length > 0) {
            msg = errors[field][0];
            break;
          }
        }
      }
      setRegisterError(msg);
    } finally {
      setRegisterLoading(false);
    }
  };

  if (!visible || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center flex-1">Create Account</h2>
            <button 
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {registerError && (
            <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Welcome to the family!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-[10px] sm:text-sm font-medium text-gray-400 ml-1">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={registerData.firstName}
                  onChange={handleInputChange}
                  placeholder="First"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  required
                  disabled={registerLoading || registerSuccess}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-[10px] sm:text-sm font-medium text-gray-400 ml-1">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  required
                  disabled={registerLoading || registerSuccess}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] sm:text-sm font-medium text-gray-400 ml-1">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
                disabled={registerLoading || registerSuccess}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] sm:text-sm font-medium text-gray-400 ml-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerData.password}
                onChange={handleInputChange}
                placeholder="Minimum 8 characters"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
                disabled={registerLoading || registerSuccess}
              />
            </div>

            <button
              type="submit"
              disabled={registerLoading || registerSuccess}
              className="w-full py-3 sm:py-4 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:opacity-50 text-black font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-black/20 mt-2"
            >
              {registerLoading ? "Creating account..." : "Join SYNK"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <button 
                onClick={(e) => { e.preventDefault(); onBackToLogin(); }}
                className="text-white font-semibold hover:underline decoration-purple-500 underline-offset-4"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
