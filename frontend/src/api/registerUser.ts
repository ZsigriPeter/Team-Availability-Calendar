// src/api/registerUser.ts
export interface RegisterData {
    username: string;
    password: string;
  }
  
  export async function registerUser(data: RegisterData) {
    const response = await fetch('/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || 'Registration failed');
    }
  
    return response.json();
  }
  