import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (error) {
          console.error("Session verification failed:", error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please check your credentials." 
      };
    }
  };

  const register = async (payload) => {
    try {
      const res = await api.post("/auth/register", payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
