import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NuevaSesionComponent } from '../nueva-sesion/nueva-sesion.component';
import { MatDialog } from '@angular/material/dialog';
import { EditarSesionComponent } from '../editar-sesion/editar-sesion.component';
import { ActivatedRoute } from '@angular/router';
import { AsistenciaSesionComponent } from '../asistencia-sesion/asistencia-sesion.component';
import { IntranetService, PlantillaSesion, SesionListado } from '../../../../services/intranet.service';

export interface Sesion {
  idSesion: number;
  nro_sesion: number;
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
  
  sesiones: SesionListado[] = [];
  filaExpandida: number | null = null;
  periId: number = 0;
  tutId: number = 0;
  anioIngreso!: number;
  semestre!: number;
  perId: number = 1;

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
      this.periId = parseInt(perCodigoParam, 10);
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
    if (this.tutId && this.periId) {
        this.cargarSesiones();
    }
  }

  cargarSesiones() {
    this._IntranetService.obtenerSesionesTutorPeriodo(this.perId, this.periId, this.tutId)
      .subscribe({
        next: (resp) => {
          console.log('RESPUESTA BACKEND listar:', resp);
          this.sesiones = resp;
        },
        error: (err) => console.error('ERROR listar:', err),
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

  editar(sesion: SesionListado) {
    const data = {
      idSesion: sesion.idSesion,
      nro: sesion.nro,
      fecha: sesion.sesFecha,
      lugar: sesion.sesLugar,
      observaciones: sesion.observaciones,
      tematica: sesion.tematica,
    };

    console.log('[Padre] data enviado al modal:', data);

    const dialogRef = this.dialog.open(EditarSesionComponent, {
      width: '40vw',
      maxWidth: '90vw',
      disableClose: true,
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('[Padre] result recibido del modal:', result);
      if (!result) return;

      const payload = {
        perId: this.perId,
        fechaEjecucion: result.fecha,
        lugar: result.lugar,
        observaciones: result.observaciones ?? null,
      };

      console.log('[Padre] payload enviado al backend (editarSesionPorTutor):', payload);

      this._IntranetService.editarSesionPorTutor(result.idSesion, payload).subscribe({
        next: () => { this.cargarSesiones(); },
        error: (err) => console.error('Error editando sesión:', err),
      });
    });
  }


  nuevaSesion() {
    this._IntranetService.obtenerPlantillasDisponibles(this.perId, this.periId, this.tutId).subscribe({
      next: (plantillas: PlantillaSesion[]) => {
        const dialogRef = this.dialog.open(NuevaSesionComponent, {
          width: '40vw',
          maxWidth: '90vw',
          disableClose: true,
          data: {
            sesionesPlantilla: plantillas,
            periId: this.periId,
            tutId: this.tutId
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.cargarSesiones();
          }
        });
      },
      error: (err: unknown) => {
        console.error('Error cargando plantillas disponibles:', err);
      }
    });
  }

}