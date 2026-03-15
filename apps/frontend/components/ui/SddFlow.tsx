'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface SddStep {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

const steps: SddStep[] = [
  { id: 'draft', title: 'Draft', desc: 'Create spec document', icon: '📝' },
  { id: 'approved', title: 'Approved', desc: 'Stakeholder review', icon: '✅' },
  { id: 'tasks', title: 'Tasks', desc: 'Break into tasks', icon: '📋' },
  { id: 'impl', title: 'Impl', desc: 'Implementation', icon: '⚡' },
  { id: 'done', title: 'Done', desc: 'Verified & shipped', icon: '🚀' },
];

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
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-center gap-0 md:gap-2 flex-wrap md:flex-nowrap">
        {steps.map((step, i) => (
          <div key={step.id} className={`sdd-step sdd-step-${step.id} flex items-center`}>
            <div className="flex flex-col items-center">
              <div className="sdd-step-icon w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-sky-500/30 bg-slate-900/80 dark:bg-slate-900/60 flex items-center justify-center text-2xl md:text-3xl backdrop-blur-sm transition-all hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20">
                {step.icon}
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
          <span className="text-emerald-400">♻️</span>
          <span className="font-mono text-[10px] text-emerald-400/80">
            Feedback loop: iterate and improve
          </span>
        </div>
      </div>
    </div>
  );
}
