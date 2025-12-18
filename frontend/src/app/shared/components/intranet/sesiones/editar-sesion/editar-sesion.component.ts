import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatIconModule } from '@angular/material/icon';

type SesionDialogData = {
  idSesion?: number;
  nro?: number;
  fecha?: Date | string;
  lugar?: string;
  observaciones?: string;
  tematica?: string;
};

@Component({
  selector: 'app-editar-sesion',
  templateUrl: './editar-sesion.component.html',
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
export class EditarSesionComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditarSesionComponent>);
  public data = inject(MAT_DIALOG_DATA) as SesionDialogData;

  idSesion!: number;
  nroSesion!: number;
  autor!: string;
  tematica!: string;

  formSesion!: FormGroup;

  private originalFechaYMD = '';
  private originalHoraHHmm = '';

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatDateYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private parseDateFromBackend(value: unknown): { date: Date | null; time: Date | null; ymd: string; hhmm: string } {
    if (!value) return { date: null, time: null, ymd: '', hhmm: '' };

    if (value instanceof Date && !isNaN(value.getTime())) {
      const ymd = this.formatDateYMD(value);
      const hhmm = this.formatTime(value);
      const dateOnly = new Date(value.getFullYear(), value.getMonth(), value.getDate());
      const timeOnly = new Date(2000, 0, 1, value.getHours(), value.getMinutes(), 0, 0);
      return { date: dateOnly, time: timeOnly, ymd, hhmm };
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');

      const ymd = normalized.substring(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return { date: null, time: null, ymd: '', hhmm: '' };

      const [y, m, d] = ymd.split('-').map(Number);
      const dateOnly = new Date(y, m - 1, d);

      const match = normalized.match(/T(\d{2}):(\d{2})/);
      const hhmm = match ? `${match[1]}:${match[2]}` : '';

      const timeOnly = match ? new Date(2000, 0, 1, Number(match[1]), Number(match[2]), 0, 0) : null;

      return { date: dateOnly, time: timeOnly, ymd, hhmm };
    }

    return { date: null, time: null, ymd: '', hhmm: '' };
  }

  ngOnInit() {
    this.idSesion  = this.data?.idSesion ?? 0;
    this.nroSesion = this.data?.nro ?? 0;
    this.tematica  = this.data?.tematica ?? '';
    this.autor = 'María Antonia González Vega';

    const parsed = this.parseDateFromBackend(this.data?.fecha);

    this.originalFechaYMD = parsed.ymd;
    this.originalHoraHHmm = parsed.hhmm;

    this.formSesion = this.fb.group({
      fecha: [parsed.date, Validators.required],
      hora:  [parsed.time, Validators.required],
      lugar: [this.data?.lugar ?? '', Validators.required],
      observaciones: [this.data?.observaciones ?? '']
    });

    this.formSesion.markAsPristine();
    this.formSesion.markAsUntouched();
    this.formSesion.get('fecha')?.markAsPristine();
    this.formSesion.get('fecha')?.markAsUntouched();
    this.formSesion.get('hora')?.markAsPristine();
    this.formSesion.get('hora')?.markAsUntouched();
  }

  cancelar() {
    this.dialogRef.close();
  }

  guardarEdicion() {
    if (!this.formSesion.valid) return;

    const raw = this.formSesion.getRawValue() as {
      fecha: Date | null;
      hora: Date | null;
      lugar: string;
      observaciones: string;
    };

    const fechaCtrl = this.formSesion.get('fecha');
    const horaCtrl  = this.formSesion.get('hora');

    const fechaParte =
      (fechaCtrl?.touched && raw.fecha instanceof Date && !isNaN(raw.fecha.getTime()))
        ? this.formatDateYMD(raw.fecha)
        : this.originalFechaYMD;

    const horaParte =
      (horaCtrl?.touched && raw.hora instanceof Date && !isNaN(raw.hora.getTime()))
        ? this.formatTime(raw.hora) // solo HH:mm
        : this.originalHoraHHmm;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaParte)) return;
    if (!/^\d{2}:\d{2}$/.test(horaParte)) return;

    const fechaCompleta = `${fechaParte} ${horaParte}`;

    const payload = {
      idSesion: this.idSesion,
      fecha: fechaCompleta,
      lugar: raw.lugar,
      observaciones: (raw.observaciones ?? '').toString().trim() || null
    };

    this.dialogRef.close(payload);
  }
}
