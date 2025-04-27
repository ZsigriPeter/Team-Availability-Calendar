// src/api/userId.ts
import { getAuthHeaders } from "./authHeaders";
  
  export async function getUserId(userName: string) {
    const response = await fetch(`/api/user/${userName}`, {
        headers: getAuthHeaders(),
      });
  
    const result = await response.json();
  
    if (!response.ok) {
      throw new Error(result?.detail || 'No User found');
    }
  
    return result;
  }
  