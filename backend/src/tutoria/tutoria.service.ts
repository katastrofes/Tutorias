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
    tutoriaId: number,
    carreraId?: number,
  ) {
    const query = this.tutoriaRepo
      .createQueryBuilder('tutoria')
      // carreras asociadas a la tutoria (para nombre de la tutoría, sede y facultades)
      .leftJoin('tutoria.carreras', 'tutCarr')
      .leftJoin('tutCarr.facultad', 'tutCarrFac')
      // tutores
      .leftJoin('tutoria.tutores', 'persona')
      // carreras de la persona (carrera del tutor)
      .leftJoin('persona.carreras', 'cdp')
      .leftJoin('cdp.carrera', 'carreraPersona')
      .leftJoin('carreraPersona.facultad', 'facPersonaFac')
      .leftJoin('tutoria.periodo', 'periodo')
      .where('tutoria.id = :tutoriaId', { tutoriaId })
      .andWhere('periodo.peri_id = :periodoId', { periodoId });

    if (carreraId) {
      query.andWhere('carreraPersona.id = :carreraId', { carreraId });
    }

    return query
      .select([
        'tutoria.id AS tutId',
        "GROUP_CONCAT(DISTINCT tutCarr.sede SEPARATOR ' / ') AS sede",
        "GROUP_CONCAT(DISTINCT tutCarrFac.descripcion SEPARATOR ' / ') AS facultad",
        "GROUP_CONCAT(DISTINCT tutCarr.nombre SEPARATOR ' / ') AS nombreTutoria",
        'persona.nombre AS nombre',
        'persona.rut AS rut',
        'persona.correo AS email',
        'persona.celular AS celular',
        "GROUP_CONCAT(DISTINCT carreraPersona.nombre SEPARATOR ' / ') AS carreraTutor",
      ])
      .groupBy('persona.per_id')
      .addGroupBy('tutoria.id')
      .getRawMany();
  }
}
