import { jwtVerify, type JWTPayload } from "jose";

/** JWT access-token claims signed by the Express API (authService.buildTokenPayload). */
export type AccessTokenPayload = JWTPayload & {
  sub: string;
  role: string;
  email?: string;
  name?: string;
};

function isAccessTokenPayload(value: JWTPayload): value is AccessTokenPayload {
  return (
    typeof value.sub === "string" &&
    value.sub.length > 0 &&
    typeof value.role === "string" &&
    value.role.length > 0
  );
}

/**
 * Verify an access JWT locally (Edge-safe). Mirrors backend verifyAccessToken().
 * Returns null when the token is invalid, expired, or JWT_SECRET is missing.
 */
export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[verifyAccessToken] JWT_SECRET is not set");
    return null;
  }

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (!isAccessTokenPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
