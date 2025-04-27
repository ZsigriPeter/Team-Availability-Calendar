// src/api/authHeaders.ts
export function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }