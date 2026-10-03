import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Talleres')
@Controller('talleres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TalleresController {
  constructor(private readonly talleresService: TalleresService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un nuevo taller' })
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.talleresService.create(createTallerDto);
  }

  @Get()
  @Roles('admin', 'secretaria', 'profesor')
  @ApiOperation({ summary: 'Listar todos los talleres' })
  findAll() {
    return this.talleresService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'secretaria', 'profesor')
  @ApiOperation({ summary: 'Obtener un taller por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.talleresService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar un taller' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTallerDto: UpdateTallerDto) {
    return this.talleresService.update(id, updateTallerDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar un taller' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.talleresService.remove(id);
  }
}
