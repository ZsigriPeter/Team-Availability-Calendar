// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '../api/userData';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

interface UserContextType {
  isLoggedIn: boolean;
  userName: string;
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

  function hasAccessToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }
  
const loginFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

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
    
    setUserName(user.displayName || "Unknown");
    setIsLoggedIn(true);
  } catch (err) {
    console.error("Google login error:", err);
  }
};

const logoutFirebase = async () => {
  await signOut(auth);
  localStorage.removeItem('accessToken');
  setIsLoggedIn(false);
  setUserName('');
  navigate('/login');
};

  const login = async () => {
  try {
    const data = await getUserData(navigate);
    setUserName(data.username);
    setIsLoggedIn(true);
  } catch (err) {
    console.error('Failed to fetch user data:', err);
  }
};

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/login');
  };

  useEffect(() => {
    if (isLoggedIn) {
      login();
    }
  }, []);

  return (
    <UserContext.Provider value={{ isLoggedIn, userName, login, logout, loginFirebase, logoutFirebase }}>
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

