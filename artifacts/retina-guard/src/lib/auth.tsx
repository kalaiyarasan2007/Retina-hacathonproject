import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

export type Role = "admin" | "doctor" | null;

interface User {
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("retina_auth");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (username: string, role: Role) => {
    const u = { username, role };
    setUser(u);
    localStorage.setItem("retina_auth", JSON.stringify(u));
    setLocation("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("retina_auth");
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
