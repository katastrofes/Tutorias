import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkScrollableModule } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    CdkScrollableModule
  ]
})
export class DetalleComponent implements OnInit {

  // Angular Router
  route = inject(ActivatedRoute);
  router = inject(Router);

  // Drawer
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;

  // Asignatura (temporal, luego puedes setear dinámicamente)
  asiNombre = 'INGENIERÍA QUÍMICA AMBIENTAL';
  asiCodigo = 'CC229';

  // Steps
  currentStep = 0;
  steps = [
    { order: 0, title: 'Sesiones', subtitle: 'Registro de sesiones', path: 'sesiones' },
    { order: 1, title: 'Tutorados', subtitle: 'Registro de tutorados', path: 'tutorados' },
    { order: 2, title: 'Recursos', subtitle: 'Recursos digitales', path: 'recursos' },
  ];

  ngOnInit(): void {
    this.goToStep(0);
  }

  // Navegar a un paso específico
  goToStep(index: number): void {
    this.currentStep = index;
    this.router.navigate([this.steps[index].path], { relativeTo: this.route });
  }

  // Navegar al paso anterior
  goToPreviousStep(): void {
    if (this.currentStep === 0) return;
    this.currentStep--;
    this.router.navigate([this.steps[this.currentStep].path], { relativeTo: this.route });
  }

  // Navegar al siguiente paso
  goToNextStep(): void {
    if (this.currentStep === this.steps.length - 1) return;
    this.currentStep++;
    this.router.navigate([this.steps[this.currentStep].path], { relativeTo: this.route });
  }

  // TrackBy para ngFor
  trackByFn(index: number, item: any): any {
    return item.path || index;
  }
}
