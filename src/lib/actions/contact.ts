"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { notifyNewContactMessage } from "@/lib/notify";

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

  after(async () => {
    try {
      await notifyNewContactMessage({ name, message });
    } catch (err) {
      console.error("Échec de la notification de message de contact :", err);
    }
  });

  return { success: true };
}

export async function deleteContactMessageAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/espace-entreprise/demandes");
}
