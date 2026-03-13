import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtOrWebhookSecretGuard } from '../auth/guards/jwt-or-webhook.guard';
import { UsersModule } from '../users/users.module';

import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';
import {
  ChecklistEntity,
  ChecklistItemEntity,
  ChecklistFeedbackEntity,
} from './entities/checklist.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ChecklistEntity, ChecklistItemEntity, ChecklistFeedbackEntity]),
    UsersModule,
  ],
  providers: [ChecklistsService, JwtOrWebhookSecretGuard, JwtAuthGuard],
  controllers: [ChecklistsController],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
