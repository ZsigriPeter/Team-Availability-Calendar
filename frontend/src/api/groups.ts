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

export async function getRoleOfUserInGroup(groupId: number, userId: number, navigate: NavigateFunction) {
  const res = await fetchWithAuth(`/api/group-role/?group_id=${groupId}&user_id=${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, navigate);
  return res.json();
}

export async function deleteGroup(groupId: number, navigate: NavigateFunction) {
  try {
    const res = await fetchWithAuth(`/api/groups/${groupId}/delete/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }, navigate);
    if (res.status === 204) return null;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

export async function fetchMembers(groupId: number, navigate: NavigateFunction) {
  const res = await fetchWithAuth(`/api/groups/${groupId}/members/`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, navigate);
  return res.json();
};
