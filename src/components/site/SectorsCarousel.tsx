"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { SectorIcon } from "@/components/site/SectorIcon";

export interface CarouselSector {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  icon: string;
}

const GAP = 20; // = gap-5
const AUTO_SCROLL_MS = 4500;
const DRAG_THRESHOLD = 6;

// Piste de cartes qui défile toute seule, qui se glisse au doigt ou à la souris et qui
// se pilote aussi avec les flèches et les points.
export function SectorsCarousel({ sectors }: { sectors: CarouselSector[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Nombre de « pages » (positions d'arrêt) et position courante, recalculés au
  // redimensionnement et au défilement.
  useEffect(() => {
    const el = track.current;
    if (!el) return;

    function measure() {
      const node = track.current;
      if (!node) return;
      const s = step();
      const overflow = node.scrollWidth - node.clientWidth;
      setPages(s > 0 && overflow > 4 ? Math.round(overflow / s) + 1 : 1);
      setActive(s > 0 ? Math.round(node.scrollLeft / s) : 0);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [step, sectors.length]);

  const next = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    scrollToIndex(atEnd ? 0 : Math.round(el.scrollLeft / step()) + 1);
  }, [scrollToIndex, step]);

  const prev = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / step());
    scrollToIndex(index <= 0 ? pages - 1 : index - 1);
  }, [pages, scrollToIndex, step]);

  // Défilement automatique : il tourne dès qu'il y a plus de cartes que de place, sauf pendant
  // une interaction (toucher, glissé, clavier) ou si le visiteur a mis le carrousel en pause.
  // Avec « réduire les animations », le changement de carte se fait sans animation.
  useEffect(() => {
    if (pages <= 1 || paused || userPaused) return;
    const id = setInterval(next, AUTO_SCROLL_MS);
    return () => clearInterval(id);
  }, [pages, paused, userPaused, next]);

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

  const multiple = pages > 1;

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
      onTouchEnd={() => pauseFor(6000)}
      className="relative"
    >
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
        } ${multiple ? "cursor-grab" : ""}`}
      >
        {sectors.map((sector) => (
          <article
            key={sector.id}
            className="group flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.34px)]"
          >
            <div className="relative h-40 overflow-hidden">
              {sector.photoUrl ? (
                <Image
                  src={sector.photoUrl}
                  alt={sector.name}
                  fill
                  draggable={false}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  role="img"
                  aria-label={sector.name}
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
                href={`/produits?categorie=${sector.slug}`}
                draggable={false}
                className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-rust hover:underline"
              >
                En savoir plus <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {multiple && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5" aria-label="Pagination du carrousel">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  scrollToIndex(i);
                  pauseFor(6000);
                }}
                aria-label={`Aller à la position ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-rust" : "w-2 bg-border-egbm hover:bg-ink-soft"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Reprendre le défilement automatique" : "Mettre le défilement en pause"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-egbm bg-white text-ink transition-colors hover:border-rust hover:text-rust"
            >
              {userPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              type="button"
              onClick={() => {
                prev();
                pauseFor(6000);
              }}
              aria-label="Secteurs précédents"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-egbm bg-white text-ink transition-colors hover:border-rust hover:text-rust"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                next();
                pauseFor(6000);
              }}
              aria-label="Secteurs suivants"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-egbm bg-white text-ink transition-colors hover:border-rust hover:text-rust"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
