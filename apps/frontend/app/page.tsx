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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || !ref.current) return;
    
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      if (ref.current) ref.current.textContent = Math.floor(start).toString();
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, mounted]);
  return ref;
}

const STACK = [
  { 
    name: 'Next.js', 
    desc: 'React framework with App Router', 
    color: 'text-black dark:text-white',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11.25h-13L12 6.5z"/>
      </svg>
    )
  },
  { 
    name: 'NestJS', 
    desc: 'Node.js framework with TypeORM', 
    color: 'text-red-600 dark:text-red-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
      </svg>
    )
  },
  { 
    name: 'TypeScript', 
    desc: 'Typed JavaScript at scale', 
    color: 'text-sky-600 dark:text-sky-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.395c.273.12.582.248.926.381.52.202.99.409 1.41.621.42.212.777.459 1.069.743.293.284.514.622.665 1.014.15.392.226.858.226 1.398 0 .602-.114 1.119-.34 1.55-.227.43-.546.786-.956 1.067-.41.28-.897.487-1.46.623a7.685 7.685 0 0 1-1.838.203c-.654 0-1.273-.063-1.855-.188a8.137 8.137 0 0 1-1.543-.459v-2.631c.263.14.549.3.858.478.309.179.61.346.903.501.293.156.567.28.82.375.255.096.49.165.706.206.216.042.41.062.583.062.272 0 .514-.03.724-.091.21-.062.387-.159.53-.293.143-.133.253-.3.33-.501.077-.201.116-.444.116-.728 0-.291-.048-.533-.145-.725-.097-.193-.252-.35-.464-.473a4.77 4.77 0 0 0-.756-.34c-.295-.098-.654-.223-1.077-.374-.528-.19-.989-.395-1.384-.615a6.66 6.66 0 0 1-1.113-.675 3.94 3.94 0 0 1-.749-.893 2.836 2.836 0 0 1-.412-1.196c-.057-.329-.086-.794-.086-1.397 0-.613.115-1.139.344-1.58.23-.44.545-.802.947-1.085.402-.284.875-.495 1.418-.633a7.685 7.685 0 0 1 1.77-.214zm-6.59 1.678c.15.017.304.045.46.086.157.04.31.093.458.158.149.065.285.143.409.233.124.09.234.194.328.312.094.118.17.252.227.402.057.15.086.32.086.51 0 .223-.045.416-.135.579-.09.164-.217.3-.38.407a2.67 2.67 0 0 1-.585.27 6.16 6.16 0 0 1-.748.2c-.282.05-.58.088-.894.116l-.546.047z"/>
      </svg>
    )
  },
  { 
    name: 'PostgreSQL', 
    desc: 'Advanced open source database', 
    color: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
      </svg>
    )
  },
  { 
    name: 'Redis', 
    desc: 'In-memory data store', 
    color: 'text-red-500 dark:text-red-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M10.5 2.661l.54.95-.54-.95a.75.75 0 0 1 1.035-.23l.77.62-.77-.62a.75.75 0 0 1 .23-1.035l1.08.38-1.08-.38a.75.75 0 0 1 .5-.866l.77.62-.77-.62a.75.75 0 0 1 .23-1.035l1.08.38-1.08-.38a.75.75 0 0 1 .5-.866l1.08.38-1.08-.38a.75.75 0 0 1 .23-1.035l1.08.38-1.08-.38a.75.75 0 0 1 .5-.866l1.08.38-1.08-.38a.75.75 0 0 1 .23-1.035l1.08.38-1.08-.38a.75.75 0 0 1 .5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l4.62 1.54a.75.75 0 0 1 .5.866l-4.62-1.54a.75.75 0 0 1 .23 1.035l-2.31-1.54a.75.75 0 0 1 .5.866l-1.08-.38 1.08.38a.75.75 0 0 1-.23 1.035l-2.31 1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-2.31-1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-4.62-1.54a.75.75 0 0 1-.5-.866l4.62 1.54a.75.75 0 0 1-.23-1.035l2.31 1.54-2.31-1.54a.75.75 0 0 1-.5-.866l1.08.38-1.08-.38a.75.75 0 0 1 .23-1.035l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1 .5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l4.62 1.54-4.62-1.54a.75.75 0 0 1-.5-.866l1.08.38-1.08-.38a.75.75 0 0 1 .23-1.035l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l4.62 1.54a.75.75 0 0 1 .5.866l-4.62-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l1.08.38-1.08-.38a.75.75 0 0 1-.5-.866l2.31 1.54-2.31-1.54a.75.75 0 0 1-.23-1.035l4.62 1.54a.75.75 0 0 1 .5.866l-1.08-.38 1.08.38a.75.75 0 0 1-.23 1.035l-2.31-1.54a.75.75 0 0 1-.5-.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-2.31 1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-2.31-1.54a.75.75 0 0 1-.23 1.035l-1.08.38 1.08-.38a.75.75 0 0 1 .5.866l-4.62-1.54a.75.75 0 0 1-.5-.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-2.31-1.54a.75.75 0 0 1-.5-.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-2.31 1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-4.62-1.54a.75.75 0 0 1-.5.866l-1.08-.38 1.08.38a.75.75 0 0 1-.23 1.035l-2.31-1.54a.75.75 0 0 1-.5.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-2.31-1.54a.75.75 0 0 1-.5.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-4.62-1.54a.75.75 0 0 1-.5.866l-1.08-.38 1.08.38a.75.75 0 0 1-.23 1.035l-2.31-1.54a.75.75 0 0 1-.5.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-2.31 1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-2.31-1.54a.75.75 0 0 1-.23 1.035l-1.08.38 1.08-.38a.75.75 0 0 1 .5.866l-4.62-1.54a.75.75 0 0 1-.5.866L6.8 13.6l1.08-.38a.75.75 0 0 1 .23 1.035l-2.31-1.54a.75.75 0 0 1-.5.866L3.38 14.46l1.08-.38a.75.75 0 0 1 .23 1.035l-2.31 1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-4.62-1.54a.75.75 0 0 1-.5.866l-.77-.62.77.62a.75.75 0 0 1-.23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-.77-.62.77.62a.75.75 0 0 1-.23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-2.31-1.54 2.31 1.54a.75.75 0 0 1-.23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-2.31-1.54 2.31 1.54a.75.75 0 0 1-.23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-2.31-1.54 2.31 1.54a.75.75 0 0 1-.23 1.035l-1.08-.38 1.08.38a.75.75 0 0 1-.5.866l-4.62-1.54 4.62 1.54a.75.75 0 0 1 .5.866l-1.08-.38 1.08.38a.75.75 0 0 1-.23 1.035l-2.31-1.54a.75.75 0 0 1-.5.866l-1.08.38 1.08-.38a.75.75 0 0 1 .23 1.035l-2.31 1.54 2.31 1.54a.75.75 0 0 1 .23 1.035l-4.62-1.54a.75.75 0 0 1-.5.866z"/>
      </svg>
    )
  },
  { 
    name: 'Docker', 
    desc: 'Container platform', 
    color: 'text-sky-600 dark:text-sky-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.084.185.185.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.185.185v1.888c0 .102.084.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
      </svg>
    )
  },
  { 
    name: 'TailwindCSS', 
    desc: 'Utility-first CSS framework', 
    color: 'text-sky-500 dark:text-sky-300',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
      </svg>
    )
  },
  { 
    name: 'n8n', 
    desc: 'Workflow automation', 
    color: 'text-pink-500 dark:text-pink-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-1 2v8h2V4h-2z"/>
      </svg>
    )
  },
];

