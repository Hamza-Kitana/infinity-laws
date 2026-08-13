import { useMemo, useState, type ReactNode } from "react";
import {
  Ban,
  Building2,
  CarFront,
  CircleParking,
  Dices,
  Gavel,
  Hospital,
  KeyRound,
  Lock,
  MapPinned,
  Scale,
  Scissors,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Ticket,
  Trees,
  TriangleAlert,
  Users,
  UtensilsCrossed,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import logo from "@/assets/infinity-logo.png";
import { sections, type PenaltySection, type RuleSection, type SafeZone, type SafeZoneSection } from "@/data/laws";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function parseRange(value: string) {
  const nums = value.match(/\d+/g)?.map(Number) ?? [0];
  return { min: nums[0] ?? 0, max: nums[1] ?? nums[0] ?? 0 };
}

const WARN_HEAT = [
  "oklch(0.84 0.16 95)",
  "oklch(0.76 0.18 62)",
  "oklch(0.70 0.21 38)",
  "oklch(0.64 0.24 22)",
  "oklch(0.60 0.27 14)",
] as const;

function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      <span className="hidden h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-transparent sm:block" />
    </div>
  );
}

function RulesGrid({ section, query }: { section: RuleSection; query: string }) {
  const q = query.trim();
  const rules = q
    ? section.rules.filter((r) => r.title.includes(q) || r.description.includes(q))
    : section.rules;

  if (rules.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        لا توجد مادة مطابقة لبحثك داخل هذا القسم.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rules.map((rule, i) => (
        <article
          key={rule.id}
          className="law-card anim-rise glass-panel rounded-2xl p-4 ps-5 md:p-5 md:ps-6"
          style={{ animationDelay: `${Math.min(i, 14) * 35}ms` }}
        >
          <span className="pointer-events-none absolute -end-1 top-0 font-display text-[64px] leading-none font-black text-primary/7 select-none md:text-[92px]">
            {pad(rule.id)}
          </span>
          <div className="relative flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/35 bg-primary/12 font-display text-lg font-black">
              <span className="neon-text">{pad(rule.id)}</span>
            </span>
            <div className="min-w-0 pt-0.5">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] tracking-[0.28em] text-primary">
                مادة دستورية
              </span>
              <h3 className="font-display mt-2 text-base font-bold text-foreground">{rule.title}</h3>
            </div>
          </div>
          <p className="relative mt-3 text-[13px] leading-7 text-muted-foreground">{rule.description}</p>
        </article>
      ))}
    </div>
  );
}

const SAFE_ZONE_STYLE: Record<
  string,
  { icon: typeof Shield; tile: string; badge: string; ring: string; iconColor: string; layout?: "garage" }
