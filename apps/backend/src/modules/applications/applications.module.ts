import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationEntity, BaseCvEntity } from './entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity, BaseCvEntity]), UsersModule],
  providers: [ApplicationsService, JwtAuthGuard],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
