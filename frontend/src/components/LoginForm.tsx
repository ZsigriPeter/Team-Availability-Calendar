// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { loginUser } from '@/api/loginUser';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const tokens = await loginUser({ username, password });
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      setStatus('success');
      // Optionally redirect to dashboard or availability page
    } catch (err: any) {
      setStatus(err.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold">Login</h2>

      <div>
        <label className="block mb-1 text-sm font-medium">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Login
      </button>

      {status === 'success' && (
        <p className="text-green-600">Login successful!</p>
      )}
      {status && status !== 'success' && (
        <p className="text-red-600">{status}</p>
      )}
    </form>
  );
};
