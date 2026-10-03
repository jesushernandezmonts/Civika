# 🎓 CIVIKA - Sistema de Gestión Cultural

Backend del sistema de gestión integral **Civika**.

## Stack

- **Framework:** NestJS + TypeScript
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** JWT + Google OAuth
- **Almacenamiento:** Cloudinary
- **Email:** Gmail SMTP / SendGrid / Resend / Brevo

## Instalación

```bash
npm install
cp .env.example .env  # Configurar variables de entorno
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

## Variables de entorno requeridas

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
FRONTEND_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Documentación API

Disponible en `http://localhost:3000/api/docs` (Swagger)

## Usuario admin por defecto (seed)

- Email: `admin@civika.com`
- Password: `Admin2025`
