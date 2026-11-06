// Règles des commandes fournisseurs et des livraisons, partagées entre serveur et interface.

export type SupplierStatusValue =
  | "BROUILLON"
  | "ENVOYEE"
  | "CONFIRMEE"
  | "EXPEDIEE"
  | "RECUE_PARTIELLEMENT"
  | "RECUE"
  | "ANNULEE";

export type DeliveryStatusValue = "PREVUE" | "EN_COURS" | "EFFECTUEE" | "ANNULEE";

export const SUPPLIER_STATUSES: SupplierStatusValue[] = [
  "BROUILLON",
  "ENVOYEE",
  "CONFIRMEE",
  "EXPEDIEE",
  "RECUE_PARTIELLEMENT",
  "RECUE",
  "ANNULEE",
];

export const SUPPLIER_LABELS: Record<SupplierStatusValue, string> = {
  BROUILLON: "Brouillon",
  ENVOYEE: "Envoyée au fournisseur",
  CONFIRMEE: "Confirmée par le fournisseur",
  EXPEDIEE: "Expédiée par le fournisseur",
  RECUE_PARTIELLEMENT: "Reçue partiellement",
  RECUE: "Reçue",
  ANNULEE: "Annulée",
};

export const SUPPLIER_CLASSES: Record<SupplierStatusValue, string> = {
  BROUILLON: "bg-surface text-ink-soft",
  ENVOYEE: "bg-safety text-ink",
  CONFIRMEE: "bg-blue-100 text-blue-900",
  EXPEDIEE: "bg-ink text-white",
  RECUE_PARTIELLEMENT: "bg-rust text-white",
  RECUE: "bg-green text-white",
  ANNULEE: "bg-surface text-ink-soft",
};

// Avancer, annuler, ou revenir d'une étape. Les réceptions (qui mènent à « Reçue ») passent par le formulaire de réception.
export const SUPPLIER_TRANSITIONS: Record<SupplierStatusValue, SupplierStatusValue[]> = {
  BROUILLON: ["ENVOYEE", "ANNULEE"],
  ENVOYEE: ["CONFIRMEE", "BROUILLON", "ANNULEE"],
  CONFIRMEE: ["EXPEDIEE", "ENVOYEE", "ANNULEE"],
  EXPEDIEE: ["CONFIRMEE", "ANNULEE"],
  RECUE_PARTIELLEMENT: ["ANNULEE"],
  RECUE: [],
  ANNULEE: [],
};

const RANK: Record<SupplierStatusValue, number> = {
  BROUILLON: 0,
  ENVOYEE: 1,
  CONFIRMEE: 2,
  EXPEDIEE: 3,
  RECUE_PARTIELLEMENT: 4,
  RECUE: 5,
  ANNULEE: 6,
};

export function isSupplierBackward(from: SupplierStatusValue, to: SupplierStatusValue): boolean {
  return to !== "ANNULEE" && from !== "ANNULEE" && RANK[to] < RANK[from];
}

export function isSupplierTerminal(status: SupplierStatusValue): boolean {
  return status === "RECUE" || status === "ANNULEE";
}

export function isSupplierStatus(value: string): value is SupplierStatusValue {
  return (SUPPLIER_STATUSES as string[]).includes(value);
}

export function canSupplierTransition(from: SupplierStatusValue, to: SupplierStatusValue): boolean {
  return SUPPLIER_TRANSITIONS[from].includes(to);
}

// Une réception de marchandises est possible tant que la commande n'est ni brouillon, ni terminée.
export function canReceive(status: SupplierStatusValue): boolean {
  return ["ENVOYEE", "CONFIRMEE", "EXPEDIEE", "RECUE_PARTIELLEMENT"].includes(status);
}

// Événement système enregistré à l'arrivée sur un statut fournisseur (le texte exact est dans « detail »).
export const SUPPLIER_EVENT_FOR_STATUS: Record<
  SupplierStatusValue,
  "ENVOYEE" | "CONFIRMEE" | "EXPEDIEE" | "ANNULEE" | "RECEPTION" | "RECEPTION_PARTIELLE"
> = {
  BROUILLON: "ENVOYEE",
  ENVOYEE: "ENVOYEE",
  CONFIRMEE: "CONFIRMEE",
  EXPEDIEE: "EXPEDIEE",
  RECUE_PARTIELLEMENT: "RECEPTION_PARTIELLE",
  RECUE: "RECEPTION",
  ANNULEE: "ANNULEE",
};

export const DELIVERY_LABELS: Record<DeliveryStatusValue, string> = {
  PREVUE: "Prévue",
  EN_COURS: "En cours",
  EFFECTUEE: "Effectuée",
  ANNULEE: "Annulée",
};

export const DELIVERY_CLASSES: Record<DeliveryStatusValue, string> = {
  PREVUE: "bg-safety text-ink",
  EN_COURS: "bg-ink text-white",
  EFFECTUEE: "bg-green text-white",
  ANNULEE: "bg-surface text-ink-soft",
};

export const MOVEMENT_LABELS: Record<string, string> = {
  LIVRAISON: "Livraison client",
  RECEPTION: "Réception fournisseur",
  ANNULATION_LIVRAISON: "Annulation de livraison",
  REGULARISATION: "Régularisation",
};
