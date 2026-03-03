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
  const [navbarOpen, setNavbarOpen] = useState(true);

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

  const [isEditingName, setIsEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

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
          err.response?.data?.message || "Failed to load profile information.",
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
          "Failed to change password.",
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
          "Failed to upload profile picture.",
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
          <div
            className="min-h-screen flex items-center justify-center w-full"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
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
          <div
            className="min-h-screen flex items-center justify-center w-full"
            style={{
              background:
                "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
            }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">
                My Profile
              </h1>
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
        <div
          className="min-h-screen py-8 px-4 w-full"
          style={{
            background:
              "radial-gradient(circle at 0 0, #4c3073 0%, #2d1b4e 32%, #120626 80%)",
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white mb-4">My Profile</h1>

            {/* Overview card */}
            <div className="rounded-2xl border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/40 via-[#120626]/80 to-[#120626]/90 shadow-[0_22px_70px_rgba(0,0,0,0.88)] p-6 flex flex-col md:flex-row gap-6 items-center">
              <div
                className="relative group cursor-pointer"
                onClick={() =>
                  document.getElementById("profile-picture-input")?.click()
                }
              >
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
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-white text-sm font-semibold">Edit</span>
                </div>
              </div>
              {/* Hidden file input */}
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;

                  setProfileFile(file);
                  setProfilePreview(URL.createObjectURL(file));
                  setPictureStatus(null);

                  try {
                    const url = await uploadProfilePicture(file);
                    const updated = await updateUserProfile({
                      profilePictureUrl: url,
                    });
                    setUser(updated);
                    setPictureStatus("Profile picture updated successfully.");
                    setProfileFile(null);
                  } catch (err: any) {
                    console.error("Failed to upload profile picture:", err);
                    setPictureStatus(
                      err.response?.data?.message ||
                        err.response?.data?.errors ||
                        "Failed to upload profile picture.",
                    );
                    setProfilePreview(null);
                  }
                }}
              />

              <div className="flex-1 space-y-1">
                {!isEditingName ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-white">
                      {fullName()}
                    </p>
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setEditFirstName(firstName);
                        setEditLastName(lastName);
                        setProfileStatus(null);
                      }}
                      className="text-purple-300 hover:text-purple-200 transition-colors p-1"
                      title="Edit name"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="px-3 py-1.5 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="px-3 py-1.5 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e] text-sm"
                      />
                      <button
                        onClick={async () => {
                          if (!user) return;
                          setProfileStatus(null);
                          try {
                            const updated = await updateUserProfile({
                              firstName: editFirstName || null,
                              lastName: editLastName || null,
                            });
                            setUser(updated);
                            setFirstName(editFirstName);
                            setLastName(editLastName);
                            setIsEditingName(false);
                            setProfileStatus("Name updated successfully.");
                          } catch (err: any) {
                            console.error("Failed to update name:", err);
                            setProfileStatus(
                              err.response?.data?.message ||
                                "Failed to update name.",
                            );
                          }
                        }}
                        className="bg-[#2d1b4e] hover:bg-[#4c3073] text-white px-4 py-1.5 rounded-lg font-semibold transition text-sm whitespace-nowrap"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setProfileStatus(null);
                        }}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1"
                        title="Cancel"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-gray-300">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#2d1b4e] text-purple-200 border border-[#4c3073]">
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Profile status message */}
            {profileStatus && (
              <div className="rounded-lg border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/40 via-[#120626]/80 to-[#120626]/90 p-4">
                <p className="text-sm text-gray-300">{profileStatus}</p>
              </div>
            )}

            {/* Change Password section */}
            <div className="rounded-2xl border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/40 via-[#120626]/80 to-[#120626]/90 shadow-[0_22px_70px_rgba(0,0,0,0.88)] p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#4c3073] rounded-lg bg-[#120626] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2d1b4e]"
              />
              <button
                onClick={handleChangePassword}
                className="w-full bg-[#2d1b4e] hover:bg-[#4c3073] text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Change Password
              </button>

              {passwordStatus && (
                <p className="text-sm mt-1 text-gray-300">{passwordStatus}</p>
              )}
            </div>

            {/* Picture status message */}
            {pictureStatus && (
              <div className="rounded-lg border border-[#4c3073]/60 bg-gradient-to-br from-[#2d1b4e]/40 via-[#120626]/80 to-[#120626]/90 p-4">
                <p className="text-sm text-gray-300">{pictureStatus}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
