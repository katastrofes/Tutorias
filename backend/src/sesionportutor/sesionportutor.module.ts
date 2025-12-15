import { Module } from '@nestjs/common';
import { SesionportutorService } from './sesionportutor.service';
import { SesionportutorController } from './sesionportutor.controller';

@Module({
  controllers: [SesionportutorController],
  providers: [SesionportutorService],
})
export class SesionportutorModule {}
