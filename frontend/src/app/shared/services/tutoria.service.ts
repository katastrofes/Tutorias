import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carrera } from '../models/carrera';
import { Persona } from '../models/persona';
import { Tutoria } from '../models/tutoria';

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

  createTutoria(data: Tutoria): Observable<any> {
    return this.http.post(`${this.apiUrl}/tutoria`, data);
  }
  getTutoriasPorPeriodo(semestre: number, anio: number) {
  return this.http.get<any[]>(`${this.apiUrl}/tutoria/periodo?semestre=${semestre}&año=${anio}`);
  }
}
