import { ChangeDetectionStrategy, Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-editar-sesion',
  templateUrl: './editar-sesion.component.html',
  imports: [ReactiveFormsModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarSesionComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef: MatDialogRef<EditarSesionComponent> = inject(MatDialogRef)
  public data: any = inject(MAT_DIALOG_DATA);
  
  idSesion!: number;
  nroSesion!: number;
  fecha!: Date;
  tematica!: string;
  autor!: string;
  competencias: string[] = [];
  formSesion!: FormGroup;

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  ngOnInit() {
    this.idSesion     = this.data?.idSesion;
    this.nroSesion    = this.data?.nro;
    this.tematica       = this.data?.tematica;
    this.autor        = this.data?.autor;
    let comps: string[] = [];

    if (typeof this.data?.competencias === 'string') {
      comps = this.data.competencias.split(',').map((c: string) => c.trim());
      comps = comps.filter(c => c.length > 0);
    } 
    this.competencias = comps;

    this.formSesion = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      lugar: ['', Validators.required],
      observaciones: ['']
    });

    let fechaParte = '';
    let horaParte = '';

    if (this.data?.fecha instanceof Date) {
      const fechaCompleta = this.data.fecha as Date;
      fechaParte = fechaCompleta.toISOString().substring(0, 10); 
      
      horaParte = this.formatTime(fechaCompleta); 
    }

    this.formSesion.patchValue({
      fecha: fechaParte,
      hora: horaParte,
      lugar: this.data?.lugar,
      observaciones: this.data?.observaciones
    });
  }

  cargarSesionParaEditar(data: any) {
    this.formSesion.patchValue({
      idSesion: data.idSesion,
      nro: data.nro,
      fecha: data.fecha,
      tematica: data.tematica,
      autor: data.autor,
      lugar: data.lugar,
      competencias: typeof data.competencias === 'string'
      ? data.competencias.split(',').map((c: string) => c.trim())
      : data.competencias || [],
      observaciones: data.observaciones || ''
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  guardarEdicion() {

    if (!this.formSesion.valid || !this.formSesion.dirty) {
        return;
    }

    const values = this.formSesion.getRawValue();

    const fechaCompleta = `${values.fecha} ${values.hora}`;

    const editedSesion = {
        idSesion: this.idSesion,
        fecha: fechaCompleta,
        lugar: values.lugar,
        observaciones: values.observaciones
    };
    
    this.dialogRef.close(editedSesion);
  }

}
