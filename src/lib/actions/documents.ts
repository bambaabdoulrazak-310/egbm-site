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
    prixBrut: z.number().nonnegative(),
    remise: z.number().min(0).max(100),
    prixNet: z.number().nonnegative(),
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
  const clientAddress = String(formData.get("clientAddress") ?? "").trim();
  const objet = String(formData.get("objet") ?? "").trim();
  const vatApplicable = formData.get("vatApplicable") === "on";
  const validityDaysRaw = String(formData.get("validityDays") ?? "").trim();
  const numberOverride = String(formData.get("number") ?? "").trim();
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

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.prixNet, 0);
  const vat = vatApplicable ? Math.round(subtotal * 0.18) : 0;
  const total = subtotal + vat;
  const documentType = type as (typeof TYPES)[number];

  let number = numberOverride;
  if (!number) {
    const year = new Date().getFullYear();
    const counterKey = `${documentType}-${year}`;
    const counter = await prisma.documentCounter.upsert({
      where: { id: counterKey },
      create: { id: counterKey, lastNo: 1 },
      update: { lastNo: { increment: 1 } },
    });
    number = `${PREFIXES[documentType]}-${year}-${String(counter.lastNo).padStart(3, "0")}`;
  }

  const existing = await prisma.document.findUnique({ where: { number } });
  if (existing) {
    return { error: `Le numéro ${number} est déjà utilisé.` };
  }

  const validityDays = validityDaysRaw ? Number(validityDaysRaw) : null;

  await prisma.document.create({
    data: {
      number,
      type: documentType,
      clientName,
      clientContact: clientContact || null,
      clientAddress: clientAddress || null,
      objet: objet || null,
      vatApplicable,
      validityDays: validityDays && validityDays > 0 ? validityDays : null,
      subtotal,
      vat,
      total,
      lines: {
        create: lines.map((l) => ({
          productId: l.productId || null,
          productName: l.productName,
          quantity: l.qty,
          unitPriceGross: l.prixBrut,
          discountPercent: l.remise,
          unitPrice: l.prixNet,
        })),
      },
    },
  });

  revalidatePath("/espace-entreprise/facturation");
  return { success: true };
}
