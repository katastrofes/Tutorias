// src/persona/persona.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PersonaService } from './persona.service';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  
}
