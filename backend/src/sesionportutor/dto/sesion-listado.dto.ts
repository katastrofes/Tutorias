export class SesionListadoDto {
  idSesion: number;
  nro: number;
  sesFecha: string;      
  tematica: string;         
  sesLugar: string | null;
  descripcion: string | null;
  observaciones: string | null;
}
