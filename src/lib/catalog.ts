import { BookOpen, HardHat, Leaf, Package, Pickaxe, Wrench } from "lucide-react";
import type { ProductCategory } from "@/generated/prisma/enums";

export interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  BTP: "BTP",
  AGRO_CHIMIQUE: "Agro-chimique",
  MATERIAUX_INDUSTRIELS: "Matériaux industriels",
  EQUIPEMENTS_MINIERS: "Équipements miniers",
  CATALOGUES: "Catalogues",
  AUTRES_SERVICES: "Autres services",
};

export const CATEGORY_ICON = {
  BTP: HardHat,
  AGRO_CHIMIQUE: Leaf,
  MATERIAUX_INDUSTRIELS: Package,
  EQUIPEMENTS_MINIERS: Pickaxe,
  CATALOGUES: BookOpen,
  AUTRES_SERVICES: Wrench,
} as const;

export const CATEGORY_TEXT_COLOR: Record<ProductCategory, string> = {
  BTP: "text-rust",
  AGRO_CHIMIQUE: "text-green",
  MATERIAUX_INDUSTRIELS: "text-cement",
  EQUIPEMENTS_MINIERS: "text-rust-dark",
  CATALOGUES: "text-ink",
  AUTRES_SERVICES: "text-ink-soft",
};

export function formatFCFA(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
