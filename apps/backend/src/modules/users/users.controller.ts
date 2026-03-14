import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import type { UserRole } from './user.entity';
import { UsersService } from './users.service';

class ToggleActiveDto {
  isActive!: boolean;
}
class UpdateProfileDto {
  name?: string;
  telegramChatId?: string;
}

class SetPermissionDto {
  @IsString() key!: string;
  @IsBoolean() granted!: boolean;
}

class SetModulesDto {
  @IsString({ each: true }) modules!: string[];
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getRequestingUser(req: { user: JwtUser }): { id: string; role: UserRole } {
    return {
      id: req.user.userId,
      role: req.user.role as UserRole,
    };
  }

  // ── Own profile ────────────────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req: { user: JwtUser }) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own profile (name, telegramChatId)' })
  updateMe(@Request() req: { user: JwtUser }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  /**
   * GET /v1/users/me/permissions
   * Returns the allowed modules for the current user as a map.
   * Superadmin gets all modules (all true).
   * Admin and client get their allowedModules mapped to boolean.
   */
  @Get('me/permissions')
  @ApiOperation({ summary: 'Get allowed modules for the current user' })
  async getMyPermissions(@CurrentUser() user: JwtUser): Promise<Record<string, boolean>> {
    const full = await this.usersService.findOne(user.userId);
    const allModules = ['checklist', 'applications', 'ai'];

    // Superadmin gets full access to all modules
    if (full.role === 'superadmin') {
      const result: Record<string, boolean> = {};
      for (const mod of allModules) {
        result[mod] = true;
      }
      return result;
    }

    // Admin and client get their allowedModules mapped to boolean
    const allowed = this.usersService.getAllowedModules(full);
    const result: Record<string, boolean> = {};
    for (const mod of allModules) {
      result[mod] = allowed.includes(mod);
    }
    return result;
  }

  // ── Admin — user management ────────────────────────────────────────────────

  @Get()
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiOperation({ summary: 'List users (admin sees only their clients, superadmin sees all)' })
  findAll(@Request() req: { user: JwtUser }) {
    const requestingUser = this.getRequestingUser(req);
    return this.usersService.findAll(requestingUser);
  }

  @Get('admins')
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiOperation({ summary: 'List all admins (for superadmin to assign)' })
  findAdmins() {
    return this.usersService.findAdmins();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiOperation({ summary: 'Get user by ID with their permissions (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: JwtUser }) {
    const requestingUser = this.getRequestingUser(req);
    return this.usersService.findOne(id, requestingUser);
  }

  @Patch(':id/active')
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or deactivate user (superadmin)' })
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleActiveDto,
    @Request() req: { user: JwtUser },
  ) {
    const requestingUser = this.getRequestingUser(req);
    return this.usersService.setActive(id, dto.isActive, requestingUser);
  }

  /**
   * PATCH /v1/users/:id/permissions
   * Set a single module permission for a user.
   * Body: { key: "applications", granted: false }
   * Only superadmin can change permissions.
   * Admin can only change permissions for their own clients.
   */
  @Patch(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a module permission for a user' })
  setPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetPermissionDto,
    @Request() req: { user: JwtUser },
  ): Promise<string[]> {
    const requestingUser = this.getRequestingUser(req);
    return this.usersService.setModulePermission(id, dto.key, dto.granted, requestingUser);
  }

  /**
   * PATCH /v1/users/:id/modules
   * Replace all module permissions for a user.
   * Body: { modules: ["checklist", "ai"] }
   */
  @Patch(':id/modules')
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set all module permissions for a user' })
  setAllModules(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetModulesDto,
    @Request() req: { user: JwtUser },
  ): Promise<string[]> {
    const requestingUser = this.getRequestingUser(req);
    return this.usersService.setAllModules(id, dto.modules, requestingUser);
  }
}
