// ── Types ────────────────────────────────────────────────────────────────────
export type ChannelStatus = 'setup' | 'active' | 'paused' | 'monetized';
export type IdeaStatus = 'idea' | 'scripted' | 'filmed' | 'published' | 'analyzed';
export type ContentFormat = 'tutorial' | 'story' | 'list' | 'comparison' | 'reaction' | 'shorts_only';
export type SuccessProbability = 'high' | 'medium' | 'low';

export interface Niche {
  id: string;
  name: string;
  slug: string;
  description?: string;
  searchVolume: string;
  competition: string;
  opportunityScore: number;
  trend: string;
  trendPercent?: number;
  topKeywords: string[];
  suggestedAudience?: string;
  estimatedCPM?: number;
  source: string;
  createdAt: string;
  updatedAt: string;
  suggestedChannelName?: string;
}

export interface Channel {
  id: string;
  userId: string;
  nicheId: string;
  name: string;
  slug: string;
  description?: string;
  targetAudience?: string;
  channelGoal?: string;
  ctr?: number;
  avgRetention?: number;
  subscriberCount?: number;
  totalViews?: number;
  status: ChannelStatus;
  monetizationSetupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentIdea {
  id: string;
  channelId: string;
  title: string;
  hook?: string;
  script?: string;
  angle?: string;
  format: ContentFormat;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  hashtags?: string[];
  successProbability: SuccessProbability;
  successReason?: string;
  shortAngle?: string;
  shortScript?: string;
  status: IdeaStatus;
  publishedCtr?: number;
  publishedRetention?: number;
  publishedViews?: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  topKeywords?: string[];
}

export interface MonetizationStep {
  id: string;
  category: string;
  title: string;
  description: string;
  actionUrl?: string;
  completed: boolean;
  completedAt?: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface MonetizationSetup {
  id: string;
  channelId: string;
  steps: MonetizationStep[];
  completedAt?: string;
}

export interface ModuleVisibility {
  id: string;
  moduleName: string;
  isEnabled: boolean;
  allowedRoles: string[];
  allowedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

// ── API client ────────────────────────────────────────────────────────────────
function getHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ailab_at') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const API_BASE = '/api/v1/youtube';

// NICHES
export async function getNiches(): Promise<{ niches: Niche[]; source: string; cachedAt: string | null }> {
  const res = await fetch(`${API_BASE}/niches`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch niches');
  return res.json();
}

export async function getNicheById(id: string): Promise<Niche> {
  const res = await fetch(`${API_BASE}/niches/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch niche');
  return res.json();
}

// CHANNELS
export async function getChannels(): Promise<Channel[]> {
  const res = await fetch(`${API_BASE}/channels`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch channels');
  return res.json();
}

export async function getChannelById(id: string): Promise<Channel> {
  const res = await fetch(`${API_BASE}/channels/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch channel');
  return res.json();
}

export interface CreateChannelDto {
  nicheId: string;
  name: string;
  description?: string;
  targetAudience: string;
}

export async function createChannel(dto: CreateChannelDto): Promise<Channel> {
  const res = await fetch(`${API_BASE}/channels`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to create channel');
  return res.json();
}

// IDEAS
export async function getIdeasByChannel(channelId: string): Promise<ContentIdea[]> {
  const res = await fetch(`${API_BASE}/channels/${channelId}/ideas`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch ideas');
  return res.json();
}

export async function getIdeaById(id: string): Promise<ContentIdea> {
  const res = await fetch(`${API_BASE}/ideas/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch idea');
  return res.json();
}

export interface UpdateIdeaSeoDto {
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  hashtags?: string[];
}

export async function updateIdeaSeo(id: string, dto: UpdateIdeaSeoDto): Promise<ContentIdea> {
  const res = await fetch(`${API_BASE}/ideas/${id}/seo`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update idea SEO');
  return res.json();
}

export interface UpdateIdeaMetricsDto {
  publishedCtr?: number;
  publishedRetention?: number;
  publishedViews?: number;
}

export async function updateIdeaMetrics(id: string, dto: UpdateIdeaMetricsDto): Promise<ContentIdea> {
  const res = await fetch(`${API_BASE}/ideas/${id}/metrics`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update idea metrics');
  return res.json();
}

export interface UpdateIdeaStatusDto {
  status: IdeaStatus;
}

export async function updateIdeaStatus(id: string, dto: UpdateIdeaStatusDto): Promise<ContentIdea> {
  const res = await fetch(`${API_BASE}/ideas/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update idea status');
  return res.json();
}

// MONETIZATION
export async function getMonetizationSetup(channelId: string): Promise<MonetizationSetup> {
  const res = await fetch(`${API_BASE}/channels/${channelId}/monetization`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch monetization setup');
  return res.json();
}

export async function updateMonetizationStep(channelId: string, stepId: string, completed: boolean): Promise<MonetizationSetup> {
  const res = await fetch(`${API_BASE}/channels/${channelId}/monetization/steps/${stepId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error('Failed to update monetization step');
  return res.json();
}

// ADMIN / VISIBILITY
export async function getAllModuleVisibility(): Promise<ModuleVisibility[]> {
  const res = await fetch(`${API_BASE}/admin/visibility`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch module visibility');
  return res.json();
}

export interface UpdateVisibilityDto {
  moduleName: string;
  isEnabled: boolean;
  allowedRoles?: string[];
  allowedUsers?: string[];
}

export async function updateModuleVisibility(dto: UpdateVisibilityDto): Promise<ModuleVisibility> {
  const res = await fetch(`${API_BASE}/admin/visibility`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update module visibility');
  return res.json();
}

export async function canAccessModule(moduleName: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/access/${moduleName}`, { headers: getHeaders() });
  if (!res.ok) return false;
  return res.json();
}

// AI GENERATION
export async function generateIdeaScript(ideaId: string): Promise<ContentIdea> {
  const res = await fetch(`${API_BASE}/ideas/${ideaId}/script`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to generate script');
  return res.json();
}

export async function generateAIPrompts(ideaId: string, promptType: 'video' | 'thumbnail' | 'short'): Promise<AIVideoPrompt[]> {
  const res = await fetch(`${API_BASE}/ideas/${ideaId}/prompts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ promptType }),
  });
  if (!res.ok) throw new Error('Failed to generate prompts');
  return res.json();
}

export async function regenerateChannelIdeas(channelId: string): Promise<ContentIdea[]> {
  const res = await fetch(`${API_BASE}/channels/${channelId}/ideas/regenerate`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to regenerate ideas');
  return res.json();
}

// AI PROMPTS
export interface AIVideoPrompt {
  id: string;
  ideaId: string;
  platform: string;
  promptType: string;
  promptText: string;
  generationBatch: number;
  completed: boolean;
  createdAt: string;
}

export async function deletePrompt(promptId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/prompts/${promptId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete prompt');
}

export async function togglePromptComplete(promptId: string): Promise<AIVideoPrompt> {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle prompt');
  return res.json();
}

// NICHES - DELETE
export async function deleteNiche(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/niches/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete niche');
}
