import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { IntranetService, PlantillaSesion} from '../../../../services/intranet.service';

@Component({
  selector: 'app-nueva-sesion',
  templateUrl: './nueva-sesion.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaSesionComponent implements OnInit {

  private fb = inject(FormBuilder);
  private matDialogRef = inject(MatDialogRef<NuevaSesionComponent>);
  private _IntranetService = inject(IntranetService);
  private data: { sesionesPlantilla: PlantillaSesion[], perCodigo: number, tutId: number} = inject(MAT_DIALOG_DATA);

  sesionesPlantilla: PlantillaSesion[] = [];

  tematicaSeleccionada = '';
  autor = '';
  competenciasSeleccionadas: string[] = [];
  perCodigo: number = 0;
  tutId: number = 0;

  formSesion!: FormGroup;

  ngOnInit() {
    this.sesionesPlantilla = this.data.sesionesPlantilla;
    this.perCodigo = this.data.perCodigo;
    this.tutId = this.data.tutId;

    this.formSesion = this.fb.group({
      pse_id: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      tematica: [''],
      autor: [''],
      lugar: ['', Validators.required],
      observaciones: [''],
      competencias: ['']
    });
  }

  onPlantillaSeleccionada() {
    const id = this.formSesion.value.pse_id;
    const sesion = this.sesionesPlantilla.find(s => s.pse_id == id) as PlantillaSesion; 

    if (!sesion) return;

    this.tematicaSeleccionada = sesion.tematica;
    this.autor = 'María Antonia González Vega'

    let comps: string[] = [];
    if (typeof sesion.competencias === 'string') {
        comps = sesion.competencias.split(',').map(c => c.trim());
        comps = comps.filter(c => c.length > 0);
    }
    this.competenciasSeleccionadas = comps;
  }

  cancelar() {
    this.matDialogRef.close(null);
  }

  guardar() {
    if (this.formSesion.invalid) {
      console.error('El formulario es inválido. Por favor, complete todos los campos requeridos.');
      return;
    }

    const { pse_id, fecha, hora, lugar, observaciones } = this.formSesion.value;
    const fechaCompleta = `${fecha} ${hora}`;

    const sesionData = {
      perId: '1',
      tutId: this.tutId,
      pseId: pse_id,
      fecha: fechaCompleta,
      lugar: lugar,
      observaciones: observaciones || ''
    };
    
    this._IntranetService.nuevaSesion(
      sesionData.tutId,
      sesionData.pseId,
      sesionData.fecha,
      sesionData.lugar,
      sesionData.observaciones
    ).subscribe({
      next: (response: any) => {
        if (response && response.cod === '1') { 
          this.matDialogRef.close(response.datos);
          console.log(response.datos);
        } else {
          console.error('Error al guardar la sesión (código 2):', response.msj);
          this.matDialogRef.close(null);
        }
      },
      error: (error) => {
        console.error('Error de conexión/petición:', error);
        this.matDialogRef.close(null);
      }
    });
  }
}
