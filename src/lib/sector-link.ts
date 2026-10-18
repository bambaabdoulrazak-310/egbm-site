// Adresse d'une carte de secteur : lien personnalisé s'il existe (ex. /catalogues),
// sinon le filtre de la page Produits. Utilisable côté serveur et côté navigateur.
export function sectorHref(sector: { slug: string; link: string | null }) {
  return sector.link || `/produits?categorie=${sector.slug}`;
}

// Un lien personnalisé doit être un chemin interne ("/catalogues") ou une adresse https.
export function isValidSectorLink(link: string) {
  return /^\/(?!\/)[^\s]*$/.test(link) || /^https:\/\/[^\s]+$/.test(link);
}
