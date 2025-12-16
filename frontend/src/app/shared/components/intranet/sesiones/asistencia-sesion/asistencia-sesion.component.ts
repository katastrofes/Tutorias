import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntranetService } from '../../../../services/intranet.service';

@Component({
  selector: 'app-asistencia-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-sesion.component.html'
})
export class AsistenciaSesionComponent {

  private dialogRef = inject(MatDialogRef<AsistenciaSesionComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private _IntranetService = inject(IntranetService);

  estudiantesTotales: any[] = [];
  estudiantesFiltrados: any[] = [];
  
  filtroRut: string = '';
  filtroNombre: string = '';
  nombreFocused: boolean = false;
  
  presentes: number = 0;
  porcentaje: number = 0;
  todosMarcados: boolean = false; // <-- NUEVA VARIABLE
  sesId!: number;

  constructor() {
    console.log("DATA DEL MODAL:", this.data);
    this.sesId = this.data?.sesion?.idSesion || this.data?.ses_id || 0;

    if (!this.sesId) {
      console.error('ERROR: ID de sesión no disponible');
      this.dialogRef.close(false);
      return;
    }

    console.log("Tutorados:", this.data?.tutorados);

    this.estudiantesTotales = (this.data?.tutorados ?? []).map((t: any) => ({
      id: t.PER_ID,
      nombre: t.NOMBRE,
      rut: t.RUT,
      presente: false
    }));
    
    this.estudiantesFiltrados = [...this.estudiantesTotales];
    
    console.log(`Inicializados ${this.estudiantesTotales.length} estudiantes`);
    
    this.cargarAsistenciaGuardada();
  }

  normalizarTexto(texto: string): string {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  }

  cargarAsistenciaGuardada() {
    console.log('Cargando asistencia guardada para sesión:', this.sesId);
    
    this._IntranetService.obtenerAsistenciaPorSesion(this.sesId)
      .subscribe({
        next: (asistenciaGuardada: any[]) => {
          console.log('Asistencia guardada obtenida:', asistenciaGuardada);
          
          if (asistenciaGuardada && asistenciaGuardada.length > 0) {
            const asistenciaMap = new Map<string, boolean>();
            
            asistenciaGuardada.forEach(item => {
              const estaPresente = item.ESTADO === 'PRESENTE';
              asistenciaMap.set(item.ID.toString(), estaPresente);
            });
            
            this.estudiantesTotales = this.estudiantesTotales.map(est => ({
              ...est,
              presente: asistenciaMap.get(est.id.toString()) || false
            }));
            
            this.aplicarFiltros();
            
            console.log(`Asistencia cargada: ${asistenciaGuardada.length} registros`);
          } else {
            console.log('No hay asistencia guardada para esta sesión');
          }
          
          this.actualizarResumen();
        },
        error: (err) => {
          console.error('Error al cargar asistencia guardada:', err);
          
          if (err.status === 404) {
            console.log('El endpoint de asistencia aún no está implementado');
          } else if (err.error?.cod === '2') {
            console.log('No hay asistencia guardada:', err.error.msj);
          }
          
          this.actualizarResumen();
        }
      });
  }

  filtrarPorRut(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filtroRut = input.value;
    this.aplicarFiltros();
  }

  filtrarPorNombre(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filtroNombre = input.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const filtroRutNormalizado = this.normalizarTexto(this.filtroRut);
    const filtroNombreNormalizado = this.normalizarTexto(this.filtroNombre);
    
    this.estudiantesFiltrados = this.estudiantesTotales.filter(est => {
      const rutNormalizado = this.normalizarTexto(est.rut);
      const nombreNormalizado = this.normalizarTexto(est.nombre);
      
      const coincideRut = !filtroRutNormalizado || 
        rutNormalizado.includes(filtroRutNormalizado);
      
      const coincideNombre = !filtroNombreNormalizado || 
        nombreNormalizado.includes(filtroNombreNormalizado);
      
      return coincideRut && coincideNombre;
    });
    
    this.actualizarResumen();
  }

  limpiarFiltros() {
    this.filtroRut = '';
    this.filtroNombre = '';
    this.estudiantesFiltrados = [...this.estudiantesTotales];
    this.actualizarResumen();
  }

  toggleAsistencia(est: any) {
    const index = this.estudiantesTotales.findIndex(e => e.id === est.id);
    if (index !== -1) {
      this.estudiantesTotales[index].presente = !this.estudiantesTotales[index].presente;
    }
    
    this.actualizarResumen();
  }

  actualizarResumen() {
    const totalEstudiantes = this.estudiantesTotales.length;
    const totalPresentes = this.estudiantesTotales.filter(e => e.presente).length;
    
    const idsFiltrados = this.estudiantesFiltrados.map(e => e.id);
    const presentesFiltrados = this.estudiantesTotales.filter(
      estudiante => idsFiltrados.includes(estudiante.id) && estudiante.presente
    );
    
    this.presentes = totalPresentes; 
    this.porcentaje = totalEstudiantes > 0 ? Math.round((totalPresentes / totalEstudiantes) * 100) : 0;
    
    const totalFiltrados = idsFiltrados.length;
    const presentesEnFiltrados = presentesFiltrados.length;
    this.todosMarcados = totalFiltrados > 0 && presentesEnFiltrados === totalFiltrados;
  }

  toggleMarcarTodos() {
    const idsFiltrados = this.estudiantesFiltrados.map(e => e.id);
    
    if (this.todosMarcados) {
      this.estudiantesTotales = this.estudiantesTotales.map(est => ({
        ...est,
        presente: idsFiltrados.includes(est.id) ? false : est.presente
      }));
      
      this.estudiantesFiltrados = this.estudiantesFiltrados.map(est => ({
        ...est,
        presente: false
      }));
    } else {
      this.estudiantesTotales = this.estudiantesTotales.map(est => ({
        ...est,
        presente: idsFiltrados.includes(est.id) ? true : est.presente
      }));
      
      this.estudiantesFiltrados = this.estudiantesFiltrados.map(est => ({
        ...est,
        presente: true
      }));
    }
    
    this.actualizarResumen();
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  guardar() {
    console.log("GUARDANDO ASISTENCIA…");

    if (this.estudiantesTotales.length === 0) {
      console.error('No hay estudiantes para guardar');
      return;
    }

    const asistentes = this.estudiantesTotales.map(e => ({
      per_id: e.id,
      estado: e.presente ? 1 : 0
    }));
    
    console.log('Lista de asistencia, ', asistentes);

    this._IntranetService.guardarAsistencia(
      this.sesId,
      asistentes
    ).subscribe({
      next: (response) => {
        console.log("Respuesta del servidor:", response);
        
        if (response && response.cod !== undefined) {
          if (response.cod.toString() === '1') {
            console.log("Asistencia guardada correctamente");
            this.dialogRef.close(true);
          } else {
            console.error("Backend reportó error:", response.msj);
            this.dialogRef.close(false);
          }
        } else {
          console.log("Respuesta sin código, asumiendo éxito");
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        console.error('Error al guardar asistencia:', err);
        this.dialogRef.close(false);
      }
    });
  }
}