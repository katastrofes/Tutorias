import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';


interface TableData {
  id: number;
  carreras: string;
  n_tutores: number;
  fecha_creacion: string;
}
@Component({
  selector: 'app-gestion-tutorias',
  templateUrl: './gestion-tutorias.component.html',
  imports: [
      PageBreadcrumbComponent,
      LabelComponent,
      SelectComponent,
      CommonModule,
      ButtonComponent,
  ],
  styles: ``
})
export class GestionTutoriasComponent implements OnInit {

  //obtener opciones de periodos
  options = [
    { value: '60', label: '2025 Semestre 2' }
  ];

  tableData: TableData[] = [];


  selectedValue = '';
  constructor() { }

  ngOnInit() {
  }

  //agregar logica para cargar tutorias segun periodo
  cargarTutorias(periodo: string) {
    console.log("Cargando tutorías del periodo:", periodo);

    this.tableData = [
      {
        id: 2,
        carreras: 'Ingeniería Comercial',
        n_tutores: 7,
        fecha_creacion: '2025-02-05',
      },
      {
        id: 3,
        carreras: 'Ingeniería en Computación',
        n_tutores: 12,
        fecha_creacion: '2025-02-06',
      }
    ];
  }

  handleSelectChange(value: string) {
    this.selectedValue = value;
    console.log('Selected value:', value);
    this.cargarTutorias(value);
    
  }

  //agregar logica para agregar tutoria
  agregarTutoria() {
    console.log('Agregar nueva tutoría');
  }

  //agregar logica para editar tutoria
  editarTutoria(item: TableData) {
  console.log('Editar:', item);
  }
  
  //agregar logica para eliminar tutoria
  eliminarTutoria(item: TableData) {
    console.log('Eliminar:', item);
  }
}
