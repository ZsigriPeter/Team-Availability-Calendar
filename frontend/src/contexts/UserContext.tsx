// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '../api/userData'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

interface UserContextType {
  isLoggedIn: boolean;
  userName: string;
  login: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('accessToken'));
  const [userName, setUserName] = useState<string>('');

  const login = async () => {
    setIsLoggedIn(true);
    try {
      const data = await getUserData(navigate);
      setUserName(data.username);
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
    <UserContext.Provider value={{ isLoggedIn, userName, login, logout }}>
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
