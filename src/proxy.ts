import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "egbm_session";

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

// Vérification rapide de présence de session pour éviter le rendu de l'espace
// entreprise à un visiteur non connecté. Chaque page/Server Action revérifie
// la session et le rôle indépendamment (voir src/lib/auth-guard.ts) : ce
// proxy est une première ligne de défense, pas la seule.
export async function proxy(request: NextRequest) {
  if (!(await hasValidSession(request))) {
    const url = new URL("/connexion", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/espace-entreprise/:path*"],
};
