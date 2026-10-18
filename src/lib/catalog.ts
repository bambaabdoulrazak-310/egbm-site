export interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
}

export function formatFCFA(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
