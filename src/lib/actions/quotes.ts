"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { notifyNewQuoteRequest } from "@/lib/notify";

export interface QuoteRequestState {
  error?: string;
  success?: boolean;
}

export async function createQuoteRequestAction(
  _prevState: QuoteRequestState,
  formData: FormData
): Promise<QuoteRequestState> {
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!clientName || !clientPhone || !message) {
    return { error: "Veuillez renseigner votre nom, votre téléphone et votre besoin." };
  }

  await prisma.quoteRequest.create({
    data: { clientName, clientPhone, clientEmail: clientEmail || null, message },
  });

  try {
    await notifyNewQuoteRequest({
      clientName,
      clientPhone,
      clientEmail: clientEmail || null,
      message,
    });
  } catch (err) {
    console.error("Échec de la notification de demande de devis :", err);
  }

  return { success: true };
}

export async function deleteQuoteRequestAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.quoteRequest.delete({ where: { id } });
  revalidatePath("/espace-entreprise/demandes");
}
