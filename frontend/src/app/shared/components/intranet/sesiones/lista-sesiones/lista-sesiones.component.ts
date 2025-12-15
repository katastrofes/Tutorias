import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NuevaSesionComponent } from '../nueva-sesion/nueva-sesion.component';
import { MatDialog } from '@angular/material/dialog';
import { EditarSesionComponent } from '../editar-sesion/editar-sesion.component';
import { ActivatedRoute } from '@angular/router';
import { AsistenciaSesionComponent } from '../asistencia-sesion/asistencia-sesion.component';
import { IntranetService, PlantillaSesion } from '../../../../services/intranet.service';

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

@Component({
  selector: 'app-lista-sesiones',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './lista-sesiones.component.html',
})
export class ListaSesionesComponent implements OnInit{
  private dialog = inject(MatDialog)
  private _IntranetService = inject(IntranetService);
  private route = inject(ActivatedRoute);
  
  sesiones: Sesion[] = [];
  filaExpandida: number | null = null;
  perCodigo: number = 0;
  tutId: number = 0;
  anioIngreso!: number;
  semestre!: number;

  ngOnInit() {
    const anioParam = this.route.parent?.snapshot.paramMap.get('anio');
    const semestreParam = this.route.parent?.snapshot.paramMap.get('semestre');
    const tutIdParam = this.route.parent?.snapshot.paramMap.get('tutId');
    const perCodigoParam = this.route.parent?.snapshot.paramMap.get('perCodigo');

    if (tutIdParam) {
      this.tutId = parseInt(tutIdParam, 10);
    } else {
      console.error('Error: No se pudo obtener el parámetro tutId de la URL.');
      return;
    }

    if (perCodigoParam) {
      this.perCodigo = parseInt(perCodigoParam, 10);
    } else {
      console.error('Error: No se pudo obtener el parámetro periodo (perCodigo) de la URL.');
      return;
    }

    if (semestreParam) {
      this.semestre = parseInt(semestreParam, 10);
    } else {
      console.error('Error: No se pudo obtener el parámetro semestre de la URL.');
      return;
    }

    if (anioParam) {
      this.anioIngreso = parseInt(anioParam, 10);
    } else {
      console.error('Error: No se pudo obtener el parámetro año ingreso de la URL.');
      return;
    }
    if (this.tutId && this.perCodigo) {
        this.cargarSesiones();
    }
  }

  cargarSesiones() {
    this._IntranetService.obtenerSesionesTutor(this.perCodigo, this.tutId).subscribe({
        next: (sesiones: Sesion[]) => {
            this.sesiones = sesiones;
        }
    });
  }

  toggleExpand(id: number) {
    this.filaExpandida = this.filaExpandida === id ? null : id;
  }

  verAsistencia(sesion: any) {
    this._IntranetService.obtenerTutoradosPorTutoria(
        this.tutId,
        this.anioIngreso,
        this.semestre
    ).subscribe(tutorados => {

        const dialogRef = this.dialog.open(AsistenciaSesionComponent, {
            width: '60vw',
            maxWidth: '90vw',
            disableClose: true,
            data: {
                tutorados: tutorados,
                sesion: sesion
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('Modal cerrado', result);
        });

    });
  }

  editar(sesion: any) {
    const dialogRef = this.dialog.open(EditarSesionComponent, {
      width: '40vw',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        idSesion: sesion.idSesion,
        nro: sesion.nro,
        fecha: sesion.fecha,
        tematica: sesion.tematica,
        autor: sesion.autor,
        lugar: sesion.lugar,
        competencias: sesion.competencias,
        observaciones: sesion.observaciones
      },
    });

    //modificar
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this._IntranetService.editarSesion(
        result.idSesion,
        result.fecha,
        result.lugar,
        result.observaciones
      ).subscribe(res => {
          console.log("Sesión actualizada:", result);

          const i = this.sesiones.findIndex(s => s.idSesion === result.idSesion);
          if (i !== -1) {
              const fechaActualizada = new Date(result.fecha);

              this.sesiones[i] = { 
                  ...this.sesiones[i], 
                  lugar: result.lugar, 
                  observaciones: result.observaciones,
                  fecha: fechaActualizada
              };
          }
      });
    });
  }

  nuevaSesion() {
    this._IntranetService.obtenerPlantillaSesiones(this.perCodigo, this.tutId).subscribe(
      (plantillas: PlantillaSesion[]) => {
        const dialogRef = this.dialog.open(NuevaSesionComponent, {
          width: '40vw',
          maxWidth: '90vw',
          disableClose: true,
          data: { 
            sesionesPlantilla: plantillas,
            perCodigo: this.perCodigo,
            tutId: this.tutId
          }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.cargarSesiones();
            }
        });
      }
    );
  }
}