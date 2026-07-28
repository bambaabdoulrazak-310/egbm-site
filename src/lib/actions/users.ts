"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { hashPassword } from "@/lib/password";

export interface UserFormState {
  error?: string;
  success?: boolean;
}

export async function inviteUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const name = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("motdepasse") ?? "");

  if (!name || !email || password.length < 8) {
    return {
      error:
        "Nom, email et mot de passe requis (mot de passe : 8 caractères minimum).",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "GESTIONNAIRE" },
  });

  revalidatePath("/espace-entreprise/utilisateurs");
  return { success: true };
}

export async function revokeUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || id === admin.sub) return;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role === "ADMINISTRATEUR") return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/espace-entreprise/utilisateurs");
}
