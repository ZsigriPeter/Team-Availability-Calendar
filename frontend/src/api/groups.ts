// api/groups.ts
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { getAuthHeaders } from "./authHeaders";
import { NavigateFunction } from "react-router-dom";

export async function createGroup(name: string, navigate: NavigateFunction) {
  await fetchWithAuth("/api/groups/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  }, navigate);
}

export async function searchGroups(query: string, navigate: NavigateFunction) {
  const res = await fetchWithAuth(`/api/groups/?search=${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, navigate);
  return res.json();
}

export async function joinGroup(groupId: number, navigate: NavigateFunction) {
  await fetchWithAuth(`/api/groups/${groupId}/join/`, {
    method: "POST",
    headers: getAuthHeaders(),
  }, navigate);
}

export async function leaveGroup(groupId: number, navigate: NavigateFunction) {
  await fetchWithAuth(`/api/groups/${groupId}/leave/`, {
    method: "POST",
    headers: getAuthHeaders(),
  }, navigate);
}

export async function getMyGroups(navigate: NavigateFunction) {
  const res = await fetchWithAuth("/api/groups/my-groups/", {
    method: "GET",
    headers: getAuthHeaders(),
  }, navigate);
  return res.json();
}
