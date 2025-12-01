import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
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
export class AgregarTutoriaModalComponent implements OnChanges {

  @Input() visible = false;
  @Input() carrerasDisponibles: Carrera[] = [];
  @Input() tutoresDisponibles: Persona[] = [];
  @Input() tutoriasEditar?: { carreraIds: number[], tutorIds: number[], rowId: number };

  @Output() save = new EventEmitter<{ rowId?: number, carreraIds: number[], tutorIds: number[] }>();
  @Output() close = new EventEmitter<void>();

  carreraSeleccionada: number | null = null;
  tutorSeleccionado: number | null = null;

  carrerasSeleccionadas: Carrera[] = [];
  tutoresSeleccionados: Persona[] = [];

  // --------------------- CARRERAS ---------------------
  agregarCarrera() {
    if (!this.carreraSeleccionada) return;

    const carrera = this.carrerasDisponibles.find(c => c.id === this.carreraSeleccionada);
    if (!carrera || this.carrerasSeleccionadas.some(c => c.id === carrera.id)) return;

    this.carrerasSeleccionadas.push(carrera);
  }

  eliminarCarrera(index: number) {
    this.carrerasSeleccionadas.splice(index, 1);
  }

  // --------------------- TUTORES ---------------------
  agregarTutor() {
    if (!this.tutorSeleccionado) return;

    const tutor = this.tutoresDisponibles.find(t => t.per_id === this.tutorSeleccionado);
    if (!tutor || this.tutoresSeleccionados.some(t => t.per_id === tutor.per_id)) return;

    this.tutoresSeleccionados.push(tutor);
  }

  eliminarTutor(index: number) {
    this.tutoresSeleccionados.splice(index, 1);
  }

  // --------------------- GUARDAR / CERRAR ---------------------
  guardar() {
    if (this.tutoriasEditar && this.carrerasSeleccionadas.length === 0) {
      alert('Error: una tutoría debe tener al menos una carrera.');
      return;
    }

    this.save.emit({
      rowId: this.tutoriasEditar?.rowId,
      carreraIds: this.carrerasSeleccionadas.map(c => c.id),
      tutorIds: this.tutoresSeleccionados.map(t => t.per_id)
    });

    // Limpiar después de emitir
    this.tutoriasEditar = undefined;
    this.carrerasSeleccionadas = [];
    this.tutoresSeleccionados = [];
    this.carreraSeleccionada = null;
    this.tutorSeleccionado = null;
  }

  cerrar() {
    this.close.emit();
  }

  // --------------------- DETECTAR CAMBIO DE EDICIÓN ---------------------
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tutoriasEditar'] && this.tutoriasEditar) {
      // Modo edición → cargar valores existentes
      this.carrerasSeleccionadas = this.carrerasDisponibles.filter(c =>
        this.tutoriasEditar!.carreraIds.includes(c.id)
      );
      this.tutoresSeleccionados = this.tutoresDisponibles.filter(t =>
        this.tutoriasEditar!.tutorIds.includes(t.per_id)
      );
    } else if (!this.tutoriasEditar) {
      // Modo creación → limpiar todos los selects
      this.carrerasSeleccionadas = [];
      this.tutoresSeleccionados = [];
      this.carreraSeleccionada = null;
      this.tutorSeleccionado = null;
    }
  }
}
