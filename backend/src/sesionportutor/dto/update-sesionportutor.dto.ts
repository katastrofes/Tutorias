import { PartialType } from '@nestjs/mapped-types';
import { CreateSesionportutorDto } from './create-sesionportutor.dto';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSesionportutorDto extends PartialType(CreateSesionportutorDto) {
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
