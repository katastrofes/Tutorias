import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';

interface TableData {
  id: number | undefined;
  tutId: string;
  sesionId: string;
  nroSesion: number;
  tutor: string;
  fecha: string;
  lugar: string;
  observacion: string;
  asistencia: string;
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
  periodoOptions = [
    { value: '60', label: '2025 Semestre 2' },
    { value: '59', label: '2025 Semestre 1' },
  ];
  sedeOptions = [
    { value: '1', label: 'Sede Principal' },
    { value: '2', label: 'Sede Centro' },
    { value: '3', label: 'Sede Sur' },
  ];
  tutoriaOptions = [
    { value: '1', label: 'Matemáticas Básicas' },
    { value: '2', label: 'Contabilidad Financiera' },
    { value: '3', label: 'Programación Avanzada' },
    { value: '4', label: 'Termodinámica' },
    { value: '5', label: 'Electrónica Digital' },
  ];

  selectedPeriodo = '';
  selectedSede = '';
  selectedTutoria = '';

  tableData: TableData[] = [];

  constructor() { }

  ngOnInit() {
  }

  handlePeriodoChange(value: string) {
    this.selectedPeriodo = value;
    console.log('Periodo seleccionado:', value);
  }

  handleSedeChange(value: string) {
    this.selectedSede = value;
    console.log('Sede seleccionada:', value);
  }

  handleTutoriaChange(value: string) {
    this.selectedTutoria = value;
    console.log('Tutoría seleccionada:', value);
  }
}
