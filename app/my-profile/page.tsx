"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  updateUserProfile,
  changePassword,
  uploadProfilePicture,
  clearUserCache,
  type CurrentUser,
} from "../services/user.service";
import { authService } from "../services/auth.service";
import axios from "axios";

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [pictureStatus, setPictureStatus] = useState<string | null>(null);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCurrentUser();
        if (!data) {
          setError("You must be logged in to view this page.");
          setUser(null);
        } else {
          setUser(data);
          setFirstName((data.firstName as string) || "");
          setLastName((data.lastName as string) || "");
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        setError(err.response?.data?.message || "Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("verification-token");
    if (!token) return;

    const verifyEmail = async () => {
      try {
        await axios.post(
          "https://api.synk.hu/auth/verify-email",
          { token },
          { headers: { "Content-Type": "application/json" } },
        );
        clearUserCache();
        const freshUser = await getCurrentUser();
        if (freshUser) setUser(freshUser);
        setVerificationStatus("Success! Your email has been verified.");
        // Remove the token from the URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete("verification-token");
        window.history.replaceState({}, "", url.toString());
      } catch (err: any) {
        console.error("Failed to verify email:", err);
        setVerificationStatus(
          err.response?.data?.message || "Failed to verify email. The link may be expired.",
        );
      }
    };

    verifyEmail();
  }, []);

  const fullName = () => {
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    return user?.email || "User";
  };

  const handleChangePassword = async () => {
    setPasswordStatus(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordStatus("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("New passwords do not match.");
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordStatus("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Failed to change password:", err);
      setPasswordStatus(err.response?.data?.message || "Failed to change password.");
    }
  };

  const handleVerifyEmail = async () => {
    setVerificationStatus(null);
    try {
      await authService.sendVerificationEmail();
      setVerificationStatus("Success! Verification email sent.");
    } catch (err: any) {
      console.error("Failed to send verification email:", err);
      setVerificationStatus(
        err.response?.data?.message || "Failed to send verification email.",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Access Denied</h1>
          <p className="text-gray-400">{error || "You must be logged in to view this page."}</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">My Profile</h1>
        <p className="text-gray-500">Manage your account settings and profile preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Overview */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center space-y-6">
            <div 
              className="relative group cursor-pointer inline-block mx-auto"
              onClick={() => document.getElementById("profile-picture-input")?.click()}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-300">
                {profilePreview || user.profilePictureUrl ? (
                  <img
                    src={profilePreview || (user.profilePictureUrl as string)}
                    alt={fullName()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white uppercase italic">
                    {user.email?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>

            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                setProfilePreview(URL.createObjectURL(file));
                try {
                  const url = await uploadProfilePicture(file);
                  const updated = await updateUserProfile({ profilePictureUrl: url });
                  setUser(updated);
                  setPictureStatus("Success! Your picture has been updated.");
                } catch (err: any) {
                  setPictureStatus("Failed to update picture.");
                  setProfilePreview(null);
                }
              }}
            />

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white truncate">{fullName()}</h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>

            {!user.emailVerified && (
              <div className="flex justify-center pt-2">
                <div
                  className="flex items-center space-x-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20"
                  title="Email not verified"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Unverified
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest rounded-full">
                {user.role || "Member"}
              </span>
            </div>
          </div>
          
          {!user.emailVerified && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] p-6 text-center space-y-3">
              <h4 className="text-white font-bold text-sm">Verify your email</h4>
              <p className="text-xs text-gray-400">
                Please verify your email to access all features.
              </p>
              <button
                onClick={handleVerifyEmail}
                className="w-full py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
              >
                Send Verification Email
              </button>
              {verificationStatus && (
                <p
                  className={`text-xs ${verificationStatus.includes("Success") ? "text-green-400" : "text-red-400"}`}
                >
                  {verificationStatus}
                </p>
              )}
            </div>
          )}

          {user.emailVerified && verificationStatus?.includes("Success") && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-[2.5rem] p-6 text-center space-y-2">
              <p className="text-sm text-green-400 font-semibold">{verificationStatus}</p>
            </div>
          )}

          {(pictureStatus || profileStatus) && (
            <div className={`p-4 rounded-2xl border text-sm animate-in fade-in slide-in-from-top-2 ${
              (pictureStatus?.includes("Success") || profileStatus?.includes("Success")) 
                ? "bg-green-500/5 border-green-500/20 text-green-400" 
                : "bg-white/5 border-white/10 text-gray-400"
            }`}>
              {pictureStatus || profileStatus}
            </div>
          )}
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-8">
          {/* Personal Info */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Personal Information</h3>
              {!isEditingName && (
                <button 
                  onClick={() => { setIsEditingName(true); setEditFirstName(firstName); setEditLastName(lastName); }}
                  className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">First Name</p>
                {isEditingName ? (
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                ) : (
                  <p className="px-4 py-3 bg-white/5 border border-transparent text-white font-medium rounded-2xl">{firstName || "—"}</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Last Name</p>
                {isEditingName ? (
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                ) : (
                  <p className="px-4 py-3 bg-white/5 border border-transparent text-white font-medium rounded-2xl">{lastName || "—"}</p>
                )}
              </div>
            </div>

            {isEditingName && (
              <div className="flex space-x-4 pt-2">
                <button
                  onClick={async () => {
                    setProfileStatus(null);
                    try {
                      const updated = await updateUserProfile({ firstName: editFirstName || null, lastName: editLastName || null });
                      setUser(updated);
                      setFirstName(editFirstName);
                      setLastName(editLastName);
                      setIsEditingName(false);
                      setProfileStatus("Success! Name updated.");
                    } catch (err) {
                      setProfileStatus("Failed to update name.");
                    }
                  }}
                  className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-6 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </section>

          {/* Security */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Security & Password</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleChangePassword}
                disabled={!oldPassword || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black disabled:bg-white/5 disabled:text-gray-600 font-bold rounded-2xl transition-all"
              >
                Update Password
              </button>
              {passwordStatus && (
                <p className={`text-sm font-medium ${passwordStatus.includes("Success") ? "text-green-400" : "text-gray-500"}`}>
                  {passwordStatus}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
