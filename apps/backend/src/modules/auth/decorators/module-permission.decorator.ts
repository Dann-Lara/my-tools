import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY = 'moduleKey';

export const RequireModulePermission = (key: string) => SetMetadata(MODULE_KEY, key);
