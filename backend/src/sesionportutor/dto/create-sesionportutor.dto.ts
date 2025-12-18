// create-sesionportutor.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSesionportutorDto {
  @IsInt()
  tutoriaId: number;

  @IsInt()
  sesionId: number;

  @IsInt()
  perId: number;

  @IsNotEmpty()
  fechaEjecucion: string;

  @IsString()
  lugar: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
