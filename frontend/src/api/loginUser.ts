// src/api/loginUser.ts
export interface LoginData {
    username: string;
    password: string;
  }
  
  export async function loginUser(data: LoginData) {
    const response = await fetch('/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    const result = await response.json();
  
    if (!response.ok) {
      throw new Error(result?.detail || 'Login failed');
    }
  
    return result;
  }
  