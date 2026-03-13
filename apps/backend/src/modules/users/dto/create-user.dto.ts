import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  // Only settable by superadmin — defaults to 'client' if not provided
  @IsOptional()
  @IsEnum(['superadmin', 'admin', 'client'] as const)
  role?: UserRole;

  // Solo superadmin puede asignar un admin específico
  // Si un admin crea un cliente, se asigna automáticamente
  @IsOptional()
  @IsUUID()
  adminId?: string;
}
