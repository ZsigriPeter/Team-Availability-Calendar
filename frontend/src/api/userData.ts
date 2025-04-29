// src/api/userData.ts
export async function getUserData() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No auth token found');
  }

  try {
    const response = await fetch('/api/user-data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error; // rethrow to handle it at a higher level
  }
}
