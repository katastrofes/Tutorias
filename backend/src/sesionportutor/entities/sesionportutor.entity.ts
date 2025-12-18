import { Sesion } from 'src/sesion/entities/sesion.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Asistencia } from './asistencia.entity';
import { Persona } from 'src/persona/persona.entity';

@Entity()
export class SesionPorTutor {
  @PrimaryGeneratedColumn({ name: 'spt_id' })
  id: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @CreateDateColumn({ type: 'datetime', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lugar: string;
  
  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @ManyToOne(() => Tutoria, (tutoria) => tutoria.sesiones)
  @JoinColumn({ name: 'tutoria_id' })
  tutoria: Tutoria;

  @ManyToOne(() => Sesion, (sesion) => sesion.sesionesPorTutor)
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion;

  @OneToMany(() => Asistencia, (asistencia) => asistencia.sesionPorTutor)
  asistencias: Asistencia[];
  
  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'tutor_id' })
  tutor: Persona;
}
