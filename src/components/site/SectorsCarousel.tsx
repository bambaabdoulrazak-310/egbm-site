"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectorIcon } from "@/components/site/SectorIcon";
import { sectorHref } from "@/lib/sector-link";

export interface CarouselSector {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  icon: string;
  link: string | null;
}

const GAP = 20; // = gap-5
const AUTO_SCROLL_MS = 4500;
const DRAG_THRESHOLD = 6;
const COPIES = 3;
const RESUME_AFTER_MS = 6000;

// Carrousel en boucle : après la dernière carte revient la première, toujours dans le même
// sens (aucun retour en arrière). Pour que la boucle soit invisible, la liste est répétée 3
// fois et on se recentre sur la copie du milieu dès que le défilement est au repos.
// Il défile tout seul, se glisse au doigt ou à la souris et se pilote avec les flèches.
export function SectorsCarousel({ sectors }: { sectors: CarouselSector[] }) {
  const n = sectors.length;
  const track = useRef<HTMLDivElement>(null);
  const [loop, setLoop] = useState(false);
  const loopRef = useRef(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
  const [dragging, setDragging] = useState(false);

  const step = useCallback(() => {
    const first = track.current?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + GAP : 0;
  }, []);

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = track.current;
      if (!el) return;
      el.scrollTo({ left: index * step(), behavior: reducedMotion() ? "auto" : "smooth" });
    },
    [step]
  );

  // Se recentre sur la copie du milieu (contenu identique : aucun saut visible).
  const recenter = useCallback(() => {
    const el = track.current;
    if (!el || drag.current.down) return;
    const w = n * step();
    if (w <= 0) return;
    if (el.scrollLeft >= 2 * w - 2) el.scrollLeft -= w;
    else if (el.scrollLeft < w - 2) el.scrollLeft += w;
  }, [n, step]);

  // Mode boucle seulement s'il y a plus de cartes que de place ; recalculé à chaque
  // redimensionnement (et la position est conservée).
  useEffect(() => {
    const el = track.current;
    if (!el || n === 0) return;

    function measure() {
      const node = track.current;
      if (!node) return;
      const s = step();
      if (s <= 0) return;
      const fits = n * s - GAP <= node.clientWidth + 4;
      setLoop(!fits);
      if (!fits && loopRef.current) node.scrollLeft = (n + activeRef.current) * s;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [n, step]);

  // Quand le mode boucle change, on place la piste sur la copie du milieu (ou au début).
  useLayoutEffect(() => {
    loopRef.current = loop;
    const el = track.current;
    if (!el) return;
    el.scrollLeft = loop ? n * step() : 0;
  }, [loop, n, step]);

  // Position courante (pour les points) et recentrage une fois le défilement au repos.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const s = step();
        if (s <= 0 || n === 0) return;
        const index = Math.round(el.scrollLeft / s);
        activeRef.current = ((index % n) + n) % n;
        setActive(activeRef.current);
      });
      if (loopRef.current) {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(recenter, 160);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [n, step, recenter]);

  const next = useCallback(() => {
    const el = track.current;
    if (!el) return;
    scrollToIndex(Math.round(el.scrollLeft / step()) + 1);
  }, [scrollToIndex, step]);

  const prev = useCallback(() => {
    const el = track.current;
    if (!el) return;
    scrollToIndex(Math.round(el.scrollLeft / step()) - 1);
  }, [scrollToIndex, step]);

  // Défilement automatique en continu, sauf pendant une interaction (toucher, glissé,
  // clavier, clic sur une flèche ou un point). Avec « réduire les animations », le
  // changement de carte se fait sans animation.
  useEffect(() => {
    if (!loop || paused) return;
    const id = setInterval(next, AUTO_SCROLL_MS);
    return () => clearInterval(id);
  }, [loop, paused, next]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    []
  );

  function pauseFor(ms: number) {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), ms);
  }

  function goToSector(i: number) {
    const el = track.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / step());
    // Le chemin le plus court parmi les trois copies.
    const target = [i, n + i, 2 * n + i].reduce((best, x) =>
      Math.abs(x - current) < Math.abs(best - current) ? x : best
    );
    scrollToIndex(target);
  }

  // Glisser à la souris (le toucher défile déjà nativement).
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
    drag.current = { down: true, moved: false, startX: e.clientX, startLeft: track.current.scrollLeft };
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.down || !track.current) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) track.current.scrollLeft = d.startLeft - dx;
  }
  function endDrag() {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved && track.current) {
      setDragging(false);
      scrollToIndex(Math.round(track.current.scrollLeft / step()));
    }
  }

  // Copie 1 = liste d'origine (au milieu) ; copies 0 et 2 = clones masqués aux lecteurs
  // d'écran. Hors mode boucle, on n'affiche que la liste d'origine.
  const copies = loop ? Array.from({ length: COPIES }, (_, c) => c) : [1];

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Nos secteurs d'activité"
      onFocus={(e) => {
        // Pause seulement pour la navigation au clavier (un clic sur une flèche ne doit pas
        // bloquer le défilement indéfiniment).
        if (e.target.matches(":focus-visible")) setPaused(true);
      }}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => pauseFor(RESUME_AFTER_MS)}
      className="relative"
    >
      <div className="relative">
        <div
          ref={track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={(e) => {
            // Un glissé à la souris ne doit pas ouvrir un lien par erreur.
            if (drag.current.moved) {
              e.preventDefault();
              drag.current.moved = false;
            }
          }}
          className={`flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing select-none" : "snap-x snap-mandatory"
          } ${loop ? "cursor-grab" : ""}`}
        >
          {copies.flatMap((c) =>
            sectors.map((sector) => (
              <article
                key={`${c}-${sector.id}`}
                aria-hidden={c !== 1 ? true : undefined}
                className="group flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.34px)]"
              >
                <div className="relative h-40 overflow-hidden">
                  {sector.photoUrl ? (
                    <Image
                      src={sector.photoUrl}
                      alt={c === 1 ? sector.name : ""}
                      fill
                      draggable={false}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      role={c === 1 ? "img" : undefined}
                      aria-label={c === 1 ? sector.name : undefined}
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night to-cement"
                    >
                      <SectorIcon name={sector.icon} className="text-white/70" size={56} strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3">
                    <SectorIcon name={sector.icon} className="shrink-0 text-rust" size={26} strokeWidth={1.6} />
                    <h3 className="font-display text-xl font-bold text-ink">{sector.name}</h3>
                  </div>
                  {sector.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                      {sector.description}
                    </p>
                  )}
                  <Link
                    href={sectorHref(sector)}
                    draggable={false}
                    tabIndex={c === 1 ? undefined : -1}
                    className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-rust hover:underline"
                  >
                    En savoir plus <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {loop && (
          <>
            <button
              type="button"
              onClick={() => {
                prev();
                pauseFor(RESUME_AFTER_MS);
              }}
              aria-label="Secteurs précédents"
              className="absolute left-3 top-20 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/70 text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-white/95 hover:text-rust xl:-left-14 xl:top-1/2"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                next();
                pauseFor(RESUME_AFTER_MS);
              }}
              aria-label="Secteurs suivants"
              className="absolute right-3 top-20 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/70 text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-white/95 hover:text-rust xl:-right-14 xl:top-1/2"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {loop && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5" aria-label="Pagination du carrousel">
            {sectors.map((sector, i) => (
              <button
                key={sector.id}
                type="button"
                onClick={() => {
                  goToSector(i);
                  pauseFor(RESUME_AFTER_MS);
                }}
                aria-label={`Aller au secteur ${sector.name}`}
                aria-current={i === active ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-rust" : "w-2 bg-border-egbm hover:bg-ink-soft"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
