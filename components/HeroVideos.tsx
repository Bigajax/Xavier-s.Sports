"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const sources = [
  "/videos/hero-1.mp4",
  "/videos/hero-2.mp4",
  "/videos/hero-3.mp4",
];

/** Tríptico de vídeos do Instagram da loja em painéis com o corte Xavier (-8°). */
export default function HeroVideos() {
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const getVideos = () =>
    Array.from(wrap.current?.querySelectorAll("video") ?? []);

  const playAll = () =>
    getVideos().forEach((v) => {
      v.play().catch(() => {});
    });
  const pauseAll = () => getVideos().forEach((v) => v.pause());

  useEffect(() => {
    const vids = getVideos();
    if (!vids.length) return;
    // respeita reduced-motion: quem preferir menos movimento vê o quadro parado
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playAll();
    }
    // o navegador pode suspender autoplay sem disparar "pause" — sincroniza por polling
    const id = window.setInterval(() => {
      const v = getVideos()[0];
      if (v) setPlaying(!v.paused);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div
        ref={wrap}
        className="relative h-[360px] sm:h-[440px] md:h-[540px]"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-roxo/25 blur-3xl" />
        <div className="absolute inset-0 flex items-stretch gap-2.5 px-3 sm:gap-4 sm:px-4">
          {sources.map((src, i) => (
            <div
              key={src}
              className={`relative flex-1 -skew-x-[8deg] overflow-hidden rounded-xl shadow-2xl shadow-ink ${
                i === 1
                  ? "z-10 -my-1 ring-2 ring-amarelo/70 md:-my-2"
                  : "my-4 md:my-6"
              }`}
            >
              <video
                src={src}
                className="absolute left-1/2 top-1/2 h-[110%] w-[190%] max-w-none -translate-x-1/2 -translate-y-1/2 skew-x-[8deg] object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => (playing ? pauseAll() : playAll())}
        aria-label={playing ? "Pausar vídeos" : "Reproduzir vídeos"}
        className="absolute -bottom-1 right-1 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-ink/70 text-white backdrop-blur transition-colors hover:border-amarelo hover:text-amarelo"
      >
        {playing ? (
          <Pause className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
