import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CivikaService {
  constructor(private prisma: PrismaService) {}

  // ================= UNIFORMES =================
  async getUniformes() {
    return this.prisma.uniforme.findMany({
      where: { activo: true },
      orderBy: [{ prenda: 'asc' }, { talla: 'asc' }],
    });
  }

  async createUniforme(dto: { prenda: string; talla: string; precio: number; stock?: number }) {
    if (!dto.prenda || !dto.talla || dto.precio === undefined || dto.precio === null) {
      throw new BadRequestException('Prenda, talla y precio son requeridos.');
    }
    return this.prisma.uniforme.create({
      data: {
        prenda: dto.prenda.trim(),
        talla: dto.talla.trim(),
        precio: Number(dto.precio),
        stock: dto.stock !== undefined ? Math.max(0, Number(dto.stock)) : 0,
        activo: true,
      },
    });
  }

  async updateUniforme(id: number, dto: { prenda?: string; talla?: string; precio?: number; stock?: number; activo?: boolean }) {
    const existe = await this.prisma.uniforme.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Uniforme no encontrado.');

    return this.prisma.uniforme.update({
      where: { id },
      data: {
        ...(dto.prenda !== undefined && { prenda: dto.prenda.trim() }),
        ...(dto.talla !== undefined && { talla: dto.talla.trim() }),
        ...(dto.precio !== undefined && { precio: Number(dto.precio) }),
        ...(dto.stock !== undefined && { stock: Math.max(0, Number(dto.stock)) }),
        ...(dto.activo !== undefined && { activo: Boolean(dto.activo) }),
      },
    });
  }

  async deleteUniforme(id: number) {
    const existe = await this.prisma.uniforme.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Uniforme no encontrado.');

    return this.prisma.uniforme.update({
      where: { id },
      data: { activo: false },
    });
  }

  async registrarVentaUniforme(dto: {
    alumnoId?: number;
    comprador: string;
    detalles: Array<{ prenda: string; talla: string; cantidad: number; precioUnitario: number; subtotal: number }>;
    total: number;
    metodoPago?: string;
    registradoPor?: number;
  }) {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('La venta debe incluir al menos una prenda.');
    }

    const folio = `UNI-${Date.now().toString().slice(-6)}`;

    // Reducir stock si existe
    for (const item of dto.detalles) {
      const u = await this.prisma.uniforme.findFirst({
        where: { prenda: item.prenda, talla: item.talla, activo: true },
      });
      if (u && u.stock >= item.cantidad) {
        await this.prisma.uniforme.update({
          where: { id: u.id },
          data: { stock: u.stock - item.cantidad },
        });
      }
    }

    return this.prisma.ventaUniforme.create({
      data: {
        folio,
        alumnoId: dto.alumnoId || null,
        comprador: dto.comprador,
        detalles: dto.detalles,
        total: dto.total,
        metodoPago: dto.metodoPago || 'efectivo',
        registradoPor: dto.registradoPor || null,
      },
      include: {
        alumno: true,
      },
    });
  }

  async getVentasUniformes(alumnoId?: number) {
    const where: any = {};
    if (alumnoId) {
      where.alumnoId = alumnoId;
    }
    return this.prisma.ventaUniforme.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: { alumno: true, usuario: true },
    });
  }

  // ================= CORTES DE CAJA =================
  async getResumenCorteActual(secretariaId: number) {
    // Buscar ventas y pagos del día que no estén en un corte de caja confirmado
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [pagosColegiaturas, ventasUniformes] = await Promise.all([
      this.prisma.pago.findMany({
        where: {
          fechaPago: { gte: startOfDay },
          registradoPor: secretariaId,
        },
      }),
      this.prisma.ventaUniforme.findMany({
        where: {
          fecha: { gte: startOfDay },
          registradoPor: secretariaId,
          corteCajaId: null,
        },
      }),
    ]);

    const totalColegiaturas = pagosColegiaturas.reduce((acc, p) => acc + Number(p.monto), 0);
    const totalUniformes = ventasUniformes.reduce((acc, v) => acc + Number(v.total), 0);
    const totalEfectivo = totalColegiaturas + totalUniformes;

    return {
      totalColegiaturas,
      totalUniformes,
      totalEfectivo,
      cantidadPagosColegiatura: pagosColegiaturas.length,
      cantidadVentasUniformes: ventasUniformes.length,
    };
  }

  async crearCorteCaja(secretariaId: number, observaciones?: string) {
    const resumen = await this.getResumenCorteActual(secretariaId);
    const folio = `CORTE-${Date.now().toString().slice(-6)}`;

    const corte = await this.prisma.corteCaja.create({
      data: {
        folio,
        secretariaId,
        montoColegiaturas: resumen.totalColegiaturas,
        montoUniformes: resumen.totalUniformes,
        totalEfectivo: resumen.totalEfectivo,
        estatus: 'pendiente_entrega',
        observaciones: observaciones || null,
      },
      include: {
        secretaria: true,
      },
    });

    // Vincular ventas de uniformes del día a este corte
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    await this.prisma.ventaUniforme.updateMany({
      where: {
        fecha: { gte: startOfDay },
        registradoPor: secretariaId,
        corteCajaId: null,
      },
      data: {
        corteCajaId: corte.id,
      },
    });

    return corte;
  }

  async notificarEntregaADireccion(corteId: number) {
    const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
    if (!corte) throw new NotFoundException('Corte no encontrado');

    return this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        estatus: 'entregado_a_direccion',
        fechaEntrega: new Date(),
      },
    });
  }

  async confirmarCorteDireccion(corteId: number, doctorId: number) {
    const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
    if (!corte) throw new NotFoundException('Corte no encontrado');

    return this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        estatus: 'confirmado_por_direccion',
        fechaConfirmacion: new Date(),
        confirmadoPorId: doctorId,
      },
    });
  }

  async getCortesCaja() {
    return this.prisma.corteCaja.findMany({
      orderBy: { fechaCorte: 'desc' },
      include: {
        secretaria: true,
        confirmadoPor: true,
      },
    });
  }

  // ================= AVISOS ESCOLARES =================
  async getAvisos(grado?: string) {
    const where: any = { activo: true };
    if (grado && grado !== 'todos') {
      where.OR = [{ grado: 'todos' }, { grado }];
    }
    return this.prisma.avisoEscolar.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: { creadoPor: true },
    });
  }

  async crearAviso(dto: {
    titulo: string;
    contenido: string;
    grado?: string;
    prioridad?: string;
    creadoPorId?: number;
  }) {
    return this.prisma.avisoEscolar.create({
      data: {
        titulo: dto.titulo,
        contenido: dto.contenido,
        grado: dto.grado || 'todos',
        prioridad: dto.prioridad || 'normal',
        creadoPorId: dto.creadoPorId || null,
        activo: true,
      },
    });
  }

  async eliminarAviso(id: number) {
    return this.prisma.avisoEscolar.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ================= GESTIÓN DE PERSONAL / SECRETARÍAS =================
  async getPersonalSecretarias() {
    return this.prisma.usuario.findMany({
      where: {
        rol: { in: ['secretaria', 'admin'] },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        fotoUrl: true,
        bloqueadoHasta: true,
        creadoEn: true,
        _count: {
          select: {
            cortesCaja: true,
            pagos: true,
            ventasUniformes: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async createSecretaria(dto: { nombre: string; email: string; password: string; rol?: string }) {
    if (!dto.nombre || !dto.email || !dto.password) {
      throw new BadRequestException('Nombre, correo y contraseña son obligatorios.');
    }
    const emailNormalizado = dto.email.trim().toLowerCase();
    const existe = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });
    if (existe) {
      throw new BadRequestException('Ya existe un usuario registrado con este correo.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre.trim(),
        email: emailNormalizado,
        passwordHash,
        rol: dto.rol || 'secretaria',
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        fotoUrl: true,
        creadoEn: true,
      },
    });
  }

  async updateSecretaria(id: number, dto: { nombre?: string; email?: string; password?: string; rol?: string }) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const dataToUpdate: any = {};
    if (dto.nombre) dataToUpdate.nombre = dto.nombre.trim();
    if (dto.email) {
      const emailNormalizado = dto.email.trim().toLowerCase();
      if (emailNormalizado !== usuario.email) {
        const existe = await this.prisma.usuario.findUnique({ where: { email: emailNormalizado } });
        if (existe) {
          throw new BadRequestException('El correo ya está en uso por otra cuenta.');
        }
        dataToUpdate.email = emailNormalizado;
      }
    }
    if (dto.password && dto.password.trim().length > 0) {
      if (dto.password.length < 6) {
        throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
      }
      dataToUpdate.passwordHash = await bcrypt.hash(dto.password, 10);
      dataToUpdate.intentosFallidos = 0;
      dataToUpdate.bloqueadoHasta = null;
    }
    if (dto.rol) {
      dataToUpdate.rol = dto.rol;
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        fotoUrl: true,
        creadoEn: true,
      },
    });
  }

  async toggleBloqueoSecretaria(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const estaBloqueado = Boolean(usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date());

    if (estaBloqueado) {
      return this.prisma.usuario.update({
        where: { id },
        data: {
          bloqueadoHasta: null,
          intentosFallidos: 0,
        },
      });
    } else {
      return this.prisma.usuario.update({
        where: { id },
        data: {
          bloqueadoHasta: new Date('2099-12-31T23:59:59.000Z'),
        },
      });
    }
  }

  async deleteSecretaria(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cortesCaja: true,
            pagos: true,
            ventasUniformes: true,
          },
        },
      },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.rol === 'admin') {
      throw new BadRequestException('No se puede eliminar la cuenta principal de Dirección.');
    }

    const tieneRegistros =
      usuario._count.cortesCaja > 0 || usuario._count.pagos > 0 || usuario._count.ventasUniformes > 0;

    if (tieneRegistros) {
      return this.prisma.usuario.update({
        where: { id },
        data: {
          bloqueadoHasta: new Date('2099-12-31T23:59:59.000Z'),
        },
      });
    }

    return this.prisma.usuario.delete({ where: { id } });
  }

  // ================= STATS FINANCIERAS DIRECCIÓN =================
  async getStatsCivika() {
    const [
      alumnosTotal,
      alumnosSecundaria,
      alumnosPrepa,
      totalColegiaturasResult,
      totalUniformesResult,
      cortesPendientes,
      pagosRecientes,
      todosAlumnos,
    ] = await Promise.all([
      this.prisma.alumno.count({ where: { estatusActivo: true } }),
      this.prisma.alumno.count({
        where: {
          estatusActivo: true,
          OR: [
            { grado: { contains: 'Secundaria', mode: 'insensitive' } },
            { grado: { startsWith: 'Sec', mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.alumno.count({
        where: {
          estatusActivo: true,
          OR: [
            { grado: { contains: 'Prepa', mode: 'insensitive' } },
            { grado: { contains: 'Bachillerato', mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.pago.aggregate({ _sum: { monto: true } }),
      this.prisma.ventaUniforme.aggregate({ _sum: { total: true } }),
      this.prisma.corteCaja.count({
        where: { estatus: { in: ['pendiente_entrega', 'entregado_a_direccion'] } },
      }),
      this.prisma.pago.findMany({
        take: 100,
        include: { alumno: true },
        orderBy: { fechaPago: 'desc' },
      }),
      this.prisma.alumno.findMany({
        where: { estatusActivo: true },
        include: {
          pagos: {
            orderBy: { fechaPago: 'desc' },
            take: 1,
          },
        },
        orderBy: { nombre: 'asc' },
      }),
    ]);

    const totalColegiaturas = Number(totalColegiaturasResult._sum.monto || 0);
    const totalUniformes = Number(totalUniformesResult._sum.total || 0);
    const totalRecaudado = totalColegiaturas + totalUniformes;

    // Desglose de colegiaturas por nivel
    let colegiaturasSecundaria = 0;
    let colegiaturasPrepa = 0;

    for (const p of pagosRecientes) {
      const g = (p.alumno?.grado || '').toLowerCase();
      if (g.includes('prepa') || g.includes('bachillerato')) {
        colegiaturasPrepa += Number(p.monto);
      } else {
        colegiaturasSecundaria += Number(p.monto);
      }
    }

    // Morosidad: alumnos sin pago en los últimos 30 días o sin pagos
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);

    const alumnosMorosos = todosAlumnos
      .filter((a) => {
        const ultPago = a.pagos[0];
        if (!ultPago) return true;
        return new Date(ultPago.fechaPago) < hace30Dias;
      })
      .map((a) => ({
        id: a.id,
        nombreCompleto: `${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno || ''}`.trim(),
        grado: a.grado || 'Sin Grado',
        matricula: a.matricula || 'N/A',
        nombreTutor: a.nombreTutor || 'No registrado',
        telefonoTutor: a.telefonoTutor || a.telefono || null,
        emailTutor: a.emailTutor || null,
        ultimoPagoFecha: a.pagos[0]?.fechaPago || null,
        ultimoPagoMonto: a.pagos[0]?.monto ? Number(a.pagos[0].monto) : null,
      }))
      .slice(0, 20);

    return {
      alumnosTotal,
      alumnosSecundaria,
      alumnosPrepa,
      totalColegiaturas,
      totalUniformes,
      totalRecaudado,
      colegiaturasSecundaria,
      colegiaturasPrepa,
      cortesPendientes,
      alumnosMorosos,
    };
  }
}
