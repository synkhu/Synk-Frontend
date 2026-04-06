"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required";
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter";
  if (!/\d/.test(pw)) return "Password must contain at least one number";
  if (!/[^A-Za-z\d]/.test(pw)) return "Password must contain at least one special character";
  return null;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleResetPassword = async () => {
    const pwError = validatePassword(password);
    if (pwError) { setPopup({ type: "error", message: pwError }); return; }
    if (password !== passwordAgain) { setPopup({ type: "error", message: "Passwords do not match" }); return; }
    if (!token) { setPopup({ type: "error", message: "Invalid or missing reset token" }); return; }

    setIsLoading(true);
    try {
      await axios.post(
        "https://api.synk.hu/auth/reset-password",
        { token, newPassword: password },
        { headers: { "Content-Type": "application/json" } }
      );
      setPopup({ type: "success", message: "Password reset successfully" });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[Object.keys(err.response?.data?.errors ?? {})[0]]?.[0] ||
        "Failed to reset password. The link may have expired.";
      setPopup({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupOk = () => {
    if (popup?.type === "success") {
      router.push("/");
    } else {
      setPopup(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 w-full h-full">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Reset Password</h2>
        <p className="text-gray-500 text-sm mb-4 sm:mb-8">Must be 8+ characters with uppercase, lowercase, number &amp; special character.</p>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium text-gray-400 ml-1">New password</label>
            <input
              type="password"
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-400 ml-1">Confirm new password</label>
            <input
              type="password"
              id="confirm-password"
              value={passwordAgain}
              onChange={(e) => setPasswordAgain(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleResetPassword()}
            />
          </div>

          <button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full py-3 sm:py-4 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:opacity-50 text-black font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-black/20 mt-4 cursor-pointer"
          >
            {isLoading ? "Resetting..." : "Reset password"}
          </button>
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-full sm:max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
            {popup.type === "success" ? (
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <p className={`text-center font-semibold text-lg ${popup.type === "success" ? "text-white" : "text-red-400"}`}>
              {popup.message}
            </p>
            <button
              onClick={handlePopupOk}
              className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
