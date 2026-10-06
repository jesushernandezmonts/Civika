import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CivikaService } from './civika.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';

@Controller('civika')
export class CivikaController {
  constructor(private readonly civikaService: CivikaService) {}

  // ================= UNIFORMES =================
  @Get('uniformes')
  async getUniformes() {
    return this.civikaService.getUniformes();
  }

  @Post('uniformes')
  async createUniforme(
    @Body()
    body: {
      prenda: string;
      talla: string;
      precio: number;
      stock?: number;
    },
  ) {
    return this.civikaService.createUniforme(body);
  }

  @Patch('uniformes/:id')
  async updateUniforme(
    @Param('id') id: string,
    @Body()
    body: {
      prenda?: string;
      talla?: string;
      precio?: number;
      stock?: number;
      activo?: boolean;
    },
  ) {
    return this.civikaService.updateUniforme(Number(id), body);
  }

  @Delete('uniformes/:id')
  async deleteUniforme(@Param('id') id: string) {
    return this.civikaService.deleteUniforme(Number(id));
  }

  @Post('uniformes/venta')
  async registrarVenta(
    @Body()
    body: {
      alumnoId?: number;
      comprador: string;
      detalles: Array<{ prenda: string; talla: string; cantidad: number; precioUnitario: number; subtotal: number }>;
      total: number;
      metodoPago?: string;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id || null;
    return this.civikaService.registrarVentaUniforme({
      ...body,
      registradoPor: userId,
    });
  }

  @Get('uniformes/ventas')
  async getVentas(@Query('alumnoId') alumnoId?: string) {
    return this.civikaService.getVentasUniformes(alumnoId ? Number(alumnoId) : undefined);
  }

  // ================= CORTES DE CAJA =================
  @Get('cortes/resumen-actual')
  async getResumenActual(@Query('secretariaId') secretariaId?: string, @Request() req?: any) {
    const sId = secretariaId ? Number(secretariaId) : (req?.user?.id || 1);
    return this.civikaService.getResumenCorteActual(sId);
  }

  @Post('cortes/crear')
  async crearCorte(
    @Body() body: { secretariaId?: number; observaciones?: string },
    @Request() req: any,
  ) {
    const sId = body.secretariaId || req.user?.id || 1;
    return this.civikaService.crearCorteCaja(sId, body.observaciones);
  }

  @Post('cortes/:id/entregar')
  async notificarEntrega(@Param('id') id: string) {
    return this.civikaService.notificarEntregaADireccion(Number(id));
  }

  @Patch('cortes/:id/confirmar')
  async confirmarCorte(@Param('id') id: string, @Request() req: any) {
    const doctorId = req.user?.id || 1;
    return this.civikaService.confirmarCorteDireccion(Number(id), doctorId);
  }

  @Get('cortes')
  async getCortes() {
    return this.civikaService.getCortesCaja();
  }

  // ================= AVISOS ESCOLARES =================
  @Get('avisos')
  async getAvisos(@Query('grado') grado?: string) {
    return this.civikaService.getAvisos(grado);
  }

  @Post('avisos')
  async crearAviso(
    @Body()
    body: {
      titulo: string;
      contenido: string;
      grado?: string;
      prioridad?: string;
    },
    @Request() req: any,
  ) {
    const creadorId = req.user?.id || null;
    return this.civikaService.crearAviso({
      ...body,
      creadoPorId: creadorId,
    });
  }

  @Delete('avisos/:id')
  async eliminarAviso(@Param('id') id: string) {
    return this.civikaService.eliminarAviso(Number(id));
  }

  // ================= STATS CIVIKA =================
  @Get('stats/resumen')
  async getStats() {
    return this.civikaService.getStatsCivika();
  }

  // ================= GESTIÓN DE PERSONAL / SECRETARÍAS (DIRECCIÓN) =================
  @Get('personal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPersonal() {
    return this.civikaService.getPersonalSecretarias();
  }

  @Post('personal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createPersonal(
    @Body()
    body: {
      nombre: string;
      email: string;
      rol?: string;
    },
  ) {
    return this.civikaService.createSecretaria(body);
  }

  @Patch('personal/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePersonal(
    @Param('id') id: string,
    @Body()
    body: {
      nombre?: string;
      email?: string;
      password?: string;
      rol?: string;
    },
  ) {
    return this.civikaService.updateSecretaria(Number(id), body);
  }

  @Patch('personal/:id/toggle-bloqueo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async toggleBloqueoPersonal(@Param('id') id: string) {
    return this.civikaService.toggleBloqueoSecretaria(Number(id));
  }

  @Delete('personal/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deletePersonal(@Param('id') id: string) {
    return this.civikaService.deleteSecretaria(Number(id));
  }
}
