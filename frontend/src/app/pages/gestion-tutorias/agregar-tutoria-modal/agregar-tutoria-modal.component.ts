import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Carrera } from '../../../shared/models/carrera';
import { Persona } from '../../../shared/models/persona';

@Component({
  selector: 'app-agregar-tutoria-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-tutoria-modal.component.html',
  styleUrls: ['./agregar-tutoria-modal.component.css']
})
export class AgregarTutoriaModalComponent {
  
  @Input() visible = false;
  @Input() carrerasDisponibles: Carrera[] = [];
  @Input() tutoresDisponibles: Persona[] = [];

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  carreraSeleccionada: number | null = null;
  tutorSeleccionado: number | null = null;

  carrerasSeleccionadas: Carrera[] = [];
  tutoresSeleccionados: Persona[] = [];

  agregarCarrera() {
    if (!this.carreraSeleccionada) return;

    const carrera = this.carrerasDisponibles.find(c => c.id === this.carreraSeleccionada);
    if (!carrera || this.carrerasSeleccionadas.some(c => c.id === carrera.id)) return;

    this.carrerasSeleccionadas.push(carrera);
  }

  eliminarCarrera(index: number) {
    this.carrerasSeleccionadas.splice(index, 1);
  }

  agregarTutor() {
    if (!this.tutorSeleccionado) return;

    const tutor = this.tutoresDisponibles.find(t => t.per_id === this.tutorSeleccionado);
    if (!tutor || this.tutoresSeleccionados.some(t => t.per_id === tutor.per_id)) return;

    this.tutoresSeleccionados.push(tutor);
  }

  eliminarTutor(index: number) {
    this.tutoresSeleccionados.splice(index, 1);
  }

  guardar() {
    this.save.emit({
      carreraIds: this.carrerasSeleccionadas.map(c => c.id),
      tutorIds: this.tutoresSeleccionados.map(t => t.per_id)
    });
  }

  cerrar() {
    this.close.emit();
  }
}
