import { createHmac, timingSafeEqual } from "node:crypto";
import type { User } from "@/lib/types";

// PROVIDED IN FULL — you don't need to change anything in this file.
//
// A deliberately simple stand-in for real auth (in the real product this is AWS Cognito).
// A token is `userId.expiry.signature`, signed with an HMAC so it can't be forged client-side.
// Read it if you're curious; it's a compact example of how a signed token works.

const SECRET = "encodr-lite-dev-secret-not-for-production";
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours — long enough that it won't expire mid-exercise

/** The one hard-coded user. Credentials are in the README. */
const USERS: (User & { password: string })[] = [
  { id: "u_demo", email: "demo@encodr.dev", name: "Demo User", password: "password123" },
];

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function authenticate(email: string, password: string): User | null {
  const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return null;
  const { password: _pw, ...safe } = user;
  return safe;
}

export function issueToken(userId: string): string {
  const payload = `${userId}.${Date.now() + TOKEN_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

/** Verify a token and return the userId inside it, or null if it's invalid or expired. */
export function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiry, signature] = parts;

  const expected = sign(`${userId}.${expiry}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (Number(expiry) < Date.now()) return null;
  return userId;
}

/** Pull the bearer token off a request and return the userId it belongs to, or null. */
export function getUserIdFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyToken(header.slice("Bearer ".length));
}
