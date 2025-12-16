import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tutoria } from './tutoria.entity';
import { Sesion } from 'src/sesion/entities/sesion.entity';

@Entity()
export class Periodo {
  @PrimaryGeneratedColumn({ name: 'peri_id' })
  peri_id: number;

  @Column()
  semestre: number;

  @Column()
  año: number;

  @OneToMany(() => Tutoria, (t) => t.periodo)
  tutorias: Tutoria[];

  @OneToMany(() => Sesion, (sesion) => sesion.periodo)
  sesiones: Sesion[];
}
