// src/api/userData.ts

import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { NavigateFunction } from "react-router-dom";


export async function getUserData( navigate: NavigateFunction) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No auth token found');
  }

  try {
    const response = await fetchWithAuth('/api/user-data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, navigate,);

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}
