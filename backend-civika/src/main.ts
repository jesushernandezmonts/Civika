import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/nestjs';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

const logger = new Logger('Bootstrap');

// Inicializar Sentry si SENTRY_DSN está definido en el entorno
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
  logger.log('📡 Sentry monitoreo inicializado correctamente');
}

// Variables de entorno REQUERIDAS en producción
const REQUIRED_ENV_VARS_PRODUCTION = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
];


function validateEnv() {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS_PRODUCTION) {
    if (!process.env[envVar] || process.env[envVar].includes('tu-') || process.env[envVar].includes('cambiar-')) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    logger.error('❌ Variables de entorno faltantes o con valores placeholder:');
    missing.forEach(v => logger.error(`   - ${v}`));
    logger.error('El servidor no puede iniciar. Revisa tu archivo .env o secrets de producción.');
    process.exit(1);
  }

  logger.log('✅ Variables de entorno validadas correctamente');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ===== VALIDACIÓN DE ENTORNO =====
  if (process.env.NODE_ENV === 'production') {
    validateEnv();
  }

  // ===== SEGURIDAD =====
  // Helmet (cabeceras HTTP seguras)
  app.use(helmet({ crossOriginEmbedderPolicy: false }));

  // Rate limiting global (100 peticiones por minuto por IP)
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiadas peticiones, intente de nuevo en un minuto' },
    }),
  );

  // Rate limiting estricto para autenticación y recuperación de credenciales (5 intentos por minuto)
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiados intentos de acceso o verificación. Por seguridad, intente de nuevo en un minuto.' },
  });

  app.use('/auth/login', authLimiter);
  app.use('/auth/alumno/login', authLimiter);
  app.use('/auth/forgot-password', authLimiter);
  app.use('/auth/reset-password', authLimiter);
  app.use('/auth/alumno/activar-cuenta', authLimiter);

  // ===== CONFIGURACIÓN GENERAL =====
  // Cookie parser
  app.use(cookieParser());

  // Trust proxy para que Koyeb/Render/reverse proxies funcionen con rate limiting
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // CORS endurecido con validación estricta de origen
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://civika.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como apps móviles, tools internas o SSR)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some(allowed =>
        origin === allowed || origin.endsWith('.vercel.app') || origin.endsWith('.civika.edu.mx')
      );

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Bloqueado por política CORS: origen '${origin}' no autorizado`));
      }
    },
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // ===== SWAGGER =====
  const config = new DocumentBuilder()
    .setTitle('CIVIKA API')
    .setDescription('API para gestión de centro cultural Civika')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ===== INICIO =====
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
