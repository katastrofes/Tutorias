import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface PlantillaSesion {
  pse_id: number;
  nro_sesion: number;
  nombre: string;
  descripcion: string | null;
}

export interface SesionListado {
  idSesion: number;
  nro: number;
  sesFecha: string;
  tematica: string;
  sesLugar: string;
  descripcion: string;
  observaciones: string | null;
}

export interface Tutorado {
  id: number;
  rut: string;
  nombre: string;
  email: string;
  telefono: string;
  carrera: string;
}
export interface CrearSesionPorTutorDto {
  tutoriaId: number;
  sesionId: number;
  perId: number;
  fechaEjecucion: string;
  lugar: string;
  observaciones?: string | null;
}

export interface ApiResponse {
  cod: string;
  msj: string;
  datos?: any;
}

@Injectable({
  providedIn: 'root'
})
export class IntranetService {

  private apiUrl = 'http://localhost:3000';

  private useMockTutorados = true;

  constructor(private http: HttpClient) {}

  private mockTutorados: Tutorado[] = [
    { id: 101, nombre: 'Alumno Uno', rut: '12345678-9', carrera: 'Ingeniería', email: 'a@u.cl', telefono: '987654321' },
    { id: 102, nombre: 'Alumno Dos', rut: '98765432-1', carrera: 'Comercio', email: 'b@u.cl', telefono: '987654322' }
  ];

  obtenerPlantillasDisponibles(perId: number, periId: number, tutoriaId: number): Observable<PlantillaSesion[]> {
    const url = `${this.apiUrl}/sesion/plantillas-disponibles?perId=${perId}&periId=${periId}&tutoriaId=${tutoriaId}`;
    return this.http.get<PlantillaSesion[]>(url);
  }

  crearSesionPorTutor(dto: CrearSesionPorTutorDto) {
    const url = `${this.apiUrl}/sesionportutor`;
    console.log('DTO enviado:', dto);
    return this.http.post(url, dto);
  }

  obtenerSesionesTutorPeriodo(perId: number, periId: number, tutoriaId: number): Observable<SesionListado[]> {
    const url = `${this.apiUrl}/sesionportutor/listar?perId=${perId}&periId=${periId}&tutoriaId=${tutoriaId}`;
    return this.http.get<SesionListado[]>(url);
  }

  editarSesionPorTutor(sptId: number, body: {
    perId: number;
    fechaEjecucion: string;
    lugar?: string | null;
    observaciones?: string | null;
  }): Observable<any> {
    const url = `${this.apiUrl}/sesionportutor/${sptId}`;
    return this.http.patch<any>(url, body);
  }

  obtenerTutoradosPorTutoria(tutId: number, anioIngreso: number, semestre: number): Observable<Tutorado[]> {
    if (this.useMockTutorados) {
      return of(this.mockTutorados);
    }
    const url = `${this.apiUrl}/tutorias/${tutId}/tutorados?anio=${anioIngreso}&semestre=${semestre}`;
    return this.http.get<Tutorado[]>(url);
  }

  guardarAsistencia(idSesion: number, asistentes: any[]): Observable<any> {
    const url = `${this.apiUrl}/sesionportutor/${idSesion}/asistencia`;
    return this.http.post<any>(url, { asistentes });
  }

  obtenerAsistencia(idSesion: number): Observable<any[]> {
    const url = `${this.apiUrl}/sesionportutor/${idSesion}/asistencia`;
    return this.http.get<any[]>(url);
  }
}
