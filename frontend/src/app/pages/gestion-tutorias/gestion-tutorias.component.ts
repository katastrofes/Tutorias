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
    AgregarTutoriaModalComponent, // 👈 Importa el componente modal,
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

  carreras: Carrera[] = [];
  tutores: Persona[] = [];

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

    // Simulemos que tienes semestre y año en el label
    const [anio, semestreRaw] = periodo.label.split(' ');
    const semestre = semestreRaw === 'Semestre' ? 1 : 2;

    this.tutoriaService.getTutoriasPorPeriodo(semestre, parseInt(anio)).subscribe(data => {
      this.tableData = data.map(tutoria => ({
        id: tutoria.id,
        carreras: tutoria.carreras.map((c: any) => c.nombre).join(', '),
        n_tutores: tutoria.tutores?.length ?? 0,
        fecha_creacion: new Date(tutoria.fecha_creacion).toISOString().split('T')[0],
      }));
    });
  }

  handleSelectChange(value: string) {
    this.selectedValue = value;
    this.cargarTutorias(value);
  }

  agregarTutoria() {
    this.mostrarModal = true;
  }

  guardarTutoria(data: { carreraIds: number[], tutorIds?: number[] }) {
    console.log('Guardar tutoría con datos:', data);

    const payload = {
      periodoId: parseInt(this.selectedValue),
      carreraIds: data.carreraIds,
      tutorIds: data.tutorIds,
    };

    this.tutoriaService.createTutoria(payload).subscribe(() => {
      this.mostrarModal = false;
      this.cargarTutorias(this.selectedValue);
    });
  }

  editarTutoria(item: TableData) {
    console.log('Editar:', item);
  }

  eliminarTutoria(item: TableData) {
    console.log('Eliminar:', item);
  }
}
