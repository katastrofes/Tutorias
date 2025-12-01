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

  // Para búsqueda
  carreraBusqueda: string = '';
  carrerasFiltradas: Carrera[] = [];
  tutorBusqueda: string = '';
  tutoresFiltrados: Persona[] = [];

  // --------------------- CARRERAS ---------------------
  filtrarCarreras() {
    const texto = this.carreraBusqueda.toLowerCase();
    this.carrerasFiltradas = this.carrerasDisponibles.filter(c =>
      c.nombre.toLowerCase().includes(texto) &&
      !this.carrerasSeleccionadas.some(sel => sel.id === c.id)
    );
  }

  seleccionarCarrera(carrera: Carrera) {
    if (!this.carrerasSeleccionadas.some(c => c.id === carrera.id)) {
      this.carrerasSeleccionadas.push(carrera);
    }
    this.carreraBusqueda = '';
    this.carrerasFiltradas = [];
  }

  eliminarCarrera(index: number) {
    this.carrerasSeleccionadas.splice(index, 1);
  }

  // --------------------- TUTORES ---------------------
  filtrarTutores() {
    const texto = this.tutorBusqueda.toLowerCase();
    this.tutoresFiltrados = this.tutoresDisponibles.filter(t =>
      !this.tutoresSeleccionados.some(sel => sel.per_id === t.per_id) &&
      (t.nombre.toLowerCase().includes(texto) || t.rut.includes(texto))
    );
  }

  seleccionarTutor(tutor: Persona) {
    if (!this.tutoresSeleccionados.some(t => t.per_id === tutor.per_id)) {
      this.tutoresSeleccionados.push(tutor);
    }
    this.tutorBusqueda = '';
    this.tutoresFiltrados = [];
  }

  eliminarTutor(index: number) {
    this.tutoresSeleccionados.splice(index, 1);
  }

  // --------------------- GUARDAR / CERRAR ---------------------
  guardar() {
    if (this.carrerasSeleccionadas.length === 0) {
      alert('Error: una tutoría debe tener al menos una carrera.');
      return;
    }

    this.save.emit({
      rowId: this.tutoriasEditar?.rowId,
      carreraIds: this.carrerasSeleccionadas.map(c => c.id),
      tutorIds: this.tutoresSeleccionados.map(t => t.per_id)
    });

    this.limpiarModal();
  }

  cerrar() {
    this.close.emit();
    this.limpiarModal();
  }

  private limpiarModal() {
    this.tutoriasEditar = undefined;
    this.carrerasSeleccionadas = [];
    this.tutoresSeleccionados = [];
    this.carreraSeleccionada = null;
    this.tutorSeleccionado = null;
    this.carreraBusqueda = '';
    this.carrerasFiltradas = [];
    this.tutorBusqueda = '';
    this.tutoresFiltrados = [];
  }

  // --------------------- DETECTAR CAMBIO DE EDICIÓN ---------------------
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tutoriasEditar'] && this.tutoriasEditar) {
      this.carrerasSeleccionadas = this.carrerasDisponibles.filter(c =>
        this.tutoriasEditar!.carreraIds.includes(c.id)
      );
      this.tutoresSeleccionados = this.tutoresDisponibles.filter(t =>
        this.tutoriasEditar!.tutorIds.includes(t.per_id)
      );
    } else if (!this.tutoriasEditar) {
      this.limpiarModal();
    }
  }
}
