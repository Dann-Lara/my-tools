'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface SddStep {
  id: string;
  title: string;
  desc: string;
  icon: 'draft' | 'approved' | 'tasks' | 'impl' | 'done';
}

const steps: SddStep[] = [
  { id: 'draft', title: 'Draft', desc: 'Create spec document', icon: 'draft' },
  { id: 'approved', title: 'Approved', desc: 'Stakeholder review', icon: 'approved' },
  { id: 'tasks', title: 'Tasks', desc: 'Break into tasks', icon: 'tasks' },
  { id: 'impl', title: 'Impl', desc: 'Implementation', icon: 'impl' },
  { id: 'done', title: 'Done', desc: 'Verified & shipped', icon: 'done' },
];

const icons: Record<string, React.ReactNode> = {
  draft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  approved: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  ),
  impl: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const loopIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

function StepIcon({ icon }: { icon: string }) {
  return <span className="text-sky-400">{icons[icon]}</span>;
}

export function SddFlow() {
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
      anime.set('.sdd-step', { opacity: 1, translateY: 0 });
      anime.set('.sdd-line', { scaleX: 1, opacity: 0.3 });
      return;
    }

    anime.set('.sdd-step', { opacity: 0, translateY: 40, scale: 0.9 });
    anime.set('.sdd-line', { scaleX: 0, opacity: 0 });

    const tl = anime.timeline({
      easing: 'easeOutExpo',
    });

    steps.forEach((step, i) => {
      tl.add({
        targets: `.sdd-step-${step.id}`,
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        duration: 600,
      }, i * 150);

      if (i < steps.length - 1) {
        tl.add({
          targets: `.sdd-line-${i}`,
          scaleX: [0, 1],
          opacity: [0, 0.3],
          duration: 400,
          easing: 'easeInOutSine',
        }, '-=300');
      }
    });

    const pulse = anime({
      targets: '.sdd-step-icon',
      scale: [1, 1.1, 1],
      duration: 1500,
      delay: anime.stagger(200, { from: 'center' }),
      loop: true,
      easing: 'easeInOutSine',
    });

    return () => pulse.pause();
  }, [isVisible]);

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto">
      <div className="flex items-center justify-center gap-0 md:gap-2 flex-wrap md:flex-nowrap">
        {steps.map((step, i) => (
          <div key={step.id} className={`sdd-step sdd-step-${step.id} flex items-center`}>
            <div className="flex flex-col items-center">
              <div className="sdd-step-icon w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-sky-500/30 bg-slate-900/80 dark:bg-slate-900/60 flex items-center justify-center backdrop-blur-sm transition-all hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20">
                <StepIcon icon={step.icon} />
              </div>
              <div className="mt-3 text-center">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
                  {step.title}
                </div>
                <div className="font-mono text-[9px] text-slate-500 mt-1">
                  {step.desc}
                </div>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className={`sdd-line sdd-line-${i} hidden md:block w-8 md:w-16 h-0.5 bg-sky-500/30 mx-2 md:mx-4 rounded-full`}>
                <div className="w-full h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full opacity-50" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-emerald-400">{loopIcon}</span>
          <span className="font-mono text-[10px] text-emerald-400/80">
            Feedback loop: iterate and improve
          </span>
        </div>
      </div>
    </div>
  );
}
