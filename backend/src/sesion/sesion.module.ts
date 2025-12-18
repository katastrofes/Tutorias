import { Module } from '@nestjs/common';
import { SesionService } from './sesion.service';
import { SesionController } from './sesion.controller';
import { Sesion } from './entities/sesion.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionPorTutor } from 'src/sesionportutor/entities/sesionportutor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sesion, Tutoria, SesionPorTutor])],
  controllers: [SesionController],
  providers: [SesionService],
})
export class SesionModule {}
