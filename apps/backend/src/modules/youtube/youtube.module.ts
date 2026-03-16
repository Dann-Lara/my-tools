import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import {
  NicheEntity,
  ChannelEntity,
  ContentIdeaEntity,
  AIVideoPromptEntity,
  MonetizationSetupEntity,
  ModuleVisibilityEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NicheEntity,
      ChannelEntity,
      ContentIdeaEntity,
      AIVideoPromptEntity,
      MonetizationSetupEntity,
      ModuleVisibilityEntity,
    ]),
    UsersModule,
  ],
  providers: [YoutubeService, JwtAuthGuard],
  controllers: [YoutubeController],
  exports: [YoutubeService],
})
export class YoutubeModule {}
