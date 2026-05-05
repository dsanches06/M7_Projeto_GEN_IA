import { BASE_URL } from "./utils/index.js";

/* Função base de request */
export async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}`);
    }

    if (res.status === 204) return null;

    const data: T = await res.json();
    console.log("API RESPONSE:", data);

    return data;
  } catch (error) {
    console.error("API ERROR:", error);
    return null;
  }
}

/* GET lista */
export async function get<T>(
  endpoint: string,
  sort?: string,
  search?: string,
): Promise<T[]> {
  const params = new URLSearchParams();

  if (sort) params.append("sort", sort);
  if (search) params.append("search", search);

  const query = params.toString();
  const url = query ? `${endpoint}?${query}` : endpoint;

  const data = await request<T[]>(url);
  console.log("API GET LIST RESPONSE:", data);

  return data ?? [];
}

/* GET por ID */
export function getById<T>(
  endpoint: string,
  id: number | string,
): Promise<T | null> {
  return request<T>(`${endpoint}/${id}`);
}

/* CREATE */
export function create<T>(
  endpoint: string,
  payload: Partial<T>,
): Promise<T | null> {
  return request<T>(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/* UPDATE */
export function put<T>(
  endpoint: string,
  id: number | string,
  payload: Partial<T>,
): Promise<T | null> {
  return request<T>(`${endpoint}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/* PATCH */
export function patch<T>(
  endpoint: string,
  id: number | string,
  payload: Partial<T>,
): Promise<T | null> {
  return request<T>(`${endpoint}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/* DELETE */
export async function remove(
  endpoint: string,
  id: number | string,
): Promise<boolean> {
  const res = await request(`${endpoint}/${id}`, {
    method: "DELETE",
  });

  return res !== null;
}


interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  signal?: AbortSignal;
}
