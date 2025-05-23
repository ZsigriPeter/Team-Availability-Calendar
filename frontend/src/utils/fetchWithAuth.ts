import { NavigateFunction } from "react-router-dom";
import toast from 'react-hot-toast';

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit | undefined,
  navigate: NavigateFunction
) {
  const response = await fetch(input, init);

  if (response.status === 401) {
    toast.error("Session expired. Please log in.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
    return Promise.reject(new Error("Unauthorized"));
  }

  return response;
}