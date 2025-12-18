import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSesionportutorDto } from './dto/create-sesionportutor.dto';
import { UpdateSesionportutorDto } from './dto/update-sesionportutor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SesionPorTutor } from './entities/sesionportutor.entity';
import { Tutoria } from 'src/tutoria/entities/tutoria.entity';
import { Sesion } from 'src/sesion/entities/sesion.entity';
import { Repository } from 'typeorm';
import { SesionListadoDto } from './dto/sesion-listado.dto';

function parseFechaEjecucion(fechaEjecucion: string): Date {
  const [datePart, timePart = '00:00'] = fechaEjecucion.trim().split(' ');

  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss = '0'] = timePart.split(':');
  return new Date(y, m - 1, d, Number(hh), Number(mm), Number(ss), 0);
}

function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

@Injectable()
export class SesionportutorService {
  constructor(
    @InjectRepository(SesionPorTutor) private readonly sptRepo: Repository<SesionPorTutor>,
    @InjectRepository(Tutoria) private readonly tutoriaRepo: Repository<Tutoria>,
    @InjectRepository(Sesion) private readonly sesionRepo: Repository<Sesion>,
  ) {}

  async crear(dto: CreateSesionportutorDto) {
    // 1) existe tutoría
    const tutoria = await this.tutoriaRepo.findOne({ where: { id: dto.tutoriaId } });
    if (!tutoria) throw new NotFoundException('Tutoría no encontrada');

    // 2) existe sesión plantilla
    const sesion = await this.sesionRepo.findOne({ where: { id: dto.sesionId } });
    if (!sesion) throw new NotFoundException('Plantilla (sesión) no encontrada');

    // 3) validar que el tutor pertenece a la tutoría (M:N)
    const pertenece = await this.tutoriaRepo.manager
      .createQueryBuilder()
      .select('1')
      .from('tutores_por_tutoria', 'tpt')
      .where('tpt.tutoria_id = :tutoriaId', { tutoriaId: dto.tutoriaId })
      .andWhere('tpt.persona_id = :perId', { perId: dto.perId })
      .getRawOne();

    if (!pertenece) {
      throw new ForbiddenException('El tutor no pertenece a esta tutoría');
    }

    // Verificar si ya existe una sesión registrada para esta tutoría y plantilla
    const yaExiste = await this.sptRepo.findOne({
      where: {
        tutoria: { id: dto.tutoriaId },
        sesion: { id: dto.sesionId },
      },
      relations: { tutoria: true, sesion: true },
    });

    if (yaExiste) {
      throw new ConflictException('Esta plantilla ya fue registrada para esta tutoría');
    }

    // Crear la nueva sesión con el tutor_id (perId)
    const nueva = this.sptRepo.create({
      fecha: parseFechaEjecucion(dto.fechaEjecucion),
      observaciones: dto.observaciones ?? null,
      lugar: dto.lugar,
      tutoria,
      sesion,
      tutorId: dto.perId, // Agregamos el tutor_id
    } as Partial<SesionPorTutor>);

    return this.sptRepo.save(nueva);
  }


  async listarSesiones(perId: number, periId: number, tutoriaId: number): Promise<SesionListadoDto[]> {
    const pertenece = await this.sptRepo.manager
      .createQueryBuilder()
      .select('1')
      .from('tutores_por_tutoria', 'tpt')
      .innerJoin('tutoria', 't', 't.id = tpt.tutoria_id')
      .where('tpt.persona_id = :perId', { perId })
      .andWhere('tpt.tutoria_id = :tutoriaId', { tutoriaId })
      .andWhere('t.periodoPeriId = :periId', { periId })
      .getRawOne();

    if (!pertenece) {
      throw new ForbiddenException('El tutor no pertenece a esa tutoría o el período no coincide.');
    }

    const rows = await this.sptRepo
      .createQueryBuilder('spt')
      .innerJoin('spt.tutoria', 't')
      .innerJoin('spt.sesion', 'ses')
      .where('t.id = :tutoriaId', { tutoriaId })
      .andWhere('t.periodoPeriId = :periId', { periId })
      .select([
        'spt.id AS idSesion',
        'ses.nro_sesion AS nro',
        'spt.fecha AS fecha',
        'ses.nombre AS tematica',
        'spt.lugar AS sesLugar',
        'ses.descripcion AS descripcion',
        'spt.observaciones AS observaciones',
      ])
      .orderBy('ses.nro_sesion', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      idSesion: Number(r.idSesion),
      nro: Number(r.nro),
      sesFecha: formatDateTime(new Date(r.fecha)),
      tematica: r.tematica,
      sesLugar: r.sesLugar ?? null,
      descripcion: r.descripcion ?? null,
      observaciones: r.observaciones ?? null,
    }));
  }

  async actualizarSesion(
    sptId: number,
    perId: number,
    fechaEjecucion: string,
    lugar: string,
    observaciones?: string,
  ) {
    const spt = await this.sptRepo.findOne({
      where: { id: sptId },
      relations: { tutoria: true },
    });
    if (!spt) throw new NotFoundException('Sesión (SPT) no encontrada');

    const pertenece = await this.sptRepo.manager
      .createQueryBuilder()
      .select('1')
      .from('tutores_por_tutoria', 'tpt')
      .where('tpt.tutoria_id = :tutoriaId', { tutoriaId: spt.tutoria.id })
      .andWhere('tpt.persona_id = :perId', { perId })
      .getRawOne();

    if (!pertenece) {
      throw new ForbiddenException('No tienes permisos para editar esta sesión');
    }

    spt.fecha = parseFechaEjecucion(fechaEjecucion);
    spt.lugar = lugar;
    spt.observaciones = observaciones ?? null;

    return this.sptRepo.save(spt);
  }

  findAll() {
    return `This action returns all sesionportutor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sesionportutor`;
  }

  update(id: number, updateSesionportutorDto: UpdateSesionportutorDto) {
    return `This action updates a #${id} sesionportutor`;
  }

  remove(id: number) {
    return `This action removes a #${id} sesionportutor`;
  }
}
