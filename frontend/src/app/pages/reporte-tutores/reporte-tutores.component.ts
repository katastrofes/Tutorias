import { Component, OnInit } from "@angular/core";
import { TutoriaService } from "../../shared/services/tutoria.service";
import { PageBreadcrumbComponent } from "../../shared/components/common/page-breadcrumb/page-breadcrumb.component";
import { LabelComponent } from "../../shared/components/form/label/label.component";
import {
  SelectComponent,
  Option,
} from "../../shared/components/form/select/select.component";
import { CommonModule } from "@angular/common";

interface TableData {
  id: number | undefined;
  sede: string;
  tutId: string;
  facultad: string;
  nombreTutoria: string;
  rut: string;
  nombre: string;
  carreraTutor: string;
  email: string;
  celular: string;
  sesionesCreadas: number;
}

@Component({
  selector: "app-reporte-tutores",
  templateUrl: "./reporte-tutores.component.html",
  imports: [
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
    CommonModule,
  ],
})
export class ReporteTutoresComponent implements OnInit {
  periodoOptions: Option[] = [];
  sedeOptions: Option[] = [
    { value: "arica", label: "Sede Arica" },
    { value: "iquique", label: "Sede Iquique" },
  ];
  tutoriaOptions: Option[] = [];

  selectedPeriodo = "";
  selectedSede = "";
  selectedTutoria = "";

  tableData: TableData[] = [];

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit(): void {
    this.tutoriaService.getPeriodos().subscribe((periodos) => {
      this.periodoOptions = periodos.map((p) => ({
        value: String(p.peri_id),
        label: `${p.año} Semestre ${p.semestre}`,
      }));
    });
  }

  handlePeriodoChange(value: string) {
    this.selectedPeriodo = value;
    this.resetTabla();
    this.tryCargarTutorias();
  }

  handleSedeChange(value: string) {
    this.selectedSede = value;
    this.resetTabla();
    this.tryCargarTutorias();
  }

  handleTutoriaChange(value: string) {
    this.selectedTutoria = value;
    this.resetTabla();

    if (this.selectedPeriodo && this.selectedSede && this.selectedTutoria) {
      this.cargarTutores();
    }
  }

  tryCargarTutorias() {
    this.tutoriaOptions = [];
    this.selectedTutoria = "";

    if (this.selectedPeriodo && this.selectedSede) {
      this.tutoriaService
        .getTutoriasPorPeriodoYSede(
          +this.selectedPeriodo,
          this.selectedSede
        )
        .subscribe((tutorias) => {
          this.tutoriaOptions = tutorias.map((t) => {
            const nombreCarreras = t.carreras
              .map((c) => c.nombre)
              .join(" / ");

            return {
              value: String(t.id),
              label: nombreCarreras || `Tutoría ${t.id}`,
            };
          });
        });
    }
  }

  cargarTutores() {
    this.tutoriaService
      .getTutoresFiltrados(
        +this.selectedPeriodo,
        +this.selectedTutoria
      )
      .subscribe((data) => {
        this.tableData = data.map((row: any) => ({
          ...row,
          sesionesCreadas: row.sesionesCreadas ?? 0,
        }));

        console.log("Tutores filtrados:", this.tableData);
      });
  }

  resetTabla() {
    this.tableData = [];
  }
}
