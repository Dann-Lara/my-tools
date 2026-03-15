'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '../lib/i18n-context';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { LandingMetrics } from '../components/ui/LandingMetrics';
import { ArchitectureDiagram } from '../components/ui/ArchitectureDiagram';
import { SddFlow } from '../components/ui/SddFlow';
import { N8nShowcase } from '../components/ui/N8nShowcase';
import anime from 'animejs';

function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      if (ref.current) ref.current.textContent = Math.floor(start).toString();
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
}

const STACK = [
  { name: 'Next.js 14',  color: 'text-slate-700 dark:text-white',         dot: 'bg-slate-400 dark:bg-white' },
  { name: 'NestJS',      color: 'text-red-600 dark:text-red-400',          dot: 'bg-red-500 dark:bg-red-400' },
  { name: 'TypeScript',  color: 'text-sky-700 dark:text-sky-400',          dot: 'bg-sky-500 dark:bg-sky-400' },
  { name: 'PostgreSQL',  color: 'text-blue-700 dark:text-blue-400',        dot: 'bg-blue-500 dark:bg-blue-400' },
  { name: 'Redis',       color: 'text-orange-700 dark:text-orange-400',    dot: 'bg-orange-500 dark:bg-orange-400' },
  { name: 'n8n',         color: 'text-pink-700 dark:text-pink-400',        dot: 'bg-pink-500 dark:bg-pink-400' },
  { name: 'Docker',      color: 'text-cyan-700 dark:text-cyan-400',        dot: 'bg-cyan-500 dark:bg-cyan-400' },
  { name: 'Turborepo',   color: 'text-yellow-700 dark:text-yellow-400',   dot: 'bg-yellow-500 dark:bg-yellow-400' },
  { name: 'AI Core',     color: 'text-violet-700 dark:text-violet-400',    dot: 'bg-violet-500 dark:bg-violet-400' },
];

function HeroAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      anime.set('.hero-node', { opacity: 1, scale: 1 });
      anime.set('.hero-line', { opacity: 0.3 });
      return;
    }

    anime.set('.hero-node', { scale: 0, opacity: 0 });
    anime.set('.hero-line', { strokeDasharray: 200, strokeDashoffset: 200, opacity: 0 });

    anime({
      targets: '.hero-node',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(150),
      easing: 'easeOutElastic(1, 0.5)',
    });

    anime({
      targets: '.hero-line',
      strokeDashoffset: [200, 0],
      opacity: [0, 0.4],
      duration: 1000,
      delay: anime.stagger(200, { start: 500 }),
      easing: 'easeInOutSine',
    });

    const pulse = anime({
      targets: '.hero-node',
      scale: [1, 1.1, 1],
      duration: 2000,
      delay: anime.stagger(300),
      loop: true,
      easing: 'easeInOutSine',
    });

    return () => pulse.pause();
  }, [isVisible]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto mb-12">
      <svg viewBox="0 0 400 200" className="w-full h-auto">
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <line className="hero-line" x1="50" y1="100" x2="150" y2="100" stroke="url(#heroGrad)" strokeWidth="2" />
        <line className="hero-line" x1="150" y1="100" x2="250" y2="100" stroke="url(#heroGrad)" strokeWidth="2" />
        <line className="hero-line" x1="250" y1="100" x2="350" y2="100" stroke="url(#heroGrad)" strokeWidth="2" />
        <line className="hero-line" x1="150" y1="100" x2="200" y2="50" stroke="url(#heroGrad)" strokeWidth="1.5" />
        <line className="hero-line" x1="150" y1="100" x2="200" y2="150" stroke="url(#heroGrad)" strokeWidth="1.5" />

        <g className="hero-node" style={{ opacity: 0 }}>
          <circle cx="50" cy="100" r="20" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          <text x="50" y="105" textAnchor="middle" fontSize="14">👤</text>
        </g>
        <g className="hero-node" style={{ opacity: 0 }}>
          <circle cx="150" cy="100" r="20" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          <text x="150" y="105" textAnchor="middle" fontSize="14">⚡</text>
        </g>
        <g className="hero-node" style={{ opacity: 0 }}>
          <circle cx="250" cy="100" r="20" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          <text x="250" y="105" textAnchor="middle" fontSize="14">🔷</text>
        </g>
        <g className="hero-node" style={{ opacity: 0 }}>
          <circle cx="350" cy="100" r="20" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          <text x="350" y="105" textAnchor="middle" fontSize="14">🗄️</text>
        </g>
        <g className="hero-node" style={{ opacity: 0 }}>
          <circle cx="200" cy="50" r="16" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" />
          <text x="200" y="55" textAnchor="middle" fontSize="12">🤖</text>
        </g>
        <g className="hero-node" style={{ opacity: 0 }}>
          <circle cx="200" cy="150" r="16" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
          <text x="200" y="155" textAnchor="middle" fontSize="12">🔄</text>
        </g>
      </svg>
    </div>
  );
}

