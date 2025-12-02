export interface Tutoria {
  id: number;
  periodo: { peri_id: number; semestre: number; año: number }; // O la interfaz completa de Periodo
  carreras: { id: number; nombre: string }[]; // Array de OBJETOS de Carrera
  tutores: { per_id: number; nombre: string }[]; // Array de OBJETOS de Tutor
  // ...
}