"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { hashPassword, verifyPassword } from "@/lib/password";

export interface PasswordFormState {
  error?: string;
  success?: boolean;
}

export interface EmailFormState {
  error?: string;
  success?: boolean;
}

export async function changeEmailAction(
  _prevState: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  const session = await requireSession();

  const newEmail = String(formData.get("nouvelEmail") ?? "")
    .trim()
    .toLowerCase();
  const currentPassword = String(formData.get("motdepasseActuel") ?? "");

  if (!newEmail || !newEmail.includes("@")) {
    return { error: "Veuillez renseigner un email valide." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return { error: "Utilisateur introuvable." };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Mot de passe incorrect." };
  }

  if (newEmail === user.email) {
    return { error: "Cet email est déjà le vôtre." };
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });

  revalidatePath("/espace-entreprise/mon-compte");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await requireSession();

  const currentPassword = String(formData.get("motdepasseActuel") ?? "");
  const newPassword = String(formData.get("nouveauMotdepasse") ?? "");
  const confirmPassword = String(formData.get("confirmerMotdepasse") ?? "");

  if (newPassword.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return { error: "Utilisateur introuvable." };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

export async function toggleNotifyByEmailAction(formData: FormData) {
  const session = await requireSession();
  const notifyByEmail = formData.get("notifyByEmail") === "on";

  await prisma.user.update({
    where: { id: session.sub },
    data: { notifyByEmail },
  });

  revalidatePath("/espace-entreprise/mon-compte");
}
