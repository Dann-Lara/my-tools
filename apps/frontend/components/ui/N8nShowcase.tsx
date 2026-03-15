'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'ready';
  icon: string;
  color: string;
}

const workflows: Workflow[] = [
  { id: 'reminders', name: 'Checklist Reminders', trigger: 'Every hour', status: 'active', icon: '⏰', color: 'sky' },
  { id: 'telegram', name: 'Telegram Bot', trigger: 'Webhook', status: 'ready', icon: '✈️', color: 'cyan' },
  { id: 'feedback', name: 'Weekly Feedback', trigger: 'Sunday 20:00', status: 'active', icon: '💬', color: 'emerald' },
];

export function N8nShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
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
      anime.set('.n8n-card', { opacity: 1, translateY: 0 });
      return;
    }

    anime.set('.n8n-card', { opacity: 0, translateY: 30, scale: 0.95 });

    anime({
      targets: '.n8n-card',
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      duration: 600,
      delay: anime.stagger(150),
      easing: 'easeOutExpo',
    });

    anime({
      targets: '.n8n-glow',
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      duration: 3000,
      delay: anime.stagger(500),
      loop: true,
      easing: 'easeInOutSine',
    });
  }, [isVisible]);

  const colorClasses: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    sky: {
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      glow: 'bg-sky-500',
    },
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      glow: 'bg-cyan-500',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'bg-emerald-500',
    },
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {workflows.map((wf) => {
        const colors = colorClasses[wf.color];
        return (
          <div
            key={wf.id}
            className={`n8n-card relative p-6 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm group hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className={`n8n-glow absolute -top-10 -right-10 w-24 h-24 ${colors.glow} rounded-full blur-3xl opacity-30`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{wf.icon}</div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider ${wf.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${wf.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  {wf.status}
                </div>
              </div>

              <h3 className="font-mono text-sm font-bold text-slate-200 mb-2">
                {wf.name}
              </h3>

              <div className="flex items-center gap-2 text-slate-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-mono text-[10px]">{wf.trigger}</span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>
  );
}
