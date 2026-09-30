/**
 * Minimal HS256 JWT verification, dependency-free so it runs in the
 * middleware Edge runtime (Web Crypto API only — no Node `crypto`/`jsonwebtoken`).
 * Mirrors the token the API signs in api_service/src/auth/auth.service.ts.
 *
 * IMPORTANT: JWT_SECRET here must be the exact same value as the API's
 * JWT_SECRET, or every token will fail verification. The dev fallback below
 * matches api_service/src/auth/jwt-secret.util.ts's fallback so local dev
 * works out of the box without a .env — production must set both.
 */

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";

export interface SessionTokenPayload {
  sub: string;
  email: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  businessRole?: "OWNER" | "ADMIN" | "MEMBER" | null;
  exp?: number;
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeToString(base64Url: string): string {
  return new TextDecoder().decode(base64UrlToUint8Array(base64Url));
}

export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const secret = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = base64UrlToUint8Array(signatureB64);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature as BufferSource,
      new TextEncoder().encode(`${headerB64}.${payloadB64}`) as BufferSource
    );
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecodeToString(payloadB64)) as SessionTokenPayload;

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
