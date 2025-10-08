import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          localStorage.removeItem("token"); // Clear invalid token
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const token = (response as any)?.token;
      const userDataFromLogin = (response as any)?.user;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (userDataFromLogin) {
        setUser(userDataFromLogin);
        return;
      }

      // Fallback: fetch profile if login response doesn't include user
      if (token) {
        const profile = await authService.getProfile();
        setUser(profile);
        return;
      }

      // If no token or user returned, treat as failure
      throw new Error("Invalid login response: missing token or user");
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to handle in the Login component
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await authService.signup(name, email, password);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};