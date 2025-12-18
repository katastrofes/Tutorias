import { Carrera } from 'src/carrera/entities/carrera.entity';
import { CarrerasDePersona } from 'src/carrera/entities/CarrerasDePersona.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Persona {
  @PrimaryGeneratedColumn({ name: 'per_id' })
  per_id: number;

  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'int', nullable: true })
  edad: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  celular: string;

  @Column({ type: 'enum', enum: ['M', 'F', 'Otro'], nullable: true })
  sexo: 'M' | 'F' | 'Otro';

  @OneToMany(() => CarrerasDePersona, (cdp) => cdp.persona)
  carreras: CarrerasDePersona[];

  @ManyToMany(() => Tutoria, (tutoria) => tutoria.tutores)
  tutorias: Tutoria[];

  @ManyToMany(() => Tutoria, (tutoria) => tutoria.tutorados)
  tutoradoEn: Tutoria[];
}
