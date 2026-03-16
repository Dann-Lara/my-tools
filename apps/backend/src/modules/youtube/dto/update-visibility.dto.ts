import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVisibilityDto {
  @ApiProperty({ description: 'Nombre del módulo' })
  @IsString()
  moduleName!: string;

  @ApiProperty({ description: 'Si el módulo está habilitado' })
  @IsBoolean()
  isEnabled!: boolean;

  @ApiPropertyOptional({ description: 'Roles que pueden acceder' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @ApiPropertyOptional({ description: 'Usuarios específicos que pueden acceder' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedUsers?: string[];
}
