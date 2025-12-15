import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutoria } from './entities/tutoria.entity';
import { CreateTutoriaDto } from './dto/create-tutoria.dto';
import { UpdateTutoriaDto } from './dto/update-tutoria.dto';
import { Carrera } from 'src/carrera/entities/carrera.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Periodo } from './entities/periodo.entity';

@Injectable()
export class TutoriaService {
  constructor(
    @InjectRepository(Tutoria)
    private tutoriaRepo: Repository<Tutoria>,
    @InjectRepository(Carrera)
    private carreraRepo: Repository<Carrera>,
    @InjectRepository(Persona)
    private personaRepo: Repository<Persona>,
    @InjectRepository(Periodo)
    private periodoRepo: Repository<Periodo>,
  ) {}

  async findByPeriodo(semestre: number, año: number) {
    const periodo = await this.periodoRepo.findOne({
      where: { semestre, año },
    });
    if (!periodo) throw new NotFoundException('Periodo no encontrado');

    return this.tutoriaRepo.find({ where: { periodo } });
  }

  async create(dto: CreateTutoriaDto): Promise<Tutoria> {
    const periodo = await this.periodoRepo.findOne({
      where: { peri_id: dto.periodoId },
    });
    if (!periodo) throw new NotFoundException('Periodo no encontrado');

    const carreras = await this.carreraRepo.findByIds(dto.carreraIds);
    if (carreras.length < 1)
      throw new BadRequestException('Debe agregar al menos una carrera');

    const tutores = dto.tutorIds?.length
      ? await this.personaRepo.findByIds(dto.tutorIds)
      : [];

    const tutoria = this.tutoriaRepo.create({
      periodo,
      carreras,
      tutores,
    });

    return this.tutoriaRepo.save(tutoria);
  }

  async update(id: number, dto: UpdateTutoriaDto): Promise<Tutoria> {
    const tutoria = await this.tutoriaRepo.findOne({ where: { id } });
    if (!tutoria) throw new NotFoundException('Tutoria no encontrada');

    if (dto.carreraIds) {
      const carreras = await this.carreraRepo.findByIds(dto.carreraIds);
      if (carreras.length < 1)
        throw new BadRequestException('Debe agregar al menos una carrera');
      tutoria.carreras = carreras;
    }

    if (dto.tutorIds) {
      const tutores = await this.personaRepo.findByIds(dto.tutorIds);
      tutoria.tutores = tutores;
    }

    return this.tutoriaRepo.save(tutoria);
  }

  async remove(id: number) {
    const tutoria = await this.tutoriaRepo.findOne({ where: { id } });
    if (!tutoria) throw new NotFoundException('Tutoria no encontrada');
    return this.tutoriaRepo.remove(tutoria);
  }

  async getAllPeriodos() {
    return this.periodoRepo.find();
  }

  async getTutoriasPorPeriodo(periodoId: number) {
    const periodo = await this.periodoRepo.findOne({
      where: { peri_id: periodoId },
    });

    if (!periodo) {
      throw new NotFoundException('Periodo no encontrado');
    }

    return this.tutoriaRepo.find({
      where: { periodo }, // Filtra las tutorías por el periodo
      relations: ['carreras', 'tutores'], // Asegúrate de incluir relaciones
    });
  }

  async getTutoriasPorPeriodoYSede(
    periodoId: number,
    sede: string,
  ): Promise<Tutoria[]> {
    return this.tutoriaRepo
      .createQueryBuilder('tutoria')
      .distinct(true)
      .leftJoinAndSelect('tutoria.periodo', 'periodo')
      .leftJoinAndSelect('tutoria.carreras', 'carrera')
      .where('periodo.peri_id = :periodoId', { periodoId })
      .andWhere('carrera.sede = :sede', { sede })
      .getMany();
  }

  async getTutoresFiltrados(
    periodoId: number,
    sede: string,
    tutoriaId: number,
    carreraId?: number,
  ) {
    const query = this.tutoriaRepo
      .createQueryBuilder('tutoria')
      .leftJoin('tutoria.tutores', 'persona')
      .leftJoin('tutoria.periodo', 'periodo')
      .leftJoin('persona.carreras', 'cdp')
      .leftJoin('cdp.carrera', 'carrera')
      .leftJoin('carrera.facultad', 'facultad')
      .where('tutoria.id = :tutoriaId', { tutoriaId })
      .andWhere('periodo.peri_id = :periodoId', { periodoId })
      .andWhere('carrera.sede = :sede', { sede });

    if (carreraId) {
      query.andWhere('carrera.id = :carreraId', { carreraId });
    }

    return query
      .select([
        'tutoria.id AS tut_id',
        'carrera.sede AS sede',
        'facultad.descripcion AS facultad',
        'persona.nombre AS nombre',
        'persona.rut AS rut',
        'persona.correo AS email',
        'persona.celular AS celular',
        'carrera.nombre AS carrera_tutor',
      ])
      .getRawMany();
  }
}
