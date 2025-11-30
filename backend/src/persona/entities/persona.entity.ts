import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Persona {
  @PrimaryGeneratedColumn({ name: 'per_id' })
  per_id: number;

  @Column()
  nombre: string;
}