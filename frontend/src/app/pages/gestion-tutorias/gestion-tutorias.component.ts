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
import { Tutoria } from '../../shared/models/tutoria';

interface TableData {
  id: number | undefined;
  carreraIds: number[];
  carreras: string;
  n_tutores: number;
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
  styles: ``,
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
        this.options = data.map((p) => ({
          value: p.peri_id.toString(),
          label: `${p.año} Semestre ${p.semestre}`,
          semestre: p.semestre,
          año: p.año,
        }));

        if (this.options.length > 0) {
          this.selectedValue = this.options[0].value;
          this.cargarTutorias(this.selectedValue); // Usar selectedValue
        }
      },
      error: (err) => console.error('Error cargando periodos:', err),
    });
  }

  cargarCarrerasYTutores() {
  this.tutoriaService.getCarreras().subscribe({
    next: (data) => {
      this.carreras = data;
      console.log('Carreras cargadas:', this.carreras);  
    },
    error: (err) => console.error('Error cargando carreras:', err),
  });

  this.tutoriaService.getPersonas().subscribe({
    next: (data) => (this.tutores = data),
    error: (err) => console.error('Error cargando tutores:', err),
  });
  }

cargarTutorias(periodoId: string) {
  this.tutoriaService.getTutoriasPorPeriodo(parseInt(periodoId)).subscribe({
    next: (data: Tutoria[]) => {
      console.log("Datos recibidos:", data);

      this.tableData = data.map((tutoria) => {
        
        // 1. Extraer IDs de Carreras: USAR tutoria.carreras
        // Asumiendo que 'tutoria.carreras' es un array de objetos { id: N, nombre: '...' }
        const carreraIds: number[] = Array.isArray(tutoria.carreras) 
          ? tutoria.carreras.map((c: any) => c.id) // Mapeamos para obtener solo el 'id'
          : [];

        // 2. Extraer Nombres de Carreras usando los IDs
        const carreras = carreraIds.length > 0
          ? carreraIds
              .map((id: number) => {
                const carrera = this.carreras.find(c => c.id === id);
                return carrera ? carrera.nombre : `ID ${id} Desconocido`;
              })
              .join(', ')
          : 'No asignada';

        // 3. Contar el Número de Tutores: USAR tutoria.tutores
        // Asumiendo que 'tutoria.tutores' es un array de objetos con la propiedad 'per_id' para el ID del tutor
        const tutorIds: number[] = Array.isArray(tutoria.tutores) 
          ? tutoria.tutores.map((t: any) => t.per_id) 
          : [];
          
        const n_tutores = tutorIds.length;

        // Mapeamos el objeto al formato de la tabla
        return {
          id: tutoria.id,
          carreraIds,      // Array de IDs de las carreras
          carreras,        // Nombres de las carreras
          n_tutores,       // Número de tutores asociados
          tutorIds,        // Array de IDs (per_id) de los tutores
        };
      });

      console.log("Tabla de datos mapeados:", this.tableData);
    },
    error: (err) => {
      console.error('Error al cargar tutorías:', err);
    },
  });
}



  handleSelectChange(value: string) {
    this.selectedValue = value;
    this.cargarTutorias(value); // Actualiza las tutorías con el nuevo periodo
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
        tutorIds: data.tutorIds,
      }).subscribe({
        next: (res: any) => {
          const index = this.tableData.findIndex((t) => t.id === data.rowId);
          if (index > -1) {
            this.tableData[index] = {
              id: res.id,
              carreras: res.carreras.map((c: any) => c.nombre).join(', '),
              carreraIds: res.carreras.map((c: any) => c.id),
              n_tutores: res.tutores?.length ?? 0,
              tutorIds: res.tutores?.map((t: any) => t.per_id) ?? [],
            };
          }
        },
        error: (err) => console.error('Error actualizando tutoria:', err),
      });
    } else {
      this.tutoriaService.createTutoria({
        periodoId,
        carreraIds: data.carreraIds,
        tutorIds: data.tutorIds,
      }).subscribe({
        next: (res: any) => {
          this.tableData.push({
            id: res.id,
            carreras: res.carreras.map((c: any) => c.nombre).join(', '),
            carreraIds: res.carreras.map((c: any) => c.id),
            n_tutores: res.tutores?.length ?? 0,
            tutorIds: res.tutores?.map((t: any) => t.per_id) ?? [],
          });
        },
        error: (err) => console.error('Error creando tutoria:', err),
      });
    }

    this.mostrarModal = false;
    this.tutoriasEditar = undefined;
  }

  editarTutoria(item: TableData) {
    this.mostrarModal = true;

    // Asegúrate de que 'item.carreras' sea una cadena y divídelo correctamente
    const carreraIds = this.carreras
      .filter((c) => item.carreras.split(', ').includes(c.nombre))  // Usa el nombre de la carrera para hacer la comparación
      .map((c) => c.id);  // Mapear a los IDs correspondientes

    const tutorIds: number[] = item.tutorIds ?? [];  // Asegúrate de que tutorIds sea un arreglo de números

    // Establece los valores que se editarán
    this.tutoriasEditar = {
      rowId: item.id ?? 0,  // Asegura que el ID sea siempre un número válido, usa 0 si es undefined
      carreraIds,
      tutorIds,
    };
  }

  eliminarTutoria(item: TableData) {
  const tutoriaId = item.id ?? 0;  // Si item.id es undefined, asignamos 0

  this.tutoriaService.removeTutoria(tutoriaId).subscribe({
    next: () => {
      this.tableData = this.tableData.filter(t => t.id !== item.id);
    },
    error: (err) => console.error('Error eliminando tutoria:', err)
  });
  }
}
