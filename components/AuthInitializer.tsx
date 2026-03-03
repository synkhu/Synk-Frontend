"use client";

import { useEffect } from "react";
import { authService } from "../app/services/auth.service";
import { getCurrentUser } from "../app/services/user.service";

export default function AuthInitializer() {
  useEffect(() => {
    // Check if token exists and is still valid
    const session = authService.getSession();

    if (session && !authService.isSessionValid()) {
      // Token is expired, log the user out
      authService.logout();
      const event = new CustomEvent("session-expired");
      window.dispatchEvent(event);
    } else if (session) {
      // Token is valid, initialize and cache user data
      authService.initialize();
      // Cache user data on app initialization
      getCurrentUser().catch((error) => {
        console.error("Failed to cache user data on init:", error);
      });
    }
  }, []);

  return null;
}
