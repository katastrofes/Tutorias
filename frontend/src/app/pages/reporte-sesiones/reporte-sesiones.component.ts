import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent, Option } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';
import { TutoriaService } from '../../shared/services/tutoria.service';

interface TableData {
  id: number | undefined;
  tutId: string;
  sesionId: string;
  nroSesion: number;
  tutor: string;
  fecha: string;
  lugar: string;
  observacion: string;
  asistencia: number; // Presentes
  totalAsistencia: number; // Total inscritos
}


@Component({
  selector: 'app-reporte-sesiones',
  templateUrl: './reporte-sesiones.component.html',
  imports: [
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
    CommonModule,
  ],
  styles: ``
})
export class ReporteSesionesComponent implements OnInit {
  periodoOptions: Option[] = [];
  sedeOptions: Option[] = [
    { value: 'arica', label: 'Sede Arica' },
    { value: 'iquique', label: 'Sede Iquique' },
  ];
  tutoriaOptions: Option[] = [];

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
      this.cargarSesiones();
    }
  }

  tryCargarTutorias() {
    this.tutoriaOptions = [];
    this.selectedTutoria = '';

    if (this.selectedPeriodo && this.selectedSede) {
      this.tutoriaService
        .getTutoriasPorPeriodoYSede(+this.selectedPeriodo, this.selectedSede)
        .subscribe((tutorias) => {
          this.tutoriaOptions = tutorias.map((t) => ({
            value: String(t.id),
            label: t.carreras.map((c) => c.nombre).join(' / '),
          }));
        });
    }
  }

  cargarSesiones() {
    this.tutoriaService
      .getSesionesFiltradas(+this.selectedPeriodo, +this.selectedTutoria)
      .subscribe((data) => {
        this.tableData = data;
        console.log('Sesiones cargadas:', this.tableData);
      });
  }

  resetTabla() {
    this.tableData = [];
  }
}
