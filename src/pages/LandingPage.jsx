const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .land-root {
    min-height: 100vh;
    background: #F8FAFC;
    font-family: 'DM Sans', sans-serif;
    color: #0F172A;
    overflow-x: hidden;
  }

  /* ── BG ── */
  .land-grid {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }
  .land-glow1 {
    position: fixed;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
    top: -160px; right: -160px;
    pointer-events: none; z-index: 0;
  }
  .land-glow2 {
    position: fixed;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    pointer-events: none; z-index: 0;
  }

  /* ── NAV ── */
  .land-nav {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 2rem;
    border-bottom: 0.5px solid #E2E8F0;
  }
  .land-brand {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .land-logo {
    width: 34px; height: 34px;
    background: #2563EB; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .land-brandname {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 700; color: #0F172A;
  }
  .land-brandname span { color: #2563EB; }
  .land-nav-btns { display: flex; gap: 10px; align-items: center; }
  .land-btn-ghost {
    padding: 8px 18px;
    background: transparent;
    border: 0.5px solid #E2E8F0;
    border-radius: 8px;
    color: #475569;
    font-size: 13px; font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .land-btn-ghost:hover { border-color: #2563EB; color: #0F172A; }
  .land-btn-primary {
    padding: 8px 20px;
    background: #2563EB;
    border: none; border-radius: 8px;
    color: #fff;
    font-size: 13px; font-weight: 600;
    font-family: 'Syne', sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s;
  }
  .land-btn-primary:hover { background: #1D4ED8; }

  /* ── HERO ── */
  .land-hero {
    position: relative; z-index: 1;
    text-align: center;
    padding: 5rem 1.5rem 4rem;
    max-width: 760px; margin: 0 auto;
  }
  .land-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #EFF6FF;
    border: 0.5px solid #BFDBFE;
    color: #2563EB;
    font-size: 12px; font-weight: 500;
    padding: 5px 14px; border-radius: 20px;
    margin-bottom: 1.5rem;
    letter-spacing: 0.3px;
  }
  .land-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #2563EB;
    animation: land-pulse 2s ease-in-out infinite;
  }
  @keyframes land-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .land-h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 800;
    line-height: 1.15;
    color: #0F172A;
    margin: 0 0 1.25rem;
    letter-spacing: -0.5px;
  }
  .land-h1 .accent { color: #2563EB; }
  .land-hero-sub {
    font-size: clamp(14px, 2vw, 17px);
    color: #64748B;
    line-height: 1.7;
    max-width: 540px; margin: 0 auto 2.5rem;
  }
  .land-cta-row {
    display: flex; gap: 12px;
    justify-content: center; flex-wrap: wrap;
  }
  .land-cta-main {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px;
    background: #2563EB; border: none; border-radius: 12px;
    color: #fff; font-size: 15px; font-weight: 600;
    font-family: 'Syne', sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .land-cta-main:hover { background: #1D4ED8; transform: translateY(-1px); }
  .land-cta-sec {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px;
    background: #FFFFFF;
    border: 0.5px solid #E2E8F0;
    border-radius: 12px;
    color: #334155; font-size: 15px;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .land-cta-sec:hover { border-color: #2563EB; color: #0F172A; }

  /* ── STATS ── */
  .land-stats {
    position: relative; z-index: 1;
    display: flex; justify-content: center; gap: 0;
    flex-wrap: wrap;
    border-top: 0.5px solid #E2E8F0;
    border-bottom: 0.5px solid #E2E8F0;
    margin: 0 0 5rem;
    background: #FFFFFF;
  }
  .land-stat {
    flex: 1; min-width: 160px;
    padding: 2rem 1.5rem;
    text-align: center;
    border-right: 0.5px solid #E2E8F0;
  }
  .land-stat:last-child { border-right: none; }
  .land-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 2rem; font-weight: 700;
    color: #0F172A; margin-bottom: 4px;
  }
  .land-stat-num .acc { color: #2563EB; }
  .land-stat-label { font-size: 13px; color: #64748B; }

  /* ── MODULES (subjects equivalent) ── */
  .land-section {
    position: relative; z-index: 1;
    max-width: 1000px; margin: 0 auto 5rem;
    padding: 0 1.5rem;
  }
  .land-section-label {
    font-size: 11px; font-weight: 600;
    color: #2563EB; letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 0.75rem;
  }
  .land-section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    font-weight: 700;
    color: #0F172A;
    margin: 0 0 0.5rem;
  }
  .land-section-sub {
    font-size: 14px;
    color: #64748B;
    margin: 0 0 2.25rem;
  }
  .land-subjects {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .land-subject-card {
    background: #FFFFFF;
    border: 0.5px solid #E2E8F0;
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .land-subject-card:hover {
    border-color: #93C5FD;
    box-shadow: 0 4px 12px rgba(37,99,235,0.08);
  }
  .land-subj-icon { font-size: 24px; margin-bottom: 0.75rem; }
  .land-subj-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; color: #0F172A;
    margin-bottom: 4px;
  }
  .land-subj-count { font-size: 12.5px; color: #64748B; margin-bottom: 1rem; }
  .land-subj-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .land-subj-tag {
    font-size: 11px;
    padding: 3px 9px;
    background: #EFF6FF;
    border: 0.5px solid #BFDBFE;
    color: #2563EB;
    border-radius: 20px;
  }

  /* ── FEATURES ── */
  .land-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .land-feat {
    display: flex; gap: 14px;
    background: #FFFFFF;
    border: 0.5px solid #E2E8F0;
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  }
  .land-feat-icon { font-size: 22px; flex-shrink: 0; }
  .land-feat-title {
    font-family: 'Syne', sans-serif;
    font-size: 14.5px; font-weight: 700; color: #0F172A;
    margin-bottom: 4px;
  }
  .land-feat-desc { font-size: 12.5px; color: #64748B; line-height: 1.55; }

  /* ── CTA BANNER ── */
  .land-banner {
    position: relative; z-index: 1;
    max-width: 1000px; margin: 0 auto 4rem;
    padding: 0 1.5rem;
  }
  .land-banner-inner {
    background: linear-gradient(135deg, #EFF6FF, #FFFFFF);
    border: 0.5px solid #BFDBFE;
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
  }
  .land-banner-inner h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: #0F172A;
    margin: 0 0 0.75rem;
  }
  .land-banner p { font-size: 14px; color: #64748B; margin: 0 0 2rem; }

  /* ── FOOTER ── */
  .land-footer {
    position: relative; z-index: 1;
    border-top: 0.5px solid #E2E8F0;
    padding: 1.75rem 2rem;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
    background: #FFFFFF;
  }
  .land-footer-left { font-size: 13px; color: #94A3B8; }
  .land-footer-right { display: flex; gap: 1.5rem; }
  .land-footer-right a {
    font-size: 13px; color: #64748B;
    text-decoration: none;
  }
  .land-footer-right a:hover { color: #2563EB; }

  /* ── MOBILE ── */
  @media (max-width: 640px) {
    .land-nav { padding: 1rem 1.25rem; }
    .land-hero { padding: 3.5rem 1.25rem 3rem; }
    .land-subjects { grid-template-columns: 1fr; }
    .land-features { grid-template-columns: 1fr; }
    .land-stat { min-width: 120px; padding: 1.5rem 1rem; }
    .land-stat-num { font-size: 1.6rem; }
    .land-section { margin-bottom: 3.5rem; }
    .land-banner-inner { padding: 2rem 1.25rem; }
    .land-footer { flex-direction: column; align-items: flex-start; }
    .land-btn-ghost { display: none; }
  }
`;

export default function LandingPage({ onEnter }) {
    return (
        <>
            <style>{CSS}</style>
            <div className="land-root">
                <div className="land-grid" />
                <div className="land-glow1" />
                <div className="land-glow2" />

                {/* NAV */}
                <nav className="land-nav">
                    <a href="/" className="land-brand">
                        <div className="land-logo">
                            <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                            </svg>
                        </div>
                        <div className="land-brandname">Velox<span>Diag</span></div>
                    </a>
                    <div className="land-nav-btns">
                        <button onClick={onEnter} className="land-btn-ghost">Sign in</button>
                        <button onClick={onEnter} className="land-btn-primary">Get Started →</button>
                    </div>
                </nav>

                {/* HERO */}
                <section className="land-hero">
                    <div className="land-badge">
                        <span className="land-badge-dot" />
                        Real-time APM &amp; Query Diagnostics
                    </div>
                    <h1 className="land-h1">
                        Find and fix slow<br />
                        <span className="accent">database queries, instantly</span>
                    </h1>
                    <p className="land-hero-sub">
                        Drop-in monitoring for your backend. Automatic slow-query detection,
                        index recommendations, root-cause diagnosis, and an AI copilot that
                        explains what's actually wrong — before your users notice.
                    </p>
                    <div className="land-cta-row">
                        <button onClick={onEnter} className="land-cta-main">
                            Start Monitoring Free
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button onClick={onEnter} className="land-cta-sec">
                            Already have an account
                        </button>
                    </div>
                </section>

                {/* STATS */}
                <div className="land-stats">
                    {[
                        { num: "12", acc: "+", label: "Diagnostic modules" },
                        { num: "Real", acc: "-time", label: "Telemetry ingest" },
                        { num: "AI", acc: "", label: "Copilot built-in" },
                        { num: "100", acc: "%", label: "Actionable insights" },
                    ].map(s => (
                        <div className="land-stat" key={s.label}>
                            <div className="land-stat-num">{s.num}<span className="acc">{s.acc}</span></div>
                            <div className="land-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* CORE MODULES */}
                <section className="land-section">
                    <div className="land-section-label">Core Modules</div>
                    <h2 className="land-section-title">Everything to keep your DB healthy</h2>
                    <p className="land-section-sub">One dashboard — ingest, diagnose, fix</p>
                    <div className="land-subjects">
                        <div className="land-subject-card">
                            <div className="land-subj-icon">🩺</div>
                            <div className="land-subj-name">Diagnosis</div>
                            <div className="land-subj-count">Root-cause analysis, automatic</div>
                            <div className="land-subj-tags">
                                {["Slow Queries", "N+1 Detection", "Lock Contention", "Timeouts"].map(t => (
                                    <span className="land-subj-tag" key={t}>{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="land-subject-card">
                            <div className="land-subj-icon">📇</div>
                            <div className="land-subj-name">Index Advisor</div>
                            <div className="land-subj-count">Suggests indexes before you need them</div>
                            <div className="land-subj-tags">
                                {["Missing Index", "Unused Index", "Query Plans"].map(t => (
                                    <span className="land-subj-tag" key={t}>{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="land-subject-card">
                            <div className="land-subj-icon">📈</div>
                            <div className="land-subj-name">Telemetry</div>
                            <div className="land-subj-count">Live metrics from every request</div>
                            <div className="land-subj-tags">
                                {["Latency", "Throughput", "Error Rate", "Trends"].map(t => (
                                    <span className="land-subj-tag" key={t}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="land-section">
                    <div className="land-section-label">Features</div>
                    <h2 className="land-section-title">Built for engineers who ship</h2>
                    <p className="land-section-sub">No noisy dashboards. Just what's actually wrong, and how to fix it.</p>
                    <div className="land-features">
                        {[
                            { icon: "🔍", title: "Slow Query Detection", desc: "Every slow query captured, ranked, and explained in plain language." },
                            { icon: "🧠", title: "AI Copilot Chat", desc: "Ask VeloxDiag what's degrading performance — get a direct, actionable answer." },
                            { icon: "🛠️", title: "One-click Fixes", desc: "Ready-to-apply fix suggestions for common issues, reviewed before you run them." },
                            { icon: "📊", title: "Business Context Aware", desc: "Rules and recommendations tuned to how your application is actually used." },
                        ].map(f => (
                            <div className="land-feat" key={f.title}>
                                <div className="land-feat-icon">{f.icon}</div>
                                <div>
                                    <div className="land-feat-title">{f.title}</div>
                                    <div className="land-feat-desc">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA BANNER */}
                <div className="land-banner">
                    <div className="land-banner-inner">
                        <h2>Register your app in under a minute</h2>
                        <p>Free signup. Drop in the starter dependency. Start seeing diagnostics immediately.</p>
                        <button onClick={onEnter} className="land-cta-main" style={{ display: "inline-flex" }}>
                            Create Free Account →
                        </button>
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="land-footer">
                    <div className="land-footer-left">© 2026 VeloxDiag · Database Performance Monitoring</div>
                    <div className="land-footer-right">
                        <a href="mailto:hello@veloxdiag.app">Contact</a>
                        <button onClick={onEnter} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>Login</button>
                        <button onClick={onEnter} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>Register</button>
                    </div>
                </footer>
            </div>
        </>
    );
}