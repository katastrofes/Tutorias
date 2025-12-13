import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';

interface TableData {
  id: number | undefined;
  tutoriaId: string;
  nombreTutoria: string;
  rut: string;
  nombre: string;
  email: string;
  celular: string;
  carreraTutorado: string;
  anioIngreso: number;
  clasesAsistidas: number;
  sesionesTotales: number;
}

@Component({
  selector: 'app-reporte-estudiantes',
  templateUrl: './reporte-estudiantes.component.html',
  imports: [
      PageBreadcrumbComponent,
      LabelComponent,
      SelectComponent,
      CommonModule,
  ],
  styles: ``
})
export class ReporteEstudiantesComponent implements OnInit {
  periodoOptions = [
    { value: '60', label: '2025 Semestre 2' },
    { value: '59', label: '2025 Semestre 1' },
  ];
  sedeOptions = [
    { value: '1', label: 'Sede Principal' },
    { value: '2', label: 'Sede Centro' },
    { value: '3', label: 'Sede Sur' },
  ];
  carreraOptions = [
    { value: '1', label: 'Ingeniería Civil Industrial' },
    { value: '2', label: 'Ingeniería Comercial' },
    { value: '3', label: 'Ingeniería en Computación' },
    { value: '4', label: 'Ingeniería Civil Mecánica' },
    { value: '5', label: 'Ingeniería Electrónica' },
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
  selectedCarrera = '';
  selectedTutoria = '';

  tableData: TableData[] = [
  ];

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

  handleCarreraChange(value: string) {
    this.selectedCarrera = value;
    console.log('Carrera seleccionada:', value);
  }

  handleTutoriaChange(value: string) {
    this.selectedTutoria = value;
    console.log('Tutoría seleccionada:', value);
  }
}
