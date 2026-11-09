const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function request<T>(
  input: string,
  init?: RequestInit
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }> {
  const res = await fetch(`${API_URL}${input}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    ...init,
  });

  const body = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: body.error || { code: "REQUEST_FAILED", message: "Request failed" },
    };
  }

  return body as { success: boolean; data?: T };
}

export const documentsApi = {
  create: (title: string) =>
    request<{ document: { id: string; title: string; ownerId: string; role: string; createdAt: string; updatedAt: string } }>("/documents", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  list: () =>
    request<{ documents: Array<{ id: string; title: string; ownerId: string; role: string; createdAt: string; updatedAt: string }>; pagination: { page: number; limit: number; total: number; totalPages: number } }>("/documents", {
      method: "GET",
    }),

  get: (documentId: string) =>
    request<{ document: { id: string; title: string; ownerId: string; role: string; createdAt: string; updatedAt: string } }>(`/documents/${encodeURIComponent(documentId)}`, {
      method: "GET",
    }),

  updateTitle: (documentId: string, title: string) =>
    request<{ document: { id: string; title: string; updatedAt: string } }>(`/documents/${encodeURIComponent(documentId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),

  delete: (documentId: string) =>
    request<null>(`/documents/${encodeURIComponent(documentId)}`, {
      method: "DELETE",
    }),
};

export const membersApi = {
  list: (documentId: string) =>
    request<{ members: Array<{ userId: string; name: string; email: string; role: string }> }>(`/documents/${encodeURIComponent(documentId)}/members`, {
      method: "GET",
    }),

  add: (documentId: string, email: string, role: "editor" | "viewer") =>
    request<{ member: { userId: string; name: string; email: string; role: string } }>(`/documents/${encodeURIComponent(documentId)}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  updateRole: (documentId: string, userId: string, role: "editor" | "viewer") =>
    request<{ member: { userId: string; role: string } }>(`/documents/${encodeURIComponent(documentId)}/members/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  remove: (documentId: string, userId: string) =>
    request<null>(`/documents/${encodeURIComponent(documentId)}/members/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),
};

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string; avatarUrl: string | null } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string; avatarUrl: string | null } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ user: { id: string; name: string; email: string; avatarUrl: string | null } }>("/auth/me", {
      method: "GET",
    }),

  logout: () =>
    request<null>("/auth/logout", {
      method: "POST",
    }),
};
