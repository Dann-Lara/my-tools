import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ description: 'ID del nicho seleccionado' })
  @IsUUID()
  nicheId!: string;

  @ApiProperty({ description: 'Nombre del canal' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Descripción del canal' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Audiencia objetivo' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetAudience?: string;
}
