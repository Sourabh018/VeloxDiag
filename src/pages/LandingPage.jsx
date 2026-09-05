import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --pad-x: clamp(1.25rem, 4vw, 3rem);
    --nav-h: clamp(3.5rem, 6vh, 4.5rem);
    --h1: clamp(2.3rem, 5.5vw + 0.5rem, 4.4rem);
    --h2: clamp(1.6rem, 2.6vw + 0.6rem, 2.4rem);
    --sub: clamp(0.95rem, 0.4vw + 0.8rem, 1.08rem);
    --body: clamp(0.85rem, 0.2vw + 0.75rem, 0.95rem);
    --micro: clamp(0.7rem, 0.15vw + 0.62rem, 0.8rem);
    --gap-section: clamp(4.5rem, 9vw, 8rem);
  }
  * { box-sizing: border-box; }
  .land-root {
    min-height: 100vh; background: #F8FAFC;
    font-family: 'DM Sans', sans-serif; color: #0F172A;
    overflow-x: hidden; position: relative;
  }
  .land-canvas-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }

  /* ── NAV ── */
  .land-nav {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 var(--pad-x); height: var(--nav-h);
    background: rgba(248,250,252,0.7);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 0.5px solid #E2E8F0;
  }
  .land-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .land-logo { width: 32px; height: 32px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .land-brandname { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #0F172A; white-space: nowrap; }
  .land-brandname span { color: #2563EB; }
  .land-nav-btns { display: flex; gap: 10px; align-items: center; }
  .land-btn-ghost { padding: 8px 16px; background: transparent; border: 0.5px solid #E2E8F0; border-radius: 8px; color: #475569; font-size: 13px; font-weight: 500; cursor: pointer; transition: border-color 0.2s, color 0.2s; font-family: 'DM Sans', sans-serif; }
  .land-btn-ghost:hover { border-color: #2563EB; color: #0F172A; }
  .land-btn-primary { padding: 8px 18px; background: #2563EB; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; transition: background 0.2s, transform 0.15s; }
  .land-btn-primary:hover { background: #1D4ED8; transform: translateY(-1px); }

  /* ── HERO ── */
  .land-hero { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: clamp(4rem,10vh,7rem) var(--pad-x) clamp(3rem,6vh,4rem); text-align: center; }
  .land-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.7); backdrop-filter: blur(6px); border: 0.5px solid #BFDBFE; color: #2563EB; font-size: var(--micro); font-weight: 500; padding: 5px 14px; border-radius: 20px; margin-bottom: 1.75rem; letter-spacing: 0.3px; }
  .land-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563EB; animation: land-pulse 2s ease-in-out infinite; }
  @keyframes land-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .land-h1 { font-family: 'Syne', sans-serif; font-size: var(--h1); font-weight: 800; line-height: 1.08; color: #0F172A; margin: 0 0 1.5rem; letter-spacing: -1px; }
  .land-h1-word { display: inline-block; overflow: hidden; }
  .land-h1 .accent { color: #2563EB; }
  .land-hero-sub { font-size: var(--sub); color: #64748B; line-height: 1.7; margin: 0 auto 2.25rem; max-width: 560px; }
  .land-cta-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .land-cta-main { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #2563EB; border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; transition: background 0.2s, transform 0.15s; }
  .land-cta-main:hover { background: #1D4ED8; transform: translateY(-1px); }
  .land-cta-main svg { transition: transform 0.2s; }
  .land-cta-main:hover svg { transform: translateX(3px); }
  .land-cta-sec { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #FFFFFF; border: 0.5px solid #E2E8F0; border-radius: 12px; color: #334155; font-size: 15px; cursor: pointer; transition: border-color 0.2s, color 0.2s; font-family: 'DM Sans', sans-serif; }
  .land-cta-sec:hover { border-color: #2563EB; color: #0F172A; }

  /* ── MARQUEE TICKER ── */
  .land-ticker-wrap { position: relative; z-index: 1; border-top: 0.5px solid #E2E8F0; border-bottom: 0.5px solid #E2E8F0; background: #0F172A; overflow: hidden; padding: 14px 0; }
  .land-ticker-track { display: flex; gap: 0; white-space: nowrap; animation: land-marquee 28s linear infinite; width: max-content; }
  @keyframes land-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .land-ticker-item { display: flex; align-items: center; gap: 8px; padding: 0 2rem; font-family: 'DM Mono', monospace; font-size: 12.5px; color: #94A3B8; border-right: 0.5px solid #1E293B; }
  .land-ticker-item .path { color: #E2E8F0; }
  .land-ticker-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── SECTION SHELL ── */
  .land-section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: var(--gap-section) var(--pad-x) 0; }
  .land-section-index { font-family: 'DM Mono', monospace; font-size: var(--micro); color: #94A3B8; letter-spacing: 2px; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 10px; }
  .land-section-index .line { width: 32px; height: 1px; background: #CBD5E1; }
  .land-section-title { font-family: 'Syne', sans-serif; font-size: var(--h2); font-weight: 700; color: #0F172A; margin: 0 0 0.5rem; letter-spacing: -0.5px; }
  .land-section-sub { font-size: var(--body); color: #64748B; margin: 0 0 3rem; max-width: 500px; }

  /* ── STATS ── */
  .land-stats { position: relative; z-index: 1; display: flex; justify-content: center; flex-wrap: wrap; background: #FFFFFF; border-bottom: 0.5px solid #E2E8F0; }
  .land-stat { flex: 1; min-width: 160px; padding: 2rem 1.5rem; text-align: center; border-right: 0.5px solid #E2E8F0; }
  .land-stat:last-child { border-right: none; }
  .land-stat-num { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 700; color: #0F172A; margin-bottom: 4px; font-variant-numeric: tabular-nums; }
  .land-stat-num .acc { color: #2563EB; }
  .land-stat-label { font-size: var(--micro); color: #64748B; }

  /* ── PRODUCT SHOWCASE (stacked pin-scroll) ── */
  .land-showcase { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: var(--gap-section) var(--pad-x) 0; }
  .land-showcase-sticky { position: sticky; top: calc(var(--nav-h) + 2rem); height: fit-content; }
  .land-showcase-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 3rem; align-items: start; }
  @media (max-width: 900px) { .land-showcase-grid { grid-template-columns: 1fr; } .land-showcase-sticky { position: relative; top: 0; } }
  .land-showcase-tabs { display: flex; flex-direction: column; gap: 0.5rem; }
  .land-showcase-tab { padding: 1.1rem 1.25rem; border-radius: 12px; cursor: pointer; transition: background 0.25s; border: 0.5px solid transparent; }
  .land-showcase-tab.active { background: #FFFFFF; border-color: #E2E8F0; box-shadow: 0 4px 20px -8px rgba(15,23,42,0.08); }
  .land-showcase-tab-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .land-showcase-tab-desc { font-size: 12.5px; color: #64748B; line-height: 1.5; }
  .land-showcase-tab:not(.active) .land-showcase-tab-title { color: #94A3B8; }

  /* fake product panel shared chrome */
  .land-mock { background: #FFFFFF; border: 0.5px solid #E2E8F0; border-radius: 16px; box-shadow: 0 24px 60px -24px rgba(37,99,235,0.2); overflow: hidden; }
  .land-mock-topbar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-bottom: 0.5px solid #F1F5F9; background: #FAFBFC; }
  .land-mock-dot { width: 8px; height: 8px; border-radius: 50%; }
  .land-mock-body { padding: 1.25rem; }
  .land-mock-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 0.5px solid #F8FAFC; }
  .land-mock-row:last-child { border-bottom: none; }
  .land-mock-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .land-mock-title { font-size: 12px; font-weight: 600; color: #0F172A; }
  .land-mock-sub { font-size: 10.5px; color: #94A3B8; }
  .land-mock-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 5px; flex-shrink: 0; margin-left: auto; }
  .land-chart-bars { display: flex; align-items: flex-end; gap: 5px; height: 70px; padding: 0.5rem 0; }
  .land-chart-bar { flex: 1; background: linear-gradient(180deg, #60A5FA, #2563EB); border-radius: 3px 3px 0 0; }
  .land-mock-code { background: #0F172A; border-radius: 8px; padding: 12px 14px; font-family: 'DM Mono', monospace; font-size: 10.5px; line-height: 1.7; color: #94A3B8; overflow: hidden; }
  .land-mock-code .kw { color: #93C5FD; } .land-mock-code .str { color: #86EFAC; } .land-mock-code .cm { color: #64748B; }

  /* ── MODULES ── */
  .land-modules-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.25rem; }
  @media (max-width: 800px) { .land-modules-grid { grid-template-columns: 1fr; } }
  .land-module-card { background: #FFFFFF; border: 0.5px solid #E2E8F0; border-radius: 16px; padding: 1.75rem; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
  .land-module-card:hover { border-color: #BFDBFE; transform: translateY(-3px); box-shadow: 0 16px 40px -20px rgba(37,99,235,0.25); }
  .land-module-featured { display: flex; flex-direction: column; justify-content: space-between; }
  .land-module-stack { display: flex; flex-direction: column; gap: 1.25rem; }
  .land-module-icon-wrap { width: 44px; height: 44px; border-radius: 11px; background: #EFF6FF; border: 0.5px solid #BFDBFE; display: flex; align-items: center; justify-content: center; margin-bottom: 1.1rem; }
  .land-module-name { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 0.4rem; }
  .land-module-desc { font-size: var(--body); color: #64748B; line-height: 1.55; margin-bottom: 1.1rem; }
  .land-module-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .land-module-tag { font-size: 11px; font-weight: 500; color: #2563EB; background: #EFF6FF; border: 0.5px solid #DBEAFE; padding: 4px 10px; border-radius: 6px; }

  /* ── FEATURES alternating ── */
  .land-feature-row { display: grid; grid-template-columns: 1fr; gap: 1.5rem; padding: 2.5rem 0; border-bottom: 0.5px solid #E2E8F0; align-items: center; }
  .land-feature-row:last-child { border-bottom: none; }
  @media (min-width: 720px) { .land-feature-row { grid-template-columns: 1fr 1fr; } .land-feature-row.reverse .land-feat-visual { order: 2; } }
  .land-feat-icon-wrap { width: 44px; height: 44px; border-radius: 11px; background: #EFF6FF; border: 0.5px solid #BFDBFE; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
  .land-feat-title { font-size: 1.25rem; font-weight: 700; color: #0F172A; font-family: 'Syne', sans-serif; margin-bottom: 0.5rem; }
  .land-feat-desc { font-size: var(--body); color: #64748B; line-height: 1.6; max-width: 420px; }
  .land-feat-visual { display: flex; align-items: center; justify-content: center; }
  .land-feat-visual-inner { width: 100%; max-width: 340px; aspect-ratio: 4/3; background: #FFFFFF; border: 0.5px solid #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 50px -24px rgba(15,23,42,0.15); position: relative; overflow: hidden; }

  /* ── CTA BANNER ── */
  .land-banner { position: relative; z-index: 1; max-width: 1200px; margin: var(--gap-section) auto 0; padding: 0 var(--pad-x); }
  .land-banner-inner { position: relative; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 20px; padding: clamp(2.5rem,6vw,4rem); text-align: center; overflow: hidden; }
  .land-banner-sweep { position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, rgba(37,99,235,0.18) 45%, transparent 60%); background-size: 200% 100%; animation: land-sweep 5s linear infinite; pointer-events: none; }
  @keyframes land-sweep { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .land-banner-inner h2 { position: relative; font-family: 'Syne', sans-serif; font-size: var(--h2); font-weight: 700; color: #F8FAFC; margin: 0 0 0.75rem; }
  .land-banner-inner p { position: relative; font-size: var(--body); color: #94A3B8; margin: 0 0 2rem; }
  .land-banner-inner .land-cta-main { position: relative; }

  /* ── FOOTER ── */
  .land-footer { position: relative; z-index: 1; max-width: 1200px; margin: var(--gap-section) auto 0; border-top: 0.5px solid #E2E8F0; padding: 1.75rem var(--pad-x); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .land-footer-left { font-size: var(--micro); color: #94A3B8; }
  .land-footer-right { display: flex; gap: 1.5rem; }
  .land-footer-right a, .land-footer-right button { font-size: var(--micro); color: #64748B; background: none; border: none; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .land-footer-right a:hover, .land-footer-right button:hover { color: #2563EB; }

  @media (max-width: 640px) {
    .land-nav { padding: 0 1.1rem; }
    .land-stat { min-width: 120px; padding: 1.4rem 1rem; }
    .land-btn-ghost { display: none; }
    .land-showcase-sticky { position: relative !important; top: 0 !important; }
  }
`;

const ip = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "#2563EB", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
const IconPulse = () => (<svg {...ip}><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>);
const IconIndex = () => (<svg {...ip}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 10v10" /></svg>);
const IconChart = () => (<svg {...ip}><path d="M4 20V10M10 20V4M16 20v-7M4 20h16" /></svg>);
const IconSearch = () => (<svg {...ip}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
const IconChat = () => (<svg {...ip}><path d="M4 5h16v11H8l-4 4V5z" /><path d="M8 9h8M8 12h5" /></svg>);
const IconWrench = () => (<svg {...ip}><path d="M14.5 3.5a4 4 0 0 0-5.4 5.1L4 13.7V19h5.3l5.1-5.1a4 4 0 0 0 5.1-5.4l-3 3-2-2 3-3z" /></svg>);
const IconLayers = () => (<svg {...ip}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>);
const IconArrow = () => (<svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>);
const IconBolt = () => (<svg width="17" height="17" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>);
const IconCheck = ({ color = "#22C55E" }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>);

/* ── animated network canvas: nodes pulsing + connecting lines, represents live query telemetry flow ── */
function NetworkBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h, nodes;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.min(window.innerHeight * 1.1, 900);
      const count = Math.max(18, Math.min(34, Math.round((w * h) / 45000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e) { mouseRef.current = { x: e.clientX, y: e.clientY }; }
    window.addEventListener("mousemove", onMove);

    function tick() {
      ctx.clearRect(0, 0, w, h);
      const m = mouseRef.current;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulse += 0.02;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(37,99,235,${0.09 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dxm = nodes[i].x - m.x, dym = nodes[i].y - m.y;
        const distm = Math.sqrt(dxm * dxm + dym * dym);
        if (distm < 180) {
          ctx.strokeStyle = `rgba(37,99,235,${0.16 * (1 - distm / 180)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const pulseR = n.r + Math.sin(n.pulse) * 0.6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37,99,235,0.35)";
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="land-canvas-bg" />;
}

function useCountUp(target, isInView, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = null;
    let raf;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration]);
  return val;
}

const revealOnScroll = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
};

function AnimatedStat({ num, suffix, label, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const count = useCountUp(num, isInView);
  return (
    <motion.div className="land-stat" ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
      <div className="land-stat-num">{count}<span className="acc">{suffix}</span></div>
      <div className="land-stat-label">{label}</div>
    </motion.div>
  );
}

function AnimatedHeadline({ text, className }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span className="land-h1-word" key={i} style={{ marginRight: "0.28em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ── Live diagnosis mock (animated bars + counting numbers + rows) ── */
function MockDiagnosis({ active }) {
  const bars = [40, 65, 30, 88, 45, 60, 35, 72, 50, 90, 42, 68];
  return (
    <div className="land-mock">
      <div className="land-mock-topbar">
        <span className="land-mock-dot" style={{ background: "#F87171" }} /><span className="land-mock-dot" style={{ background: "#FBBF24" }} /><span className="land-mock-dot" style={{ background: "#34D399" }} />
        <span style={{ marginLeft: 10, fontFamily: "'DM Mono',monospace", fontSize: 10.5, color: "#94A3B8" }}>diagnosis — /api/exams/my</span>
      </div>
      <div className="land-mock-body">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Query duration, last 200 requests</div>
        <div className="land-chart-bars">
          {bars.map((b, i) => (
            <motion.div
              className="land-chart-bar"
              key={i}
              initial={{ height: 0 }}
              animate={active ? { height: `${b}%` } : { height: 0 }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              style={i === 3 || i === 9 ? { background: "linear-gradient(180deg,#FCA5A5,#EF4444)" } : undefined}
            />
          ))}
        </div>
        <div className="land-mock-row">
          <div className="land-mock-icon" style={{ background: "#FEF2F2" }}><IconPulse /></div>
          <div><div className="land-mock-title">Possible N+1 Query</div><div className="land-mock-sub">44 queries in one request</div></div>
          <div className="land-mock-badge" style={{ background: "#FEF2F2", color: "#DC2626" }}>3.1x</div>
        </div>
        <div className="land-mock-row">
          <div className="land-mock-icon" style={{ background: "#FFF7ED" }}><IconIndex /></div>
          <div><div className="land-mock-title">Missing Index Candidate</div><div className="land-mock-sub">exam_questions · 10,393 rows</div></div>
          <div className="land-mock-badge" style={{ background: "#FFF7ED", color: "#C2410C" }}>HIGH</div>
        </div>
      </div>
    </div>
  );
}

function MockRecommendation({ active }) {
  return (
    <div className="land-mock">
      <div className="land-mock-topbar">
        <span className="land-mock-dot" style={{ background: "#F87171" }} /><span className="land-mock-dot" style={{ background: "#FBBF24" }} /><span className="land-mock-dot" style={{ background: "#34D399" }} />
        <span style={{ marginLeft: 10, fontFamily: "'DM Mono',monospace", fontSize: 10.5, color: "#94A3B8" }}>recommendations — AI-grounded fix</span>
      </div>
      <div className="land-mock-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", border: "0.5px solid #BBF7D0", padding: "3px 9px", borderRadius: 6 }}>Grounded in captured EXPLAIN plan</span>
        </div>
        <div className="land-mock-code">
          <AnimatePresence mode="wait">
            {active && (
              <motion.pre
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ margin: 0, whiteSpace: "pre-wrap" }}
              >
{`@Entity
@Table(name = `}<span className="str">"exam_questions"</span>{`,
  indexes = @Index(columnList = `}<span className="str">"exam_id"</span>{`))
`}<span className="cm">{`// Seq Scan → Index Scan, 10.4k rows`}</span>
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
        <div className="land-mock-row" style={{ marginTop: 4 }}>
          <div className="land-mock-icon" style={{ background: "#EFF6FF" }}><IconCheck color="#2563EB" /></div>
          <div><div className="land-mock-title">Fix verified</div><div className="land-mock-sub">Before/after telemetry compared automatically</div></div>
        </div>
      </div>
    </div>
  );
}

function MockFixes({ active }) {
  const items = [
    { name: "N+1 on /api/results/{id}", status: "Fixed", pct: "-71%" },
    { name: "Missing index: exam_questions", status: "Fixed", pct: "-84%" },
    { name: "Slow login hash check", status: "Watching", pct: null },
  ];
  return (
    <div className="land-mock">
      <div className="land-mock-topbar">
        <span className="land-mock-dot" style={{ background: "#F87171" }} /><span className="land-mock-dot" style={{ background: "#FBBF24" }} /><span className="land-mock-dot" style={{ background: "#34D399" }} />
        <span style={{ marginLeft: 10, fontFamily: "'DM Mono',monospace", fontSize: 10.5, color: "#94A3B8" }}>fixes — verified improvements</span>
      </div>
      <div className="land-mock-body">
        {items.map((it, i) => (
          <motion.div
            className="land-mock-row"
            key={it.name}
            initial={{ opacity: 0, x: -12 }}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div className="land-mock-icon" style={{ background: it.status === "Fixed" ? "#F0FDF4" : "#FFFBEB" }}>
              {it.status === "Fixed" ? <IconCheck /> : <IconChart />}
            </div>
            <div><div className="land-mock-title">{it.name}</div><div className="land-mock-sub">{it.status}</div></div>
            {it.pct && <div className="land-mock-badge" style={{ background: "#F0FDF4", color: "#16A34A" }}>{it.pct}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const TICKER_ITEMS = [
  { path: "/api/exams/my", status: "N+1 detected", color: "#F87171" },
  { path: "/api/results/{id}", status: "fixed · -71%", color: "#34D399" },
  { path: "/api/auth/login", status: "slow request", color: "#FBBF24" },
  { path: "/api/exams/create", status: "healthy", color: "#34D399" },
  { path: "/api/exams/{id}", status: "index suggested", color: "#FBBF24" },
  { path: "/api/auth/refresh", status: "healthy", color: "#34D399" },
];

export default function LandingPage({ onEnter }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: "Diagnosis", icon: <IconPulse />, desc: "Statistical anomaly detection + rule engine finds real problems automatically.", render: (a) => <MockDiagnosis active={a} /> },
    { title: "Recommendations", icon: <IconWrench />, desc: "AI-written fixes grounded in real captured SQL — never generic guesses.", render: (a) => <MockRecommendation active={a} /> },
    { title: "Fixes", icon: <IconCheck />, desc: "Every fix verified with real before/after telemetry, not just marked done.", render: (a) => <MockFixes active={a} /> },
  ];

  const modules = [
    { icon: <IconPulse />, name: "Diagnosis", desc: "Root-cause analysis, automatic — statistical anomaly detection plus AI narration grounded in real captured SQL.", tags: ["Slow Queries", "N+1 Detection", "Lock Contention", "Timeouts"] },
    { icon: <IconIndex />, name: "Index Advisor", desc: "Suggests indexes before you need them.", tags: ["Missing Index", "Query Plans"] },
    { icon: <IconChart />, name: "Telemetry", desc: "Live metrics from every request.", tags: ["Latency", "Throughput", "Trends"] },
  ];

  const features = [
    { icon: <IconSearch />, title: "Slow Query Detection", desc: "Every slow query captured, ranked, and explained in plain language." },
    { icon: <IconChat />, title: "AI Copilot Chat", desc: "Ask VeloxDiag what's degrading performance — get a direct, actionable answer." },
    { icon: <IconWrench />, title: "One-click Fixes", desc: "Ready-to-apply fix suggestions for common issues, reviewed before you run them." },
    { icon: <IconLayers />, title: "Business Context Aware", desc: "Rules and recommendations tuned to how your application is actually used." },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="land-root">
        <NetworkBackground />

        <nav className="land-nav">
          <a href="/" className="land-brand">
            <div className="land-logo"><IconBolt /></div>
            <div className="land-brandname">Velox<span>Diag</span></div>
          </a>
          <div className="land-nav-btns">
            <button onClick={onEnter} className="land-btn-ghost">Sign in</button>
            <button onClick={onEnter} className="land-btn-primary">Get Started →</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="land-hero">
          <motion.div className="land-badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="land-badge-dot" />
            Real-time APM &amp; Query Diagnostics
          </motion.div>
          <h1 className="land-h1">
            <AnimatedHeadline text="Find and fix slow" />
            <br />
            <AnimatedHeadline text="database queries, instantly" className="accent" />
          </h1>
          <motion.p className="land-hero-sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            Drop-in monitoring for your backend. Automatic slow-query detection,
            index recommendations, root-cause diagnosis, and an AI copilot that
            explains what's actually wrong — before your users notice.
          </motion.p>
          <motion.div className="land-cta-row" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <button onClick={onEnter} className="land-cta-main">Start Monitoring Free<IconArrow /></button>
            <button onClick={onEnter} className="land-cta-sec">Already have an account</button>
          </motion.div>
        </section>

        {/* TICKER */}
        <div className="land-ticker-wrap">
          <div className="land-ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <div className="land-ticker-item" key={i}>
                <span className="land-ticker-dot" style={{ background: t.color }} />
                <span className="path">{t.path}</span>
                <span>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="land-stats">
          <AnimatedStat num={12} suffix="+" label="Diagnostic modules" delay={0} />
          <AnimatedStat num={44} suffix=" queries" label="Worst N+1 caught" delay={0.08} />
          <AnimatedStat num={71} suffix="%" label="Fastest verified fix" delay={0.16} />
          <AnimatedStat num={100} suffix="%" label="Actionable insights" delay={0.24} />
        </div>

        {/* PRODUCT SHOWCASE */}
        <section className="land-showcase">
          <motion.div {...revealOnScroll}>
            <div className="land-section-index"><span>01</span><span className="line" /><span>Product</span></div>
            <h2 className="land-section-title">See what it actually finds</h2>
            <p className="land-section-sub">Real finding types, real captured evidence, real verified fixes — not a mockup of a mockup.</p>
          </motion.div>
          <div className="land-showcase-grid">
            <div className="land-showcase-tabs">
              {tabs.map((t, i) => (
                <div key={t.title} className={`land-showcase-tab${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>
                  <div className="land-showcase-tab-title">{t.icon}{t.title}</div>
                  <div className="land-showcase-tab-desc">{t.desc}</div>
                </div>
              ))}
            </div>
            <div className="land-showcase-sticky">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {tabs[activeTab].render(true)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* CORE MODULES */}
        <section className="land-section">
          <motion.div {...revealOnScroll}>
            <div className="land-section-index"><span>02</span><span className="line" /><span>Modules</span></div>
            <h2 className="land-section-title">Everything to keep your DB healthy</h2>
            <p className="land-section-sub">One dashboard — ingest, diagnose, fix.</p>
          </motion.div>
          <div className="land-modules-grid">
            <motion.div className="land-module-card land-module-featured" {...revealOnScroll} transition={{ ...revealOnScroll.transition, delay: 0.05 }}>
              <div>
                <div className="land-module-icon-wrap">{modules[0].icon}</div>
                <div className="land-module-name">{modules[0].name}</div>
                <div className="land-module-desc">{modules[0].desc}</div>
              </div>
              <div className="land-module-tags">{modules[0].tags.map((t) => <span className="land-module-tag" key={t}>{t}</span>)}</div>
            </motion.div>
            <div className="land-module-stack">
              {modules.slice(1).map((m, i) => (
                <motion.div className="land-module-card" key={m.name} {...revealOnScroll} transition={{ ...revealOnScroll.transition, delay: 0.15 + i * 0.1 }}>
                  <div className="land-module-icon-wrap">{m.icon}</div>
                  <div className="land-module-name">{m.name}</div>
                  <div className="land-module-desc">{m.desc}</div>
                  <div className="land-module-tags">{m.tags.map((t) => <span className="land-module-tag" key={t}>{t}</span>)}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES alternating with visual panels */}
        <section className="land-section">
          <motion.div {...revealOnScroll}>
            <div className="land-section-index"><span>03</span><span className="line" /><span>Features</span></div>
            <h2 className="land-section-title">Built for engineers who ship</h2>
            <p className="land-section-sub">No noisy dashboards. Just what's actually wrong, and how to fix it.</p>
          </motion.div>
          <div>
            {features.map((f, i) => (
              <motion.div
                className={`land-feature-row${i % 2 === 1 ? " reverse" : ""}`}
                key={f.title}
                initial={{ opacity: 0, x: i % 2 === 1 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div>
                  <div className="land-feat-icon-wrap">{f.icon}</div>
                  <div className="land-feat-title">{f.title}</div>
                  <div className="land-feat-desc">{f.desc}</div>
                </div>
                <div className="land-feat-visual">
                  <motion.div
                    className="land-feat-visual-inner"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ transform: "scale(1.8)", opacity: 0.85 }}>{f.icon}</div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <div className="land-banner">
          <motion.div className="land-banner-inner" {...revealOnScroll}>
            <div className="land-banner-sweep" />
            <h2>Register your app in under a minute</h2>
            <p>Free signup. Drop in the starter dependency. Start seeing diagnostics immediately.</p>
            <button onClick={onEnter} className="land-cta-main" style={{ display: "inline-flex" }}>Create Free Account →</button>
          </motion.div>
        </div>

        <footer className="land-footer">
          <div className="land-footer-left">© 2026 VeloxDiag · Database Performance Monitoring</div>
          <div className="land-footer-right">
            <a href="mailto:hello@veloxdiag.app">Contact</a>
            <button onClick={onEnter}>Login</button>
            <button onClick={onEnter}>Register</button>
          </div>
        </footer>
      </div>
    </>
  );
}