import { IsArray, IsInt, IsOptional, ArrayMinSize } from 'class-validator';

export class CreateTutoriaDto {
  @IsInt()
  periodoId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  carreraIds: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tutorIds?: number[];
}