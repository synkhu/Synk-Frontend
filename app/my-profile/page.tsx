"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import "../page.css";
import {
  getCurrentUser,
  updateUserProfile,
  changePassword,
  uploadProfilePicture,
  CurrentUser,
} from "../services/user.service";

export default function MyProfilePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

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

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

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
        setError(
          err.response?.data?.message ||
            "Failed to load profile information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fullName = () => {
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    return user?.email || "User";
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileStatus(null);
    try {
      const updated = await updateUserProfile({
        firstName: firstName || null,
        lastName: lastName || null,
      });
      setUser(updated);
      setProfileStatus("Profile updated successfully.");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setProfileStatus(
        err.response?.data?.message || "Failed to update profile."
      );
    }
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
      setPasswordStatus(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Failed to change password."
      );
    }
  };

  const handleUploadPicture = async () => {
    if (!profileFile) {
      setPictureStatus("Please select a picture first.");
      return;
    }

    setPictureStatus(null);

    try {
      const url = await uploadProfilePicture(profileFile);

      // Optionally also update profile with the returned URL
      const updated = await updateUserProfile({ profilePictureUrl: url });
      setUser(updated);

      setPictureStatus("Profile picture updated successfully.");
      setProfileFile(null);
      setProfilePreview(null);
    } catch (err: any) {
      console.error("Failed to upload profile picture:", err);
      setPictureStatus(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Failed to upload profile picture."
      );
    }
  };

  if (loading) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div className="min-h-screen flex items-center justify-center w-full" style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}>
            <div className="text-xl text-white">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
        <div className="nav">
          <Navbar
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            navbarOpen={navbarOpen}
            setNavbarOpen={setNavbarOpen}
          />
        </div>
        <div className="content-column">
          <div className="min-h-screen flex items-center justify-center w-full" style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">My Profile</h1>
              <p className="text-gray-300 mb-4">
                {error || "You must be logged in to view this page."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = user.role || "User";
  const profilePictureUrl =
    (user.profilePictureUrl as string | undefined) || undefined;

  return (
    <div className={`main flex ${navbarOpen ? "nav-open" : "nav-closed"}`}>
      <div className="nav">
        <Navbar
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          navbarOpen={navbarOpen}
          setNavbarOpen={setNavbarOpen}
        />
      </div>
      <div className="content-column">
        <div className="min-h-screen py-8 px-4 w-full" style={{ background: "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)" }}>
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white mb-4">My Profile</h1>

            {/* Overview card */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_22px_70px_rgba(0,0,0,0.88)] p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative">
                {profilePictureUrl || profilePreview ? (
                  <img
                    src={profilePreview || profilePictureUrl}
                    alt={fullName()}
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#5a3d8a]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#3a2659] flex items-center justify-center text-3xl font-bold text-purple-200 border-2 border-[#5a3d8a]">
                    {user.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-xl font-semibold text-white">{fullName()}</p>
                <p className="text-gray-300">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-purple-900 text-purple-200 border border-purple-500">
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Profile info form */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_22px_70px_rgba(0,0,0,0.88)] p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Basic information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <p className="px-4 py-2 rounded-lg bg-[#1a0f2e] text-white border border-[#5a3d8a] text-sm">
                  {user.email}
                </p>
              </div>

              {profileStatus && (
                <p className="text-sm mt-1 text-gray-300">{profileStatus}</p>
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                className="mt-2 inline-flex justify-center px-6 py-2 rounded-lg bg-[#4c3073] hover:bg-[#5a3d8a] text-white font-semibold transition"
              >
                Save changes
              </button>
            </div>

            {/* Profile picture section */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_22px_70px_rgba(0,0,0,0.88)] p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Profile picture</h2>

              <div className="flex flex-col md:flex-row items-start gap-4">
                <div>
                  {profilePictureUrl || profilePreview ? (
                    <img
                      src={profilePreview || profilePictureUrl}
                      alt={fullName()}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#5a3d8a]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#3a2659] flex items-center justify-center text-xl font-bold text-purple-200 border-2 border-[#5a3d8a]">
                      {user.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setProfileFile(file);
                      setProfilePreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4c3073] file:text-white hover:file:bg-[#5a3d8a]"
                  />
                  <button
                    type="button"
                    onClick={handleUploadPicture}
                    className="inline-flex justify-center px-6 py-2 rounded-lg bg-[#4c3073] hover:bg-[#5a3d8a] text-white font-semibold transition"
                  >
                    Upload new picture
                  </button>
                  {pictureStatus && (
                    <p className="text-sm text-gray-300 mt-1">{pictureStatus}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-fuchsia-700/40 via-purple-900/80 to-slate-950/90 shadow-[0_22px_70px_rgba(0,0,0,0.88)] p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Change password</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-[#5a3d8a] rounded-lg bg-[#1a0f2e] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4c3073]"
                  />
                </div>
              </div>

              {passwordStatus && (
                <p className="text-sm mt-1 text-gray-300">{passwordStatus}</p>
              )}

              <button
                type="button"
                onClick={handleChangePassword}
                className="mt-2 inline-flex justify-center px-6 py-2 rounded-lg bg-[#4c3073] hover:bg-[#5a3d8a] text-white font-semibold transition"
              >
                Update password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
