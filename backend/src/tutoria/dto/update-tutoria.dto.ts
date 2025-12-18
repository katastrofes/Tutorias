import { PartialType } from '@nestjs/mapped-types';
import { CreateTutoriaDto } from './create-tutoria.dto';
import { IsOptional, IsArray, IsInt } from 'class-validator';

export class UpdateTutoriaDto extends PartialType(CreateTutoriaDto) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  carreraIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tutorIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tutoradoIds?: number[];
}
