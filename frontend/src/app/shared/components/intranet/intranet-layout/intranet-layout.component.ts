import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { IntranetHeaderComponent } from '../intranet-header/intranet-header.component';
import { IntranetSidebarComponent } from '../intranet-sidebar/intranet-sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackdropComponent } from '../../../layout/backdrop/backdrop.component';

@Component({
  selector: 'app-intranet-layout',
  imports: [
    CommonModule,
    RouterModule,
    IntranetHeaderComponent,
    IntranetSidebarComponent,
  ],
  templateUrl: './intranet-layout.component.html',
})
export class IntranetLayoutComponent {

  readonly isExpanded$;

  constructor(private sidebarService: SidebarService) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
  }
}
