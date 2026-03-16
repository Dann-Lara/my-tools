import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { UserEntity } from '../users/entities/user.entity';

import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import {
  ChannelEntity,
  ContentIdeaEntity,
  AIVideoPromptEntity,
  MonetizationSetupEntity,
  ModuleVisibilityEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
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
