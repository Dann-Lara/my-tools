'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface NodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: string;
}

const nodes: NodePosition[] = [
  { id: 'user', x: 100, y: 200, label: 'User', icon: '👤' },
  { id: 'frontend', x: 250, y: 200, label: 'Next.js', icon: '⚡' },
  { id: 'backend', x: 400, y: 200, label: 'NestJS', icon: '🔷' },
  { id: 'database', x: 550, y: 200, label: 'PostgreSQL', icon: '🗄️' },
  { id: 'ai', x: 400, y: 100, label: 'AI Core', icon: '🤖' },
  { id: 'n8n', x: 400, y: 320, label: 'n8n', icon: '🔄' },
  { id: 'telegram', x: 550, y: 320, label: 'Telegram', icon: '✈️' },
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
    anime.set('.arch-node-icon', { opacity: 0 });
    anime.set('.arch-label', { opacity: 0, translateY: 10 });
    anime.set('.arch-path', { strokeDasharray: 1000, strokeDashoffset: 1000, opacity: 0 });

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
      duration: 300,
    }, '-=400')
    .add({
      targets: '.arch-label',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      delay: anime.stagger(50),
    }, '-=300')
    .add({
      targets: '.arch-path',
      strokeDashoffset: [1000, 0],
      opacity: [0, 0.6],
      duration: 800,
      delay: anime.stagger(100),
      easing: 'easeInOutSine',
    }, '-=600');

    const pulseAnim = anime({
      targets: '.arch-node-circle',
      scale: [1, 1.05, 1],
      duration: 2000,
      delay: anime.stagger(200, { from: 'center' }),
      loop: true,
      easing: 'easeInOutSine',
    });

    const flowAnim = anime({
      targets: '.flow-particle',
      opacity: [0, 1, 0],
      translateX: [
        { value: 150, duration: 1500 },
        { value: 300, duration: 1500 },
        { value: 450, duration: 1500 },
      ],
      translateY: [
        { value: 0, duration: 1500 },
        { value: -100, duration: 1500 },
        { value: 0, duration: 1500 },
      ],
      duration: 4500,
      loop: true,
      easing: 'easeInOutSine',
    });

    return () => {
      pulseAnim.pause();
      flowAnim.pause();
    };
  }, [isVisible]);

  const getNodePosition = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 700 400"
        className="w-full max-w-4xl mx-auto h-auto"
        style={{ minHeight: '400px' }}
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
            <g key={i}>
              <path
                className="arch-path"
                d={`M ${from.x + 30} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2} ${to.x - 30} ${to.y}`}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {nodes.map((node) => (
          <g key={node.id} className="arch-node" style={{ opacity: 0 }}>
            <circle
              className="arch-node-circle"
              cx={node.x}
              cy={node.y}
              r="28"
              fill="#0f172a"
              stroke="#0ea5e9"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <text
              className="arch-node-icon"
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="18"
            >
              {node.icon}
            </text>
            <text
              className="arch-label"
              x={node.x}
              y={node.y + 50}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}

        <g className="flow-particle" opacity="0">
          <circle r="4" fill="#38bdf8">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path="M 100 200 Q 175 200 250 200 T 400 200 T 550 200"
            />
          </circle>
        </g>
      </svg>

      <div className="flex justify-center gap-8 mt-6 flex-wrap">
        {[
          { icon: '⚡', label: 'Frontend' },
          { icon: '🔷', label: 'API' },
          { icon: '🤖', label: 'AI' },
          { icon: '🔄', label: 'Automation' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
