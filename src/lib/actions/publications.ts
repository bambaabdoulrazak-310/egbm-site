"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface PublicationFormState {
  error?: string;
  success?: boolean;
}

export async function createPublicationAction(
  _prevState: PublicationFormState,
  formData: FormData
): Promise<PublicationFormState> {
  await requireSession();

  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();

  if (!title || (type !== "PUBLICATION" && type !== "EVENEMENT")) {
    return { error: "Veuillez renseigner un titre et un type valide." };
  }

  await prisma.publication.create({
    data: { type, title, text, date: new Date() },
  });

  revalidatePath("/espace-entreprise/publications");
  revalidatePath("/publications");
  return { success: true };
}

export async function deletePublicationAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.publication.delete({ where: { id } });
  revalidatePath("/espace-entreprise/publications");
  revalidatePath("/publications");
}
