import { SesionPorTutor } from 'src/sesionportutor/entities/sesionportutor.entity';
import { Periodo } from 'src/tutoria/entities/periodo.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn({ name: 'ses_id' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => SesionPorTutor, (spt) => spt.sesion)
  sesionesPorTutor: SesionPorTutor[];

  // sesion.entity.ts
  @ManyToOne(() => Periodo, (periodo) => periodo.sesiones)
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;
}
