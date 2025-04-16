// src/pages/RegisterPage.tsx
import React from 'react';
import { RegisterForm } from '@/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
