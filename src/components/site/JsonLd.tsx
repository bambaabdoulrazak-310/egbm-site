// Données structurées (schema.org) lues par Google. Le "<" est échappé pour
// qu'un texte saisi en base ne puisse jamais fermer la balise <script>.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
