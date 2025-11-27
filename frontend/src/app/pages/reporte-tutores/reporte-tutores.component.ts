import { Component, OnInit } from '@angular/core';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BasicTableOneComponent } from '../../shared/components/tables/basic-tables/basic-table-one/basic-table-one.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';


@Component({
  selector: 'app-reporte-tutores',
  templateUrl: './reporte-tutores.component.html',
  imports: [
      ComponentCardComponent,
      PageBreadcrumbComponent,
      BasicTableOneComponent,
      LabelComponent,
      SelectComponent
  ],
  styles: ``
})
export class ReporteTutoresComponent implements OnInit {
  options = [
    { value: '60', label: '2025 Semestre 2' },
    { value: '59', label: '2025 Semestre 1' },
    { value: '58', label: '2024 Semestre 2' },
  ];
  selectedValue = '';
  constructor() { }

  ngOnInit() {
  }

  handleSelectChange(value: string) {
    this.selectedValue = value;
    console.log('Selected value:', value);
  }

}
