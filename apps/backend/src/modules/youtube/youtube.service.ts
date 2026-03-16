import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NicheEntity,
  ChannelEntity,
  ContentIdeaEntity,
  AIVideoPromptEntity,
  MonetizationSetupEntity,
  ModuleVisibilityEntity,
  ChannelStatus,
  IdeaStatus,
  SearchVolume,
  Competition,
  Trend,
  NicheSource,
  DEFAULT_MONETIZATION_STEPS,
} from './entities';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateIdeaSeoDto, UpdateIdeaMetricsDto, UpdateIdeaStatusDto, GeneratePromptsDto } from './dto/update-idea.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { ConfigService } from '@nestjs/config';
import { generateNichesWithAI } from './ai/youtube-ai';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    @InjectRepository(NicheEntity)
    private readonly nicheRepo: Repository<NicheEntity>,
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
    private readonly configService: ConfigService,
  ) {}

  // === NICHES ===

  async getNiches() {
    let niches = await this.nicheRepo.find({
      order: { opportunityScore: 'DESC' },
    });

    if (niches.length === 0) {
      this.logger.log('No niches found in database, generating with AI...');
      
      try {
        const aiNiches = await generateNichesWithAI(20);
        
        if (aiNiches.length > 0) {
          const entities = aiNiches.map((n) => {
            const entity = new NicheEntity();
            entity.name = n.name;
            entity.slug = n.slug;
            entity.description = n.description;
            entity.searchVolume = SearchVolume[n.searchVolume?.toUpperCase() as keyof typeof SearchVolume] || SearchVolume.MEDIUM;
            entity.competition = Competition[n.competition?.toUpperCase() as keyof typeof Competition] || Competition.MEDIUM;
            entity.opportunityScore = n.opportunityScore;
            entity.trend = Trend[n.trend?.toUpperCase() as keyof typeof Trend] || Trend.STABLE;
            entity.trendPercent = n.trendPercent !== undefined ? n.trendPercent : null;
            entity.topKeywords = n.topKeywords || [];
            entity.suggestedAudience = n.suggestedAudience;
            entity.estimatedCPM = n.estimatedCPM;
            entity.source = NicheSource.AI;
            return entity;
          });
          
          niches = await this.nicheRepo.save(entities);
          this.logger.log(`Generated ${niches.length} niches with AI`);
        }
      } catch (err) {
        this.logger.error('Failed to generate niches with AI', err);
      }

      return { niches, source: 'ai', cachedAt: null };
    }

    return {
      niches,
      source: 'database',
      cachedAt: new Date().toISOString(),
    };
  }

  async getNicheById(id: string) {
    const niche = await this.nicheRepo.findOne({ where: { id } });
    if (!niche) throw new NotFoundException('Nicho no encontrado');
    return niche;
  }

  // === CHANNELS ===

  async getChannels(userId: string) {
    const channels = await this.channelRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['niche'],
    });
    return channels;
  }

  async getChannelById(id: string, userId: string) {
    const channel = await this.channelRepo.findOne({
      where: { id, userId },
      relations: ['niche'],
    });
    if (!channel) throw new NotFoundException('Canal no encontrado');
    return channel;
  }

  async createChannel(userId: string, dto: CreateChannelDto) {
    const niche = await this.getNicheById(dto.nicheId);
    
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const channel = this.channelRepo.create({
      userId,
      nicheId: dto.nicheId,
      name: dto.name,
      slug: `${slug}-${Date.now()}`,
      description: dto.description,
      targetAudience: dto.targetAudience || niche.suggestedAudience,
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
