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
  carreraIds: number[];
  carreras: string;
  n_tutores: number;
  fecha_creacion: string;
  tutorIds?: number[];
}

interface PeriodoOption {
  value: string;
  label: string;
  semestre: number;
  año: number;
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
  options: PeriodoOption[] = [];
  selectedValue = '';
  tableData: TableData[] = [];
  mostrarModal = false;
  carreras: Carrera[] = [];
  tutores: Persona[] = [];
  tutoriasEditar?: {
    rowId: number;
    carreraIds: number[];
    tutorIds: number[];
  };

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit() {
    this.cargarCarrerasYTutores();
    this.cargarPeriodos();
  }

  cargarPeriodos() {
    this.tutoriaService.getPeriodos().subscribe({
      next: (data: any[]) => {
        this.options = data.map(p => ({
          value: p.peri_id.toString(),
          label: `${p.año} Semestre ${p.semestre}`,
          semestre: p.semestre,
          año: p.año
        }));

        if (this.options.length > 0) {
          this.selectedValue = this.options[0].value;
          this.cargarTutorias(this.selectedValue);
        }
      },
      error: (err) => console.error('Error cargando periodos:', err)
    });
  }

  cargarCarrerasYTutores() {
    this.tutoriaService.getCarreras().subscribe({
      next: (data) => this.carreras = data,
      error: (err) => console.error('Error cargando carreras:', err)
    });

    this.tutoriaService.getPersonas().subscribe({
      next: (data) => this.tutores = data,
      error: (err) => console.error('Error cargando tutores:', err)
    });
  }

  cargarTutorias(periodoId: string) {
    const periodo = this.options.find(o => o.value === periodoId);
    if (!periodo) return;

    const { semestre, año } = periodo;

    this.tutoriaService.getTutoriasPorPeriodo(semestre, año).subscribe({
      next: (data: any[]) => {
        this.tableData = data.map(tutoria => ({
          id: tutoria.id,
          carreraIds: tutoria.carreras.map((c: any) => c.id),
          carreras: tutoria.carreras.map((c: any) => c.nombre).join(', '),
          n_tutores: tutoria.tutores?.length ?? 0,
          tutorIds: tutoria.tutores?.map((t: any) => t.per_id) ?? [],
          fecha_creacion: new Date(tutoria.fecha_creacion).toISOString().split('T')[0],
        }));
      },
      error: (err) => console.error('Error cargando tutorías:', err)
    });
  }

  handleSelectChange(value: string) {
    this.selectedValue = value;
    this.cargarTutorias(value);
  }

  agregarTutoria() {
    this.tutoriasEditar = undefined;
    this.mostrarModal = true;
  }

  guardarTutoria(data: { rowId?: number; carreraIds: number[]; tutorIds?: number[] }) {
    const periodoId = parseInt(this.selectedValue);

    if (data.rowId) {
      this.tutoriaService.updateTutoria(data.rowId, {
        carreraIds: data.carreraIds,
        tutorIds: data.tutorIds
      }).subscribe({
        next: (res: any) => {
          const index = this.tableData.findIndex(t => t.id === data.rowId);
          if (index > -1) {
            this.tableData[index] = {
              id: res.id,
              carreras: res.carreras.map((c: any) => c.nombre).join(', '),
              carreraIds: res.carreras.map((c: any) => c.id),
              n_tutores: res.tutores?.length ?? 0,
              tutorIds: res.tutores?.map((t: any) => t.per_id) ?? [],
              fecha_creacion: new Date(res.createdAt || Date.now()).toISOString().split('T')[0],
            };
          }
        },
        error: (err) => console.error('Error actualizando tutoria:', err)
      });
    } else {
      this.tutoriaService.createTutoria({
        periodoId,
        carreraIds: data.carreraIds,
        tutorIds: data.tutorIds
      }).subscribe({
        next: (res: any) => {
          this.tableData.push({
            id: res.id,
            carreras: res.carreras.map((c: any) => c.nombre).join(', '),
            carreraIds: res.carreras.map((c: any) => c.id),
            n_tutores: res.tutores?.length ?? 0,
            tutorIds: res.tutores?.map((t: any) => t.per_id) ?? [],
            fecha_creacion: new Date(res.createdAt || Date.now()).toISOString().split('T')[0],
          });
        },
        error: (err) => console.error('Error creando tutoria:', err)
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
    this.tutoriaService.removeTutoria(item.id).subscribe({
      next: () => {
        this.tableData = this.tableData.filter(t => t.id !== item.id);
      },
      error: (err) => console.error('Error eliminando tutoria:', err)
    });
  }
}
