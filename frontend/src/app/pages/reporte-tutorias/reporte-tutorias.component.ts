import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent, Option } from '../../shared/components/form/select/select.component';
import { TutoriaService } from '../../shared/services/tutoria.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Truco para evitar el error de "Property pdfMake does not exist"
const pdfMakeStatic = pdfMake as any;
const pdfFontsStatic = pdfFonts as any;

// Accedemos de forma segura al vfs
pdfMakeStatic.vfs = pdfFontsStatic.pdfMake ? pdfFontsStatic.pdfMake.vfs : pdfFontsStatic.vfs;

interface TableData {
  sede: string;
  tutoriaId: number;
  nombreTutoria: string;
  tutores: string;
  tutorados: number;
  carrerasAsociadas: number;
  sesionesPorTutor: number;
  sesionesCronograma: number;
  totalSesiones: number;
  totalSesionesRealizadas: number;
}

@Component({
  selector: 'app-reporte-tutorias',
  templateUrl: './reporte-tutorias.component.html',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
  ],
  
})
export class ReporteTutoriasComponent implements OnInit {
  periodoOptions: Option[] = [];
  tutoriaOptions: Option[] = [];
  sedeOptions: Option[] = [
    { value: 'arica', label: 'Sede Arica' },
    { value: 'iquique', label: 'Sede Iquique' },
  ];

  selectedPeriodo = '';
  selectedSede = '';
  selectedTutoria = '';

  tableData: TableData[] = [];

  constructor(private tutoriaService: TutoriaService) {}

  ngOnInit() {
    this.tutoriaService.getPeriodos().subscribe((periodos) => {
      this.periodoOptions = periodos.map((p) => ({
        value: String(p.peri_id),
        label: `${p.año} Semestre ${p.semestre}`,
      }));
    });
  }

  handlePeriodoChange(value: string) {
    this.selectedPeriodo = value;
    this.selectedTutoria = '';
    this.tableData = [];
    this.tryCargarTutorias();
  }

  handleSedeChange(value: string) {
    this.selectedSede = value;
    this.selectedTutoria = '';
    this.tableData = [];
    this.tryCargarTutorias();
  }

  handleTutoriaChange(value: string) {
    this.selectedTutoria = value;
    this.tableData = [];

    if (this.selectedPeriodo && this.selectedTutoria) {
      this.cargarResumen();
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

  cargarResumen() {
    this.tutoriaService
      .getResumenTutoria(+this.selectedPeriodo, +this.selectedTutoria)
      .subscribe((data) => {
        this.tableData = data ? [data] : [];
      });
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

    // 1. OBTENER EL NOMBRE DEL PERIODO
    const periodoLabel = this.periodoOptions.find(p => p.value === this.selectedPeriodo)?.label 
                          || this.selectedPeriodo;

    // 2. LIMPIAR EL NOMBRE DE LA SEDE
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
        // --- ENCABEZADO INSTITUCIONAL ---
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
                      text: 'INFORME TUTORÍAS', 
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

        // --- TABLA DE DATOS CENTRADA ---
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                headerRows: 1,
                widths: [15, 20, 55, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                  [
                    { text: '#', style: 'tableHeader' },
                    { text: 'ID', style: 'tableHeader' },
                    { text: 'Sede', style: 'tableHeader' },
                    { text: 'Nombre Tutoría', style: 'tableHeader' },
                    { text: 'Tutores', style: 'tableHeader' },
                    { text: 'Tutorados', style: 'tableHeader' },
                    { text: 'Carreras asociadas', style: 'tableHeader' },
                    { text: 'Sesiones cronograma', style: 'tableHeader' },
                    { text: 'Total sesiones', style: 'tableHeader' },
                    { text: 'Total sesiones realizadas', style: 'tableHeader' }
                  ],
                  ...this.tableData.map((item, index) => [
                    { text: (index + 1).toString(), style: 'tableCellGrayStrong' },
                    { text: (item.tutoriaId ?? '').toString(), style: 'tableCellGrayStrong' },
                    { text: (item.sede ?? '').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.nombreTutoria ?? '').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.tutores ?? 'SIN ASIGNAR').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.tutorados ?? 0).toString(), style: 'tableCellGrayLight' },
                    { text: (item.carrerasAsociadas ?? 0).toString(), style: 'tableCellGrayLight' },
                    { text: (item.sesionesCronograma ?? 0).toString(), style: 'tableCellGrayLight' },
                    { text: (item.totalSesiones ?? 0).toString(), style: 'tableCellGrayLight' },
                    { text: (item.totalSesionesRealizadas ?? 0).toString(), style: 'tableCellGrayLight' }
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
          fontSize: 8,
          margin: [0, 5, 0, 5]
        },
        tableCellGrayStrong: {
          fillColor: '#C8C8C8',
          alignment: 'center',
          bold: true,
          fontSize: 8,
          margin: [0, 5, 0, 5]
        },
        tableCellGrayLight: {
          fillColor: '#E6E6E6',
          alignment: 'center',
          fontSize: 8,
          margin: [0, 5, 0, 5]
        }
      }
    };

    pdfMakeStatic.createPdf(docDefinition).download(`Informe_UTA_${periodoLabel.replace(/\s+/g, '_')}.pdf`);
  }
}