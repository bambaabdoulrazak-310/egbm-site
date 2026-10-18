import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";

function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/egbm.ci" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/2250556804286" },
];

const QUICK_LINKS: Array<[string, string]> = [
  ["/", "Accueil"],
  ["/produits", "Produits"],
  ["/services", "Services"],
  ["/realisations", "Réalisations"],
  ["/contact", "Contact"],
];

const ACTIVITY_LINKS: Array<[string, string]> = [
  ["/produits?categorie=BTP", "BTP"],
  ["/produits?categorie=AGRO_CHIMIQUE", "Agro-chimie"],
  ["/produits?categorie=MATERIAUX_INDUSTRIELS", "Matériaux industriels"],
  ["/produits?categorie=EQUIPEMENTS_MINIERS", "Équipements miniers"],
  ["/produits?categorie=AUTRES_SERVICES", "Catalogues et autres services"],
];

export function Footer() {
  return (
    <footer className="bg-night text-sm text-white/75">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
            <Image
              src="/logo.jpg"
              alt="Logo EGBM"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            EGBM
          </div>
          <p className="mt-3 leading-relaxed">
            Entreprise Générale Bamba Mamadou
            <br />
            Matériaux de construction, agro-chimie et matériaux industriels à Korhogo.
          </p>
          <div className="mt-4 flex gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-rust"
              >
                <s.icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="font-display text-base font-bold text-white">Liens rapides</div>
          <ul className="mt-3 flex flex-col gap-2">
            {QUICK_LINKS.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-display text-base font-bold text-white">Nos activités</div>
          <ul className="mt-3 flex flex-col gap-2">
            {ACTIVITY_LINKS.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-display text-base font-bold text-white">Contactez-nous</div>
          <ul className="mt-3 flex flex-col gap-2">
            <li className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-rust" /> Korhogo, Côte d&apos;Ivoire
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-rust" /> +225 07 08 47 85 37
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-rust" /> +225 05 56 80 42 86
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-rust" /> contact@egbm.ci
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} EGBM — Tous droits réservés ·{" "}
        <Link href="/connexion" className="hover:text-white">
          Espace entreprise
        </Link>
      </div>
    </footer>
  );
}
