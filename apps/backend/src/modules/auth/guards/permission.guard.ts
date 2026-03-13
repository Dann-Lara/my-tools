import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULE_KEY } from '../decorators/module-permission.decorator';
import { UsersService } from '../../users/users.service';
import type { JwtUser } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!moduleKey) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: JwtUser }>();

    if (!user || !user.userId) {
      return false;
    }

    const dbUser = await this.usersService.findOne(user.userId);

    if (dbUser.role === 'superadmin' || dbUser.role === 'admin') {
      return true;
    }

    const allowedModules = this.usersService.getAllowedModules(dbUser);
    return allowedModules.includes(moduleKey);
  }
}
