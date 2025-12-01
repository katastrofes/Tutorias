import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { FormsModule } from '@angular/forms';
import { AgregarTutoriaModalComponent } from './agregar-tutoria-modal/agregar-tutoria-modal.component';
import { Carrera } from '../../shared/models/carrera';
import { Persona } from '../../shared/models/persona';
import { TutoriaService } from '../../shared/services/tutoria.service';
import { HttpClientModule } from '@angular/common/http';

interface TableData {
  id: number;
  carreras: string;
  n_tutores: number;
  fecha_creacion: string;
  tutorIds?: number[]; // NUEVO: para guardar tutores seleccionados
}

@Component({
  selector: 'app-gestion-tutorias',
  standalone: true,
  templateUrl: './gestion-tutorias.component.html',
  imports: [
    HttpClientModule,
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
    CommonModule,
    ButtonComponent,
    FormsModule,
    AgregarTutoriaModalComponent,
  ],
  styles: ``
})
export class GestionTutoriasComponent implements OnInit {
  options = [
    { value: '60', label: '2025 Semestre 2' }
  ];

  selectedValue = '';
  tableData: TableData[] = [];

  mostrarModal = false;

  carreras: Carrera[] = [
    { id: 1, nombre: 'Ingeniería Informática' },
    { id: 2, nombre: 'Ingeniería Civil' },
    { id: 3, nombre: 'Administración de Empresas' },
  ];

  tutores: Persona[] = [
    { per_id: 101, rut: '11.111.111-1', nombre: 'Juan Pérez' },
    { per_id: 102, rut: '11.111.111-1', nombre: 'María López' },
    { per_id: 103, rut: '11.111.111-1', nombre: 'Carlos Ruiz' },
  ];

  // Datos temporales para edición
  tutoriasEditar?: {
    rowId: number;
    carreraIds: number[];
    tutorIds: number[];
  };

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit() {
    this.cargarCarrerasYTutores();
  }

  cargarCarrerasYTutores() {
    this.tutoriaService.getCarreras().subscribe((data) => {
      this.carreras = data;
    });

    this.tutoriaService.getPersonas().subscribe((data) => {
      this.tutores = data;
    });
  }

  cargarTutorias(periodoId: string) {
    const periodo = this.options.find(o => o.value === periodoId);
    if (!periodo) return;

    const [anio, semestreRaw] = periodo.label.split(' ');
    const semestre = semestreRaw === 'Semestre' ? 1 : 2;

    this.tutoriaService.getTutoriasPorPeriodo(semestre, parseInt(anio)).subscribe(data => {
      this.tableData = data.map(tutoria => ({
        id: tutoria.id,
        carreras: tutoria.carreras.map((c: any) => c.nombre).join(', '),
        n_tutores: tutoria.tutores?.length ?? 0,
        tutorIds: tutoria.tutores?.map((t: any) => t.per_id) ?? [],
        fecha_creacion: new Date(tutoria.fecha_creacion).toISOString().split('T')[0],
      }));
    });
  }

  handleSelectChange(value: string) {
    this.selectedValue = value;
    this.cargarTutorias(value);
  }

  // ------------------- MODAL -------------------
  agregarTutoria() {
    this.tutoriasEditar = undefined; // limpiar edición
    this.mostrarModal = true;
  }

  guardarTutoria(data: { rowId?: number, carreraIds: number[], tutorIds?: number[] }) {
    const carrerasSeleccionadas = this.carreras
      .filter(c => data.carreraIds.includes(c.id))
      .map(c => c.nombre)
      .join(', ');

    const nTutores = data.tutorIds?.length ?? 0;
    const fechaCreacion = new Date().toISOString().split('T')[0];

    if (data.rowId) {
      // EDITAR fila existente
      const index = this.tableData.findIndex(t => t.id === data.rowId);
      if (index > -1) {
        this.tableData[index] = {
          ...this.tableData[index],
          carreras: carrerasSeleccionadas,
          n_tutores: nTutores,
          tutorIds: data.tutorIds,
          fecha_creacion: fechaCreacion
        };
      }
    } else {
      // NUEVA fila
      const nuevoId = this.tableData.length > 0
        ? Math.max(...this.tableData.map(t => t.id)) + 1
        : 1;
      this.tableData.push({
        id: nuevoId,
        carreras: carrerasSeleccionadas,
        n_tutores: nTutores,
        tutorIds: data.tutorIds,
        fecha_creacion: fechaCreacion
      });
    }

    this.mostrarModal = false;
    this.tutoriasEditar = undefined;
  }

  editarTutoria(item: TableData) {
    this.mostrarModal = true;

    const carreraIds = this.carreras
      .filter(c => item.carreras.split(', ').includes(c.nombre))
      .map(c => c.id);

    const tutorIds: number[] = item.tutorIds ?? [];

    this.tutoriasEditar = {
      rowId: item.id,
      carreraIds,
      tutorIds
    };
  }

  eliminarTutoria(item: TableData) {
    this.tableData = this.tableData.filter(t => t.id !== item.id);
  }
}
