import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Periodo } from './periodo.entity';
import { Carrera } from '../../carrera/entities/carrera.entity';
import { Persona } from '../../persona/persona.entity';

@Entity()
export class Tutoria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Periodo, (periodo) => periodo.tutorias, { eager: true })
  periodo: Periodo;

  @ManyToMany(() => Carrera, { eager: true })
  @JoinTable({
    name: 'carreras_por_tutoria',
    joinColumn: { name: 'tutoria_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'carrera_id', referencedColumnName: 'id' },
  })
  carreras: Carrera[];

  @ManyToMany(() => Persona, { eager: true })
  @JoinTable({
    name: 'tutores_por_tutoria',
    joinColumn: { name: 'tutoria_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'persona_id', referencedColumnName: 'per_id' },
  })
  tutores: Persona[];
}