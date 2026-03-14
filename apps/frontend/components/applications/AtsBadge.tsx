'use client';

interface AtsBadgeProps {
  score: number;
  showLabel?: boolean;
}

export function AtsBadge({ score, showLabel = true }: AtsBadgeProps) {
  const getColor = () => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-sky-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Needs Work';
    return 'Poor';
  };

  const getTextColor = () => {
    if (score >= 90) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 80) return 'text-sky-700 dark:text-sky-400';
    if (score >= 70) return 'text-amber-700 dark:text-amber-400';
    return 'text-rose-700 dark:text-rose-400';
  };

  const getBgColor = () => {
    if (score >= 90) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (score >= 80) return 'bg-sky-100 dark:bg-sky-900/30';
    if (score >= 70) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-rose-100 dark:bg-rose-900/30';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${getBgColor()}`}>
      <span className={`w-5 h-5 rounded-full ${getColor()} flex items-center justify-center`}>
        <span className="text-[9px] font-bold text-white">{score}</span>
      </span>
      {showLabel && (
        <span className={`font-mono text-[9px] uppercase tracking-wider ${getTextColor()}`}>
          {getLabel()}
        </span>
      )}
    </div>
  );
}
