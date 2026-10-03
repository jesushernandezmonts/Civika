import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed Colegio Cívika ---');
  const salt = await bcrypt.genSalt(10);
  const civikaPasswordHash = await bcrypt.hash('Civika2026!', salt);

  // 1. Usuario Dirección General (Doctora / Admin)
  const direccion = await prisma.usuario.upsert({
    where: { email: 'direccion@civika.edu.mx' },
    update: { nombre: 'Dirección General (Doctora)', rol: 'admin', passwordHash: civikaPasswordHash },
    create: {
      nombre: 'Dirección General (Doctora)',
      email: 'direccion@civika.edu.mx',
      passwordHash: civikaPasswordHash,
      rol: 'admin',
    },
  });
  console.log('✓ Dirección creada:', direccion.email);

  // 2. Usuario Secretaría (Caja 1)
  const secretaria = await prisma.usuario.upsert({
    where: { email: 'secretaria@civika.edu.mx' },
    update: { nombre: 'Secretaría de Control Escolar', rol: 'secretaria', passwordHash: civikaPasswordHash },
    create: {
      nombre: 'Secretaría de Control Escolar',
      email: 'secretaria@civika.edu.mx',
      passwordHash: civikaPasswordHash,
      rol: 'secretaria',
    },
  });
  console.log('✓ Secretaría creada:', secretaria.email);

  // 3. Catálogo de Uniformes
  const prendas = [
    { prenda: 'Suéter Escolar Oficial', talla: '14', precio: 480.00, stock: 35 },
    { prenda: 'Suéter Escolar Oficial', talla: '16', precio: 480.00, stock: 40 },
    { prenda: 'Suéter Escolar Oficial', talla: 'CH', precio: 510.00, stock: 30 },
    { prenda: 'Suéter Escolar Oficial', talla: 'M', precio: 510.00, stock: 25 },
    { prenda: 'Falda Escolar', talla: '14', precio: 350.00, stock: 20 },
    { prenda: 'Falda Escolar', talla: '16', precio: 350.00, stock: 25 },
    { prenda: 'Pantalón Escolar', talla: '30', precio: 380.00, stock: 30 },
    { prenda: 'Pantalón Escolar', talla: '32', precio: 380.00, stock: 30 },
    { prenda: 'Playera Tipo Polo Oficial', talla: '14', precio: 280.00, stock: 50 },
    { prenda: 'Playera Tipo Polo Oficial', talla: '16', precio: 280.00, stock: 50 },
    { prenda: 'Pans Deportivo Completo', talla: '16', precio: 650.00, stock: 30 },
    { prenda: 'Pans Deportivo Completo', talla: 'CH', precio: 690.00, stock: 25 },
  ];

  for (const p of prendas) {
    const existing = await prisma.uniforme.findFirst({
      where: { prenda: p.prenda, talla: p.talla }
    });
    if (!existing) {
      await prisma.uniforme.create({
        data: {
          prenda: p.prenda,
          talla: p.talla,
          precio: p.precio,
          stock: p.stock,
          activo: true
        }
      });
    }
  }
  console.log('✓ Catálogo de uniformes inicializado');

  // 4. Aviso Escolar Inicial
  const existingAviso = await prisma.avisoEscolar.findFirst({
    where: { titulo: 'Bienvenidos al Ciclo Escolar 2026-2027' }
  });
  if (!existingAviso) {
    await prisma.avisoEscolar.create({
      data: {
        titulo: 'Bienvenidos al Ciclo Escolar 2026-2027',
        contenido: 'Estimados Padres de Familia y Alumnos del Colegio Cívika: Les recordamos que los cobros de colegiaturas se realizan los primeros 10 días de cada mes en secretaría.',
        grado: 'todos',
        prioridad: 'importante',
        activo: true,
        creadoPorId: direccion.id
      }
    });
    console.log('✓ Aviso escolar inicial creado');
  }

  // 5. Alumno de Prueba con Tutor
  const alumnoExistente = await prisma.alumno.findFirst({
    where: { curp: 'MERC090315HTZRN01' }
  });
  if (!alumnoExistente) {
    await prisma.alumno.create({
      data: {
        nombre: 'Carlos',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: 'Ramírez',
        curp: 'MERC090315HTZRN01',
        matricula: 'CIV-2026-001',
        grado: 'Secundaria 1°A',
        nombreTutor: 'Roberto Mendoza Flores',
        telefonoTutor: '2471012345',
        emailTutor: 'tutor@civika.edu.mx',
        telefono: '2471012345',
        estatusActivo: true,
        passwordHash: civikaPasswordHash,
        authActivo: true,
        email: 'tutor@civika.edu.mx'
      }
    });
    console.log('✓ Alumno y tutor de prueba creados (Carlos Mendoza - Secundaria 1°A)');
  }

  console.log('--- Seed Colegio Cívika completado con éxito ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
