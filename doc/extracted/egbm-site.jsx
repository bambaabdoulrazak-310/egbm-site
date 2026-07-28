import React, { useState, useMemo } from "react";
import {
  HardHat, Leaf, Package, ShoppingCart, Phone, Mail, MapPin,
  LayoutDashboard, FileText, TrendingUp, Plus, Trash2, Menu, X,
  Newspaper, Wrench, ChevronRight, Calendar, Truck,
  ClipboardList, ImagePlus, CheckCircle2, ArrowRight, Minus,
  MessageCircle, Lock, LogOut, UserPlus, Users, Eye, EyeOff, ShieldCheck
} from "lucide-react";

function FacebookIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

// ---------- Palette (ancrée dans le BTP / agro-chimie / Korhogo) ----------
const C = {
  bg: "#EAE4D6",
  bgAlt: "#E0D8C7",
  ink: "#2A2822",
  inkSoft: "#5A564C",
  rust: "#E8681E",
  rustDark: "#B8500F",
  cement: "#57544C",
  green: "#128A4C",
  greenLight: "#3FA96A",
  safety: "#F0A81C",
  cream: "#F4EFE3",
  white: "#FDFBF6",
  border: "#CDC4AE",
};

const LOGO_B64 = "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";

const FONT_DISPLAY = "'Barlow Condensed', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const CATEGORIES = ["BTP", "Agro-chimique", "Matériaux industriels"];
const CAT_ICON = { "BTP": HardHat, "Agro-chimique": Leaf, "Matériaux industriels": Package };
const CAT_COLOR = { "BTP": C.rust, "Agro-chimique": C.green, "Matériaux industriels": C.cement };

const fmt = (n) => n.toLocaleString("fr-FR") + " FCFA";

const INITIAL_PRODUCTS = [
  { id: "p1", name: "Ciment CPA 42.5 (sac 50kg)", category: "BTP", price: 5500, stock: 320, sold: 1450 },
  { id: "p2", name: "Fer à béton HA10 (barre 12m)", category: "BTP", price: 6800, stock: 180, sold: 620 },
  { id: "p3", name: "Gravier concassé 15/25 (tonne)", category: "BTP", price: 12000, stock: 40, sold: 210 },
  { id: "p4", name: "Engrais NPK 15-15-15 (sac 50kg)", category: "Agro-chimique", price: 21000, stock: 150, sold: 980 },
  { id: "p5", name: "Herbicide glyphosate (bidon 5L)", category: "Agro-chimique", price: 18500, stock: 90, sold: 540 },
  { id: "p6", name: "Insecticide cyperméthrine (1L)", category: "Agro-chimique", price: 6200, stock: 210, sold: 720 },
  { id: "p7", name: "Tôle bac acier galvanisé (feuille)", category: "Matériaux industriels", price: 9800, stock: 75, sold: 310 },
  { id: "p8", name: "Contreplaqué marine 18mm (feuille)", category: "Matériaux industriels", price: 15500, stock: 60, sold: 190 },
  { id: "p9", name: "Fil de fer recuit (rouleau 25kg)", category: "Matériaux industriels", price: 22000, stock: 45, sold: 150 },
];

const INITIAL_PUBLICATIONS = [
  { id: "u1", type: "Événement", title: "EGBM au Salon du Bâtiment de Korhogo", date: "2026-08-14", excerpt: "Notre stand présentera la nouvelle gamme d'engrais NPK et nos solutions BTP." },
  { id: "u2", type: "Publication", title: "Nouvel arrivage de fer à béton HA10", date: "2026-07-18", excerpt: "Stock renouvelé — disponible en barres de 12m, livraison possible sur chantier." },
  { id: "u3", type: "Publication", title: "Promotion sur les sacs de ciment CPA 42.5", date: "2026-07-05", excerpt: "Tarif préférentiel pour les commandes de plus de 50 sacs ce mois-ci." },
];

const SERVICES = [
  { icon: HardHat, title: "Travaux de génie civil", desc: "Construction, terrassement, voirie et ouvrages BTP pour particuliers et institutions." },
  { icon: Leaf, title: "Distribution agro-chimique", desc: "Engrais, herbicides et insecticides pour l'agriculture de la région de Korhogo." },
  { icon: Package, title: "Fourniture de matériaux industriels", desc: "Tôles, contreplaqué, fil de fer et autres intrants pour vos chantiers et ateliers." },
  { icon: Truck, title: "Livraison sur chantier", desc: "Transport et livraison des commandes directement sur site, dans la région." },
];

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/egbm.ci" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/2250556804286" },
];

const INITIAL_USERS = [
  { id: "user1", nom: "Abdoul (Propriétaire)", email: "admin@egbm.ci", motdepasse: "egbm2026", role: "Administrateur" },
];

let orderCounter = 1;
let docCounter = 1;

