import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/session";

async function verifySession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

// Vérification rapide de présence de session pour éviter le rendu de l'espace
// entreprise à un visiteur non connecté. Chaque page/Server Action revérifie
// la session et le rôle indépendamment (voir src/lib/auth-guard.ts) : ce
// proxy est une première ligne de défense, pas la seule.
//
// Le cookie est aussi renouvelé (durée glissante) à chaque requête valide :
// 10 min d'inactivité déconnectent l'utilisateur, mais une utilisation active
// ne l'interrompt jamais.
export async function proxy(request: NextRequest) {
  const payload = await verifySession(request);
  if (!payload) {
    const url = new URL("/connexion", request.url);
    return NextResponse.redirect(url);
  }

  const secret = process.env.AUTH_SECRET!;
  const refreshedToken = await new SignJWT({ name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub!)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));

  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE, refreshedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}

export const config = {
  matcher: ["/espace-entreprise/:path*"],
};
