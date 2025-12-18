import { SesionPorTutor } from 'src/sesionportutor/entities/sesionportutor.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity()
export class Sesion {
  @PrimaryGeneratedColumn({ name: 'ses_id' })
  id: number;

  @Column({ type: 'int'})
  nro_sesion: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => SesionPorTutor, (spt) => spt.sesion)
  sesionesPorTutor: SesionPorTutor[];
}
