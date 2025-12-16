import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Recurso {
  nombre: string;
  fecha: string;
  nro?: number; 
}

interface Sesion {
  numero?: number;    
  recursos: Recurso[];
}

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recursos.component.html',
  styleUrl: './recursos.component.css'
})
export class RecursosComponent {

  sesiones: Sesion[] = [
    { recursos: [
        { nombre: 'Recurso.pdf', fecha: '16/10/2025' },
        { nombre: 'Recurso.pdf', fecha: '16/10/2025' }]},
    { recursos: [
      ]},
    { recursos: [
      ]},
    { recursos: [
        { nombre: 'Recurso.pdf', fecha: '16/10/2025' }]},
    { recursos: [
        { nombre: 'Recurso.pdf', fecha: '16/10/2025' }]},
    { recursos: [
      ]},
    { recursos: [
        { nombre: 'Recurso.pdf', fecha: '16/10/2025' }]}
  ];

  constructor() {
    this.asignarIds();
  }

  asignarIds() {
    this.sesiones.forEach((sesion, indexSesion) => {
      sesion.numero = indexSesion + 1;

      sesion.recursos.forEach((recurso, indexRecurso) => {
        recurso.nro = indexRecurso + 1;
      });
    });
  }

  editarSesion(sesion: Sesion) {
    console.log('Editar sesión:', sesion.numero);
  }
}
