// src/components/RegisterForm.tsx
import React, { useState } from 'react';
import { registerUser } from '@/api/registerUser';

export const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await registerUser({ username, password });
      setStatus('success');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setStatus(err.message || 'Registration failed');
    }
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="max-w-md mx-auto space-y-4 p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700"
>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register</h2>

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
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded dark:bg-blue-700 dark:hover:bg-blue-800"
  >
    Register
  </button>

  {status === 'success' && (
    <p className="text-green-600 dark:text-green-400">User registered successfully!</p>
  )}
  {status && status !== 'success' && (
    <p className="text-red-600 dark:text-red-400">{status}</p>
  )}
</form>

  );
};
