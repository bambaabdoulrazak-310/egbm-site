import { HardHat, Leaf, Package } from "lucide-react";
import type { ProductCategory } from "@/generated/prisma/enums";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  BTP: "BTP",
  AGRO_CHIMIQUE: "Agro-chimique",
  MATERIAUX_INDUSTRIELS: "Matériaux industriels",
};

export const CATEGORY_ICON = {
  BTP: HardHat,
  AGRO_CHIMIQUE: Leaf,
  MATERIAUX_INDUSTRIELS: Package,
} as const;

export const CATEGORY_TEXT_COLOR: Record<ProductCategory, string> = {
  BTP: "text-rust",
  AGRO_CHIMIQUE: "text-green",
  MATERIAUX_INDUSTRIELS: "text-cement",
};

export function formatFCFA(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
