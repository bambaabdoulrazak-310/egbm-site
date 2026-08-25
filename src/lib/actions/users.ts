"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { hashPassword, generateTemporaryPassword } from "@/lib/password";

export interface UserFormState {
  error?: string;
  success?: boolean;
  generatedPassword?: string;
  generatedEmail?: string;
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

  if (!name || !email) {
    return { error: "Nom et email requis." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "GESTIONNAIRE" },
  });

  revalidatePath("/espace-entreprise/utilisateurs");
  return { success: true, generatedPassword: temporaryPassword, generatedEmail: email };
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
