import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ description: 'Nombre del nicho seleccionado' })
  @IsString()
  @MaxLength(100)
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

  @ApiProperty({ description: 'Audiencia objetivo' })
  @IsString()
  @MaxLength(200)
  targetAudience!: string;
}
