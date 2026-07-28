"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface DocumentFormState {
  error?: string;
  success?: boolean;
}

const TYPES = ["FACTURE", "PROFORMA", "DEVIS"] as const;
const PREFIXES: Record<(typeof TYPES)[number], string> = {
  FACTURE: "FAC",
  PROFORMA: "PRO",
  DEVIS: "DEV",
};

const lineSchema = z.array(
  z.object({
    productId: z.string().optional(),
    productName: z.string().min(1),
    qty: z.number().int().positive(),
    prix: z.number().nonnegative(),
  })
);

export async function generateDocumentAction(
  _prevState: DocumentFormState,
  formData: FormData
): Promise<DocumentFormState> {
  await requireSession();

  const type = String(formData.get("type") ?? "");
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientContact = String(formData.get("clientContact") ?? "").trim();
  const linesRaw = String(formData.get("lines") ?? "[]");

  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    return { error: "Type de document invalide." };
  }
  if (!clientName) {
    return { error: "Veuillez renseigner le nom du client." };
  }

  let lines: z.infer<typeof lineSchema>;
  try {
    lines = lineSchema.parse(JSON.parse(linesRaw));
  } catch {
    return { error: "Lignes invalides." };
  }
  if (lines.length === 0) {
    return { error: "Ajoutez au moins une ligne." };
  }

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.prix, 0);
  const vat = Math.round(subtotal * 0.18);
  const total = subtotal + vat;
  const year = new Date().getFullYear();
  const documentType = type as (typeof TYPES)[number];
  const counterKey = `${documentType}-${year}`;

  const counter = await prisma.documentCounter.upsert({
    where: { id: counterKey },
    create: { id: counterKey, lastNo: 1 },
    update: { lastNo: { increment: 1 } },
  });

  const number = `${PREFIXES[documentType]}-${year}-${String(counter.lastNo).padStart(3, "0")}`;

  await prisma.document.create({
    data: {
      number,
      type: documentType,
      clientName,
      clientContact: clientContact || null,
      subtotal,
      vat,
      total,
      lines: {
        create: lines.map((l) => ({
          productId: l.productId || null,
          productName: l.productName,
          quantity: l.qty,
          unitPrice: l.prix,
        })),
      },
    },
  });

  revalidatePath("/espace-entreprise/facturation");
  return { success: true };
}
