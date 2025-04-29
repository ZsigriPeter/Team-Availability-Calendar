import { NavigateFunction } from "react-router-dom";

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit | undefined,
  navigate: NavigateFunction
) {
  const response = await fetch(input, init);

  if (response.status === 401) {
    alert("Session expired. Please log in.");
    navigate("/login");
    return Promise.reject(new Error("Unauthorized"));
  }

  return response;
}