export default function LandingPage(): React.JSX.Element {
  const { t } = useI18n();
  const linesRef = useCountUp(4200);
  const filesRef = useCountUp(97);
  const svcRef = useCountUp(6);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar variant="public" />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-14">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                        bg-sky-400/5 dark:bg-sky-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 mb-8 font-mono text-[10px] uppercase tracking-[0.3em]
                          text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-400/20
                          bg-sky-50 dark:bg-sky-400/5 rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
            <span suppressHydrationWarning>{t.home.heroTag}</span>
          </div>

          <h1 className="headline text-[clamp(4rem,14vw,11rem)] leading-none mb-8">
            <span className="text-slate-900 dark:text-white block" suppressHydrationWarning>
              {t.home.heroTitle.split('\n')[0]}
            </span>
            <span className="text-sky-500 dark:text-sky-400 block" suppressHydrationWarning>
              {t.home.heroTitle.split('\n')[1]}
            </span>
          </h1>

          <HeroAnimation />

          <div className="max-w-2xl space-y-8">
            <p className="font-mono text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed"
               suppressHydrationWarning>
              {t.home.heroSub}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary text-[11px] px-6 py-3" suppressHydrationWarning>
                {t.home.heroCta} →
              </Link>
              <Link href="/login" className="btn-ghost text-[11px] px-6 py-3" suppressHydrationWarning>
                {t.nav.login}
              </Link>
              <a href="https://github.com/Dann-Lara/my-tools" target="_blank" rel="noopener noreferrer"
                className="btn-ghost text-[11px] px-6 py-3 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                suppressHydrationWarning>
                {t.home.githubLink} ↗
              </a>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-6 max-w-sm">
            {[
              { ref: linesRef, suffix: '+', label: 'Lines of code' },
              { ref: filesRef, suffix: '',  label: 'Files' },
              { ref: svcRef,   suffix: '',  label: 'Services' },
            ].map(({ ref, suffix, label }) => (
              <div key={label} className="text-center">
                <div className="font-mono text-2xl font-bold text-sky-600 dark:text-sky-400">
                  <span ref={ref}>0</span>{suffix}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                        font-mono text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-700 animate-bounce">
          <span>scroll</span>
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <path d="M5 1v12M1 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-12 text-center">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 01</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.archTitle}
            </h2>
            <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto" suppressHydrationWarning>
              {t.home.archDesc}
            </p>
          </div>
          <ArchitectureDiagram />
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 02</p>
            <h2 className="headline text-5xl md:text-7xl text-slate-900 dark:text-white" suppressHydrationWarning>
              {t.home.stackTitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {STACK.map(({ name, color, dot }) => (
              <div key={name} className="flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-default group
                                         border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40
                                         hover:border-slate-400 dark:hover:border-slate-600 transition-all">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <span className={`font-mono text-[11px] ${color} opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-wider`}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDD */}
      <section id="sdd" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16 text-center">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 03</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.sddTitle}
            </h2>
            <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto" suppressHydrationWarning>
              {t.home.sddDesc}
            </p>
          </div>
          <SddFlow />
        </div>
      </section>

      {/* METRICS */}
      <section id="metrics" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16 text-center">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 04</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.metricsTitle}
            </h2>
          </div>
          <LandingMetrics />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 05</p>
            <h2 className="headline text-5xl md:text-7xl text-slate-900 dark:text-white" suppressHydrationWarning>
              {t.home.featuresTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🤖', title: t.home.feat1Title, desc: t.home.feat1Desc },
              { icon: '🔐', title: t.home.feat2Title, desc: t.home.feat2Desc },
              { icon: '⚡', title: t.home.feat3Title, desc: t.home.feat3Desc },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="relative group p-6 rounded-xl border transition-all duration-300
                                      border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40
                                      hover:border-sky-400/50 hover:shadow-lg dark:hover:bg-slate-900/80">
                <span className="text-2xl mb-4 block">{icon}</span>
                <h3 className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-wider"
                    suppressHydrationWarning>{title}</h3>
                <p className="font-mono text-[11px] text-slate-500 leading-relaxed" suppressHydrationWarning>{desc}</p>
                <div className="absolute bottom-4 right-4 font-mono text-[9px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* N8N SHOWCASE */}
      <section id="n8n" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16 text-center">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 06</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.n8nTitle}
            </h2>
            <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto" suppressHydrationWarning>
              {t.home.n8nDesc}
            </p>
          </div>
          <N8nShowcase />
        </div>
      </section>

      {/* API DOCS */}
      <section id="docs" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">— 07</p>
              <h2 className="headline text-5xl md:text-7xl text-slate-900 dark:text-white" suppressHydrationWarning>
                {t.home.docsTitle}
              </h2>
            </div>
            <a href="http://localhost:3001/api/docs" target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-[11px] px-8 py-4 self-start md:self-auto shrink-0"
              suppressHydrationWarning>
              {t.home.docsCta}
            </a>
          </div>
          <div className="mt-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <span className="ml-3 font-mono text-[10px] text-slate-500">POST /v1/auth/login</span>
            </div>
            <pre className="p-6 font-mono text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto leading-relaxed">
{`{
  "email": "superadmin@ailab.dev",
  "password": "SuperAdmin123!"
}

// Response → 200 OK
{
  "accessToken":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn":    604800,
  "user": { "id": "uuid", "email": "...", "role": "superadmin" }
}`}
            </pre>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
