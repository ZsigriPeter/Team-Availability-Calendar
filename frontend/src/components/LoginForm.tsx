// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { loginUser } from '@/api/loginUser';
import { useUser } from '../contexts/UserContext';
import { FcGoogle } from "react-icons/fc";

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const { login, loginFirebase } = useUser();

  const handleGoogleLogin = async () => {
  setStatus(null);
  try {
    await loginFirebase();
    setStatus('success');
  } catch (err: any) {
    setStatus(err.message || 'Google login failed');
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const tokens = await loginUser({ username, password });
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      setStatus('success');
      await login();
    } catch (err: any) {
      setStatus(err.message || 'Login failed');
    }
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="max-w-md mx-auto space-y-4 p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700"
>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login</h2>

  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
      required
    />
  </div>

  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
      required
    />
  </div>

  <button
    type="submit"
    className="bg-green-600 hover:bg-green-700 w-full text-white px-4 py-2 rounded dark:bg-green-700 dark:hover:bg-green-800"
  >
    Login
  </button>

  <button
  type="button"
  onClick={handleGoogleLogin}
  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md w-full max-w-xs mx-auto transition-colors duration-200 dark:bg-green-700 dark:hover:bg-green-800"
>
  <FcGoogle className="w-5 h-5" />
  Login with Google
</button>


  {status === 'success' && (
    <p className="text-green-600 dark:text-green-400">Login successful!</p>
  )}
  {status && status !== 'success' && (
    <p className="text-red-600 dark:text-red-400">{status}</p>
  )}
</form>

  );
};
