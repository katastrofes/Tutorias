import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SesionportutorService } from './sesionportutor.service';
import { CreateSesionportutorDto } from './dto/create-sesionportutor.dto';
import { UpdateSesionportutorDto } from './dto/update-sesionportutor.dto';

@Controller('sesionportutor')
export class SesionportutorController {
  constructor(private readonly sesionportutorService: SesionportutorService) {}

  @Post()
  create(@Body() createSesionportutorDto: CreateSesionportutorDto) {
    return this.sesionportutorService.create(createSesionportutorDto);
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
