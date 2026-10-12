"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendCustomerPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

export interface CustomerRequestResetState {
  error?: string;
  success?: boolean;
}

export async function requestCustomerPasswordResetAction(
  _prevState: CustomerRequestResetState,
  formData: FormData
): Promise<CustomerRequestResetState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    return { error: "Veuillez renseigner votre email." };
  }

  const customer = await prisma.customer.findUnique({ where: { email } });

  // On ne révèle jamais si l'email existe ou non (évite l'énumération de comptes).
  if (customer) {
    const token = randomBytes(32).toString("hex");
    await prisma.customerResetToken.create({
      data: { customerId: customer.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/compte/reinitialiser-mot-de-passe?token=${token}`;

    try {
      await sendCustomerPasswordResetEmail(email, resetUrl);
    } catch (err) {
      console.error("Échec de l'envoi de l'email de réinitialisation (client) :", err);
      return { error: "Échec de l'envoi de l'email. Réessayez plus tard." };
    }
  }

  return { success: true };
}

export interface CustomerResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetCustomerPasswordAction(
  _prevState: CustomerResetPasswordState,
  formData: FormData
): Promise<CustomerResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("nouveauMotdepasse") ?? "");
  const confirmPassword = String(formData.get("confirmerMotdepasse") ?? "");

  if (!token) {
    return { error: "Lien de réinitialisation invalide." };
  }
  if (newPassword.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const resetToken = await prisma.customerResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.customer.update({ where: { id: resetToken.customerId }, data: { passwordHash } }),
    prisma.customerResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
