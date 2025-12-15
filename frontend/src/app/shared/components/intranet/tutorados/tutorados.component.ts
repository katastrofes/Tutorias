import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IntranetService } from '../../../services/intranet.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface Tutorado {
  per_id: number;
  nombre: string;
  rut: string;
  carrera: string;
  email: string;
  telefono: string;
}

@Component({
  selector: 'app-tutorados',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './tutorados.component.html',
})
export class TutoradosComponent implements OnInit {

  private _IntranetService = inject(IntranetService);
  private route = inject(ActivatedRoute);

  tutorados: Tutorado[] = [];

  tutId!: number;
  anioIngreso!: number;
  semestre!: number;      

  ngOnInit() {

    const tutIdParam = this.route.parent?.snapshot.paramMap.get('tutId');
    const anioParam = this.route.parent?.snapshot.paramMap.get('anio');
    const semestreParam = this.route.parent?.snapshot.paramMap.get('semestre');

    if (!tutIdParam || !anioParam || !semestreParam) {
      console.error('Error: parámetros faltantes en la URL.');
      return;
    }

    this.tutId = parseInt(tutIdParam, 10);
    this.anioIngreso = parseInt(anioParam, 10);
    this.semestre = parseInt(semestreParam, 10);

    this._IntranetService.obtenerTutoradosPorTutoria(
      this.tutId,
      this.anioIngreso,
      this.semestre
    ).subscribe({
      next: (data: any[]) => {
        console.log("DATA ENVIADA DESDE API: ", data);

        this.tutorados = data.map(x => ({
          per_id: x.per_id ?? x.id ?? x.PER_ID,
          rut: x.rut ?? x.RUT,
          nombre: x.nombre ?? x.NOMBRE,
          carrera: x.carrera ?? x.CARRERA,
          email: x.email ?? x.EMAIL,
          telefono: x.telefono ?? x.TELEFONO
        }));
      },
      error: err => {
        console.error('Error cargando tutorados:', err);
      }
    });
  }

  irMensajeria(fila: Tutorado) {
    console.log('mensajeria →', fila.nombre);
  }

  verAsignaturas(fila: Tutorado) {
    console.log('asignaturas →', fila.nombre);
  }

  mensajeGeneral() {
    console.log('mensaje general tutorados');
  }
}
