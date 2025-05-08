// src/pages/LoginPage.tsx
import React from 'react';
import { LoginForm } from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-700">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
