import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Carrera } from './carrera.entity';

@Entity()
export class Facultad {
  @PrimaryGeneratedColumn({ name: 'facu_id' })
  id: number;

  @Column({ type: 'varchar', length: 150 })
  descripcion: string;

  @OneToMany(() => Carrera, (carrera) => carrera.facultad)
  carreras: Carrera[];
}
