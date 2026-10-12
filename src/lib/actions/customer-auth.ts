"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createCustomerSession, destroyCustomerSession } from "@/lib/customer-session";
import { isLikelySpam } from "@/lib/antispam";

function safeRedirect(path: string) {
  return path.startsWith("/compte") ? path : "/compte";
}

export interface CustomerRegisterState {
  error?: string;
}

export async function customerRegisterAction(
  _prevState: CustomerRegisterState,
  formData: FormData
): Promise<CustomerRegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !phone || !password) {
    return { error: "Veuillez renseigner tous les champs obligatoires." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }
  if (isLikelySpam(formData)) {
    return { error: "Une erreur est survenue. Réessayez." };
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await hashPassword(password);
  const customer = await prisma.customer.create({
    data: { name, email, phone, passwordHash },
  });

  await createCustomerSession({ sub: customer.id, name: customer.name, email: customer.email });

  redirect(safeRedirect(String(formData.get("redirect") ?? "")));
}

export interface CustomerLoginState {
  error?: string;
}

export async function customerLoginAction(
  _prevState: CustomerLoginState,
  formData: FormData
): Promise<CustomerLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Veuillez renseigner votre email et votre mot de passe." };
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) {
    return { error: "Identifiants incorrects." };
  }

  const valid = await verifyPassword(password, customer.passwordHash);
  if (!valid) {
    return { error: "Identifiants incorrects." };
  }

  await createCustomerSession({ sub: customer.id, name: customer.name, email: customer.email });

  redirect(safeRedirect(String(formData.get("redirect") ?? "")));
}

export async function customerLogoutAction() {
  await destroyCustomerSession();
  redirect("/");
}
