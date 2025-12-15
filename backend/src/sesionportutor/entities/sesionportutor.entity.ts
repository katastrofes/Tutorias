import { Sesion } from 'src/sesion/entities/sesion.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Asistencia } from './asistencia.entity';

@Entity()
export class SesionPorTutor {
  @PrimaryGeneratedColumn({ name: 'spt_id' })
  id: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  observaciones: string;

  @ManyToOne(() => Tutoria, (tutoria) => tutoria.sesiones)
  @JoinColumn({ name: 'tutoria_id' })
  tutoria: Tutoria;

  @ManyToOne(() => Sesion, (sesion) => sesion.sesionesPorTutor)
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion;

  @OneToMany(() => Asistencia, (a) => a.sesionPorTutor)
  asistencias: Asistencia[];
}
