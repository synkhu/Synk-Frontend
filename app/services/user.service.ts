"use client";

import axios from "axios";
import { authService } from "./auth.service";
import { cacheService } from "./cache.service";

const API_URL = "https://api.synk.hu";

// Create a separate axios instance for S3 uploads without global auth headers
const s3Axios = axios.create();

export interface CurrentUser {
  id?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  profilePictureUrl?: string | null;
  emailVerified?: boolean;
  [key: string]: any;
}

const getToken = () => authService.getToken();

const USER_CACHE_KEY = "current_user";

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = getToken();
  if (!token) return null;

  // Check cache first
  const cachedUser = cacheService.get<CurrentUser>(USER_CACHE_KEY);
  if (cachedUser) {
    return cachedUser;
  }

  const { data } = await axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Cache the user data for 1 hour
  const user = data as CurrentUser;
  cacheService.set(USER_CACHE_KEY, user, cacheService.USER_CACHE_TTL);

  return user;
};

/**
 * Get cached user data without making API calls
 */
export const getCachedUser = (): CurrentUser | null => {
  return cacheService.get<CurrentUser>(USER_CACHE_KEY);
};

/**
 * Clear the cached user data
 */
export const clearUserCache = (): void => {
  cacheService.remove(USER_CACHE_KEY);
};

export const updateUserProfile = async (update: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profilePictureUrl?: string | null;
}) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  // Clear cache before updating
  clearUserCache();

  await axios.patch(`${API_URL}/users/me`, update, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return await getCurrentUser();
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  // Clear cache before changing password
  clearUserCache();

  await axios.patch(
    `${API_URL}/users/me/password`,
    { oldPassword, newPassword },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found.");

  const { data } = await axios.post(
    `${API_URL}/users/me/profile-picture`,
    {
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const uploadUrl: string | undefined =
    data.uploadUrl || data.upload_url || data.url;
  const profilePictureUrl: string | undefined =
    data.profilePictureUrl ||
    data.profile_picture_url ||
    data.fileUrl ||
    data.file_url ||
    data.publicUrl ||
    data.url;

  if (!uploadUrl || !profilePictureUrl) {
    throw new Error("Invalid profile picture upload response");
  }

  // Upload directly to S3 using pre-signed URL with separate axios instance
  await s3Axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  return profilePictureUrl;
};
