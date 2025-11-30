import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';

import { CreateTutoriaDto } from './dto/create-tutoria.dto';
import { UpdateTutoriaDto } from './dto/update-tutoria.dto';
import { TutoriaService } from './tutoria.service';

@Controller('tutoria')
export class TutoriaController {
  constructor(private readonly service: TutoriaService) {}

  @Get('periodo')
    getByPeriodo(
      @Query('semestre') semestre: number,
      @Query('año') año: number
    ) {
      return this.service.findByPeriodo(semestre, año);
  }

  @Get()
  findByPeriodo(@Query('semestre') semestre: number, @Query('año') año: number) {
    return this.service.findByPeriodo(semestre, año);
  }

  @Post()
  create(@Body() dto: CreateTutoriaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateTutoriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
  
}
