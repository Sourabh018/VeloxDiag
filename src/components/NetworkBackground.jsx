import { useEffect, useRef } from "react";

// Animated node network — used behind the landing page and auth screens so
// the whole "outside the dashboard" experience feels like one connected
// product instead of a marketing page bolted onto a plain login form.
export default function NetworkBackground({ maxHeight = 900, className = "land-canvas-bg" }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h, nodes;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.min(window.innerHeight * 1.1, maxHeight);
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
  }, [maxHeight]);

  return <canvas ref={canvasRef} className={className} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}