export default function App() {
  const [side, setSide] = useState("client"); // client | entreprise
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);
  const [commandes, setCommandes] = useState([
    { id: "c0", client: "Coopérative Agricole de Waraniéné", tel: "07 01 02 03 04", items: [{ name: "Engrais NPK 15-15-15 (sac 50kg)", qty: 20, price: 21000 }], total: 420000, statut: "En cours", date: "2026-07-15" },
  ]);
  const [factures, setFactures] = useState([]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: FONT_BODY, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
      `}</style>

      <TopSwitch side={side} setSide={setSide} />

      {side === "client" ? (
        <ClientSite
          products={products}
          publications={publications}
          onOrder={(order) => setCommandes((prev) => [...prev, order])}
        />
      ) : currentUser ? (
        <AdminSpace
          products={products} setProducts={setProducts}
          publications={publications} setPublications={setPublications}
          commandes={commandes} setCommandes={setCommandes}
          factures={factures} setFactures={setFactures}
          users={users} setUsers={setUsers}
          currentUser={currentUser} onLogout={() => setCurrentUser(null)}
        />
      ) : (
        <LoginScreen users={users} onLogin={setCurrentUser} />
      )}
    </div>
  );
}

// ============ SWITCH HAUT DE PAGE (simule les 2 "sites") ============
function TopSwitch({ side, setSide }) {
  return (
    <div style={{ background: C.ink }} className="w-full flex items-center justify-end sm:justify-between px-4 py-2 text-xs">
      <div style={{ fontFamily: FONT_MONO, color: C.bgAlt }} className="tracking-wide hidden sm:block">
        PROTOTYPE — EGBM.CI
      </div>
      <div className="flex rounded-full overflow-hidden border" style={{ borderColor: C.cement }}>
        <button
          onClick={() => setSide("client")}
          className="px-4 py-1.5 font-semibold transition-colors"
          style={{
            background: side === "client" ? C.rust : "transparent",
            color: side === "client" ? C.white : C.bgAlt,
          }}
        >
          Site Client
        </button>
        <button
          onClick={() => setSide("entreprise")}
          className="px-4 py-1.5 font-semibold transition-colors"
          style={{
            background: side === "entreprise" ? C.green : "transparent",
            color: side === "entreprise" ? C.white : C.bgAlt,
          }}
        >
          Espace Entreprise
        </button>
      </div>
    </div>
  );
}

function StripeDivider({ color1 = C.rust, color2 = C.safety }) {
  return (
    <div
      style={{
        height: 6,
        backgroundImage: `repeating-linear-gradient(-45deg, ${color1}, ${color1} 10px, ${color2} 10px, ${color2} 20px)`,
      }}
    />
  );
}

function Stamp({ label = "EGBM · KORHOGO" }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 -rotate-3"
      style={{ borderColor: C.rust, color: C.rust, fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600 }}
    >
      <CheckCircle2 size={13} /> {label}
    </div>
  );
}

// ================= CÔTÉ CLIENT =================
function ClientSite({ products, publications, onOrder }) {
  const [view, setView] = useState("accueil");
  const [panier, setPanier] = useState({}); // productId -> qty
  const [navOpen, setNavOpen] = useState(false);

  const navItems = [
    ["accueil", "Accueil"],
    ["produits", "Produits"],
    ["services", "Services"],
    ["publications", "Publications"],
    ["commande", "Commande"],
    ["contact", "Contact"],
  ];

  const addToCart = (id) => setPanier((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const setQty = (id, qty) => setPanier((p) => ({ ...p, [id]: Math.max(0, qty) }));

  return (
    <div>
      {/* Header */}
      <header style={{ background: C.rust }} className="text-white">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => setView("accueil")} className="flex items-center gap-2">
            <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="Logo EGBM" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: C.white }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 26, letterSpacing: 0.5 }}>
              EGBM
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-3 lg:gap-6" style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700 }}>
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className="uppercase tracking-wide pb-1 border-b-2 transition-colors"
                style={{ borderColor: view === key ? C.safety : "transparent", opacity: view === key ? 1 : 0.85 }}
              >
                {label}
              </button>
            ))}
          </nav>
          <button onClick={() => setView("commande")} className="relative">
            <ShoppingCart size={24} />
            {Object.values(panier).some((q) => q > 0) && (
              <span
                className="absolute -top-2 -right-2 text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: C.safety, color: C.ink }}
              >
                {Object.values(panier).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          <button className="md:hidden" onClick={() => setNavOpen((o) => !o)}>
            {navOpen ? <X /> : <Menu />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden px-5 pb-4 flex flex-col gap-2" style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700 }}>
            {navItems.map(([key, label]) => (
              <button key={key} onClick={() => { setView(key); setNavOpen(false); }} className="text-left uppercase">
                {label}
              </button>
            ))}
          </div>
        )}
      </header>
      <StripeDivider />

      <main className="max-w-6xl mx-auto px-5 py-10">
        {view === "accueil" && <Accueil setView={setView} />}
        {view === "produits" && <Produits products={products} onAdd={addToCart} />}
        {view === "services" && <Services />}
        {view === "publications" && <Publications publications={publications} />}
        {view === "commande" && (
          <Commande
            products={products}
            panier={panier}
            setQty={setQty}
            onSubmit={(order) => { onOrder(order); setPanier({}); }}
          />
        )}
        {view === "contact" && <Contact />}
      </main>

      <footer style={{ background: C.ink, color: C.bgAlt }} className="py-6 mt-10 flex flex-col items-center gap-3 text-sm">
        <div className="flex gap-4">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: C.cement }}>
              <s.icon size={17} color={C.white} />
            </a>
          ))}
        </div>
        <div>EGBM — Entreprise Générale Bamba Mamadou · Korhogo, Côte d'Ivoire</div>
      </footer>
    </div>
  );
}

function Illustration({ variant, className }) {
  if (variant === "hero") {
    return (
      <svg viewBox="0 0 1200 420" className={className} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.rust} />
            <stop offset="100%" stopColor={C.rustDark} />
          </linearGradient>
        </defs>
        <rect width="1200" height="420" fill="url(#heroGrad)" />
        {[...Array(6)].map((_, i) => (
          <rect key={i} x={i * 220 - 60} y="280" width="90" height="140" fill={C.ink} opacity="0.15" />
        ))}
        <polygon points="120,300 120,120 130,120 130,160 320,160 320,175 140,175 140,300" fill={C.cream} opacity="0.7" />
        <circle cx="130" cy="120" r="8" fill={C.cream} opacity="0.7" />
        <g opacity="0.85">
          <rect x="950" y="220" width="60" height="80" rx="4" fill={C.safety} />
          <rect x="1020" y="240" width="60" height="60" rx="4" fill={C.green} />
          <rect x="1090" y="200" width="60" height="100" rx="4" fill={C.safety} />
        </g>
        <text x="60" y="70" fontFamily={FONT_DISPLAY} fontWeight="800" fontSize="64" fill={C.white} opacity="0.9">EGBM</text>
      </svg>
    );
  }
  const cfg = {
    btp: { color: C.rust, icon: HardHat },
    agro: { color: C.green, icon: Leaf },
    materiaux: { color: C.cement, icon: Package },
  }[variant];
  const Icon = cfg.icon;
  return (
    <div className={className} style={{ background: `linear-gradient(135deg, ${cfg.color}, ${C.ink})`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={56} color={C.white} opacity={0.9} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 18px, ${C.white}10 18px, ${C.white}10 20px)` }} />
    </div>
  );
}

