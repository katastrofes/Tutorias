import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { SesionportutorService } from './sesionportutor.service';
import { CreateSesionportutorDto } from './dto/create-sesionportutor.dto';
import { UpdateSesionportutorDto } from './dto/update-sesionportutor.dto';
import { SesionListadoDto } from './dto/sesion-listado.dto';

@Controller('sesionportutor')
export class SesionportutorController {
  constructor(private readonly sesionportutorService: SesionportutorService) {}

  @Post()
  crear(@Body() dto: CreateSesionportutorDto) {
    return this.sesionportutorService.crear(dto);
  }

  @Get('listar')
  listar(
    @Query('perId', ParseIntPipe) perId: number,
    @Query('periId', ParseIntPipe) periId: number,
    @Query('tutoriaId', ParseIntPipe) tutoriaId: number,
  ): Promise<SesionListadoDto[]> {
    return this.sesionportutorService.listarSesiones(perId, periId, tutoriaId);
  }

  @Patch(':sptId')
  actualizar(
    @Param('sptId', ParseIntPipe) sptId: number,
    @Body() dto: UpdateSesionportutorDto,
  ) {
    return this.sesionportutorService.actualizarSesion(sptId, dto.perId, dto.fechaEjecucion, dto.lugar, dto.observaciones);
  }

  @Get()
  findAll() {
    return this.sesionportutorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sesionportutorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSesionportutorDto: UpdateSesionportutorDto) {
    return this.sesionportutorService.update(+id, updateSesionportutorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sesionportutorService.remove(+id);
  }
}
