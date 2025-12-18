import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SelectComponent, Option } from '../../shared/components/form/select/select.component';
import { CommonModule } from '@angular/common';
import { TutoriaService } from '../../shared/services/tutoria.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMakeStatic = pdfMake as any;
const pdfFontsStatic = pdfFonts as any;
pdfMakeStatic.vfs = pdfFontsStatic.pdfMake ? pdfFontsStatic.pdfMake.vfs : pdfFontsStatic.vfs;

interface TableData {
  id: number | undefined;
  tutId: string;
  sesionId: string;
  nroSesion: number;
  tutor: string;
  fecha: string;
  lugar: string;
  observacion: string;
  asistencia: number; // Presentes
  totalAsistencia: number; // Total inscritos
}


@Component({
  selector: 'app-reporte-sesiones',
  templateUrl: './reporte-sesiones.component.html',
  imports: [
    PageBreadcrumbComponent,
    LabelComponent,
    SelectComponent,
    CommonModule,
  ],
  styles: ``
})
export class ReporteSesionesComponent implements OnInit {
  periodoOptions: Option[] = [];
  sedeOptions: Option[] = [
    { value: 'arica', label: 'Sede Arica' },
    { value: 'iquique', label: 'Sede Iquique' },
  ];
  tutoriaOptions: Option[] = [];

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
      this.cargarSesiones();
    }
  }

  tryCargarTutorias() {
    this.tutoriaOptions = [];
    this.selectedTutoria = '';

    if (this.selectedPeriodo && this.selectedSede) {
      this.tutoriaService
        .getTutoriasPorPeriodoYSede(+this.selectedPeriodo, this.selectedSede)
        .subscribe((tutorias) => {
          this.tutoriaOptions = tutorias.map((t) => ({
            value: String(t.id),
            label: t.carreras.map((c) => c.nombre).join(' / '),
          }));
        });
    }
  }

  cargarSesiones() {
    this.tutoriaService
      .getSesionesFiltradas(+this.selectedPeriodo, +this.selectedTutoria)
      .subscribe((data) => {
        this.tableData = data;
        console.log('Sesiones cargadas:', this.tableData);
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
                      text: 'INFORME SESIONES', 
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
            { width: '*', text: '' }, // Espaciador izquierdo
            {
              width: 'auto',
              table: {
                headerRows: 1,
                // widths para: #, Tut ID, Sesion ID, Nro, Tutor, Fecha, Lugar, Observación, Asistencia
                widths: [20, 35, 35, 25, 130, 50, 70, 120, 50],
                body: [
                  [
                    { text: '#', style: 'tableHeader' },
                    { text: 'Tut ID', style: 'tableHeader' },
                    { text: 'Sesion ID', style: 'tableHeader' },
                    { text: 'N°', style: 'tableHeader' },
                    { text: 'Tutor', style: 'tableHeader' },
                    { text: 'Fecha', style: 'tableHeader' },
                    { text: 'Lugar', style: 'tableHeader' },
                    { text: 'Observación', style: 'tableHeader' },
                    { text: 'Asistencia', style: 'tableHeader' }
                  ],
                  ...this.tableData.map((item, index) => [
                    { text: (index + 1).toString(), style: 'tableCellGrayStrong' },
                    { text: (item.tutId ?? '').toString(), style: 'tableCellGrayStrong' },
                    { text: (item.sesionId ?? '').toString(), style: 'tableCellGrayLight' },
                    { text: (item.nroSesion ?? 0).toString(), style: 'tableCellGrayLight' },
                    { text: (item.tutor ?? '').toUpperCase(), style: 'tableCellGrayLight', alignment: 'center' },
                    { text: item.fecha || 'SIN REGISTRO', style: 'tableCellGrayLight' },
                    { text: (item.lugar ?? 'SIN REGISTRO').toUpperCase(), style: 'tableCellGrayLight' },
                    { text: (item.observacion ?? 'SIN REGISTRO').toUpperCase(), style: 'tableCellGrayLight', fontSize: 6.5 },
                    { text: `${item.asistencia ?? 0} / ${item.totalAsistencia ?? 0}`, style: 'tableCellGrayStrong' }
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
            { width: '*', text: '' } // Espaciador derecho
          ]
        }
      ],
      styles: {
        mainTitle: { fontSize: 22, bold: true, color: '#000000' },
        labelHeader: { fontSize: 13, bold: true },
        valueHeader: { fontSize: 13 },
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

    pdfMakeStatic.createPdf(docDefinition).download(`Informe_Sesiones_UTA_${periodoLabel.replace(/\s+/g, '_')}.pdf`);
  }
}