> = {
  "sz-police": {
    icon: Shield,
    tile: "border-primary/35 bg-primary/8",
    badge: "border-primary/40 bg-primary/15 text-primary",
    ring: "border-primary/45",
    iconColor: "text-primary",
  },
  "sz-hospital": {
    icon: Hospital,
    tile: "border-red-400/30 bg-red-500/8",
    badge: "border-red-400/35 bg-red-500/15 text-red-300",
    ring: "border-red-400/40",
    iconColor: "text-red-300",
  },
  "sz-apartments": {
    icon: Building2,
    tile: "border-accent/30 bg-accent/8",
    badge: "border-accent/35 bg-accent/15 text-accent",
    ring: "border-accent/40",
    iconColor: "text-accent",
  },
  "sz-park": {
    icon: Trees,
    tile: "safe-tile border-safe/45 bg-safe/10 sm:col-span-2",
    badge: "border-safe/45 bg-safe/20 text-safe",
    ring: "border-safe/55",
    iconColor: "text-safe",
  },
  "sz-public-garages": {
    icon: Warehouse,
    tile: "safe-tile-garage sm:col-span-2",
    badge: "border-amber-300/40 bg-amber-400/15 text-amber-200",
    ring: "border-amber-300/50",
    iconColor: "text-amber-200",
    layout: "garage",
  },
  "sz-restaurants": {
    icon: UtensilsCrossed,
    tile: "border-orange-400/28 bg-orange-500/8",
    badge: "border-orange-400/35 bg-orange-500/15 text-orange-200",
    ring: "border-orange-400/40",
    iconColor: "text-orange-200",
  },
  "sz-workshops": {
    icon: Wrench,
    tile: "border-muted-foreground/25 bg-secondary/30",
    badge: "border-border bg-secondary/50 text-muted-foreground",
    ring: "border-border",
    iconColor: "text-muted-foreground",
  },
  "sz-jail": {
    icon: Lock,
    tile: "border-zinc-400/25 bg-zinc-500/8",
    badge: "border-zinc-400/35 bg-zinc-500/15 text-zinc-300",
    ring: "border-zinc-400/40",
    iconColor: "text-zinc-300",
  },
  "sz-court": {
    icon: Scale,
    tile: "border-violet-400/28 bg-violet-500/8",
    badge: "border-violet-400/35 bg-violet-500/15 text-violet-200",
    ring: "border-violet-400/40",
    iconColor: "text-violet-200",
  },
  "sz-impound": {
    icon: CircleParking,
    tile: "border-sky-400/28 bg-sky-500/8",
    badge: "border-sky-400/35 bg-sky-500/15 text-sky-200",
    ring: "border-sky-400/40",
    iconColor: "text-sky-200",
  },
  "sz-dealerships": {
    icon: CarFront,
    tile: "border-cyan-400/25 bg-cyan-500/8",
    badge: "border-cyan-400/35 bg-cyan-500/15 text-cyan-200",
    ring: "border-cyan-400/40",
    iconColor: "text-cyan-200",
  },
  "sz-rental": {
    icon: KeyRound,
    tile: "border-emerald-400/25 bg-emerald-500/8",
    badge: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
    ring: "border-emerald-400/40",
    iconColor: "text-emerald-200",
  },
  "sz-casino": {
    icon: Dices,
    tile: "border-fuchsia-400/28 bg-fuchsia-500/8",
    badge: "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-200",
    ring: "border-fuchsia-400/40",
    iconColor: "text-fuchsia-200",
  },
  "sz-barber": {
    icon: Scissors,
    tile: "border-pink-400/25 bg-pink-500/8",
    badge: "border-pink-400/35 bg-pink-500/15 text-pink-200",
    ring: "border-pink-400/40",
    iconColor: "text-pink-200",
  },
};

function safeZoneStyle(zone: SafeZone) {
  return (
    SAFE_ZONE_STYLE[zone.id] ?? {
      icon: MapPinned,
      tile: "border-safe/25 bg-safe/6",
      badge: "border-safe/35 bg-safe/15 text-safe",
      ring: "border-safe/40",
      iconColor: "text-safe",
    }
  );
}

