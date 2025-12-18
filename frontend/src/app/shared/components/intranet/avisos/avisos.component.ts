import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export interface AvisoCard {
  id: number;
  nombre: string;
  cargo: string;
  dias: number;
  avatarUrl?: string;
  titulo: string;
  descripcion: string;
  adjuntoLabel?: string;
}

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avisos.component.html',
})
export class AvisosComponent {
  cards: AvisoCard[] = [
    {
      id: 1,
      nombre: 'Javiera Valentina Araya Vergara',
      cargo: 'Area De Asistencia Social',
      dias: 15,
      avatarUrl: 'https://i.pravatar.cc/80?img=47',
      titulo: '¡Atención estudiantes!',
      descripcion:
        'Ya se encuentran abiertas las postulaciones y renovaciones de Becas de Mantención JUNAEB 2026...\n\nPlazo: del 1 de diciembre de 2025 al 31 de enero de 2026.\nPostula o renueva en: sinabweb.junaeb.cl',
      adjuntoLabel: 'Ver adjunto',
    },
    {
      id: 2,
      nombre: 'Claudia Alejandra Cid Rojas',
      cargo: 'Registraduría',
      dias: 105,
      avatarUrl: 'https://i.pravatar.cc/80?img=15',
      titulo: 'Certificado de Títulos y Grados digitales',
      descripcion:
        'Desde el 03 de Noviembre se emitirá los Certificados de Títulos y Grados en formato digital.',
      adjuntoLabel: 'Ver adjunto',
    },
  ];

  abrirAdjunto(card: AvisoCard) {
    console.log('Abrir adjunto de:', card.id);
  }
}
