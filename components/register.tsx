import React, { useState, useEffect } from "react";
import axios from "axios";
import "./navbar.css";
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
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible && !registerLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [visible, registerLoading, onClose]);

  const handleRegisterInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");
    setRegisterSuccess(false);

    try {
      const { data } = await axios.post(
        "https://api.synk.hu/auth/register",
        registerData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      // Log in with the registered credentials and cache user data
      const { authService } = await import("../app/services/auth.service");
      await authService.login({
        email: registerData.email,
        password: registerData.password,
      });

      // Fetch and cache user data after successful registration
      await getCurrentUser();

      setRegisterSuccess(true);
      setRegisterError("");
      setRegisterData({ email: "", password: "", firstName: "", lastName: "" });

      setTimeout(() => {
        onClose();
        setRegisterSuccess(false);
      }, 2000);
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
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.response?.data?.error) {
        msg = error.response.data.error;
      } else if (error.response) {
        msg = `An error occurred (${error.response.status})`;
      } else if (error.request) {
        msg = "No connection to server. Check your internet connection.";
      } else {
        msg = error.message || msg;
      }

      setRegisterError(msg);
      setRegisterSuccess(false);
    } finally {
      setRegisterLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2 className="popup-title">Register</h2>
          <button onClick={onClose} className="popup-close">
            ×
          </button>
        </div>

        {registerSuccess && (
          <div className="popup-success">Registration successful!</div>
        )}

        {registerError && (
          <div className="popup-error">
            {registerError.split("\n").map((err, idx) => (
              <div key={idx} style={{ marginBottom: "4px" }}>
                • {err}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit}>
          <div className="popup-input-group">
            <label className="popup-label">Email</label>
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterInputChange}
              className="popup-input"
              required
            />

            <label className="popup-label">Password</label>
            <input
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterInputChange}
              className="popup-input"
              required
            />

            <label className="popup-label">First name</label>
            <input
              type="text"
              name="firstName"
              value={registerData.firstName}
              onChange={handleRegisterInputChange}
              className="popup-input"
              required
            />

            <label className="popup-label">Last name</label>
            <input
              type="text"
              name="lastName"
              value={registerData.lastName}
              onChange={handleRegisterInputChange}
              className="popup-input"
              required
            />
          </div>

          <button
            type="submit"
            className="popup-primary-button"
            disabled={registerLoading}
          >
            {registerLoading ? "Registering..." : "Register"}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="popup-secondary-button"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
}