function PenaltiesPanel({ section }: { section: PenaltySection }) {
  const robberyMax = Math.max(
    ...section.robberyPeopleRules.map((r) => parseRange(r.value).max),
    1,
  );
  const policeMax = Math.max(
    ...section.directPoliceUnitsRules.map((r) => parseRange(r.value).max),
    1,
  );

  return (
    <div className="space-y-10">
      <section className="anim-rise">
        <SectionHeading
          icon={<Siren className="size-4" />}
          title="الإنذارات المتدرجة"
          hint="كل إنذار أشد من الذي قبله — الخامس نهاية الطريق"
        />
        <div className="relative">
          <div className="pointer-events-none absolute top-[46%] right-8 left-8 hidden h-px bg-gradient-to-l from-red-500/70 via-orange-400/50 to-amber-300/40 xl:block" />
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {section.warningLevels.map((w, i) => {
              const heat = WARN_HEAT[i] ?? WARN_HEAT[4];
              const fatal = i === section.warningLevels.length - 1;
              return (
                <div
                  key={w.id}
                  className={`warn-card anim-rise rounded-2xl p-4 text-center ${fatal ? "xl:scale-[1.03]" : ""}`}
                  style={{ animationDelay: `${i * 55}ms`, ["--heat" as string]: heat }}
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-white/10 bg-black/20">
                    {fatal ? (
                      <Ban className="size-6" style={{ color: heat }} />
                    ) : (
                      <span className="font-display text-3xl font-black" style={{ color: heat }}>
                        {w.id}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-sm font-bold">{w.title}</div>
                  <div
                    className="mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold"
                    style={{ background: `color-mix(in oklch, ${heat} 18%, transparent)`, color: heat }}
                  >
                    {w.duration}
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/35">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((i + 1) / section.warningLevels.length) * 100}%`,
                        background: heat,
                        boxShadow: `0 0 12px ${heat}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          icon={<Ticket className="size-4" />}
          title={section.warningRemoval.title}
          hint="بعد انتهاء المدة افتح تذكرة مع التصوير"
        />
        <div
          className="warn-card anim-rise rounded-2xl p-5 md:p-6"
          style={{ ["--heat" as string]: "oklch(0.78 0.14 175)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-3xl text-[13px] leading-7 text-muted-foreground">
              {section.warningRemoval.description}
            </p>
            <span className="rounded-full border border-safe/35 bg-safe/15 px-3 py-1 text-[11px] font-bold text-safe">
              {section.warningRemoval.duration}
            </span>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          icon={<Gavel className="size-4" />}
          title="العقوبات المحددة"
          hint="المخالفات الحساسة — بعضها نهائي من أول مرة"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {section.specificPenalties.map((p, i) => {
            const instant = p.penalty.includes("مباشر") || p.penalty.includes("لا رجعة");
            const byCase = p.penalty.includes("حسب الحالة");
            return (
              <div
                key={p.id}
                className="warn-card anim-rise rounded-2xl p-5"
                style={{
                  animationDelay: `${i * 45}ms`,
                  ["--heat" as string]: instant ? "oklch(0.62 0.26 14)" : "oklch(0.70 0.18 330)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {instant ? (
                      <Ban className="size-4 text-red-400" />
                    ) : (
                      <TriangleAlert className="size-4 text-primary" />
                    )}
                    {p.title}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider ${
                      instant
                        ? "bg-red-500/20 text-red-300"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {byCase ? "حسب الحالة" : instant ? "نهائي مباشر" : "تصاعدي"}
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-7 text-muted-foreground">{p.penalty}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeading
            icon={<Users className="size-4" />}
            title="عدد الأشخاص بالسرقات"
            hint="الحد الأدنى والأقصى للمشاركين — غالبًا يلزم رهينة"
          />
          <div className="glass-panel overflow-hidden rounded-2xl">
            {section.robberyPeopleRules.map((r) => {
              const { min, max } = parseRange(r.value);
              return (
                <div key={r.label} className="ops-row flex items-center gap-4 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{r.label}</div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-primary to-accent"
                        style={{ width: `${(max / robberyMax) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="neon-text font-display min-w-14 text-end text-sm font-black">
                    {min === max ? min : `${min}–${max}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeading
            icon={<ShieldAlert className="size-4" />}
            title="وحدات الشرطة المباشرة"
            hint="الحالات المفتوحة = العدد + 11 — Police MAX 11"
          />
          <div className="glass-panel overflow-hidden rounded-2xl">
            {section.directPoliceUnitsRules.map((r) => {
              const { max } = parseRange(r.value);
              return (
                <div key={r.label} className="ops-row flex items-center gap-4 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{r.label}</div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-red-400 to-primary"
                        style={{ width: `${(max / policeMax) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-display min-w-10 text-end text-sm font-black text-red-300">
                    {max}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function SafeZonesPanel({ section, query }: { section: SafeZoneSection; query: string }) {
  const q = query.trim().toLowerCase();
  const zones = q
    ? section.safeZones.filter(
        (z) =>
          z.label.includes(q) ||
          z.note.includes(q) ||
          z.category.includes(q) ||
          z.tags.some((t) => t.includes(q)),
      )
    : section.safeZones;

  if (zones.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        لا توجد منطقة مطابقة لبحثك.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-safe/30 bg-safe/8 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5 sm:py-4">
        <span className="flex size-11 items-center justify-center rounded-2xl border border-safe/35 bg-safe/15 text-safe">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black tracking-[0.35em] text-safe">SANCTUARY MAP</p>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
            داخل هذه المناطق: لا خطف، لا إطلاق نار، لا سيناريو إجرامي. يحق للشرطة الدخول والتعامل عند الاقتضاء.
          </p>
        </div>
        <span className="rounded-full border border-safe/30 px-3 py-1 text-[11px] font-bold text-safe">
          {zones.length} منطقة
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {zones.map((z, i) => {
          const style = safeZoneStyle(z);
          const Icon = style.icon;
          const zoneNo = section.safeZones.findIndex((sz) => sz.id === z.id) + 1;
          const isGarage = style.layout === "garage";

          return (
            <article
              key={z.id}
              className={`anim-rise min-h-[220px] overflow-hidden rounded-[1.4rem] border p-4 md:min-h-[240px] md:rounded-[1.6rem] md:p-5 ${style.tile}`}
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className={`relative flex h-full ${isGarage ? "flex-col sm:flex-row sm:items-center sm:gap-5" : "flex-col"}`}>
                <div className={`flex items-center justify-between gap-2 ${isGarage ? "sm:absolute sm:inset-x-0 sm:top-0" : ""}`}>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black tracking-[0.18em] ${style.badge}`}>
                    {z.category}
                  </span>
                  <span className="font-display text-[10px] font-black tracking-[0.18em] text-muted-foreground">
                    SZ-{pad(zoneNo)}
                  </span>
                </div>

                <div
                  className={`relative shrink-0 ${
                    isGarage
                      ? "mx-auto mt-4 mb-3 sm:mx-0 sm:mt-8 sm:mb-0"
                      : "mx-auto mt-4 mb-3 md:mt-5 md:mb-4"
                  }`}
                >
                  {z.featured && !isGarage ? (
                    <span className="anim-pulse-ring absolute inset-[-10px] rounded-2xl border border-safe/50 opacity-50" />
                  ) : null}
                  <span
                    className={`relative flex items-center justify-center border bg-black/30 ${
                      isGarage
                        ? "size-16 rounded-xl sm:size-[4.5rem]"
                        : z.featured
                          ? "size-14 rounded-2xl md:size-16"
                          : "size-14 rounded-2xl md:size-16 md:rounded-full"
                    } ${style.ring}`}
                  >
                    <Icon className={`size-6 md:size-7 ${style.iconColor}`} />
                  </span>
                </div>

                <div className={`min-w-0 flex-1 ${isGarage ? "sm:pt-8" : ""}`}>
                  <h3
                    className={`font-display text-[14px] leading-7 font-bold md:text-[15px] ${
                      isGarage ? "text-center sm:text-start" : "text-center"
                    }`}
                  >
                    {z.label}
                  </h3>
                  <p
                    className={`mt-2 text-[11px] leading-6 md:text-[12px] ${
                      isGarage
                        ? "text-center text-amber-100/75 sm:text-start"
                        : "text-center text-muted-foreground"
                    }`}
                  >
                    {z.note}
                  </p>

                  <div
                    className={`mt-4 flex flex-wrap gap-1.5 ${isGarage ? "justify-center sm:justify-start" : "justify-center"} ${isGarage ? "" : "mt-auto pt-4"}`}
                  >
                    {z.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-2 py-1 text-[9px] ${
                          isGarage
                            ? "border-amber-300/20 bg-amber-400/10 text-amber-100/85"
                            : "border-white/8 bg-black/35 text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        ملاحظة: يحق للشرطة الدخول للمناطق الآمنة وإطلاق النار عند الاقتضاء ضمن الأنظمة.
      </p>
    </div>
  );
}

export function LawsDeck() {
  const [activeId, setActiveId] = useState(sections[0]!.id);
  const [query, setQuery] = useState("");
  const active = useMemo(() => sections.find((s) => s.id === activeId) ?? sections[0]!, [activeId]);
  const total = useMemo(
    () => sections.reduce((n, s) => n + (s.kind === "rules" ? s.rules.length : 0), 0),
    [],
  );

  return (
    <div className="scene-3d flex h-dvh flex-col px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-6">
      <header className="glass-panel neon-ring flex flex-col gap-3 rounded-2xl px-3 py-3 md:flex-row md:flex-wrap md:items-center md:gap-4 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logo}
            alt="شعار سيرفر إنفينيتي"
            className="size-10 shrink-0 rounded-2xl object-cover md:size-11"
          />
          <div className="min-w-0">
            <h1 className="font-display text-base leading-tight font-black md:text-lg">
              دستور مدينة <span className="neon-text tracking-wide">INFINITE</span>
            </h1>
            <p className="text-[10px] tracking-widest text-muted-foreground md:text-[11px]">
              CFW · نظام اللعب · {total} مادة
            </p>
          </div>
        </div>

        <label className="relative flex w-full items-center md:ms-auto md:w-auto">
          <Search className="pointer-events-none absolute start-3 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث داخل القسم…"
            className="h-11 w-full rounded-full border border-border bg-secondary/40 ps-9 pe-9 text-base outline-none transition focus:border-primary/70 md:w-64 md:text-sm md:focus:w-72"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="مسح البحث"
              className="absolute end-3 text-muted-foreground transition hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </header>

      <nav className="scroll-tabs layer-3d -mx-3 mt-3 overflow-x-auto px-3 md:mx-0 md:mt-4 md:flex md:justify-center md:overflow-visible md:px-0">
        <div className="glass-panel flex w-max min-w-full items-center justify-start gap-1.5 rounded-2xl px-2 py-2 md:w-auto md:flex-wrap md:justify-center md:rounded-3xl md:px-3">
          {sections.map((s) => {
            const isActive = s.id === activeId;
            const count =
              s.kind === "rules"
                ? s.rules.length
                : s.kind === "safezones"
                  ? s.safeZones.length
                  : s.warningLevels.length;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveId(s.id);
                  setQuery("");
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-300 md:gap-2 md:px-5 md:py-2.5 md:text-sm ${
                  isActive
                    ? "neon-ring border-primary/70 bg-primary text-primary-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <span className="md:hidden">{s.short}</span>
                <span className="hidden md:inline">{s.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive ? "bg-primary-foreground/20" : "bg-secondary/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <section
        key={activeId}
        className="scroll-neon layer-3d mt-3 min-h-0 flex-1 overflow-y-auto pe-1 md:mt-4 md:pe-2"
      >
        <div className="anim-rise mb-4 flex items-start gap-3 md:mb-5">
          {active.kind === "safezones" ? (
            <ShieldCheck className="mt-1 size-5 shrink-0 text-safe" />
          ) : (
            <ScrollText className="mt-1 size-5 shrink-0 text-primary" />
          )}
          <div className="min-w-0">
            <h2 className="font-display text-xl font-black md:text-2xl">{active.label}</h2>
            <p className="mt-1 text-[12px] leading-6 text-muted-foreground md:text-[13px]">
              {active.subtitle}
            </p>
          </div>
        </div>

        {active.kind === "rules" ? (
          <RulesGrid section={active} query={query} />
        ) : active.kind === "safezones" ? (
          <SafeZonesPanel section={active} query={query} />
        ) : (
          <PenaltiesPanel section={active} />
        )}

        <footer className="mt-10 pb-4 text-center text-[11px] tracking-widest text-muted-foreground">
          © 2026 INFINITE · CFW · جميع الحقوق محفوظة
        </footer>
      </section>
    </div>
  );
}
