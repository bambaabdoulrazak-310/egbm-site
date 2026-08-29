const MIN_FILL_TIME_MS = 2500;

// Formulaire rempli trop vite (bot) ou champ piège rempli (invisible pour un humain) => spam.
export function isLikelySpam(formData: FormData): boolean {
  const honeypot = String(formData.get("site_web") ?? "");
  if (honeypot.trim() !== "") return true;

  const renderedAt = Number(formData.get("ts") ?? 0);
  if (!renderedAt || Date.now() - renderedAt < MIN_FILL_TIME_MS) return true;

  return false;
}
