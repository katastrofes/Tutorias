import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent, Option } from '../../shared/components/form/select/select.component';
import { TutoriaService } from '../../shared/services/tutoria.service';

interface TableData {
  sede: string;
  tutoriaId: number;
  nombreTutoria: string;
  tutores: string;
  tutorados: number;
  carrerasAsociadas: number;
  sesionesPorTutor: number;
  sesionesCronograma: number;
  totalSesiones: number;
  totalSesionesRealizadas: number;
}

@Component({
  selector: 'app-reporte-tutorias',
  templateUrl: './reporte-tutorias.component.html',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
  ],
})
export class ReporteTutoriasComponent implements OnInit {
  periodoOptions: Option[] = [];
  tutoriaOptions: Option[] = [];
  sedeOptions: Option[] = [
    { value: 'arica', label: 'Sede Arica' },
    { value: 'iquique', label: 'Sede Iquique' },
  ];

  selectedPeriodo = '';
  selectedSede = '';
  selectedTutoria = '';

  tableData: TableData[] = [];

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit() {
    this.tutoriaService.getPeriodos().subscribe((periodos) => {
      this.periodoOptions = periodos.map((p) => ({
        value: String(p.peri_id),
        label: `${p.año} Semestre ${p.semestre}`,
      }));
    });
  }

  handlePeriodoChange(value: string) {
    this.selectedPeriodo = value;
    this.selectedTutoria = '';
    this.tableData = [];
    this.tryCargarTutorias();
  }

  handleSedeChange(value: string) {
    this.selectedSede = value;
    this.selectedTutoria = '';
    this.tableData = [];
    this.tryCargarTutorias();
  }

  handleTutoriaChange(value: string) {
    this.selectedTutoria = value;
    this.tableData = [];

    if (this.selectedPeriodo && this.selectedTutoria) {
      this.cargarResumen();
    }
  }

  tryCargarTutorias() {
    this.tutoriaOptions = [];

    if (this.selectedPeriodo) {
      this.tutoriaService
        .getTutoriasPorPeriodo(+this.selectedPeriodo)
        .subscribe((tutorias) => {
          this.tutoriaOptions = tutorias.map((t) => ({
            value: String(t.id),
            label: t.carreras.map((c) => c.nombre).join(' / '),
          }));
        });
    }
  }

  cargarResumen() {
    this.tutoriaService
      .getResumenTutoria(+this.selectedPeriodo, +this.selectedTutoria)
      .subscribe((data) => {
        this.tableData = data ? [data] : [];
      });
  }
}
