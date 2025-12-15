import { Injectable } from '@nestjs/common';
import { CreateSesionportutorDto } from './dto/create-sesionportutor.dto';
import { UpdateSesionportutorDto } from './dto/update-sesionportutor.dto';

@Injectable()
export class SesionportutorService {
  create(createSesionportutorDto: CreateSesionportutorDto) {
    return 'This action adds a new sesionportutor';
  }

  findAll() {
    return `This action returns all sesionportutor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sesionportutor`;
  }

  update(id: number, updateSesionportutorDto: UpdateSesionportutorDto) {
    return `This action updates a #${id} sesionportutor`;
  }

  remove(id: number) {
    return `This action removes a #${id} sesionportutor`;
  }
}
