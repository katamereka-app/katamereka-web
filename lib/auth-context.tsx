"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api-client";

export type UserRole = "customer" | "bisnis";
export type PlatformRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type BusinessMemberRole = "OWNER" | "ADMIN" | "MEMBER" | null;

export interface UserProfile {
  id?: string;
  name: string;
  username: string;
  email: string;
  initials: string;
  joinedDate: string;
  verified: boolean;
  role: UserRole;
  // Signed, server-verified claims — safe to use for UI gating decisions.
  platformRole: PlatformRole;
  businessRole: BusinessMemberRole;
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

const emptyDefaultUser: UserProfile = {
  name: "-",
  username: "-",
  email: "-",
  initials: "-",
  joinedDate: "-",
  verified: false,
  role: "customer",
  platformRole: "USER",
  businessRole: null,
  reviewCount: 0,
  helpfulCount: 0,
  businessCount: 0,
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

function setSessionCookie(token: string) {
  try {
    // The cookie carries the actual signed JWT (not a bare "1" flag) so
    // middleware.ts can cryptographically verify role/businessRole at the
    // edge instead of trusting an unsigned value the client could forge.
    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `km_session=${token}; path=/; max-age=2592000; SameSite=Lax${secure}`;
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
        if (parsed.accessToken) {
          setUser({
            ...parsed,
            role: parsed.role || "customer",
            platformRole: parsed.platformRole || "USER",
            businessRole: parsed.businessRole ?? null,
          });
          setIsLoggedIn(true);
          setSessionCookie(parsed.accessToken);
        }
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

      if (!data.accessToken) {
        return { success: false, message: "Login gagal: server tidak mengembalikan sesi" };
      }

      const returnedUser = data.user || {};
      const lowerEmail = email.trim().toLowerCase();

      // Ground truth comes from the server now — role & businessRole are
      // signed into the JWT (see auth.service.ts), never guessed client-side.
      const platformRole: PlatformRole = returnedUser.role || "USER";
      const businessRole: BusinessMemberRole = returnedUser.businessRole ?? null;
      const userRole: UserRole = businessRole ? "bisnis" : "customer";

      const userName = returnedUser.name || email.split("@")[0];
      const initials = userName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const loadedUser: UserProfile = {
        id: returnedUser.id || "",
        name: userName,
        username: lowerEmail.split("@")[0].toLowerCase().replace(/\s+/g, ""),
        email: returnedUser.email || lowerEmail,
        initials: initials || "-",
        joinedDate: "Sep 2026",
        verified: true,
        role: userRole,
        platformRole,
        businessRole,
        status: returnedUser.status || "ACTIVE",
        accessToken: data.accessToken,
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: businessRole ? 1 : 0,
      };

      setUser(loadedUser);
      setIsLoggedIn(true);
      setSessionCookie(data.accessToken);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("katamereka_active_user", JSON.stringify(loadedUser));

      return {
        success: true,
        message: data.message || "Login berhasil",
        user: loadedUser,
        accessToken: data.accessToken,
      };
    } catch (e) {
      // No fail-open: a network error must never look like a successful
      // login — the old fallback here fabricated a session for any input.
      return { success: false, message: "Terjadi kesalahan koneksi ke server" };
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
        user: user || (isLoggedIn ? null : emptyDefaultUser),
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
