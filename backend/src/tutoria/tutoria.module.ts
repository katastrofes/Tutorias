import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutoriaService } from './tutoria.service';
import { TutoriaController } from './tutoria.controller';
import { Tutoria } from './entities/tutoria.entity';
import { Carrera } from '../carrera/entities/carrera.entity';
import { Persona } from '../persona/entities/persona.entity';
import { Periodo } from './entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tutoria, Carrera, Persona, Periodo])],
  controllers: [TutoriaController],
  providers: [TutoriaService],
})
export class TutoriaModule {}
