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
  Landmark,
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
  Wrench,
  X,
} from "lucide-react";
import logo from "@/assets/infinity-logo.png";
import { sections, type PenaltySection, type RuleSection, type SafeZoneSection } from "@/data/laws";

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
          className="law-card anim-rise glass-panel rounded-2xl p-5 ps-6"
          style={{ animationDelay: `${Math.min(i, 14) * 35}ms` }}
        >
          <span className="pointer-events-none absolute -end-1 top-0 font-display text-[92px] leading-none font-black text-primary/7 select-none">
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

function safeZoneVisual(label: string) {
  if (label.includes("شرطة")) return Shield;
  if (label.includes("مستشف")) return Hospital;
  if (label.includes("شقق")) return Building2;
  if (label.includes("حديقة")) return Trees;
  if (label.includes("منطقة عامة") || label.includes("كراجات")) return Landmark;
  if (label.includes("مطاعم") || label.includes("كافيه")) return UtensilsCrossed;
  if (label.includes("ورش")) return Wrench;
  if (label.includes("سجن")) return Lock;
  if (label.includes("محكمة")) return Scale;
  if (label.includes("حجز")) return CircleParking;
  if (label.includes("معارض")) return CarFront;
  if (label.includes("تأجير")) return KeyRound;
  if (label.includes("كازينو")) return Dices;
  if (label.includes("وشوم") || label.includes("حلاقة")) return Scissors;
  return MapPinned;
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
  const q = query.trim();
  const zones = q ? section.safeZones.filter((z) => z.label.includes(q)) : section.safeZones;

  if (zones.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        لا توجد منطقة مطابقة لبحثك.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-safe/30 bg-safe/8 px-5 py-4">
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
          const Icon = safeZoneVisual(z.label);
          return (
            <article
              key={z.label}
              className="safe-tile anim-rise min-h-[220px] rounded-[1.6rem] p-5"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[11px] font-black tracking-[0.22em] text-safe/80">
                    SZ-{pad(i + 1)}
                  </span>
                  <span className="rounded-full border border-safe/35 bg-safe/15 px-2.5 py-0.5 text-[9px] font-black tracking-[0.22em] text-safe">
                    آمن
                  </span>
                </div>

                <div className="relative mx-auto mt-5 mb-4">
                  <span className="anim-pulse-ring absolute inset-[-10px] rounded-full border border-safe/50" />
                  <span
                    className="anim-pulse-ring absolute inset-[-10px] rounded-full border border-safe/30"
                    style={{ animationDelay: "1.1s" }}
                  />
                  <span className="relative flex size-16 items-center justify-center rounded-full border border-safe/40 bg-black/30 text-safe shadow-[0_0_28px_oklch(0.78_0.14_175/0.35)]">
                    <Icon className="size-7" />
                  </span>
                </div>

                <h3 className="font-display text-center text-[15px] leading-7 font-bold">
                  {z.label}
                </h3>
                <p className="mt-1 text-center text-[10px] tracking-[0.28em] text-safe/80">
                  محمية دستورية
                </p>

                <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-4">
                  <span className="rounded-full bg-black/30 px-2 py-1 text-[9px] text-muted-foreground">
                    لا خطف
                  </span>
                  <span className="rounded-full bg-black/30 px-2 py-1 text-[9px] text-muted-foreground">
                    لا سلاح
                  </span>
                  <span className="rounded-full bg-black/30 px-2 py-1 text-[9px] text-muted-foreground">
                    لا سيناريو
                  </span>
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
    <div className="scene-3d flex h-screen flex-col px-4 py-4 md:px-8 md:py-6">
      <header className="glass-panel neon-ring flex flex-wrap items-center gap-4 rounded-2xl px-4 py-3">
        <img
          src={logo}
          alt="شعار سيرفر إنفينيتي"
          className="size-11 rounded-2xl object-cover"
        />
        <div className="me-auto">
          <h1 className="font-display text-lg leading-tight font-black">
            دستور مدينة <span className="neon-text tracking-wide">INFINITE</span>
          </h1>
          <p className="text-[11px] tracking-widest text-muted-foreground">
            CFW · نظام اللعب · {total} مادة
          </p>
        </div>

        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute start-3 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث داخل القسم المفتوح…"
            className="h-11 w-56 rounded-full border border-border bg-secondary/40 ps-9 pe-9 text-sm outline-none transition focus:w-72 focus:border-primary/70 md:w-64"
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

      <nav className="layer-3d mt-4 flex justify-center">
        <div className="glass-panel flex flex-wrap items-center justify-center gap-1.5 rounded-3xl px-2 py-2 sm:gap-2 sm:px-3">
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
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "neon-ring border-primary/70 bg-primary text-primary-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                {s.label}
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
        className="scroll-neon layer-3d mt-4 min-h-0 flex-1 overflow-y-auto pe-2"
      >
        <div className="anim-rise mb-5 flex items-start gap-3">
          {active.kind === "safezones" ? (
            <ShieldCheck className="mt-1 size-5 text-safe" />
          ) : (
            <ScrollText className="mt-1 size-5 text-primary" />
          )}
          <div>
            <h2 className="font-display text-2xl font-black">{active.label}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">{active.subtitle}</p>
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
