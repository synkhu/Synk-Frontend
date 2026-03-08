"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = () => {
    if (!password || !passwordAgain) {
      setError("Please fill in both fields");
      return;
    }

    if (password !== passwordAgain) {
      setError("Passwords do not match");
      return;
    }

    // In a real app, you would make an API call here.
    // For this task, we just simulate success.
    
    setError("");
    setIsSuccess(true);
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 4000); // Redirect after 4 seconds (3-5 sec range)

      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 w-full h-full">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-500 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password reset successfully</h2>
          <p className="text-gray-400">Redirecting to home page...</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Reset Password</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Password again</label>
              <input
                type="password"
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
            </div>

            <button
              onClick={handleResetPassword}
              className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-black/20 mt-4 cursor-pointer"
            >
              Reset password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
