import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reporte-tutores',
  templateUrl: './reporte-tutores.component.html',
  imports: [
      PageBreadcrumbComponent,
      LabelComponent,
      SelectComponent,
      CommonModule,
  ],
  styles: ``
})
export class ReporteTutoresComponent implements OnInit {
  options = [
    { value: '60', label: '2025 Semestre 2' }
  ];
  tableData = [
    {
      id: 1,
      user: {
        name: 'González Tapia Francisco Javier',
        rut: '12345678-9',
        carrera: 'Ingeniería Civil Industrial',
        role: 'Tutor',
      },
      tutorias: 'López Martínez Ana María',
      facultad: 'Facultad de Ingeniería',
      sessions: 10,
    },
    {
      id: 2,
      user: {
        name: 'Fernández García José Luis',
        rut: '98765432-1',
        carrera: 'Ingeniería Comercial',
        role: 'Tutor',
      },
      tutorias: 'Ing. C. Comercial / 537',
      facultad: 'Facultad de Ciencias Económicas',
      sessions: 8,
    },
    {
      id: 3,
      user: {
        name: 'Morales Ruiz Carmen Beatriz',
        rut: '23456789-0',
        carrera: 'Ingeniería en Computación',
        role: 'Tutor',
      },
      tutorias: 'Ing. C. Computación / 523',
      facultad: 'Facultad de Ciencias de la Computación',
      sessions: 12,
    },
    {
      id: 4,
      user: {
        name: 'Hernández Gómez Carolina Pilar',
        rut: '87654321-0',
        carrera: 'Ingeniería Civil Mecánica',
        role: 'Tutor',
      },
      tutorias: 'Ing. C. Mecánica / 518',
      facultad: 'Facultad de Ingeniería',
      sessions: 15,
    },
    {
      id: 5,
      user: {
        name: 'Sánchez Fernández Pedro Pablo',
        rut: '34567890-1',
        carrera: 'Ingeniería Electrónica',
        role: 'Tutor',
      },
      tutorias: 'Ing. C. Electrónica / 510',
      facultad: 'Facultad de Ingeniería',
      sessions: 7,
    },
  ];


  selectedValue = '';
  constructor() { }

  ngOnInit() {
  }

  handleSelectChange(value: string) {
    this.selectedValue = value;
    console.log('Selected value:', value);
  }
}
