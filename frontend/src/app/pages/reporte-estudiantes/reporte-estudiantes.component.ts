import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import {
  SelectComponent,
  Option,
} from '../../shared/components/form/select/select.component';
import { TutoriaService } from '../../shared/services/tutoria.service';

interface TableData {
  tutoriaId: string;
  nombreTutoria: string;
  rut: string;
  nombre: string;
  email: string;
  celular: string;
  carreraTutorado: string;
  clasesAsistidas: number;
}

@Component({
  selector: 'app-reporte-estudiantes',
  templateUrl: './reporte-estudiantes.component.html',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
  ],
  styles: '',
})
export class ReporteEstudiantesComponent implements OnInit {
  // Filtros
  periodoOptions: Option[] = [];
  sedeOptions: Option[] = [
    { value: 'arica', label: 'Sede Arica' },
    { value: 'iquique', label: 'Sede Iquique' },
  ];
  tutoriaOptions: Option[] = [];

  selectedPeriodo = '';
  selectedSede = '';
  selectedTutoria = '';

  // Tabla
  tableData: TableData[] = [];

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit(): void {
    this.tutoriaService.getPeriodos().subscribe((periodos) => {
      this.periodoOptions = periodos.map((p) => ({
        value: String(p.peri_id),
        label: `${p.año} Semestre ${p.semestre}`,
      }));
    });
  }

  // ========================
  // HANDLERS DE FILTROS
  // ========================

  handlePeriodoChange(value: string) {
    this.selectedPeriodo = value;
    this.resetTabla();
    this.tryCargarTutorias();
  }

  handleSedeChange(value: string) {
    this.selectedSede = value;
    this.resetTabla();
    this.tryCargarTutorias();
  }

  handleTutoriaChange(value: string) {
    this.selectedTutoria = value;
    this.resetTabla();

    if (this.selectedPeriodo && this.selectedSede && this.selectedTutoria) {
      this.cargarEstudiantes();
    }
  }

  // ========================
  // CARGA DE DATOS
  // ========================

  tryCargarTutorias() {
    this.tutoriaOptions = [];
    this.selectedTutoria = '';

    if (this.selectedPeriodo && this.selectedSede) {
      this.tutoriaService
        .getTutoriasPorPeriodoYSede(+this.selectedPeriodo, this.selectedSede)
        .subscribe((tutorias) => {
          this.tutoriaOptions = tutorias.map((t) => {
            const nombreCarreras = t.carreras.map((c) => c.nombre).join(' / ');
            return {
              value: String(t.id),
              label: nombreCarreras || `Tutoría ${t.id}`,
            };
          });
        });
    }
  }

  cargarEstudiantes() {
    this.tutoriaService
      .getTutoradosFiltrados(+this.selectedPeriodo, +this.selectedTutoria)
      .subscribe((data) => {
        this.tableData = data.map((row: any) => ({
          tutoriaId: row.tutoriaId,
          nombreTutoria: row.nombreTutoria,
          rut: row.rut,
          nombre: row.nombre,
          email: row.email,
          celular: row.celular,
          carreraTutorado: row.carreraTutorado,
          clasesAsistidas: row.clasesAsistidas ?? 0,
        }));

        console.log('Estudiantes filtrados:', this.tableData);
      });
  }

  // ========================
  // UTILIDAD
  // ========================

  resetTabla() {
    this.tableData = [];
  }
}
