'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { Spinner } from '@/components/ui/Spinner';
import {
  getMonetizationSetup,
  updateMonetizationStep,
  type MonetizationSetup,
} from '@/lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

interface MonetizationStep {
  id: string;
  category: string;
  title: string;
  description: string;
  actionUrl?: string;
  completed: boolean;
  completedAt?: string;
  priority: 'critical' | 'high' | 'medium';
}

function MonetizationTabContent() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const [setup, setSetup] = useState<MonetizationSetup | null>(null);
  const [loading, setLoading] = useState(true);

  const channelId = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadMonetization();
  }, [channelId, authLoading, user]);

  async function loadMonetization() {
    setLoading(true);
    try {
      const data = await getMonetizationSetup(channelId);
      setSetup(data);
    } catch (err) {
      console.error('Failed to load monetization:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStep(stepId: string, completed: boolean) {
    try {
      await updateMonetizationStep(channelId, stepId, completed);
      setSetup(setup ? {
        ...setup,
        steps: setup.steps.map((s) =>
          s.id === stepId ? { ...s, completed } : s
        ),
      } : null);
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ypp: t.youtube.yppSetup,
      ads_config: t.youtube.adsConfig,
      content_policy: t.youtube.contentPolicy,
      seo: 'SEO',
      affiliate: t.youtube.affiliate,
      owned_product: t.youtube.ownedProduct,
    };
    return labels[category] || category;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      high: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      medium: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    };
    return styles[priority] || styles.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!setup) return null;

  const completedSteps = setup.steps.filter((s) => s.completed).length;
  const totalSteps = setup.steps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  const groupedSteps = setup.steps.reduce((acc, step) => {
    if (!acc[step.category]) acc[step.category] = [];
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, MonetizationStep[]>);

  return (
    <div>
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.youtube.monetizationSteps}
          </h2>
          <span className="text-sky-600 dark:text-sky-400 font-mono">
            {completedSteps}/{totalSteps} ({progress}%)
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedSteps).map(([category, steps]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
              {getCategoryLabel(category)}
            </h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`card p-4 ${step.completed ? 'border-l-4 border-l-emerald-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={(e) => handleToggleStep(step.id, e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-slate-900 dark:text-white ${step.completed ? 'line-through opacity-60' : ''}`}>
                          {step.title}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${getPriorityBadge(step.priority)}`}>
                          {step.priority === 'critical' ? t.youtube.critical : step.priority === 'high' ? t.youtube.high : t.youtube.medium}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {step.description}
                      </p>
                      {step.actionUrl && (
                        <a
                          href={step.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline mt-2 inline-block"
                        >
                          {t.youtube.yppSetup} &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonetizationPage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PermissionGate module="youtube">
      <MonetizationTabContent />
    </PermissionGate>
  );
}
