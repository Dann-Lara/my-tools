import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChannelEntity,
  ContentIdeaEntity,
  AIVideoPromptEntity,
  MonetizationSetupEntity,
  ModuleVisibilityEntity,
  NicheEntity,
  ChannelStatus,
  IdeaStatus,
  DEFAULT_MONETIZATION_STEPS,
} from './entities';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateIdeaSeoDto, UpdateIdeaMetricsDto, UpdateIdeaStatusDto, GeneratePromptsDto } from './dto/update-idea.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { ConfigService } from '@nestjs/config';
import { generateNichesWithAI, generateScriptWithAI, generateAIPromptsWithAI, generateContentIdeasWithAI } from './ai/youtube-ai';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channelRepo: Repository<ChannelEntity>,
    @InjectRepository(ContentIdeaEntity)
    private readonly ideaRepo: Repository<ContentIdeaEntity>,
    @InjectRepository(AIVideoPromptEntity)
    private readonly promptRepo: Repository<AIVideoPromptEntity>,
    @InjectRepository(MonetizationSetupEntity)
    private readonly monetizationRepo: Repository<MonetizationSetupEntity>,
    @InjectRepository(ModuleVisibilityEntity)
    private readonly visibilityRepo: Repository<ModuleVisibilityEntity>,
    @InjectRepository(NicheEntity)
    private readonly nicheRepo: Repository<NicheEntity>,
    private readonly configService: ConfigService,
  ) {}

  // === NICHES ===

  async getNiches() {
    try {
      const niches = await generateNichesWithAI(6);
      return { niches, source: 'ai', cachedAt: null };
    } catch (err) {
      this.logger.error('Failed to generate niches with AI', err);
      return { niches: [], source: 'ai', cachedAt: null };
    }
  }

  async deleteNiche(id: string, userId: string) {
    const niche = await this.nicheRepo.findOne({ where: { id } });
    if (!niche) {
      throw new NotFoundException('Nicho no encontrado');
    }
    await this.nicheRepo.remove(niche);
  }

  // === CHANNELS ===

  async getChannels(userId: string) {
    const channels = await this.channelRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return channels;
  }

  async getChannelById(id: string, userId: string) {
    const channel = await this.channelRepo.findOne({
      where: { id, userId },
    });
    if (!channel) throw new NotFoundException('Canal no encontrado');
    return channel;
  }

  async createChannel(userId: string, dto: CreateChannelDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const channel = this.channelRepo.create({
      userId,
      nicheId: dto.nicheId,
      name: dto.name,
      slug: `${slug}-${Date.now()}`,
      description: dto.description,
      targetAudience: dto.targetAudience,
      status: ChannelStatus.SETUP,
    });

    const savedChannel = await this.channelRepo.save(channel);

    // Create monetization setup
    await this.monetizationRepo.save({
      channelId: savedChannel.id,
      steps: DEFAULT_MONETIZATION_STEPS,
    });

    return savedChannel;
  }

  // === IDEAS ===

  async getIdeasByChannel(channelId: string, userId: string) {
    const channel = await this.getChannelById(channelId, userId);
    
    const ideas = await this.ideaRepo.find({
      where: { channelId },
      order: { position: 'ASC' },
    });

    return ideas;
  }

  async getIdeaById(id: string, userId: string) {
    const idea = await this.ideaRepo.findOne({
      where: { id },
      relations: ['channel'],
    });
    
    if (!idea) throw new NotFoundException('Idea no encontrada');
    
    if (idea.channel.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta idea');
    }

    return idea;
  }

  async updateIdeaSeo(id: string, userId: string, dto: UpdateIdeaSeoDto) {
    const idea = await this.getIdeaById(id, userId);
    
    Object.assign(idea, dto);
    return this.ideaRepo.save(idea);
  }

  async updateIdeaMetrics(id: string, userId: string, dto: UpdateIdeaMetricsDto) {
    const idea = await this.getIdeaById(id, userId);
    
    idea.publishedCtr = dto.publishedCtr;
    idea.publishedRetention = dto.publishedRetention;
    idea.publishedViews = dto.publishedViews;
    idea.status = IdeaStatus.ANALYZED;
    
    return this.ideaRepo.save(idea);
  }

  async updateIdeaStatus(id: string, userId: string, dto: UpdateIdeaStatusDto) {
    const idea = await this.getIdeaById(id, userId);
    
    idea.status = dto.status;
    return this.ideaRepo.save(idea);
  }

  async generateScript(ideaId: string, userId: string) {
    const idea = await this.getIdeaById(ideaId, userId);
    const channel = await this.getChannelById(idea.channelId, userId);

    const script = await generateScriptWithAI(
      idea.title,
      idea.hook || '',
      idea.angle || '',
      idea.format,
      channel.targetAudience,
    );

    idea.script = script.script;
    idea.seoTitle = idea.seoTitle || script.seoTitle;
    idea.seoDescription = idea.seoDescription || script.seoDescription;
    idea.tags = idea.tags || script.tags;
    idea.hashtags = idea.hashtags || script.hashtags;
    idea.status = IdeaStatus.SCRIPTED;

    return this.ideaRepo.save(idea);
  }

  async generateAIPrompts(ideaId: string, userId: string, promptType: 'video' | 'thumbnail' | 'short') {
    const idea = await this.getIdeaById(ideaId, userId);

    const prompts = await generateAIPromptsWithAI(
      idea.title,
      idea.script || '',
      promptType,
    );

    const existingPrompts = await this.promptRepo.find({
      where: { ideaId },
    });
    const maxBatch = existingPrompts.length > 0 
      ? Math.max(...existingPrompts.map(p => p.generationBatch))
      : 0;

    const newPromptsData = prompts.map(p => ({
      ideaId,
      platform: p.platform.toLowerCase() as any,
      promptType: promptType as any,
      promptText: p.prompt,
      generationBatch: maxBatch + 1,
    }));

    const newPrompts = this.promptRepo.create(newPromptsData);
    await this.promptRepo.save(newPrompts);

    return newPrompts;
  }

  async deletePrompt(promptId: string, userId: string) {
    const prompt = await this.promptRepo.findOne({
      where: { id: promptId },
      relations: ['idea', 'idea.channel', 'idea.channel.userId'],
    });
    if (!prompt) {
      throw new NotFoundException('Prompt no encontrado');
    }
    if (prompt.idea?.channel?.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este prompt');
    }
    await this.promptRepo.remove(prompt);
  }

  async togglePromptComplete(promptId: string, userId: string) {
    const prompt = await this.promptRepo.findOne({
      where: { id: promptId },
      relations: ['idea', 'idea.channel'],
    });
    if (!prompt) {
      throw new NotFoundException('Prompt no encontrado');
    }
    if (prompt.idea?.channel?.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este prompt');
    }
    prompt.completed = !prompt.completed;
    return this.promptRepo.save(prompt);
  }

  async regenerateIdeas(channelId: string, userId: string) {
    const channel = await this.getChannelById(channelId, userId);
    
    const existingIdeas = await this.ideaRepo.find({
      where: { channelId },
      select: ['title'],
    });
    const existingTitles = existingIdeas.map(i => i.title);

    const newIdeas = await generateContentIdeasWithAI(
      channel.name,
      channel.nicheId,
      channel.targetAudience,
      5,
    );

    const maxPositionResult = await this.ideaRepo
      .createQueryBuilder('idea')
      .where('idea.channelId = :channelId', { channelId })
      .select('MAX(idea.position)', 'max')
      .getRawOne();
    const maxPosition = maxPositionResult?.max || 0;

    const newIdeasData = newIdeas.map((idea, index) => ({
      channelId,
      title: idea.title,
      hook: idea.hook,
      angle: idea.angle,
      format: idea.format as any,
      successProbability: idea.successProbability as any,
      successReason: idea.successReason,
      shortAngle: idea.shortAngle,
      shortScript: idea.shortScript,
      status: IdeaStatus.IDEA,
      position: maxPosition + index + 1,
    }));

    const savedIdeas = this.ideaRepo.create(newIdeasData);
    await this.ideaRepo.save(savedIdeas);

    return savedIdeas;
  }

  // === MONETIZATION ===

  async getMonetizationSetup(channelId: string, userId: string) {
    const channel = await this.getChannelById(channelId, userId);
    
    let setup = await this.monetizationRepo.findOne({
      where: { channelId },
    });
    
    if (!setup) {
      setup = await this.monetizationRepo.save({
        channelId,
        steps: DEFAULT_MONETIZATION_STEPS,
      });
    }
    
    return setup;
  }

  async updateMonetizationStep(channelId: string, userId: string, stepId: string, completed: boolean) {
    const channel = await this.getChannelById(channelId, userId);
    
    const setup = await this.monetizationRepo.findOne({
      where: { channelId },
    });
    
    if (!setup) throw new NotFoundException('Setup de monetización no encontrado');
    
    const stepIndex = setup.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) throw new NotFoundException('Step no encontrado');
    
    setup.steps[stepIndex].completed = completed;
    setup.steps[stepIndex].completedAt = completed ? new Date() : null;
    
    // Check if all critical steps are completed
    const criticalSteps = setup.steps.filter(s => s.priority === 'critical');
    const allCriticalCompleted = criticalSteps.every(s => s.completed);
    
    if (allCriticalCompleted) {
      channel.monetizationSetupCompleted = true;
      channel.status = ChannelStatus.MONETIZED;
      await this.channelRepo.save(channel);
      setup.completedAt = new Date();
    }
    
    return this.monetizationRepo.save(setup);
  }

  // === MODULE VISIBILITY (Superadmin) ===

  async getAllModuleVisibility() {
    return this.visibilityRepo.find({
      order: { moduleName: 'ASC' },
    });
  }

  async updateModuleVisibility(dto: UpdateVisibilityDto) {
    let visibility = await this.visibilityRepo.findOne({
      where: { moduleName: dto.moduleName },
    });
    
    if (visibility) {
      visibility.isEnabled = dto.isEnabled;
      visibility.allowedRoles = dto.allowedRoles || [];
      visibility.allowedUsers = dto.allowedUsers || [];
    } else {
      visibility = this.visibilityRepo.create(dto);
    }
    
    return this.visibilityRepo.save(visibility);
  }

  async canAccessModule(userId: string, role: string, moduleName: string): Promise<boolean> {
    const visibility = await this.visibilityRepo.findOne({
      where: { moduleName },
    });
    
    if (!visibility || visibility.isEnabled === false) {
      // If no visibility record, allow by default (for backwards compatibility)
      // Or if explicitly disabled, deny
      return visibility === null;
    }
    
    // Check role
    if (visibility.allowedRoles && visibility.allowedRoles.length > 0) {
      if (visibility.allowedRoles.includes(role)) return true;
    }
    
    // Check specific user
    if (visibility.allowedUsers && visibility.allowedUsers.length > 0) {
      if (visibility.allowedUsers.includes(userId)) return true;
    }
    
    // If no restrictions, allow
    if ((!visibility.allowedRoles || visibility.allowedRoles.length === 0) &&
        (!visibility.allowedUsers || visibility.allowedUsers.length === 0)) {
      return true;
    }
    
    return false;
  }

  // === INITIALIZE DEFAULT VISIBILITY ===

  async initializeDefaultVisibility() {
    const modules = ['youtube', 'checklists', 'applications'];
    
    for (const moduleName of modules) {
      const existing = await this.visibilityRepo.findOne({
        where: { moduleName },
      });
      
      if (!existing) {
        const visibility = this.visibilityRepo.create({
          moduleName,
          isEnabled: true,
          allowedRoles: [],
          allowedUsers: [],
        });
        await this.visibilityRepo.save(visibility);
      }
    }
  }
}
