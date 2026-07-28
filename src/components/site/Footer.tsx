import { MessageCircle } from "lucide-react";

function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/egbm.ci" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/2250556804286" },
];

export function Footer() {
  return (
    <footer className="mt-10 flex flex-col items-center gap-3 bg-ink py-6 text-sm text-bg-alt">
      <div className="flex gap-4">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cement transition-colors"
          >
            <s.icon size={17} />
          </a>
        ))}
      </div>
      <div>EGBM — Entreprise Générale Bamba Mamadou · Korhogo, Côte d&apos;Ivoire</div>
    </footer>
  );
}
