import {
  BookOpen,
  Boxes,
  Building2,
  Cog,
  Construction,
  Droplets,
  Factory,
  Fuel,
  Hammer,
  HardHat,
  Layers,
  Leaf,
  Package,
  Pickaxe,
  Ruler,
  Sprout,
  Tractor,
  Truck,
  Warehouse,
  Wheat,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Icônes proposées dans l'espace entreprise pour illustrer un secteur.
// La base ne stocke que le nom (clé) : ajouter une icône = l'ajouter ici.
export const SECTOR_ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  HardHat: { Icon: HardHat, label: "Casque de chantier" },
  Construction: { Icon: Construction, label: "Construction" },
  Building2: { Icon: Building2, label: "Bâtiment" },
  Hammer: { Icon: Hammer, label: "Marteau" },
  Ruler: { Icon: Ruler, label: "Règle" },
  Leaf: { Icon: Leaf, label: "Feuille" },
  Sprout: { Icon: Sprout, label: "Pousse" },
  Wheat: { Icon: Wheat, label: "Blé" },
  Tractor: { Icon: Tractor, label: "Tracteur" },
  Droplets: { Icon: Droplets, label: "Eau" },
  Package: { Icon: Package, label: "Colis" },
  Boxes: { Icon: Boxes, label: "Caisses" },
  Warehouse: { Icon: Warehouse, label: "Entrepôt" },
  Factory: { Icon: Factory, label: "Usine" },
  Cog: { Icon: Cog, label: "Engrenage" },
  Pickaxe: { Icon: Pickaxe, label: "Pioche" },
  Fuel: { Icon: Fuel, label: "Carburant" },
  Zap: { Icon: Zap, label: "Électricité" },
  Truck: { Icon: Truck, label: "Camion" },
  Wrench: { Icon: Wrench, label: "Clé à molette" },
  BookOpen: { Icon: BookOpen, label: "Catalogue" },
  Layers: { Icon: Layers, label: "Couches" },
};

export const SECTOR_ICON_KEYS = Object.keys(SECTOR_ICONS);

export function getSectorIcon(key: string | null | undefined): LucideIcon {
  return (key && SECTOR_ICONS[key]?.Icon) || Package;
}
