import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Carrera } from '../../../shared/models/carrera';
import { Persona } from '../../../shared/models/persona';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-agregar-tutoria-modal',
  standalone: true,
  templateUrl: './agregar-tutoria-modal.component.html',
  styleUrls: ['./agregar-tutoria-modal.component.css'],
  imports: [
    CommonModule, // 👈 habilita *ngIf, *ngFor, etc.
    FormsModule,  // 👈 habilita ngModel, ngValue, etc.
  ],
})
export class AgregarTutoriaModalComponent {
  @Input() visible = false;
  @Input() carrerasDisponibles: Carrera[] = [];
  @Input() tutoresDisponibles: Persona[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ carreraIds: number[], tutorIds?: number[] }>();

  carreraSeleccionada: number | null = null;
  tutorSeleccionado: number | null = null;
  carreraIds: number[] = [];
  tutorIds: number[] = [];

  agregarCarrera() {
    if (this.carreraSeleccionada && !this.carreraIds.includes(this.carreraSeleccionada)) {
      this.carreraIds.push(this.carreraSeleccionada);
    }
  }

  agregarTutor() {
    if (this.tutorSeleccionado && !this.tutorIds.includes(this.tutorSeleccionado)) {
      this.tutorIds.push(this.tutorSeleccionado);
    }
  }

  guardar() {
    this.save.emit({
      carreraIds: this.carreraIds,
      tutorIds: this.tutorIds,
    });
  }

  cerrar() {
    this.close.emit();
  }
}
