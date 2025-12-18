import { Component, OnInit } from "@angular/core";
import { TutoriaService } from "../../shared/services/tutoria.service";
import { PageBreadcrumbComponent } from "../../shared/components/common/page-breadcrumb/page-breadcrumb.component";
import { LabelComponent } from "../../shared/components/form/label/label.component";
import {
  SelectComponent,
  Option,
} from "../../shared/components/form/select/select.component";
import { CommonModule } from "@angular/common";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMakeStatic = pdfMake as any;
const pdfFontsStatic = pdfFonts as any;
pdfMakeStatic.vfs = pdfFontsStatic.pdfMake ? pdfFontsStatic.pdfMake.vfs : pdfFontsStatic.vfs;

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

  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  async exportToPDF() {
    if (this.tableData.length === 0) return;

    // 1. Obtener etiquetas de Periodo y Sede
    const periodoLabel = this.periodoOptions.find(p => p.value === this.selectedPeriodo)?.label 
                          || this.selectedPeriodo;
    const sedeNombre = this.selectedSede.replace(/sede /i, '').toUpperCase();

    let logoUta = '';
    try {
      logoUta = await this.getBase64ImageFromURL('/images/logo/uta.png');
    } catch (error) {
      console.error('Error cargando el logo:', error);
    }

    const docDefinition: any = {
      pageOrientation: 'landscape',
      pageSize: 'A4',
      pageMargins: [20, 30, 20, 30],
      
      content: [
        // --- ENCABEZADO INSTITUCIONAL UTA ---
        {
          table: {
            widths: [120, '*'],
            body: [
              [
                {
                  image: logoUta ? logoUta : null,
                  width: 100,
                  alignment: 'center',
                  margin: [5, 10, 5, 10],
                  border: [true, true, false, true]
                },
                {
                  stack: [
                    { 
                      text: 'INFORME TUTORES', 
                      style: 'mainTitle', 
                      alignment: 'center',
                      margin: [0, 10, 150, 15] 
                    },
                    {
                      table: {
                        widths: ['auto', '*', 'auto', '*'],
                        body: [
                          [
                            { text: 'Periodo', style: 'labelHeader', alignment: 'right', border: [false, false, false, false] },
                            { text: `: ${periodoLabel}`, style: 'valueHeader', border: [false, false, false, false] },
                            { text: 'Sede', style: 'labelHeader', alignment: 'right', border: [false, false, false, false] },
                            { text: `: ${sedeNombre}`, style: 'valueHeader', border: [false, false, false, false] }
                          ]
                        ]
                      },
                      layout: 'noBorders',
                      margin: [0, 0, 0, 10]
                    }
                  ],
                  border: [false, true, true, true]
                }
              ]
            ]
          },
          layout: {
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          }
        },

        { text: '', margin: [0, 15] },

        // --- TABLA DE DATOS CENTRADA (10 COLUMNAS) ---
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                headerRows: 1,
                widths: [45, 30, 60, '*', 55, 70, 70, 85, 50, 35],
                body: [
                  [
                    { text: 'Sede', style: 'tableHeader' },
                    { text: 'Tut ID', style: 'tableHeader' },
                    { text: 'Facultad', style: 'tableHeader' },
                    { text: 'Nombre Tutoría', style: 'tableHeader' },
                    { text: 'RUT', style: 'tableHeader' },
                    { text: 'Nombre', style: 'tableHeader' },
                    { text: 'Carrera Tutor', style: 'tableHeader' },
                    { text: 'Email', style: 'tableHeader' },
                    { text: 'Celular', style: 'tableHeader' },
                    { text: 'Sesiones creadas', style: 'tableHeader' }
                  ],
                  ...this.tableData.map((item) => [
                    { text: (item.sede ?? '').toUpperCase(), style: 'tableCellGrayStrong' },
                    { text: (item.tutId ?? '').toString(), style: 'tableCellGrayStrong' },
                    { text: (item.facultad ?? '').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.nombreTutoria ?? '').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.rut ?? '').toString(), style: 'tableCellGrayLight' },
                    { text: (item.nombre ?? '').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.carreraTutor ?? '').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.email ?? '').toLowerCase(), style: 'tableCellGrayLight', fontSize: 6.5 },
                    { text: (item.celular ?? '').toString(), style: 'tableCellGrayLight' },
                    { text: (item.sesionesCreadas ?? 0).toString(), style: 'tableCellGrayStrong' }
                  ])
                ]
              },
              layout: {
                hLineColor: () => '#ffffff',
                vLineColor: () => '#ffffff',
                hLineWidth: () => 2,
                vLineWidth: () => 2,
              }
            },
            { width: '*', text: '' }
          ]
        }
      ],
      styles: {
        mainTitle: { fontSize: 22, bold: true, color: '#000000' },
        labelHeader: { fontSize: 12, bold: true },
        valueHeader: { fontSize: 12 },
        tableHeader: {
          fillColor: '#969696',
          color: '#000000',
          bold: true,
          alignment: 'center',
          fontSize: 7,
          margin: [0, 5, 0, 5]
        },
        tableCellGrayStrong: {
          fillColor: '#C8C8C8',
          alignment: 'center',
          bold: true,
          fontSize: 7,
          margin: [0, 5, 0, 5]
        },
        tableCellGrayLight: {
          fillColor: '#E6E6E6',
          alignment: 'center',
          fontSize: 7,
          margin: [0, 5, 0, 5]
        }
      }
    };

    pdfMakeStatic.createPdf(docDefinition).download(`Informe_Tutores_UTA_${periodoLabel.replace(/\s+/g, '_')}.pdf`);
  }
}