function Accueil({ setView }) {
  return (
    <div>
      <div className="rounded-lg overflow-hidden mb-8" style={{ border: `1px solid ${C.border}` }}>
        <Illustration variant="hero" className="w-full h-56 md:h-72" />
      </div>

      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Stamp />
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, lineHeight: 0.95, color: C.ink }} className="mt-4 text-4xl sm:text-5xl md:text-6xl">
            BÂTIR, CULTIVER,<br />ÉQUIPER LE NORD.
          </h1>
          <p style={{ color: C.inkSoft }} className="mt-5 text-lg max-w-md">
            Depuis Korhogo, EGBM fournit matériaux de construction, intrants agro-chimiques
            et matériaux industriels aux chantiers et exploitations de toute la région.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setView("produits")} className="px-5 py-3 rounded-md text-white font-semibold flex items-center gap-2" style={{ background: C.rust }}>
              Voir les produits <ArrowRight size={18} />
            </button>
            <button onClick={() => setView("contact")} className="px-5 py-3 rounded-md font-semibold border-2" style={{ borderColor: C.ink }}>
              Nous contacter
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[["3", "secteurs d'activité"], ["9+", "produits référencés"], ["24/7", "livraison chantier"]].map(([n, l], i) => (
            <div key={i} className="rounded-lg p-2.5 sm:p-4 text-center" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: C.rust }} className="text-xl sm:text-3xl md:text-4xl">{n}</div>
              <div className="text-[10px] sm:text-xs mt-1" style={{ color: C.inkSoft }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }} className="text-2xl md:text-3xl">Nos secteurs</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-5">
          {[
            { cat: "BTP", variant: "btp" },
            { cat: "Agro-chimique", variant: "agro" },
            { cat: "Matériaux industriels", variant: "materiaux" },
          ].map(({ cat, variant }) => {
            const Icon = CAT_ICON[cat];
            return (
              <div key={cat} className="rounded-lg overflow-hidden" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                <Illustration variant={variant} className="w-full h-36" />
                <div className="p-4">
                  <Icon color={CAT_COLOR[cat]} size={24} />
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }} className="mt-2">{cat}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Produits({ products, onAdd }) {
  const [filter, setFilter] = useState("Tous");
  const filtered = filter === "Tous" ? products : products.filter((p) => p.category === filter);
  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-3xl md:text-5xl">Produits</h1>
      <div className="flex gap-2 mt-4 flex-wrap">
        {["Tous", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: filter === c ? C.rust : C.cream,
              color: filter === c ? C.white : C.ink,
              border: `1px solid ${C.border}`,
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {filtered.map((p) => {
          const Icon = CAT_ICON[p.category];
          return (
            <div key={p.id} className="rounded-lg p-4 flex flex-col" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
              <div className="h-24 rounded-md flex items-center justify-center mb-3" style={{ background: C.bgAlt }}>
                <Icon size={36} color={CAT_COLOR[p.category]} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: CAT_COLOR[p.category] }}>{p.category}</div>
              <div className="font-semibold mt-1 flex-1">{p.name}</div>
              <div style={{ fontFamily: FONT_MONO, color: C.ink }} className="mt-2 font-semibold">{fmt(p.price)}</div>
              <button onClick={() => onAdd(p.id)} className="mt-3 w-full py-2 rounded-md text-white text-sm font-semibold flex items-center justify-center gap-1.5" style={{ background: C.rust }}>
                <Plus size={15} /> Ajouter à la commande
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Services() {
  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-3xl md:text-5xl">Services</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {SERVICES.map((s, i) => (
          <div key={i} className="rounded-lg p-5 flex gap-4" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
            <s.icon size={28} color={C.rust} />
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }}>{s.title}</div>
              <div className="text-sm mt-1" style={{ color: C.inkSoft }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Publications({ publications }) {
  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-3xl md:text-5xl">Publications & Événements</h1>
      <div className="flex flex-col gap-4 mt-6">
        {publications.slice().sort((a, b) => b.date.localeCompare(a.date)).map((pub) => (
          <div key={pub.id} className="rounded-lg p-5 flex gap-4" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
            <div className="flex flex-col items-center justify-center w-16 shrink-0 rounded-md" style={{ background: pub.type === "Événement" ? C.safety : C.bgAlt }}>
              <Calendar size={18} />
              <div style={{ fontFamily: FONT_MONO, fontSize: 11 }} className="mt-1">{pub.date.slice(5)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase" style={{ color: pub.type === "Événement" ? C.rust : C.green }}>{pub.type}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }}>{pub.title}</div>
              <div className="text-sm mt-1" style={{ color: C.inkSoft }}>{pub.excerpt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Commande({ products, panier, setQty, onSubmit }) {
  const [form, setForm] = useState({ nom: "", tel: "", adresse: "" });
  const [confirmed, setConfirmed] = useState(false);

  const lignes = Object.entries(panier).filter(([, q]) => q > 0).map(([id, q]) => {
    const p = products.find((pr) => pr.id === id);
    return { ...p, qty: q };
  });
  const total = lignes.reduce((s, l) => s + l.price * l.qty, 0);

  const submit = () => {
    if (!form.nom || !form.tel || lignes.length === 0) return;
    onSubmit({
      id: "c" + orderCounter++,
      client: form.nom,
      tel: form.tel,
      adresse: form.adresse,
      items: lignes.map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
      total,
      statut: "Nouvelle",
      date: new Date().toISOString().slice(0, 10),
    });
    setForm({ nom: "", tel: "", adresse: "" });
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 4000);
  };

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-3xl md:text-5xl">Votre commande</h1>
      {confirmed && (
        <div className="mt-4 p-4 rounded-md flex items-center gap-2 font-semibold" style={{ background: C.green, color: C.white }}>
          <CheckCircle2 /> Commande envoyée — nous vous contacterons pour confirmation.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700 }}>Panier</h2>
          {lignes.length === 0 && <p className="mt-2 text-sm" style={{ color: C.inkSoft }}>Aucun article. Ajoutez des produits depuis la page Produits.</p>}
          <div className="flex flex-col gap-2 mt-3">
            {lignes.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-md p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                <div className="text-sm font-medium">{l.name}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(l.id, l.qty - 1)}><Minus size={16} /></button>
                  <span style={{ fontFamily: FONT_MONO }} className="w-6 text-center">{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)}><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          {lignes.length > 0 && (
            <div className="mt-4 flex justify-between font-semibold" style={{ fontFamily: FONT_MONO }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          )}
        </div>
        <div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700 }}>Vos informations</h2>
          <div className="flex flex-col gap-3 mt-3">
            <input placeholder="Nom complet" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="p-3 rounded-md" style={{ border: `1px solid ${C.border}`, background: C.white }} />
            <input placeholder="Téléphone" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} className="p-3 rounded-md" style={{ border: `1px solid ${C.border}`, background: C.white }} />
            <input placeholder="Adresse de livraison" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="p-3 rounded-md" style={{ border: `1px solid ${C.border}`, background: C.white }} />
            <button onClick={submit} className="py-3 rounded-md text-white font-semibold" style={{ background: C.rust }}>
              Envoyer la commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-3xl md:text-5xl">Contact</h1>
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3"><MapPin color={C.rust} /> Korhogo, Côte d'Ivoire</div>
          <div className="flex items-center gap-3"><Phone color={C.rust} /> +225 07 00 00 00 00</div>
          <div className="flex items-center gap-3"><Mail color={C.rust} /> contact@egbm.ci</div>
          <div className="flex gap-3 mt-2">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                <s.icon size={18} color={C.rust} />
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <input placeholder="Votre nom" className="p-3 rounded-md" style={{ border: `1px solid ${C.border}`, background: C.cream }} />
          <input placeholder="Votre message" className="p-3 rounded-md h-28" style={{ border: `1px solid ${C.border}`, background: C.cream }} />
          <button className="py-3 rounded-md text-white font-semibold" style={{ background: C.rust }}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}

// ================= CONNEXION ESPACE ENTREPRISE =================
function LoginScreen({ users, onLogin }) {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [erreur, setErreur] = useState("");

  const submit = () => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.motdepasse === motdepasse);
    if (user) { setErreur(""); onLogin(user); }
    else setErreur("Identifiants incorrects.");
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center px-5" style={{ background: C.bgAlt }}>
      <div className="w-full max-w-sm rounded-lg p-6" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
        <div className="flex flex-col items-center mb-4">
          <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="Logo EGBM" className="w-14 h-14 rounded-full object-cover mb-2" />
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 24 }}>Espace Entreprise</div>
          <div className="text-xs" style={{ color: C.inkSoft }}>Accès réservé au personnel autorisé</div>
        </div>
        <div className="flex flex-col gap-3">
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 rounded-md" style={{ border: `1px solid ${C.border}`, background: C.white }} />
          <div className="relative">
            <input type={showPwd ? "text" : "password"} placeholder="Mot de passe" value={motdepasse} onChange={(e) => setMotdepasse(e.target.value)} className="p-3 pr-10 rounded-md w-full" style={{ border: `1px solid ${C.border}`, background: C.white }} />
            <button onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPwd ? <EyeOff size={18} color={C.inkSoft} /> : <Eye size={18} color={C.inkSoft} />}
            </button>
          </div>
          {erreur && <div className="text-sm" style={{ color: C.rustDark }}>{erreur}</div>}
          <button onClick={submit} className="py-3 rounded-md text-white font-semibold flex items-center justify-center gap-2" style={{ background: C.green }}>
            <Lock size={16} /> Se connecter
          </button>
        </div>
        <div className="mt-4 text-xs rounded-md p-3" style={{ background: C.bgAlt, color: C.inkSoft }}>
          Démo — compte propriétaire : <b>admin@egbm.ci</b> / <b>egbm2026</b>
        </div>
      </div>
    </div>
  );
}

// ================= ESPACE ENTREPRISE =================
function AdminSpace({ products, setProducts, publications, setPublications, commandes, setCommandes, factures, setFactures, users, setUsers, currentUser, onLogout }) {
  const [view, setView] = useState("dashboard");
  const isAdmin = currentUser.role === "Administrateur";
  const items = [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["produits", "Produits", Package],
    ["publications", "Publications", Newspaper],
    ["commandes", "Commandes", ClipboardList],
    ["facturation", "Facturation", FileText],
    ...(isAdmin ? [["utilisateurs", "Utilisateurs", Users]] : []),
  ];
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-40px)]">
      <aside style={{ background: C.ink, color: C.bgAlt }} className="w-56 shrink-0 p-4 hidden md:flex md:flex-col">
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 24, color: C.white }} className="mb-2 flex items-center gap-2">
          <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="Logo EGBM" className="w-8 h-8 rounded-full object-cover" /> EGBM
        </div>
        <div className="mb-4 text-xs rounded-md p-2" style={{ background: "#00000030" }}>
          <div className="font-semibold" style={{ color: C.white }}>{currentUser.nom}</div>
          <div className="flex items-center gap-1 mt-0.5"><ShieldCheck size={12} /> {currentUser.role}</div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {items.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-left"
              style={{ background: view === key ? C.green : "transparent", color: view === key ? C.white : C.bgAlt }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium mt-2" style={{ color: C.bgAlt }}>
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      <div className="flex md:hidden gap-1 p-2 overflow-x-auto items-center" style={{ background: C.ink }}>
        {items.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setView(key)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs shrink-0"
            style={{ background: view === key ? C.green : "transparent", color: C.white }}>
            <Icon size={14} /> {label}
          </button>
        ))}
        <button onClick={onLogout} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs shrink-0" style={{ color: C.bgAlt }}>
          <LogOut size={14} /> Quitter
        </button>
      </div>

      <main className="flex-1 p-4 sm:p-6 overflow-x-hidden" style={{ background: C.bgAlt }}>
        {view === "dashboard" && <Dashboard products={products} commandes={commandes} />}
        {view === "produits" && <AdminProduits products={products} setProducts={setProducts} />}
        {view === "publications" && <AdminPublications publications={publications} setPublications={setPublications} />}
        {view === "commandes" && <AdminCommandes commandes={commandes} setCommandes={setCommandes} />}
        {view === "facturation" && <Facturation products={products} factures={factures} setFactures={setFactures} />}
        {view === "utilisateurs" && isAdmin && <AdminUtilisateurs users={users} setUsers={setUsers} currentUser={currentUser} />}
      </main>
    </div>
  );
}

