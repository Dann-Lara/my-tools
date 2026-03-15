'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface MetricsData {
  activeUsers: number;
  checklistsCreated: number;
  applicationsTracked: number;
}

interface MetricCardProps {
  icon: string;
  value: number;
  label: string;
  delay: number;
}

function MetricCard({ icon, value, label, delay }: MetricCardProps) {
  const countRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !countRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      if (countRef.current) {
        countRef.current.textContent = value.toLocaleString();
      }
      return;
    }

    const obj = { val: 0 };
    
    anime({
      targets: obj,
      val: value,
      round: 1,
      duration: 2000,
      easing: 'easeOutExpo',
      update: function () {
        if (countRef.current) {
          countRef.current.textContent = obj.val.toLocaleString();
        }
      },
    });

    anime({
      targets: cardRef.current,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      delay: delay,
      easing: 'easeOutExpo',
    });
  }, [isVisible, value, delay]);

  return (
    <div
      ref={cardRef}
      className="relative group p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <div className="font-mono text-4xl font-bold text-sky-600 dark:text-sky-400 mb-2">
          <span ref={countRef}>0</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {label}
        </div>
      </div>

      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500" />
    </div>
  );
}

export function LandingMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/landing/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        } else {
          setMetrics({ activeUsers: 42, checklistsCreated: 128, applicationsTracked: 89 });
        }
      } catch {
        setMetrics({ activeUsers: 42, checklistsCreated: 128, applicationsTracked: 89 });
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  const metricsConfig = [
    { icon: '🚀', value: metrics?.activeUsers ?? 0, label: 'Active Users', delay: 0 },
    { icon: '📋', value: metrics?.checklistsCreated ?? 0, label: 'Checklists Created', delay: 100 },
    { icon: '📝', value: metrics?.applicationsTracked ?? 0, label: 'Applications Tracked', delay: 200 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <div className="animate-pulse">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {metricsConfig.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
