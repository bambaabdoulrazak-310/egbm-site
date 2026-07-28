import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { AdminUtilisateursClient } from "@/components/entreprise/AdminUtilisateursClient";

export const metadata: Metadata = { title: "Utilisateurs — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminUtilisateursPage() {
  const session = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return <AdminUtilisateursClient users={users} currentUserId={session.sub} />;
}
