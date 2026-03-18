'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { Spinner } from '@/components/ui/Spinner';
import {
  getIdeasByChannel,
  generateAIPrompts,
  deletePrompt,
  togglePromptComplete,
  type ContentIdea,
  type AIVideoPrompt,
} from '@/lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

type PromptType = 'video' | 'thumbnail' | 'short';

function PromptsTabContent() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [promptType, setPromptType] = useState<PromptType>('video');
  const [prompts, setPrompts] = useState<AIVideoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const channelId = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadIdeas();
  }, [channelId, authLoading, user]);

  async function loadIdeas() {
    setLoading(true);
    try {
      const data = await getIdeasByChannel(channelId);
      setIdeas(data);
      if (data.length > 0) {
        setSelectedIdea(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!selectedIdea) return;
    setGenerating(true);
    setError(null);
    try {
      const newPrompts = await generateAIPrompts(selectedIdea, promptType);
      setPrompts([...prompts, ...newPrompts]);
    } catch (err) {
      console.error('Failed to generate prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate prompts');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(promptId: string) {
    try {
      await deletePrompt(promptId);
      setPrompts(prompts.filter(p => p.id !== promptId));
    } catch (err) {
      console.error('Failed to delete prompt:', err);
    }
  }

  async function handleToggleComplete(promptId: string) {
    try {
      const updated = await togglePromptComplete(promptId);
      setPrompts(prompts.map(p => p.id === promptId ? updated : p));
    } catch (err) {
      console.error('Failed to toggle prompt:', err);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const getIdeaTitle = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    return idea ? idea.title : 'Unknown idea';
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      sora: 'S',
      runway: 'R',
      kling: 'K',
      midjourney: 'M',
      pika: 'P',
    };
    return icons[platform] || platform[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t.youtube.selectIdea}
          </label>
          <select
            value={selectedIdea}
            onChange={(e) => setSelectedIdea(e.target.value)}
            className="input w-full"
          >
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title.slice(0, 50)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {(['video', 'thumbnail', 'short'] as PromptType[]).map((type) => (
            <button
              key={type}
              onClick={() => setPromptType(type)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors
                ${promptType === type
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {type === 'video' ? t.youtube.promptVideo : type === 'thumbnail' ? t.youtube.promptThumbnail : t.youtube.promptShort}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !selectedIdea}
          className="btn-primary whitespace-nowrap"
        >
          {generating ? t.youtube.generatingPrompts : t.youtube.generateNewPrompt}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            {t.youtube.generateNewPrompt}
          </button>
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>{t.youtube.noPrompts}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`card p-4 ${prompt.completed ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : ''}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={prompt.completed}
                  onChange={() => handleToggleComplete(prompt.id)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                        {getPlatformIcon(prompt.platform)} {prompt.platform}
                      </span>
                      <span className="text-xs text-slate-400">
                        {getIdeaTitle(prompt.ideaId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(prompt.promptText, prompt.id)}
                        className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        {copied === prompt.id ? t.youtube.copied : t.youtube.copyPrompt}
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        {t.youtube.deletePrompt}
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${prompt.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                    {prompt.promptText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PromptsPage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <PermissionGate module="youtube">
      <PromptsTabContent />
    </PermissionGate>
  );
}
