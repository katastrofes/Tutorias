import { Module } from '@nestjs/common';
import { SesionportutorService } from './sesionportutor.service';
import { SesionportutorController } from './sesionportutor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionPorTutor } from './entities/sesionportutor.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import { Sesion } from 'src/sesion/entities/sesion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SesionPorTutor, Tutoria, Sesion]),
  ],
  controllers: [SesionportutorController],
  providers: [SesionportutorService],
})
export class SesionportutorModule {}
