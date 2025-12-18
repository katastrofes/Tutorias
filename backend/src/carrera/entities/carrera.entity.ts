import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Facultad } from './facultad.entity';
import { CarrerasDePersona } from './CarrerasDePersona.entity';


@Entity()
export class Carrera {
  @PrimaryGeneratedColumn({ name: 'car_id' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sede: string;

  @Column({ type: 'date', nullable: true })
  fecha_creacion: Date;

  @Column({ type: 'date', nullable: true })
  fecha_eliminacion: Date;

  @ManyToOne(() => Facultad, (facultad) => facultad.carreras)
  @JoinColumn({ name: 'facu_id' })
  facultad: Facultad;

  @OneToMany(() => CarrerasDePersona, (cdp) => cdp.carrera)
  personas: CarrerasDePersona[];
}
