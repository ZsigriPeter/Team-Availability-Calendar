// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '../api/userData';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

interface UserContextType {
  isLoggedIn: boolean;
  userName: string;
  userId?: number;
  login: () => Promise<void>;
  logout: () => void;
  loginFirebase: () => Promise<void>;
  logoutFirebase: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => hasAccessToken());
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<number | undefined>(undefined);

  function hasAccessToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  const loginFirebase = async () => {
    try {
      provider.addScope("https://www.googleapis.com/auth/calendar.events");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();

      const credential = GoogleAuthProvider.credentialFromResult(result);

      const accessToken = credential?.accessToken;

      const res = await fetch("/api/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Backend authentication failed");
      }

      const data = await res.json();

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      if (accessToken) {
        localStorage.setItem("googleAccessToken", accessToken);
      }

      setUserName(user.displayName || "Unknown");
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Google login error:", err);
    }
  };


  const logoutFirebase = async () => {
    await signOut(auth);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('googleAccessToken');
    setIsLoggedIn(false);
    setUserName('');
    setUserId(undefined);
    navigate('/login');
  };

  const login = async () => {
    try {
      const data = await getUserData(navigate);
      setUserName(data.username);
      setUserId(data.id);
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('googleAccessToken');
    setIsLoggedIn(false);
    setUserName('');
    setUserId(undefined);
    navigate('/login');
  };

  useEffect(() => {
    if (isLoggedIn) {
      login();
    }
  }, []);

  return (
    <UserContext.Provider value={{ isLoggedIn, userName, userId, login, logout, loginFirebase, logoutFirebase }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

