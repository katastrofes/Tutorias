import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sesion } from './entities/sesion.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import { Repository } from 'typeorm';
import { PlantillaDisponibleDto } from './dto/plantilla-disponible.dto';
import { SesionPorTutor } from 'src/sesionportutor/entities/sesionportutor.entity';

@Injectable()
export class SesionService {
  constructor(
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,

    @InjectRepository(Tutoria)
    private readonly tutoriaRepo: Repository<Tutoria>,
  ) {}

  async obtenerPlantillasDisponibles(
    perId: number,
    periId: number,
    tutoriaId: number,
  ): Promise<PlantillaDisponibleDto[]> {

    const tutoria = await this.tutoriaRepo
      .createQueryBuilder('t')
      .innerJoin('t.tutores', 'tutor')
      .where('t.id = :tutoriaId', { tutoriaId })
      .andWhere('t.periodoPeriId = :periId', { periId })
      .andWhere('tutor.per_id = :perId', { perId })
      .getOne();

    if (!tutoria) {
      throw new ForbiddenException('El tutor no pertenece a esa tutoría o el período no coincide.');
    }

    const rows = await this.sesionRepo
      .createQueryBuilder('p')
      .select([
        'p.id AS pse_id',
        'p.nro_sesion AS nro_sesion',
        'p.nombre AS nombre',
        'p.descripcion AS descripcion',
      ])
      .leftJoin(
        SesionPorTutor,
        'spt',
        'spt.sesion_id = p.ses_id AND spt.tutoria_id = :tutoriaId',
        { tutoriaId },
      )
      .where('spt.spt_id IS NULL')
      .orderBy('p.nro_sesion', 'ASC')
      .getRawMany<PlantillaDisponibleDto>();

    return rows;
  }
  
  create(createSesionDto: CreateSesionDto) {
    return 'This action adds a new sesion';
  }

  findAll() {
    return `This action returns all sesion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sesion`;
  }

  update(id: number, updateSesionDto: UpdateSesionDto) {
    return `This action updates a #${id} sesion`;
  }

  remove(id: number) {
    return `This action removes a #${id} sesion`;
  }
}
