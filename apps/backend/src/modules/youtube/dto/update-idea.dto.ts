import { IsString, IsOptional, IsEnum, IsNumber, IsArray, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentFormat, IdeaStatus } from '../entities/content-idea.entity';

export class UpdateIdeaSeoDto {
  @ApiPropertyOptional({ description: 'Título SEO' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'Descripción SEO' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Hashtags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}

export class UpdateIdeaMetricsDto {
  @ApiProperty({ description: 'CTR del video publicado' })
  @IsNumber()
  publishedCtr!: number;

  @ApiProperty({ description: 'Retención del video publicado' })
  @IsNumber()
  publishedRetention!: number;

  @ApiProperty({ description: 'Vistas del video publicado' })
  @IsNumber()
  publishedViews!: number;
}

export class UpdateIdeaStatusDto {
  @ApiProperty({ enum: IdeaStatus, description: 'Nuevo status de la idea' })
  @IsEnum(IdeaStatus)
  status!: IdeaStatus;
}

export class GeneratePromptsDto {
  @ApiProperty({ enum: ['video', 'thumbnail', 'short'], description: 'Tipo de prompts a generar' })
  @IsString()
  promptType!: 'video' | 'thumbnail' | 'short';
}
