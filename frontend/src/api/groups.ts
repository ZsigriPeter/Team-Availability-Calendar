// api/groups.ts
import { getAuthHeaders } from "./authHeaders";

export async function createGroup(name: string) {
  await fetch("/api/groups/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
}

export async function searchGroups(query: string) {
  const res = await fetch(`/api/groups/?search=${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function joinGroup(groupId: number) {
  await fetch(`/api/groups/${groupId}/join/`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}

export async function leaveGroup(groupId: number) {
  await fetch(`/api/groups/${groupId}/leave/`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}



  