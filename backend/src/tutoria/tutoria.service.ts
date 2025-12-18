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
    const tutorados = dto.tutoradoIds?.length
      ? await this.personaRepo.findByIds(dto.tutoradoIds)
      : [];

    const tutoria = this.tutoriaRepo.create({
      periodo,
      carreras,
      tutores,
      tutorados,
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

    if (dto.tutoradoIds) {
      const tutorados = await this.personaRepo.findByIds(dto.tutoradoIds);
      tutoria.tutorados = tutorados;
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
      // carreras asociadas a la tutoria
      .leftJoin('tutoria.carreras', 'tutCarr')
      .leftJoin('tutCarr.facultad', 'tutCarrFac')
      // tutores
      .leftJoin('tutoria.tutores', 'persona')
      // carreras del tutor
      .leftJoin('persona.carreras', 'cdp')
      .leftJoin('cdp.carrera', 'carreraPersona')
      .leftJoin('carreraPersona.facultad', 'facPersonaFac')
      // periodo
      .leftJoin('tutoria.periodo', 'periodo')
      // ✅ Sesiones creadas por ese tutor en esa tutoria
      .leftJoin('tutoria.sesiones', 'spt', 'spt.tutor = persona.per_id')

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

        'COUNT(DISTINCT spt.id) AS sesionesCreadas',
      ])
      .groupBy('persona.per_id')
      .addGroupBy('tutoria.id')
      .getRawMany();
  }

  async getTutoradosFiltrados(
    periodoId: number,
    tutoriaId: number,
    carreraId?: number,
  ) {
    const query = this.tutoriaRepo
      .createQueryBuilder('tutoria')
      .leftJoin('tutoria.tutorados', 'persona')
      .leftJoin('persona.carreras', 'cdp')
      .leftJoin('cdp.carrera', 'carrera')
      .leftJoin('tutoria.periodo', 'periodo')
      .leftJoin('tutoria.sesiones', 'spt')
      .leftJoin(
        'asistencia',
        'asistencia',
        'asistencia.sesionPorTutor = spt.id AND asistencia.persona = persona.per_id AND asistencia.estado = :estado',
        { estado: 'presente' },
      )
      .where('tutoria.id = :tutoriaId', { tutoriaId })
      .andWhere('periodo.peri_id = :periodoId', { periodoId });

    if (carreraId) {
      query.andWhere('carrera.id = :carreraId', { carreraId });
    }

    return query
      .select([
        'tutoria.id AS tutoriaId',
        "GROUP_CONCAT(DISTINCT carrera.nombre SEPARATOR ' / ') AS nombreTutoria",
        'persona.rut AS rut',
        'persona.nombre AS nombre',
        'persona.correo AS email',
        'persona.celular AS celular',
        "GROUP_CONCAT(DISTINCT carrera.nombre SEPARATOR ' / ') AS carreraTutorado",
        'COUNT(DISTINCT asistencia.id) AS clasesAsistidas',
      ])
      .groupBy('persona.per_id')
      .addGroupBy('tutoria.id')
      .getRawMany();
  }

  async getSesionesFiltradas(periodoId: number, tutoriaId: number) {
    return this.tutoriaRepo
      .createQueryBuilder('tutoria')
      .leftJoin('tutoria.periodo', 'periodo')
      .innerJoin('tutoria.sesiones', 'spt')
      .leftJoin('spt.sesion', 'sesion')
      .leftJoin('spt.asistencias', 'asistencia')
      .leftJoin('spt.tutor', 'tutor')
      .where('tutoria.id = :tutoriaId', { tutoriaId })
      .andWhere('periodo.peri_id = :periodoId', { periodoId })
      .select([
        'tutoria.id AS tutId',
        'spt.id AS sesionId',
        'sesion.nombre AS nroSesion',
        "GROUP_CONCAT(DISTINCT tutor.nombre SEPARATOR ' / ') AS tutor",
        'spt.fecha AS fecha',
        'spt.observaciones AS observacion',
        'spt.lugar AS lugar',
        "COUNT(CASE WHEN asistencia.estado = 'presente' THEN 1 END) AS asistencia",
        'COUNT(asistencia.id) AS totalAsistencia',
      ])
      .groupBy('spt.id')
      .getRawMany();
  }

  async getResumenTutoria(periodoId: number, tutoriaId: number) {
    // 1. CORRECCIÓN: Iniciar sin alias y usar FROM
    const subSesionesPorTutor = this.tutoriaRepo
      .createQueryBuilder()
      .from('sesion_por_tutor', 'spt2')
      .select('COUNT(*)')
      .where('spt2.tutoria_id = :tutoriaId', { tutoriaId });

    // 2. CORRECCIÓN: Iniciar sin alias y usar FROM
    const subSesionesCronograma = this.tutoriaRepo
      .createQueryBuilder()
      .from('sesion', 's')
      .select('COUNT(*)')
      .where('s.periodo_id = :periodoId', { periodoId });

    // 3. CORRECTO: Esta subconsulta ya estaba arreglada
    const subSesionesRealizadas = this.tutoriaRepo
      .createQueryBuilder()
      .from('sesion_por_tutor', 'spt3')
      .select('COUNT(DISTINCT spt3.spt_id)')
      .innerJoin(
        'asistencia',
        'a',
        'a.spt_id = spt3.spt_id AND a.estado = "presente"',
      )
      .where('spt3.tutoria_id = :tutoriaId', { tutoriaId });

    // Consulta principal
    const result = await this.tutoriaRepo
      .createQueryBuilder('tutoria')
      .leftJoin('tutoria.periodo', 'periodo')
      .leftJoin('tutoria.carreras', 'carrera')
      .leftJoin('tutoria.tutores', 'tutor')
      .leftJoin('tutoria.tutorados', 'tutorado')
      .leftJoin('tutoria.sesiones', 'spt')
      .leftJoin('spt.asistencias', 'asistencia')
      .leftJoin('spt.sesion', 'sesion')
      .where('tutoria.id = :tutoriaId', { tutoriaId })
      .andWhere('periodo.peri_id = :periodoId', { periodoId })
      .select([
        'tutoria.id AS tutoriaId',
        "GROUP_CONCAT(DISTINCT carrera.sede SEPARATOR ' / ') AS sede",
        "GROUP_CONCAT(DISTINCT carrera.nombre SEPARATOR ' / ') AS nombreTutoria",
        "GROUP_CONCAT(DISTINCT tutor.nombre SEPARATOR ' / ') AS tutores",
        'COUNT(DISTINCT tutorado.per_id) AS tutorados',
        'COUNT(DISTINCT carrera.id) AS carrerasAsociadas',
        `(${subSesionesCronograma.getQuery()}) AS sesionesCronograma`,
        'COUNT(DISTINCT spt.id) AS totalSesiones',
        `(${subSesionesRealizadas.getQuery()}) AS totalSesionesRealizadas`,
      ])
      .setParameters({ tutoriaId, periodoId })
      .groupBy('tutoria.id')
      .getRawOne();

    return result;
  }
}
