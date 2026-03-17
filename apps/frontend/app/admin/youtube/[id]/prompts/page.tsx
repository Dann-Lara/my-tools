'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useI18n } from '../../../../lib/i18n-context';
import { usePermissions } from '../../../../lib/permissions-context';
import { PermissionGate } from '../../../../components/ui/PermissionGate';
import { Spinner } from '../../../../components/ui/Spinner';
import {
  getIdeasByChannel,
  generateAIPrompts,
  type ContentIdea,
  type AIVideoPrompt,
} from '../../../../lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

type PromptType = 'video' | 'thumbnail' | 'short';

function PromptsTabContent() {
  const { t } = useI18n();
  const params = useParams();
  const { hasPermission } = usePermissions();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [promptType, setPromptType] = useState<PromptType>('video');
  const [prompts, setPrompts] = useState<AIVideoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const channelId = params.id as string;

  useEffect(() => {
    loadIdeas();
  }, [channelId]);

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
    try {
      const newPrompts = await generateAIPrompts(selectedIdea, promptType);
      setPrompts([...prompts, ...newPrompts]);
    } catch (err) {
      console.error('Failed to generate prompts:', err);
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

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
      <div className="flex flex-wrap gap-4 mb-8 items-end">
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
          className="btn-primary"
        >
          {generating ? t.youtube.generatingPrompts : t.youtube.generatePrompts}
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>{t.youtube.noIdeas}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(new Set(prompts.map(p => p.generationBatch)))
            .sort((a, b) => b - a)
            .map((batch) => (
              <div key={batch} className="card p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  {t.youtube.batch} {batch}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts
                    .filter((p) => p.generationBatch === batch)
                    .map((prompt) => (
                      <div key={prompt.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                            {getPlatformIcon(prompt.platform)} {prompt.platform}
                          </span>
                          <button
                            onClick={() => copyToClipboard(prompt.promptText, prompt.id)}
                            className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            {copied === prompt.id ? t.youtube.copied : t.youtube.copyPrompt}
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4">
                          {prompt.promptText}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function PromptsPage() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('youtube')) {
    return null;
  }

  return (
    <PermissionGate module="youtube">
      <PromptsTabContent />
    </PermissionGate>
  );
}
