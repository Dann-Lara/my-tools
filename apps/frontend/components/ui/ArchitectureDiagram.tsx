'use client';

import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface NodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: 'user' | 'frontend' | 'backend' | 'database' | 'ai' | 'n8n' | 'telegram';
}

const nodes: NodePosition[] = [
  { id: 'user', x: 100, y: 200, label: 'User', icon: 'user' },
  { id: 'frontend', x: 250, y: 200, label: 'Next.js', icon: 'frontend' },
  { id: 'backend', x: 400, y: 200, label: 'NestJS', icon: 'backend' },
  { id: 'database', x: 550, y: 200, label: 'PostgreSQL', icon: 'database' },
  { id: 'ai', x: 400, y: 100, label: 'AI Core', icon: 'ai' },
  { id: 'n8n', x: 400, y: 320, label: 'n8n', icon: 'n8n' },
  { id: 'telegram', x: 550, y: 320, label: 'Telegram', icon: 'telegram' },
];

const connections = [
  { from: 'user', to: 'frontend' },
  { from: 'frontend', to: 'backend' },
  { from: 'backend', to: 'database' },
  { from: 'backend', to: 'ai' },
  { from: 'backend', to: 'n8n' },
  { from: 'n8n', to: 'telegram' },
  { from: 'ai', to: 'backend' },
  { from: 'n8n', to: 'backend' },
];

const icons: Record<string, React.ReactNode> = {
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  ),
  n8n: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M4 4h16v16H4z" />
      <path d="M9 9h6v6H9z" fill="currentColor" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
};

function NodeIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const iconNode = icons[icon];
  if (!iconNode) return null;
  return (
    <span className={className} suppressHydrationWarning>
      {iconNode}
    </span>
  );
}

export function ArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      anime({
        targets: '.arch-node, .arch-label',
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
      return;
    }

    anime.set('.arch-node-circle', { scale: 0, opacity: 0 });
    anime.set('.arch-node-icon', { opacity: 0, scale: 0.5 });
    anime.set('.arch-label', { opacity: 0, translateY: 10 });
    anime.set('.arch-path', { strokeDasharray: 500, strokeDashoffset: 500, opacity: 0 });

    const tl = anime.timeline({
      easing: 'easeOutExpo',
    });

    tl.add({
      targets: '.arch-node-circle',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(80),
    })
    .add({
      targets: '.arch-node-icon',
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 400,
      easing: 'easeOutBack',
    }, '-=300')
    .add({
      targets: '.arch-label',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      delay: anime.stagger(50),
    }, '-=200')
    .add({
      targets: '.arch-path',
      strokeDashoffset: [500, 0],
      opacity: [0, 0.5],
      duration: 800,
      delay: anime.stagger(80),
      easing: 'easeInOutSine',
    }, '-=400');

    const pulseAnim = anime({
      targets: '.arch-node-circle',
      scale: [1, 1.08, 1],
      duration: 2000,
      delay: anime.stagger(150, { from: 'center' }),
      loop: true,
      easing: 'easeInOutSine',
    });

    return () => {
      pulseAnim.pause();
    };
  }, [isVisible]);

  const getNodePosition = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 700 400"
        className="w-full h-auto"
        style={{ minHeight: '400px' }}
      >
        <defs>
          <linearGradient id="archPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
          </linearGradient>
          <filter id="archGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn, i) => {
          const from = getNodePosition(conn.from);
          const to = getNodePosition(conn.to);
          return (
            <path
              key={i}
              className="arch-path"
              d={`M ${from.x + 30} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2} ${to.x - 30} ${to.y}`}
              fill="none"
              stroke="url(#archPathGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {nodes.map((node) => (
          <g key={node.id} className="arch-node" style={{ opacity: 0 }}>
            <circle
              className="arch-node-circle"
              cx={node.x}
              cy={node.y}
              r="30"
              fill="#0f172a"
              stroke="#0ea5e9"
              strokeWidth="2"
              filter="url(#archGlow)"
            />
            <g transform={`translate(${node.x - 12}, ${node.y - 12})`} className="arch-node-icon">
              <NodeIcon icon={node.icon} className="w-6 h-6 text-sky-400" />
            </g>
            <text
              className="arch-label"
              x={node.x}
              y={node.y + 52}
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex justify-center gap-10 mt-8 flex-wrap">
        {[
          { icon: 'frontend', label: 'Frontend' },
          { icon: 'backend', label: 'API' },
          { icon: 'ai', label: 'AI' },
          { icon: 'n8n', label: 'Automation' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <NodeIcon icon={item.icon} className="w-4 h-4 text-sky-500" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
