import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { IntranetService, PlantillaSesion } from '../../../../services/intranet.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nueva-sesion',
  templateUrl: './nueva-sesion.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule,
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaSesionComponent implements OnInit {

  private fb = inject(FormBuilder);
  private matDialogRef = inject(MatDialogRef<NuevaSesionComponent>);
  private _IntranetService = inject(IntranetService);
  private data: { sesionesPlantilla: PlantillaSesion[], perCodigo: number, tutId: number } = inject(MAT_DIALOG_DATA);

  sesionesPlantilla: PlantillaSesion[] = [];

  tematicaSeleccionada = '';
  autor = 'María Antonia González Vega';
  perCodigo = 0;
  tutId = 0;

  formSesion!: FormGroup;

  private formatDateYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatTimeHHmm(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private normalizeFechaToYMD(value: unknown): string {
    if (value instanceof Date && !isNaN(value.getTime())) return this.formatDateYMD(value);
    // si ya viene "YYYY-MM-DD"
    return String(value ?? '').trim().substring(0, 10);
  }

  private normalizeHoraToHHmm(value: unknown): string {
    if (value instanceof Date && !isNaN(value.getTime())) return this.formatTimeHHmm(value);
    // si viene "HH:mm:ss" -> "HH:mm"
    const s = String(value ?? '').trim();
    return s.length >= 5 ? s.substring(0, 5) : s;
  }

  ngOnInit() {
    this.sesionesPlantilla = this.data.sesionesPlantilla;
    this.perCodigo = this.data.perCodigo;
    this.tutId = this.data.tutId;

    this.formSesion = this.fb.group({
      pse_id: ['', Validators.required],
      fecha: [null, Validators.required],
      hora: ['', Validators.required],
      tematica: [{ value: '', disabled: true }],
      autor: [{ value: this.autor, disabled: true }],
      lugar: ['', Validators.required],
      observaciones: ['']
    });
  }

  onPlantillaSeleccionada() {
    const id = this.formSesion.get('pse_id')?.value;
    const sesion = this.sesionesPlantilla.find(s => String(s.pse_id) === String(id));

    if (!sesion) return;

    this.tematicaSeleccionada = sesion.nombre;

    this.formSesion.patchValue({
      tematica: sesion.nombre,
      autor: this.autor
    });
  }

  cancelar() {
    this.matDialogRef.close(null);
  }

  guardar() {
    if (this.formSesion.invalid) return;

    const raw = this.formSesion.getRawValue() as {
      pse_id: string | number;
      fecha: unknown;
      hora: unknown;
      lugar: string;
      observaciones: string | null;
    };

    const fechaYMD = this.normalizeFechaToYMD(raw.fecha);
    const horaHHmm = this.normalizeHoraToHHmm(raw.hora);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaYMD)) return;
    if (!/^\d{2}:\d{2}$/.test(horaHHmm)) return;

    const fechaEjecucion = `${fechaYMD} ${horaHHmm}`;

    const dto = {
      tutoriaId: this.tutId,
      sesionId: Number(raw.pse_id),
      perId: 10,
      fechaEjecucion,
      lugar: raw.lugar ?? '',
      observaciones: (raw.observaciones ?? '').toString().trim() || null,
    };

    this._IntranetService.crearSesionPorTutor(dto).subscribe({
      next: (resp) => this.matDialogRef.close(resp),
      error: (err) => {
        console.error(err);
        this.matDialogRef.close(null);
      }
    });
  }
}
