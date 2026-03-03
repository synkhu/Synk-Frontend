"use client";

import { useEffect } from "react";
import { authService } from "../app/services/auth.service";

export default function AuthInitializer() {
  useEffect(() => {
    // Check if token exists and is still valid
    const session = authService.getSession();

    if (session && !authService.isSessionValid()) {
      // Token is expired, log the user out
      authService.logout();
      const event = new CustomEvent("session-expired");
      window.dispatchEvent(event);
    } else {
      // Token is valid, initialize normally
      authService.initialize();
    }
  }, []);

  return null;
}
