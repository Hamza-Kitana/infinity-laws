import { useState } from "react";
import logo from "@/assets/infinity-logo.png";

export function WelcomeGate({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onEnter, 700);
  };

  return (
    <div
      className={`scene-3d fixed inset-0 z-30 flex flex-col items-center justify-center px-6 text-center ${
        leaving ? "anim-fade-out" : ""
      }`}
    >
      <div className="layer-3d relative flex flex-col items-center">
        <div className="relative">
          <span className="anim-pulse-ring absolute inset-0 rounded-[34%] border border-primary/60" />
          <span
            className="anim-pulse-ring absolute inset-0 rounded-[34%] border border-accent/50"
            style={{ animationDelay: "1.2s" }}
          />
          <img
            src={logo}
            alt="شعار سيرفر إنفينيتي"
            className="anim-float neon-ring size-36 rounded-[28%] object-cover md:size-44"
          />
        </div>

        <p className="mt-10 text-xs tracking-[0.65em] text-muted-foreground">CFW</p>
        <h1 className="neon-text font-display mt-3 text-6xl leading-none font-black tracking-[0.12em] md:text-8xl">
          INFINITY
        </h1>
        <p className="mt-3 text-[11px] tracking-[0.45em] text-muted-foreground">نظام اللعب</p>
        <p className="mt-5 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
          أنت على أبواب دخول مدينة إنفينيتي. مجتمع رول بلاي يسعى للكمال — اقرأ الدستور جيدًا،
          والتزم به احترامًا لنفسك ولمن حولك.
        </p>

        <button
          onClick={enter}
          className="group neon-ring relative mt-10 overflow-hidden rounded-full bg-primary px-12 py-4 text-base font-bold text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">دخول المدينة</span>
          <span className="anim-sweep absolute inset-y-0 w-1/3 bg-primary-foreground/25 blur-md" />
        </button>

        <div className="mt-10 flex items-center gap-6 text-[11px] tracking-widest text-muted-foreground">
          <span>V . 2026</span>
          <span className="h-3 w-px bg-border" />
          <span>دستور المدينة</span>
          <span className="h-3 w-px bg-border" />
          <span>GTA V • FiveM</span>
        </div>
      </div>
    </div>
  );
}