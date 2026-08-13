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
      className={`scene-3d fixed inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto px-5 text-center pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
        leaving ? "anim-fade-out" : ""
      }`}
    >
      <div className="layer-3d relative my-auto flex w-full max-w-lg flex-col items-center py-6">
        <div className="relative">
          <span className="anim-pulse-ring absolute inset-0 rounded-[34%] border border-primary/60" />
          <span
            className="anim-pulse-ring absolute inset-0 rounded-[34%] border border-accent/50"
            style={{ animationDelay: "1.2s" }}
          />
          <img
            src={logo}
            alt="شعار سيرفر إنفينيتي"
            className="anim-float neon-ring size-28 rounded-[28%] object-cover sm:size-36 md:size-44"
          />
        </div>

        <p className="mt-7 text-[10px] tracking-[0.55em] text-muted-foreground sm:mt-10 sm:text-xs sm:tracking-[0.65em]">
          CFW
        </p>
        <h1 className="neon-text font-display mt-2 text-[clamp(2.4rem,12vw,6rem)] leading-none font-black tracking-[0.06em] sm:mt-3 sm:tracking-[0.12em]">
          INFINITE
        </h1>
        <p className="mt-2 text-[10px] tracking-[0.35em] text-muted-foreground sm:mt-3 sm:text-[11px] sm:tracking-[0.45em]">
          نظام اللعب
        </p>
        <p className="mt-4 max-w-xl text-[13px] leading-7 text-muted-foreground sm:mt-5 sm:text-sm sm:leading-8 md:text-base">
          أنت على أبواب دخول مدينة إنفينيتي. مجتمع رول بلاي يسعى للكمال — اقرأ الدستور جيدًا،
          والتزم به احترامًا لنفسك ولمن حولك.
        </p>

        <button
          onClick={enter}
          className="group neon-ring relative mt-7 w-full max-w-xs overflow-hidden rounded-full bg-primary px-12 py-3.5 text-base font-bold text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95 sm:mt-10 sm:w-auto sm:py-4"
        >
          <span className="relative z-10">دخول المدينة</span>
          <span className="anim-sweep absolute inset-y-0 w-1/3 bg-primary-foreground/25 blur-md" />
        </button>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] tracking-widest text-muted-foreground sm:mt-10 sm:gap-6 sm:text-[11px]">
          <span>V . 2026</span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span>دستور المدينة</span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span>GTA V • FiveM</span>
        </div>
      </div>
    </div>
  );
}