const HeroIcons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  frontend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  backend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  ),
  n8n: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="8" y="8" width="8" height="8" fill="currentColor" />
    </svg>
  ),
};

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
      anime.set('.hero-node', { opacity: 1 });
      anime.set('.hero-line', { opacity: 0.3 });
      return;
    }

    anime.set('.hero-node', { opacity: 0 });
    anime.set('.hero-line', { opacity: 0 });

    anime({
      targets: '.hero-node',
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(100),
      easing: 'easeOutQuad',
    });

    anime({
      targets: '.hero-line',
      opacity: [0, 0.4],
      duration: 600,
      delay: anime.stagger(100, { start: 300 }),
      easing: 'easeOutQuad',
    });
  }, [isVisible]);

  const heroNodes = [
    { id: 'user', x: 100, y: 150, icon: HeroIcons.user },
    { id: 'frontend', x: 250, y: 150, icon: HeroIcons.frontend },
    { id: 'backend', x: 400, y: 150, icon: HeroIcons.backend },
    { id: 'database', x: 550, y: 150, icon: HeroIcons.database },
    { id: 'ai', x: 400, y: 70, icon: HeroIcons.ai },
    { id: 'n8n', x: 400, y: 230, icon: HeroIcons.n8n },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" suppressHydrationWarning>
      <svg viewBox="0 0 800 300" className="w-full h-full opacity-60">
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <line className="hero-line" x1="100" y1="150" x2="250" y2="150" stroke="url(#heroGrad)" strokeWidth="2" />
        <line className="hero-line" x1="250" y1="150" x2="400" y2="150" stroke="url(#heroGrad)" strokeWidth="2" />
        <line className="hero-line" x1="400" y1="150" x2="550" y2="150" stroke="url(#heroGrad)" strokeWidth="2" />
        <line className="hero-line" x1="250" y1="150" x2="400" y2="70" stroke="url(#heroGrad)" strokeWidth="1.5" />
        <line className="hero-line" x1="250" y1="150" x2="400" y2="230" stroke="url(#heroGrad)" strokeWidth="1.5" />

        {heroNodes.map((node) => (
          <g key={node.id} className="hero-node" style={{ opacity: 0 }}>
            <circle cx={node.x} cy={node.y} r="20" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
            <g transform={`translate(${node.x - 10}, ${node.y - 10})`} className="text-sky-400" suppressHydrationWarning>
              {node.icon}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

const FeatureIcons = {
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  ),
  auth: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  automation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
};

export default function LandingPage(): React.JSX.Element {
  const { t } = useI18n();
  const linesRef = useCountUp(4200);
  const filesRef = useCountUp(97);
  const svcRef = useCountUp(6);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar variant="public" />

      {/* HERO */}
      <section className="relative min-h-[70vh] overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                        bg-sky-400/5 dark:bg-sky-500/8 rounded-full blur-[120px] pointer-events-none" />

        <HeroAnimation />

        <div className="relative z-10 max-w-[1400px] px-6 md:px-12 py-16">
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

          <div className="max-w-2xl space-y-8">
            <p className="font-mono text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed"
               suppressHydrationWarning>
              {t.home.heroSub}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary text-[11px] px-6 py-3" suppressHydrationWarning>
                {t.home.heroCta}
              </Link>
              <Link href="/login" className="btn-ghost text-[11px] px-6 py-3" suppressHydrationWarning>
                {t.nav.login}
              </Link>
              <a href="https://github.com/Dann-Lara/my-tools" target="_blank" rel="noopener noreferrer"
                className="btn-ghost text-[11px] px-6 py-3 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                suppressHydrationWarning>
                {t.home.githubLink}
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl">
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
          <span suppressHydrationWarning>scroll</span>
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <path d="M5 1v12M1 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-12">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 01</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.archTitle}
            </h2>
            <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400 max-w-2xl" suppressHydrationWarning>
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
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 02</p>
            <h2 className="headline text-5xl md:text-7xl text-slate-900 dark:text-white" suppressHydrationWarning>
              {t.home.stackTitle}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {STACK.map(({ name, desc, color, icon }) => (
              <div key={name} className="group p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300">
                <div className={`${color} mb-4 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className={`font-mono text-sm font-bold ${color} uppercase tracking-wider mb-1`}>
                  {name}
                </h3>
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDD */}
      <section id="sdd" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 03</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.sddTitle}
            </h2>
            <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400 max-w-2xl" suppressHydrationWarning>
              {t.home.sddDesc}
            </p>
          </div>
          <SddFlow />
        </div>
      </section>

      {/* METRICS */}
      <section id="metrics" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 04</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.metricsTitle}
            </h2>
          </div>
          <div suppressHydrationWarning>
            <LandingMetrics />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 md:py-32 border-t border-slate-200 dark:border-slate-800/50 bg-slate-900/30 dark:bg-slate-900/20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 05</p>
            <h2 className="headline text-5xl md:text-7xl text-slate-900 dark:text-white" suppressHydrationWarning>
              {t.home.featuresTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FeatureIcons.ai, title: t.home.feat1Title, desc: t.home.feat1Desc },
              { icon: FeatureIcons.auth, title: t.home.feat2Title, desc: t.home.feat2Desc },
              { icon: FeatureIcons.automation, title: t.home.feat3Title, desc: t.home.feat3Desc },
              { icon: FeatureIcons.ai, title: t.home.feat4Title, desc: t.home.feat4Desc },
              { icon: FeatureIcons.automation, title: t.home.feat5Title, desc: t.home.feat5Desc },
              { icon: FeatureIcons.auth, title: t.home.feat6Title, desc: t.home.feat6Desc },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="relative group p-6 rounded-xl border transition-all duration-300
                                      border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40
                                      hover:border-sky-400/50 hover:shadow-lg dark:hover:bg-slate-900/80">
                <span className="text-sky-400 mb-4 block" suppressHydrationWarning>{icon}</span>
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
          <div className="mb-16">
            <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 06</p>
            <h2 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white mb-4" suppressHydrationWarning>
              {t.home.n8nTitle}
            </h2>
            <p className="font-mono text-[12px] text-slate-500 dark:text-slate-400 max-w-2xl" suppressHydrationWarning>
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
              <p className="font-mono text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.4em] mb-4">- 07</p>
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

// Response - 200 OK
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
