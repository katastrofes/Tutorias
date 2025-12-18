import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';



import { Carrera } from './carrera.entity';
import { Persona } from 'src/persona/entities/persona.entity';


@Entity()
export class CarrerasDePersona {
  @PrimaryGeneratedColumn({ name: 'cdp_id' })
  id: number;

  @Column({ type: 'int' })
  anio_ingreso: number;

  @ManyToOne(() => Persona, (persona) => persona.carreras)
  @JoinColumn({ name: 'per_id' })
  persona: Persona;

  @ManyToOne(() => Carrera, (carrera) => carrera.personas)
  @JoinColumn({ name: 'car_id' })
  carrera: Carrera;
}
