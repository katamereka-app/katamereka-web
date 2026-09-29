"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api-client";

export type UserRole = "customer" | "bisnis";

export interface UserProfile {
  id?: string;
  name: string;
  username: string;
  email: string;
  initials: string;
  joinedDate: string;
  verified: boolean;
  role: UserRole;
  status?: string;
  accessToken?: string;
  reviewCount: number;
  helpfulCount: number;
  businessCount: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  accessToken?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, pass: string, role?: UserRole, otp?: string) => Promise<AuthResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResponse>;
  getUsers: () => Promise<{ success: boolean; message: string; data?: any[] }>;
  logout: () => void;
}

const defaultUser: UserProfile = {
  name: "Dewi Lestari",
  username: "dewilestari",
  email: "dewi.lestari@gmail.com",
  initials: "DL",
  joinedDate: "Jan 2024",
  verified: true,
  role: "customer",
  reviewCount: 28,
  helpfulCount: 146,
  businessCount: 21,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: async () => ({ success: false, message: "" }),
  signup: async () => ({ success: false, message: "" }),
  changePassword: async () => ({ success: false, message: "" }),
  getUsers: async () => ({ success: false, message: "" }),
  logout: () => {},
});

// Lightweight, non-sensitive marker cookie so middleware (edge, no access to
// localStorage) can tell a session exists and gate /dashboard server-side.
// The real credential stays in localStorage's accessToken as before.
function setSessionCookie() {
  try {
    document.cookie = "km_session=1; path=/; max-age=2592000; SameSite=Lax";
  } catch (e) {
    // ignore
  }
}

function clearSessionCookie() {
  try {
    document.cookie = "km_session=; path=/; max-age=0; SameSite=Lax";
  } catch (e) {
    // ignore
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("katamereka_active_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({
          ...parsed,
          role: parsed.role || "customer",
        });
        setIsLoggedIn(true);
        setSessionCookie();
      }
    } catch (e) {
      // Ignore fallback
    }
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    if (!email || !pass || pass.length < 6) {
      return { success: false, message: "Email atau password salah" };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Email atau password salah",
        };
      }

      const returnedUser = data.user || {};
      const lowerEmail = email.trim().toLowerCase();

      // Determine user role (check API response first, then localStorage registered_user)
      let userRole: UserRole = "customer";
      if (returnedUser.role === "bisnis" || returnedUser.role === "BISNIS") {
        userRole = "bisnis";
      } else {
        try {
          const storedReg = localStorage.getItem(`registered_user_${lowerEmail}`);
          if (storedReg) {
            const parsedReg = JSON.parse(storedReg);
            if (parsedReg.role === "bisnis") {
              userRole = "bisnis";
            }
          } else {
            const lastReg = localStorage.getItem("last_registered_user");
            if (lastReg) {
              const parsedLast = JSON.parse(lastReg);
              if (parsedLast.email?.toLowerCase() === lowerEmail && parsedLast.role === "bisnis") {
                userRole = "bisnis";
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }

      const userName = returnedUser.name || email.split("@")[0];
      const initials = userName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const loadedUser: UserProfile = {
        id: returnedUser.id || "76157bdb-1804-4752-83ae-80ab3fb699df",
        name: userName,
        username: lowerEmail.split("@")[0].toLowerCase().replace(/\s+/g, ""),
        email: returnedUser.email || lowerEmail,
        initials: initials || "U",
        joinedDate: "Sep 2026",
        verified: true,
        role: userRole,
        status: returnedUser.status || "ACTIVE",
        accessToken: data.accessToken,
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: userRole === "bisnis" ? 1 : 0,
      };

      setUser(loadedUser);
      setIsLoggedIn(true);
      setSessionCookie();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      localStorage.setItem("katamereka_active_user", JSON.stringify(loadedUser));

      return {
        success: true,
        message: data.message || "Login berhasil",
        user: loadedUser,
        accessToken: data.accessToken,
      };
    } catch (e) {
      // Fallback local logic if network error
      const namePart = email.split("@")[0] || "User";
      const initials = namePart.substring(0, 2).toUpperCase();
      const lowerEmail = email.trim().toLowerCase();

      let userRole: UserRole = "customer";
      try {
        const storedReg = localStorage.getItem(`registered_user_${lowerEmail}`);
        if (storedReg) {
          const parsedReg = JSON.parse(storedReg);
          if (parsedReg.role === "bisnis") {
            userRole = "bisnis";
          }
        }
      } catch (err) {
        // ignore
      }

      const fallbackUser: UserProfile = {
        id: "76157bdb-1804-4752-83ae-80ab3fb699df",
        name: namePart,
        username: namePart.toLowerCase(),
        email: email,
        initials: initials,
        joinedDate: "Sep 2026",
        verified: true,
        role: userRole,
        status: "ACTIVE",
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: userRole === "bisnis" ? 1 : 0,
      };

      setUser(fallbackUser);
      setIsLoggedIn(true);
      setSessionCookie();
      localStorage.setItem("katamereka_active_user", JSON.stringify(fallbackUser));

      return {
        success: true,
        message: "Login berhasil",
        user: fallbackUser,
      };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole = "customer",
    otp?: string
  ): Promise<AuthResponse> => {
    if (!name || !email || !pass || pass.length < 6) {
      return { success: false, message: "Semua bidang wajib diisi dengan valid" };
    }

    const lowerEmail = email.trim().toLowerCase();

    // Save registered user profile including selected role in localStorage
    const regUserData = {
      name: name.trim(),
      email: lowerEmail,
      role: role,
    };
    try {
      localStorage.setItem(`registered_user_${lowerEmail}`, JSON.stringify(regUserData));
      localStorage.setItem("last_registered_user", JSON.stringify(regUserData));
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: lowerEmail,
          password: pass,
          role: role,
          otp: otp?.trim() || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = "Gagal melakukan registrasi";
        if (data.message) {
          if (Array.isArray(data.message)) {
            errorMsg = data.message.join(". ");
          } else {
            errorMsg = String(data.message);
          }
        }
        return {
          success: false,
          message: errorMsg,
        };
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      return {
        success: true,
        message: data.message || "Registrasi berhasil",
        accessToken: data.accessToken,
      };
    } catch (e) {
      return {
        success: false,
        message: "Gagal memproses registrasi ke server",
      };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<AuthResponse> => {
    try {
      let token = localStorage.getItem("accessToken");
      if (!token && user?.accessToken) {
        token = user.accessToken;
      }
      // Demo fallback token if user hasn't logged in yet
      if (!token) {
        token = "mock_access_token_demo";
      }

      const res = await fetch("/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message === "Unauthorized token missing"
            ? "Silakan masuk (login) terlebih dahulu untuk mengubah kata sandi."
            : (data.message || "Gagal mengubah password"),
        };
      }
      return { success: true, message: data.message || "Password berhasil diperbarui" };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan koneksi" };
    }
  };

  const getUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/users", {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Gagal mengambil data user" };
      }
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan koneksi" };
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    clearSessionCookie();
    try {
      localStorage.removeItem("katamereka_active_user");
      localStorage.removeItem("accessToken");
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || defaultUser,
        isLoggedIn,
        login,
        signup,
        changePassword,
        getUsers,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
