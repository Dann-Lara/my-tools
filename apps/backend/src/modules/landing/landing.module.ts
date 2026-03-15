import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LandingController } from './landing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [LandingController],
  providers: [],
  exports: [],
})
export class LandingModule {}
