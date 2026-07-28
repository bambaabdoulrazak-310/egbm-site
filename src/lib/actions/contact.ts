"use server";

import { prisma } from "@/lib/prisma";

export interface ContactState {
  error?: string;
  success?: boolean;
}

export async function sendContactMessageAction(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message) {
    return { error: "Veuillez renseigner votre nom et votre message." };
  }

  await prisma.contactMessage.create({ data: { name, message } });

  return { success: true };
}
