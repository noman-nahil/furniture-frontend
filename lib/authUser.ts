/**
 * Canonical AuthUser shape for the frontend and helpers to map backend user
 * documents ({ _id, name, email, role }) from /auth/login and /auth/me.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type ApiUserLike = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

/** Map a backend user document to AuthUser. Returns null if required fields are missing. */
export function mapApiUserToAuthUser(raw: ApiUserLike | null | undefined): AuthUser | null {
  if (!raw) return null;

  const id = raw._id ?? raw.id;
  if (!id || !raw.role) return null;

  return {
    id,
    name: raw.name ?? raw.email ?? "",
    email: raw.email ?? "",
    role: raw.role,
  };
}

/**
 * Parse GET /auth/me (flat user) or optional { data: user } wrapper.
 * Also accepts a nested login payload shape when passed the full response body.
 */
export function parseAuthUserFromApiResponse(body: unknown): AuthUser | null {
  if (!body || typeof body !== "object") return null;

  const record = body as { data?: unknown; user?: unknown };

  const candidate = record.data ?? record.user ?? body;
  if (!candidate || typeof candidate !== "object") return null;

  return mapApiUserToAuthUser(candidate as ApiUserLike);
}
