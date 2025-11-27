import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';

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
  optionsPeriodo = [
    { value: '60', label: '2025 Semestre 2' }
  ];
  
  optionsCarrera = [
    { value: '1', label: 'Ingeniería Civil Industrial' }
  ];
  tableData = [
    {
      id: 1,
      user: {
        name: 'González Tapia, Francisco Javier',
        rut: '12345678-9',
        carrera: 'Ingeniería Civil Industrial',
        role: 'Tutor',
        yearOfEntry: '2025',
        asistencia: '8',
        email: 'francisco.gonzalez@example.com',
      },
      tutorias: 'Ing. C. Computación / 523',
      tutorado: 'Juan Pérez',
      facultad: 'Facultad de Ingeniería',
      sessions: 10,
    },
    {
      id: 2,
      user: {
        name: 'Fernández García, José Luis',
        rut: '98765432-1',
        carrera: 'Ingeniería Comercial',
        role: 'Tutor',
        yearOfEntry: '2025',
        asistencia: '7',
        email: 'jose.fernandez@example.com',
      },
      tutorias: 'Ing. C. Comercial / 537',
      tutorado: 'Ana López',
      facultad: 'Facultad de Ciencias Económicas',
      sessions: 8,
    },
    {
      id: 3,
      user: {
        name: 'Morales Ruiz, Carmen Beatriz',
        rut: '23456789-0',
        carrera: 'Ingeniería en Computación',
        role: 'Tutor',
        yearOfEntry: '2025',
        asistencia: '12',
        email: 'carmen.morales@example.com',
      },
      tutorias: 'Ing. C. Computación / 523',
      tutorado: 'Luis García',
      facultad: 'Facultad de Ciencias de la Computación',
      sessions: 12,
    },
    {
      id: 4,
      user: {
        name: 'Hernández Gómez, Carolina Pilar',
        rut: '87654321-0',
        carrera: 'Ingeniería Civil Mecánica',
        role: 'Tutor',
        yearOfEntry: '2025',
        asistencia: '10',
        email: 'carolina.hernandez@example.com',
      },
      tutorias: 'Ing. C. Mecánica / 518',
      tutorado: 'Carlos Sánchez',
      facultad: 'Facultad de Ingeniería',
      sessions: 15,
    },
    {
      id: 5,
      user: {
        name: 'Sánchez Fernández, Pedro Pablo',
        rut: '34567890-1',
        carrera: 'Ingeniería Electrónica',
        role: 'Tutor',
        yearOfEntry: '2025',
        asistencia: '7',
        email: 'pedro.sanchez@example.com',
      },
      tutorias: 'Ing. C. Electrónica / 510',
      tutorado: 'Pedro Morales',
      facultad: 'Facultad de Ingeniería',
      sessions: 7,
    },
  ];



  selectedValuePeriodo = '';
  selectedValueCarrera = '';
  constructor() { }

  ngOnInit() {
  }

  handleSelectChangePeriodo(valuePeriodo: string) {
    this.selectedValuePeriodo = valuePeriodo;
    console.log('Selected value:', valuePeriodo);
  }

  handleSelectChangeCarrera(valueCarrera: string) {
    this.selectedValueCarrera = valueCarrera;
    console.log('Selected value:', valueCarrera);
  }
}
