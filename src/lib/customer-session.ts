import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export const CUSTOMER_SESSION_COOKIE = "egbm_client_session";
const CUSTOMER_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 jours

export interface CustomerSessionPayload {
  sub: string;
  name: string;
  email: string;
}

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET n'est pas défini.");
  }
  return new TextEncoder().encode(secret);
}

export async function createCustomerSession(payload: CustomerSessionPayload) {
  const token = await new SignJWT({ name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${CUSTOMER_SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_DURATION_SECONDS,
  });
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}
