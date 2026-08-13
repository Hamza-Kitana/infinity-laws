import { useEffect, useRef } from "react";

type Building = { x: number; z: number; w: number; d: number; h: number; lit: number };

/** خلفية ثلاثية الأبعاد: مدينة سلكية متحركة + شبكة نيون + جزيئات عمق */
export function CityBackground({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const buildings: Building[] = Array.from({ length: isMobile ? 52 : 120 }, () => {
      const side = Math.random() < 0.5 ? -1 : 1;
      return {
        x: side * rand(120, 900),
        z: rand(60, 4200),
        w: rand(80, 220),
        d: rand(80, 220),
        h: rand(160, 900),
        lit: Math.random(),
      };
    });

    const stars = Array.from({ length: isMobile ? 70 : 160 }, () => ({
      x: rand(-1600, 1600),
      y: rand(-900, -120),
      z: rand(300, 4200),
      s: rand(0.4, 1.6),
    }));

    let pointerX = 0;
    let pointerY = 0;
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer);

    let camZ = 0;
    let camX = 0;
    let camY = 0;
    const FOV = 520;

    const project = (x: number, y: number, z: number) => {
      const zz = z - camZ;
      if (zz <= 1) return null;
      const scale = FOV / zz;
      return {
        sx: w / 2 + (x - camX) * scale,
        sy: h * 0.62 + (y - camY) * scale,
        scale,
        zz,
      };
    };

    const draw = (t: number) => {
      const k = intensityRef.current;
      camZ += 2.2 + 3.4 * k;
      camX += (pointerX * 130 - camX) * 0.03;
      camY += (pointerY * 55 - camY) * 0.03;

      ctx.clearRect(0, 0, w, h);

      // وهج الأفق
      const glow = ctx.createRadialGradient(w / 2, h * 0.62, 0, w / 2, h * 0.62, Math.max(w, h) * 0.75);
      glow.addColorStop(0, `rgba(168, 85, 247, ${0.3 * k})`);
      glow.addColorStop(0.45, `rgba(109, 40, 217, ${0.14 * k})`);
      glow.addColorStop(1, "rgba(6, 2, 14, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // نجوم
      for (const s of stars) {
        const p = project(s.x, s.y, s.z);
        if (!p) {
          s.z += 4200;
          continue;
        }
        if (p.zz < 40) s.z += 4200;
        ctx.globalAlpha = Math.min(1, p.scale * 1.6) * 0.7;
        ctx.fillStyle = "#e9d5ff";
        ctx.fillRect(p.sx, p.sy, s.s * p.scale * 2, s.s * p.scale * 2);
      }
      ctx.globalAlpha = 1;

      // شبكة الطريق
      ctx.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const z = ((i * 220 - (camZ % 220)) % 8800) + 60;
        const a = project(-1400, 260, z);
        const b = project(1400, 260, z);
        if (!a || !b) continue;
        ctx.strokeStyle = `rgba(192, 132, 252, ${Math.min(0.32, (a.scale * 1.5) / 2) * k})`;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }
      for (let gx = -1400; gx <= 1400; gx += 200) {
        const a = project(gx, 260, 80);
        const b = project(gx, 260, 5200);
        if (!a || !b) continue;
        ctx.strokeStyle = `rgba(147, 51, 234, ${0.16 * k})`;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      // أبراج المدينة
      const sorted = [...buildings].sort((p, q) => q.z - p.z);
      for (const bl of sorted) {
        if (bl.z - camZ < 40) {
          bl.z += 4400;
          bl.h = rand(160, 900);
          bl.x = (Math.random() < 0.5 ? -1 : 1) * rand(120, 900);
        }
        const base = project(bl.x, 260, bl.z);
        const top = project(bl.x, 260 - bl.h, bl.z);
        if (!base || !top) continue;
        const pw = bl.w * base.scale;
        const fade = Math.max(0, Math.min(1, 1 - (bl.z - camZ) / 4200));
        ctx.fillStyle = `rgba(20, 6, 38, ${0.85 * fade})`;
        ctx.fillRect(base.sx - pw / 2, top.sy, pw, base.sy - top.sy);
        ctx.strokeStyle = `rgba(196, 132, 252, ${0.5 * fade * k})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(base.sx - pw / 2, top.sy, pw, base.sy - top.sy);

        // نوافذ مضيئة
        const rows = Math.floor((base.sy - top.sy) / (14 * Math.max(0.4, base.scale * 6)));
        if (rows > 1 && pw > 6) {
          const step = (base.sy - top.sy) / rows;
          for (let r = 0; r < rows; r++) {
            const flick = Math.sin(t * 0.001 + bl.lit * 20 + r) > 0.15;
            if (!flick) continue;
            ctx.fillStyle = `rgba(233, 213, 255, ${0.16 * fade})`;
            ctx.fillRect(base.sx - pw / 2 + 2, top.sy + r * step + 2, pw - 4, Math.max(1, step * 0.35));
          }
        }
      }

      // ضباب سفلي
      const fog = ctx.createLinearGradient(0, h * 0.5, 0, h);
      fog.addColorStop(0, "rgba(10, 3, 22, 0)");
      fog.addColorStop(1, "rgba(10, 3, 22, 0.95)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <canvas ref={ref} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_35%,oklch(0.09_0.05_300/0.85)_100%)]" />
    </div>
  );
}