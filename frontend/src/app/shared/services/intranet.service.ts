import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface PlantillaSesion {
  pse_id: number;
  nro: number;
  tematica: string;
  competencias: string;
}

export interface Sesion {
  idSesion: number;
  nro: number;
  fecha: Date;
  tematica: string;
  autor: string;
  lugar: string;
  competencias: string;
  objetivos: string;
  observaciones: string;
}

export interface Tutorado {
  id: number;
  rut: string;
  nombre: string;
  email: string;
  telefono: string;
  carrera: string;
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

  // URL base (ajusta según tu backend)
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Toggle to use mock responses instead of real HTTP calls (useful for frontend testing)
  private useMock = true;

  // Mock data
  private mockPlantillas: PlantillaSesion[] = [
    { pse_id: 1, nro: 1, tematica: 'Introducción', competencias: 'Comunicación,Análisis' },
    { pse_id: 2, nro: 2, tematica: 'Práctica', competencias: 'Programación,Resolución' },
    { pse_id: 3, nro: 3, tematica: 'Repaso', competencias: 'Sintaxis,Algoritmos' }
  ];

  private mockSesiones: Sesion[] = [
    {
      idSesion: 1,
      nro: 1,
      fecha: new Date('2025-12-01'),
      tematica: 'Introducción',
      autor: 'Profesor A',
      lugar: 'Sala 101',
      competencias: 'Comunicación',
      objetivos: 'Conocer temario',
      observaciones: ''
    },
    {
      idSesion: 2,
      nro: 2,
      fecha: new Date('2025-12-08'),
      tematica: 'Práctica',
      autor: 'Profesor B',
      lugar: 'Sala 102',
      competencias: 'Programación',
      objetivos: 'Resolver ejercicios',
      observaciones: ''
    }
  ];

  private mockTutorados: Tutorado[] = [
    { id: 101, nombre: 'Alumno Uno', rut: '12345678-9', carrera: 'Ingeniería', email: 'a@u.cl', telefono: '987654321' },
    { id: 102, nombre: 'Alumno Dos', rut: '98765432-1', carrera: 'Comercio', email: 'b@u.cl', telefono: '987654322' }
  ];

  /**
   * Obtiene las plantillas de sesión disponibles para una tutoría
   */
  obtenerPlantillasSesiones( tutId: number): Observable<PlantillaSesion[]> {
    if (this.useMock) {
      return of(this.mockPlantillas);
    }
    const url = `${this.apiUrl}/sesiones/plantillas/${tutId}`;
    return this.http.get<PlantillaSesion[]>(url, {    });
  }

  /**
   * Alias para compatibilidad: algunos componentes esperan este nombre y pasan perCodigo
   */
  obtenerPlantillaSesiones( _perCodigo: number, tutId: number): Observable<PlantillaSesion[]> {
    // perCodigo no es usado por el endpoint actual pero se mantiene en la firma
    return this.obtenerPlantillasSesiones(tutId);
  }

  /**
   * Crea una nueva sesión
   */
  nuevaSesion(
    tutId: number,
    pseId: number,
    fecha: string,
    lugar: string,
    observaciones: string,
  ): Observable<ApiResponse> {
    if (this.useMock) {
      const newId = (this.mockSesiones[this.mockSesiones.length - 1]?.idSesion || 0) + 1;
      const nro = newId;
      const newSesion: Sesion = {
        idSesion: newId,
        nro,
        fecha: new Date(fecha),
        tematica: this.mockPlantillas.find(p => p.pse_id === pseId)?.tematica || 'Nueva',
        autor: 'Mock Autor',
        lugar,
        competencias: '',
        objetivos: '',
        observaciones: observaciones || ''
      };
      this.mockSesiones.push(newSesion);
      return of({ cod: '1', msj: 'OK', datos: newSesion });
    }

    const url = `${this.apiUrl}/sesiones`;
    const body = {
      tutId,
      pseId,
      fecha,
      lugar,
      observaciones
    };
    
    return this.http.post<ApiResponse>(url, body, {});
  }

  /**
   * Obtiene todas las sesiones de una tutoría
   */
  obtenerSesionesTutor(perCodigo: number, tutId: number): Observable<Sesion[]> {
    if (this.useMock) {
      return of(this.mockSesiones);
    }
    const url = `${this.apiUrl}/sesiones/tutor/${tutId}?perCodigo=${perCodigo}`;
    return this.http.get<Sesion[]>(url, {});
  }

  /**
   * Edita una sesión existente
   */
  editarSesion(
    idSesion: number,
    fecha: string,
    lugar: string,
    observaciones: string
  ): Observable<ApiResponse> {
    if (this.useMock) {
      const i = this.mockSesiones.findIndex(s => s.idSesion === idSesion);
      if (i !== -1) {
        this.mockSesiones[i] = { ...this.mockSesiones[i], fecha: new Date(fecha), lugar, observaciones } as Sesion;
        return of({ cod: '1', msj: 'OK', datos: this.mockSesiones[i] });
      }
      return of({ cod: '2', msj: 'Not found' });
    }
    const url = `${this.apiUrl}/sesiones/${idSesion}`;
    const body = {
      fecha,
      lugar,
      observaciones
    };
    
    return this.http.put<ApiResponse>(url, body, {    });
  }

  /**
   * Obtiene los tutorados de una tutoría
   */
  obtenerTutoradosPorTutoria(
    tutId: number,
    anioIngreso: number,
    semestre: number
  ): Observable<Tutorado[]> {
    if (this.useMock) {
      return of(this.mockTutorados);
    }
    const url = `${this.apiUrl}/tutorias/${tutId}/tutorados?anio=${anioIngreso}&semestre=${semestre}`;
    return this.http.get<Tutorado[]>(url, {    });
  }

  /**
   * Registra la asistencia de los tutorados a una sesión
   */
  guardarAsistencia(
    idSesion: number,
    asistentes: any[]
  ): Observable<ApiResponse> {
    if (this.useMock) {
      // simulate saving
      return of({ cod: '1', msj: 'Asistencia guardada', datos: asistentes });
    }
    const url = `${this.apiUrl}/sesiones/${idSesion}/asistencia`;
    const body = { asistentes };
    
    return this.http.post<ApiResponse>(url, body, {    });
  }

  /**
   * Obtiene la asistencia de una sesión
   */
  obtenerAsistencia(
    idSesion: number
  ): Observable<any[]> {
    if (this.useMock) {
      // return mock asistencia: map mockTutorados to present/absent
      const lista = this.mockTutorados.map(t => ({ ID: t.id, ESTADO: 'AUSENTE' }));
      return of(lista);
    }
    const url = `${this.apiUrl}/sesiones/${idSesion}/asistencia`;
    return this.http.get<any[]>(url, {    });
  }

  /**
   * Alias usado en componentes: obtenerAsistenciaPorSesion
   */
  obtenerAsistenciaPorSesion( idSesion: number): Observable<any[]> {
    return this.obtenerAsistencia( idSesion);
  }

  /**
   * Elimina una sesión
   */
  eliminarSesion(
    idSesion: number
  ): Observable<ApiResponse> {
    if (this.useMock) {
      const i = this.mockSesiones.findIndex(s => s.idSesion === idSesion);
      if (i !== -1) {
        this.mockSesiones.splice(i, 1);
        return of({ cod: '1', msj: 'Eliminado' });
      }
      return of({ cod: '2', msj: 'No encontrado' });
    }
    const url = `${this.apiUrl}/sesiones/${idSesion}`;
    return this.http.delete<ApiResponse>(url, {    });
  }

}
