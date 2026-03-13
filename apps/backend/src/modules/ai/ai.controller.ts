import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireModulePermission } from '../auth/decorators/module-permission.decorator';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { SummarizeDto } from './dto/summarize.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller({ path: 'ai', version: '1' })
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModulePermission('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate text using AI' })
  @ApiResponse({ status: 200, description: 'Text generated successfully' })
  async generate(@Body() dto: GenerateDto): Promise<{ result: string; model: string }> {
    return this.aiService.generate(dto);
  }

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Summarize text using AI' })
  async summarize(@Body() dto: SummarizeDto): Promise<{ result: string }> {
    return this.aiService.summarize(dto);
  }

  @Get('providers')
  @ApiOperation({ summary: 'List active AI providers and their status' })
  getProviderStatus() {
    return this.aiService.getProviderStatus();
  }
}
