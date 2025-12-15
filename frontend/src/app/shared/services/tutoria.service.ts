import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carrera } from '../models/carrera';
import { Persona } from '../models/persona';
import { Tutoria } from '../models/tutoria';
import { Periodo } from '../models/periodo';

@Injectable({
  providedIn: 'root',
})
export class TutoriaService {
  private apiUrl = 'http://localhost:3000'; // ajusta si tienes proxy

  constructor(private http: HttpClient) {}

  getTutorias(semestre: number, año: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tutoria?semestre=${semestre}&año=${año}`);
  }

  getCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.apiUrl}/carrera`); // Ajusta si no hay endpoint
  }

  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/persona`); // Ajusta si no hay endpoint
  }

  getTutoriasPorPeriodo(periodoId: number): Observable<Tutoria[]> {
    return this.http.get<Tutoria[]>(`${this.apiUrl}/tutoria/periodo?periodoId=${periodoId}`);
  }

  createTutoria(data: { periodoId: number, carreraIds: number[], tutorIds?: number[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tutoria`, data);
  }

  updateTutoria(id: number, data: { carreraIds?: number[], tutorIds?: number[] }): Observable<any> {
    return this.http.put(`${this.apiUrl}/tutoria/${id}`, data);
  }

  removeTutoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tutoria/${id}`);
  }

  getPeriodos() {
  return this.http.get<Periodo[]>(`${this.apiUrl}/tutoria/periodos`);
  }

  getTutoriasPorPeriodoYSede(periodoId: number, sede: string): Observable<Tutoria[]> {
  return this.http.get<Tutoria[]>(
    `${this.apiUrl}/tutoria/filtro?periodoId=${periodoId}&sede=${sede}`
  );
  }
  getTutoresFiltrados(
  periodoId: number,
  sede: string,
  tutoriaId: number,
  carreraId?: number
  ): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/tutoria/tutores?periodoId=${periodoId}&sede=${sede}&tutoriaId=${tutoriaId}&carreraId=${carreraId ?? ''}`
  );
  }
}
