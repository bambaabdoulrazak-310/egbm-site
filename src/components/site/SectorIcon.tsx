import type { ComponentProps } from "react";
import { Package } from "lucide-react";
import { SECTOR_ICONS } from "@/lib/sector-icons";

// Affiche l'icône choisie pour un secteur (clé stockée en base), Package par défaut.
export function SectorIcon({
  name,
  ...props
}: { name: string | null | undefined } & ComponentProps<typeof Package>) {
  const Icon = (name && SECTOR_ICONS[name]?.Icon) || Package;
  return <Icon {...props} />;
}
