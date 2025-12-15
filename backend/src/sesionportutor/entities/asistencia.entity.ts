import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';
import { SesionPorTutor } from './sesionportutor.entity';

@Entity()
export class Asistencia {
  @PrimaryGeneratedColumn({ name: 'asl_id' })
  id: number;

  @Column({ type: 'enum', enum: ['presente', 'ausente'], default: 'ausente' })
  estado: 'presente' | 'ausente';

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'per_id' })
  persona: Persona;

  @ManyToOne(() => SesionPorTutor, (spt) => spt.asistencias)
  @JoinColumn({ name: 'spt_id' })
  sesionPorTutor: SesionPorTutor;
}
