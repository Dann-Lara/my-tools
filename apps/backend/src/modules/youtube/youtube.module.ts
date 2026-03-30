import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/user.entity';
import { UsersModule } from '../users/users.module';

import {
  ChannelEntity,
  ContentIdeaEntity,
  AIVideoPromptEntity,
  MonetizationSetupEntity,
  ModuleVisibilityEntity,
  NicheEntity,
} from './entities';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ChannelEntity,
      ContentIdeaEntity,
      AIVideoPromptEntity,
      MonetizationSetupEntity,
      ModuleVisibilityEntity,
      NicheEntity,
    ]),
    UsersModule,
  ],
  providers: [YoutubeService, JwtAuthGuard],
  controllers: [YoutubeController],
  exports: [YoutubeService],
})
export class YoutubeModule {}
