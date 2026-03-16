import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireModulePermission } from '../auth/decorators/module-permission.decorator';
import { YoutubeService } from './youtube.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateIdeaSeoDto, UpdateIdeaMetricsDto, UpdateIdeaStatusDto } from './dto/update-idea.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';

@ApiTags('YouTube')
@ApiBearerAuth()
@Controller({ path: 'youtube', version: '1' })
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModulePermission('youtube')
export class YoutubeController {
  constructor(private readonly svc: YoutubeService) {}

  // === NICHES ===

  @Get('niches')
  @ApiOperation({ summary: 'List all available niches' })
  getNiches() {
    return this.svc.getNiches();
  }

  @Get('niches/:id')
  @ApiOperation({ summary: 'Get a specific niche by ID' })
  getNicheById(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getNicheById(id);
  }

  // === CHANNELS ===

  @Get('channels')
  @ApiOperation({ summary: 'List all channels for the current user' })
  getChannels(@CurrentUser() user: JwtUser) {
    return this.svc.getChannels(user.userId);
  }

  @Get('channels/:id')
  @ApiOperation({ summary: 'Get a specific channel by ID' })
  getChannelById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.getChannelById(id, user.userId);
  }

  @Post('channels')
  @ApiOperation({ summary: 'Create a new YouTube channel' })
  createChannel(@CurrentUser() user: JwtUser, @Body() dto: CreateChannelDto) {
    return this.svc.createChannel(user.userId, dto);
  }

  // === IDEAS ===

  @Get('channels/:channelId/ideas')
  @ApiOperation({ summary: 'List all ideas for a channel' })
  getIdeasByChannel(
    @CurrentUser() user: JwtUser,
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ) {
    return this.svc.getIdeasByChannel(channelId, user.userId);
  }

  @Get('ideas/:id')
  @ApiOperation({ summary: 'Get a specific idea by ID' })
  getIdeaById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.getIdeaById(id, user.userId);
  }

  @Patch('ideas/:id/seo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update idea SEO data' })
  updateIdeaSeo(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIdeaSeoDto,
  ) {
    return this.svc.updateIdeaSeo(id, user.userId, dto);
  }

  @Patch('ideas/:id/metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update idea metrics after publishing' })
  updateIdeaMetrics(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIdeaMetricsDto,
  ) {
    return this.svc.updateIdeaMetrics(id, user.userId, dto);
  }

  @Patch('ideas/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update idea status' })
  updateIdeaStatus(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIdeaStatusDto,
  ) {
    return this.svc.updateIdeaStatus(id, user.userId, dto);
  }

  // === MONETIZATION ===

  @Get('channels/:channelId/monetization')
  @ApiOperation({ summary: 'Get monetization setup for a channel' })
  getMonetizationSetup(
    @CurrentUser() user: JwtUser,
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ) {
    return this.svc.getMonetizationSetup(channelId, user.userId);
  }

  @Patch('channels/:channelId/monetization/steps/:stepId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a monetization step completion status' })
  updateMonetizationStep(
    @CurrentUser() user: JwtUser,
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Param('stepId') stepId: string,
    @Body('completed') completed: boolean,
  ) {
    return this.svc.updateMonetizationStep(channelId, user.userId, stepId, completed);
  }

  // === MODULE VISIBILITY (Superadmin only) ===

  @Get('admin/visibility')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all module visibility settings (superadmin)' })
  getAllModuleVisibility(@CurrentUser() user: JwtUser) {
    if (user.role !== 'superadmin') {
      return { error: 'Forbidden', message: 'Only superadmins can access this endpoint' };
    }
    return this.svc.getAllModuleVisibility();
  }

  @Patch('admin/visibility')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update module visibility settings (superadmin)' })
  updateModuleVisibility(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateVisibilityDto,
  ) {
    if (user.role !== 'superadmin') {
      return { error: 'Forbidden', message: 'Only superadmins can access this endpoint' };
    }
    return this.svc.updateModuleVisibility(dto);
  }

  @Get('access/:moduleName')
  @ApiOperation({ summary: 'Check if current user can access a module' })
  canAccessModule(
    @CurrentUser() user: JwtUser,
    @Param('moduleName') moduleName: string,
  ) {
    return this.svc.canAccessModule(user.userId, user.role, moduleName);
  }
}