function AdminUtilisateurs({ users, setUsers, currentUser }) {
  const [draft, setDraft] = useState({ nom: "", email: "", motdepasse: "" });

  const add = () => {
    if (!draft.nom || !draft.email || !draft.motdepasse) return;
    setUsers((u) => [...u, { id: "user" + Date.now(), ...draft, role: "Gestionnaire" }]);
    setDraft({ nom: "", email: "", motdepasse: "" });
  };
  const remove = (id) => setUsers((u) => u.filter((usr) => usr.id !== id));

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-2xl md:text-4xl">Utilisateurs & autorisations</h1>
      <p className="text-sm mt-2" style={{ color: C.inkSoft }}>
        Donne l'accès à l'espace entreprise à d'autres personnes. Elles pourront gérer produits, publications, commandes et factures,
        mais ne pourront pas inviter d'autres utilisateurs (réservé à l'Administrateur).
      </p>

      <div className="rounded-lg p-4 mt-4 grid md:grid-cols-4 gap-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
        <input placeholder="Nom complet" value={draft.nom} onChange={(e) => setDraft({ ...draft, nom: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
        <input placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
        <input placeholder="Mot de passe temporaire" value={draft.motdepasse} onChange={(e) => setDraft({ ...draft, motdepasse: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
        <button onClick={add} className="px-4 py-2 rounded-md text-white font-semibold flex items-center justify-center gap-1.5" style={{ background: C.green }}>
          <UserPlus size={16} /> Autoriser
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-5">
        {users.map((u) => (
          <div key={u.id} className="rounded-lg p-3 flex items-center justify-between" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
            <div>
              <div className="font-semibold">{u.nom}</div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{u.email} · {u.role}</div>
            </div>
            {u.id !== currentUser.id && u.role !== "Administrateur" && (
              <button onClick={() => remove(u.id)}><Trash2 size={16} color={C.rust} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ products, commandes }) {
  const ca = commandes.reduce((s, c) => s + c.total, 0);
  const enAttente = commandes.filter((c) => c.statut === "Nouvelle" || c.statut === "En cours").length;
  const stockTotal = products.reduce((s, p) => s + p.stock, 0);
  const topProduits = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-2xl md:text-4xl">Tableau de bord</h1>
      <div className="grid md:grid-cols-4 gap-4 mt-5">
        {[
          ["Chiffre d'affaires (commandes)", fmt(ca)],
          ["Commandes en attente", enAttente],
          ["Unités en stock", stockTotal],
          ["Produit le plus vendu", topProduits[0]?.name.split(" (")[0]],
        ].map(([label, val], i) => (
          <div key={i} className="rounded-lg p-4" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>{label}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700 }} className="mt-1">{val}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-5 mt-6" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp color={C.rust} size={18} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700 }}>Produits les plus vendus</span>
        </div>
        <div className="flex flex-col gap-3">
          {topProduits.map((p) => {
            const max = topProduits[0]?.sold || 1;
            const pct = Math.max(4, Math.round((p.sold / max) * 100));
            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-40 md:w-56 text-xs shrink-0 truncate" style={{ color: C.inkSoft }}>{p.name.split(" (")[0]}</div>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: C.bgAlt, height: 18 }}>
                  <div style={{ width: `${pct}%`, background: C.rust, height: "100%" }} />
                </div>
                <div className="w-14 text-right text-xs font-semibold shrink-0" style={{ fontFamily: FONT_MONO }}>{p.sold}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminProduits({ products, setProducts }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", category: "BTP", price: "", stock: "" });

  const addProduct = () => {
    if (!draft.name || !draft.price) return;
    setProducts((p) => [...p, { id: "p" + Date.now(), name: draft.name, category: draft.category, price: Number(draft.price), stock: Number(draft.stock) || 0, sold: 0 }]);
    setDraft({ name: "", category: "BTP", price: "", stock: "" });
    setShowForm(false);
  };
  const removeProduct = (id) => setProducts((p) => p.filter((pr) => pr.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-2xl md:text-4xl">Produits</h1>
        <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 rounded-md text-white font-semibold flex items-center gap-1.5" style={{ background: C.green }}>
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg p-4 mt-4 grid md:grid-cols-5 gap-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
          <input placeholder="Nom du produit" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="p-2 rounded-md md:col-span-2" style={{ border: `1px solid ${C.border}` }} />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Prix (FCFA)" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
          <input placeholder="Stock" type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
          <div className="md:col-span-5 flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md" style={{ border: `1px dashed ${C.border}` }}>
              <ImagePlus size={15} /> Ajouter une photo
            </button>
            <button onClick={addProduct} className="ml-auto px-4 py-2 rounded-md text-white font-semibold" style={{ background: C.rust }}>Enregistrer</button>
          </div>
        </div>
      )}

      <div className="rounded-lg mt-5 overflow-x-auto" style={{ border: `1px solid ${C.border}` }}>
        <table className="w-full text-sm min-w-[560px]">
          <thead style={{ background: C.ink, color: C.white }}>
            <tr>
              <th className="text-left p-3">Produit</th>
              <th className="text-left p-3">Catégorie</th>
              <th className="text-left p-3">Prix</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Ventes</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ background: C.cream, borderTop: `1px solid ${C.border}` }}>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3" style={{ fontFamily: FONT_MONO }}>{fmt(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.sold}</td>
                <td className="p-3"><button onClick={() => removeProduct(p.id)}><Trash2 size={16} color={C.rust} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPublications({ publications, setPublications }) {
  const [draft, setDraft] = useState({ type: "Publication", title: "", excerpt: "" });
  const add = () => {
    if (!draft.title) return;
    setPublications((p) => [...p, { id: "u" + Date.now(), ...draft, date: new Date().toISOString().slice(0, 10) }]);
    setDraft({ type: "Publication", title: "", excerpt: "" });
  };
  const remove = (id) => setPublications((p) => p.filter((u) => u.id !== id));

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-2xl md:text-4xl">Publications & Événements</h1>
      <div className="rounded-lg p-4 mt-4 grid md:grid-cols-4 gap-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
        <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }}>
          <option>Publication</option><option>Événement</option>
        </select>
        <input placeholder="Titre" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="p-2 rounded-md md:col-span-2" style={{ border: `1px solid ${C.border}` }} />
        <button onClick={add} className="px-4 py-2 rounded-md text-white font-semibold" style={{ background: C.rust }}>Publier</button>
        <input placeholder="Texte court" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="p-2 rounded-md md:col-span-4" style={{ border: `1px solid ${C.border}` }} />
      </div>
      <div className="flex flex-col gap-3 mt-5">
        {publications.slice().sort((a, b) => b.date.localeCompare(a.date)).map((u) => (
          <div key={u.id} className="rounded-lg p-4 flex justify-between items-start" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
            <div>
              <div className="text-xs font-semibold uppercase" style={{ color: u.type === "Événement" ? C.rust : C.green }}>{u.type} · {u.date}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18 }}>{u.title}</div>
              <div className="text-sm" style={{ color: C.inkSoft }}>{u.excerpt}</div>
            </div>
            <button onClick={() => remove(u.id)}><Trash2 size={16} color={C.rust} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCommandes({ commandes, setCommandes }) {
  const setStatut = (id, statut) => setCommandes((cs) => cs.map((c) => (c.id === id ? { ...c, statut } : c)));
  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-2xl md:text-4xl">Commandes reçues</h1>
      <div className="flex flex-col gap-3 mt-5">
        {commandes.length === 0 && <p style={{ color: C.inkSoft }}>Aucune commande pour le moment.</p>}
        {commandes.slice().reverse().map((c) => (
          <div key={c.id} className="rounded-lg p-4" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <div className="font-semibold">{c.client}</div>
                <div className="text-xs" style={{ color: C.inkSoft }}>{c.tel} · {c.date}</div>
              </div>
              <select value={c.statut} onChange={(e) => setStatut(c.id, e.target.value)} className="p-1.5 rounded-md text-sm" style={{ border: `1px solid ${C.border}` }}>
                <option>Nouvelle</option><option>En cours</option><option>Livrée</option>
              </select>
            </div>
            <ul className="mt-2 text-sm" style={{ color: C.inkSoft }}>
              {c.items.map((it, i) => <li key={i}>{it.qty} × {it.name}</li>)}
            </ul>
            <div className="mt-2 font-semibold" style={{ fontFamily: FONT_MONO }}>{fmt(c.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Facturation({ products, factures, setFactures }) {
  const [type, setType] = useState("Facture");
  const [client, setClient] = useState({ nom: "", contact: "" });
  const [lignes, setLignes] = useState([]);

  const addLigne = () => setLignes((l) => [...l, { productId: products[0]?.id, qty: 1, prix: products[0]?.price || 0 }]);
  const updateLigne = (i, field, val) => setLignes((l) => l.map((ln, idx) => idx === i ? { ...ln, [field]: val } : ln));
  const removeLigne = (i) => setLignes((l) => l.filter((_, idx) => idx !== i));

  const sousTotal = lignes.reduce((s, l) => s + Number(l.prix) * Number(l.qty), 0);
  const tva = Math.round(sousTotal * 0.18);
  const total = sousTotal + tva;

  const prefix = { "Facture": "FAC", "Proforma": "PRO", "Devis": "DEV" }[type];

  const generer = () => {
    if (!client.nom || lignes.length === 0) return;
    const numero = `${prefix}-2026-${String(docCounter++).padStart(3, "0")}`;
    setFactures((f) => [...f, { numero, type, client: { ...client }, lignes: [...lignes], sousTotal, tva, total, date: new Date().toISOString().slice(0, 10) }]);
    setClient({ nom: "", contact: "" });
    setLignes([]);
  };

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }} className="text-2xl md:text-4xl">Facturation</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <div className="rounded-lg p-4" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
          <div className="flex gap-2 mb-3">
            {["Facture", "Proforma", "Devis"].map((t) => (
              <button key={t} onClick={() => setType(t)} className="px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: type === t ? C.green : C.bgAlt, color: type === t ? C.white : C.ink }}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nom du client" value={client.nom} onChange={(e) => setClient({ ...client, nom: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
            <input placeholder="Contact" value={client.contact} onChange={(e) => setClient({ ...client, contact: e.target.value })} className="p-2 rounded-md" style={{ border: `1px solid ${C.border}` }} />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {lignes.map((l, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-center">
                <select value={l.productId} onChange={(e) => {
                  const prod = products.find((p) => p.id === e.target.value);
                  updateLigne(i, "productId", e.target.value);
                  updateLigne(i, "prix", prod.price);
                }} className="col-span-2 md:col-span-6 p-2 rounded-md text-sm" style={{ border: `1px solid ${C.border}` }}>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" placeholder="Qté" value={l.qty} onChange={(e) => updateLigne(i, "qty", e.target.value)} className="col-span-1 md:col-span-2 p-2 rounded-md text-sm w-full" style={{ border: `1px solid ${C.border}` }} />
                <input type="number" placeholder="Prix" value={l.prix} onChange={(e) => updateLigne(i, "prix", e.target.value)} className="col-span-1 md:col-span-3 p-2 rounded-md text-sm w-full" style={{ border: `1px solid ${C.border}` }} />
                <button onClick={() => removeLigne(i)} className="col-span-2 md:col-span-1 flex justify-center"><Trash2 size={15} color={C.rust} /></button>
              </div>
            ))}
            <button onClick={addLigne} className="text-sm flex items-center gap-1 mt-1" style={{ color: C.rust }}>
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>

          <div className="mt-4 text-sm flex flex-col gap-1" style={{ fontFamily: FONT_MONO }}>
            <div className="flex justify-between"><span>Sous-total</span><span>{fmt(sousTotal)}</span></div>
            <div className="flex justify-between"><span>TVA (18%)</span><span>{fmt(tva)}</span></div>
            <div className="flex justify-between font-bold"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
          <button onClick={generer} className="mt-4 w-full py-2.5 rounded-md text-white font-semibold" style={{ background: C.rust }}>
            Générer le document
          </button>
        </div>

        <div className="rounded-lg p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="Logo EGBM" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22 }}>EGBM</div>
                <div className="text-xs" style={{ color: C.inkSoft }}>Entreprise Générale Bamba Mamadou<br />Korhogo, Côte d'Ivoire</div>
              </div>
            </div>
            <Stamp label={type.toUpperCase()} />
          </div>
          <div className="text-xs mt-3" style={{ fontFamily: FONT_MONO, color: C.inkSoft }}>
            N° {prefix}-2026-{String(docCounter).padStart(3, "0")} (aperçu) · {new Date().toISOString().slice(0, 10)}
          </div>
          <div className="mt-3 text-sm">
            <div className="font-semibold">Client :</div>
            <div>{client.nom || "—"}</div>
            <div style={{ color: C.inkSoft }}>{client.contact}</div>
          </div>
          <table className="w-full text-sm mt-4">
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}><th className="text-left py-1">Article</th><th className="text-right py-1">Qté</th><th className="text-right py-1">P.U.</th><th className="text-right py-1">Total</th></tr></thead>
            <tbody>
              {lignes.map((l, i) => {
                const prod = products.find((p) => p.id === l.productId);
                return (
                  <tr key={i}>
                    <td className="py-1">{prod?.name}</td>
                    <td className="py-1 text-right">{l.qty}</td>
                    <td className="py-1 text-right" style={{ fontFamily: FONT_MONO }}>{Number(l.prix).toLocaleString("fr-FR")}</td>
                    <td className="py-1 text-right" style={{ fontFamily: FONT_MONO }}>{(l.qty * l.prix).toLocaleString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 text-sm flex flex-col items-end" style={{ fontFamily: FONT_MONO }}>
            <div>Sous-total : {fmt(sousTotal)}</div>
            <div>TVA 18% : {fmt(tva)}</div>
            <div className="font-bold">Total : {fmt(total)}</div>
          </div>
        </div>
      </div>

      {factures.length > 0 && (
        <div className="mt-6">
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700 }}>Documents générés</h2>
          <div className="flex flex-col gap-2 mt-2">
            {factures.slice().reverse().map((f) => (
              <div key={f.numero} className="rounded-md p-3 flex justify-between text-sm" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: FONT_MONO }}>{f.numero} — {f.type}</span>
                <span>{f.client.nom}</span>
                <span style={{ fontFamily: FONT_MONO }}>{fmt(f.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
