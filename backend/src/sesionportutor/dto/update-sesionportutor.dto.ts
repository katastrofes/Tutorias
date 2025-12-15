import { PartialType } from '@nestjs/mapped-types';
import { CreateSesionportutorDto } from './create-sesionportutor.dto';

export class UpdateSesionportutorDto extends PartialType(CreateSesionportutorDto) {}
